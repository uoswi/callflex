import { Hono } from 'hono'
import { supabaseAdmin } from '../../lib/supabase'
import Stripe from 'stripe'

const app = new Hono()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
})

app.post('/', async (c) => {
  const signature = c.req.header('stripe-signature')
  const rawBody = await c.req.text()

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature || '',
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err)
    return c.json({ error: 'Invalid signature' }, 400)
  }

  console.log(`Stripe webhook: ${event.type}`)

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutComplete(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoiceFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled Stripe event: ${event.type}`)
    }

    return c.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return c.json({ error: 'Webhook processing failed' }, 500)
  }
})

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const organizationId = session.metadata?.organizationId

  if (!organizationId) {
    console.error('No organizationId in checkout session metadata')
    return
  }

  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

  // Get the plan from the price
  const priceId = subscription.items.data[0].price.id
  const { data: plan } = await supabaseAdmin
    .from('plans')
    .select('id')
    .or(`stripe_price_id_monthly.eq.${priceId},stripe_price_id_yearly.eq.${priceId}`)
    .single()

  // Update organization
  await supabaseAdmin
    .from('organizations')
    .update({
      stripe_subscription_id: subscription.id,
      plan_id: plan?.id,
      status: 'active',
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      current_period_minutes_used: 0,
    })
    .eq('id', organizationId)

  // Log billing event
  await supabaseAdmin.from('billing_events').insert({
    organization_id: organizationId,
    event_type: 'subscription_created',
    stripe_event_id: session.id,
    metadata: {
      plan_id: plan?.id,
      subscription_id: subscription.id,
    },
  })
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const organizationId = subscription.metadata?.organizationId

  if (!organizationId) {
    // Find org by customer ID
    const { data: org } = await supabaseAdmin
      .from('organizations')
      .select('id')
      .eq('stripe_subscription_id', subscription.id)
      .single()

    if (!org) {
      console.error('Could not find organization for subscription:', subscription.id)
      return
    }

    await updateOrgSubscription(org.id, subscription)
  } else {
    await updateOrgSubscription(organizationId, subscription)
  }
}

async function updateOrgSubscription(organizationId: string, subscription: Stripe.Subscription) {
  // Determine status
  let status = 'active'
  if (subscription.status === 'past_due') status = 'past_due'
  if (subscription.status === 'canceled') status = 'canceled'
  if (subscription.status === 'trialing') status = 'trial'

  // Get plan
  const priceId = subscription.items.data[0].price.id
  const { data: plan } = await supabaseAdmin
    .from('plans')
    .select('id')
    .or(`stripe_price_id_monthly.eq.${priceId},stripe_price_id_yearly.eq.${priceId}`)
    .single()

  await supabaseAdmin
    .from('organizations')
    .update({
      plan_id: plan?.id,
      status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    })
    .eq('id', organizationId)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const { data: org } = await supabaseAdmin
    .from('organizations')
    .select('id')
    .eq('stripe_subscription_id', subscription.id)
    .single()

  if (org) {
    // Downgrade to no plan
    await supabaseAdmin
      .from('organizations')
      .update({
        status: 'canceled',
        stripe_subscription_id: null,
        plan_id: null,
      })
      .eq('id', org.id)

    // Log billing event
    await supabaseAdmin.from('billing_events').insert({
      organization_id: org.id,
      event_type: 'subscription_canceled',
      metadata: { subscription_id: subscription.id },
    })
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string

  const { data: org } = await supabaseAdmin
    .from('organizations')
    .select('id')
    .eq('stripe_subscription_id', subscriptionId)
    .single()

  if (org) {
    // Reset usage for new period
    await supabaseAdmin
      .from('organizations')
      .update({
        current_period_minutes_used: 0,
        status: 'active',
      })
      .eq('id', org.id)

    // Log billing event
    await supabaseAdmin.from('billing_events').insert({
      organization_id: org.id,
      event_type: 'invoice_paid',
      stripe_invoice_id: invoice.id,
      amount_cents: invoice.amount_paid,
      currency: invoice.currency,
    })
  }
}

async function handleInvoiceFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string

  const { data: org } = await supabaseAdmin
    .from('organizations')
    .select('id')
    .eq('stripe_subscription_id', subscriptionId)
    .single()

  if (org) {
    await supabaseAdmin
      .from('organizations')
      .update({ status: 'past_due' })
      .eq('id', org.id)

    // Log billing event
    await supabaseAdmin.from('billing_events').insert({
      organization_id: org.id,
      event_type: 'invoice_payment_failed',
      stripe_invoice_id: invoice.id,
      amount_cents: invoice.amount_due,
      currency: invoice.currency,
    })
  }
}

export default app
