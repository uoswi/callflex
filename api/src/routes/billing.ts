import { Hono } from 'hono'
import { supabaseAdmin } from '../lib/supabase'
import { authMiddleware } from '../middleware/auth'
import Stripe from 'stripe'

const app = new Hono()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
})

app.use('*', authMiddleware)

// Get billing overview
app.get('/', async (c) => {
  const user = c.get('user')
  const orgId = c.req.query('organizationId')

  if (!orgId) {
    return c.json({ error: 'organizationId required' }, 400)
  }

  const { data: member } = await supabaseAdmin
    .from('organization_members')
    .select('role')
    .eq('organization_id', orgId)
    .eq('user_id', user.id)
    .single()

  if (!member) {
    return c.json({ error: 'Not authorized' }, 403)
  }

  const { data: org } = await supabaseAdmin
    .from('organizations')
    .select(`
      id, name, status, stripe_customer_id, stripe_subscription_id,
      current_period_minutes_used, current_period_start, current_period_end,
      plan:plans (*)
    `)
    .eq('id', orgId)
    .single()

  if (!org) {
    return c.json({ error: 'Organization not found' }, 404)
  }

  return c.json({
    billing: {
      status: org.status,
      plan: org.plan,
      usage: {
        minutesUsed: org.current_period_minutes_used || 0,
        minutesIncluded: (org.plan as { included_minutes: number })?.included_minutes || 0,
        periodStart: org.current_period_start,
        periodEnd: org.current_period_end,
      },
      hasPaymentMethod: !!org.stripe_subscription_id,
    }
  })
})

// Get current usage
app.get('/usage', async (c) => {
  const user = c.get('user')
  const orgId = c.req.query('organizationId')

  if (!orgId) {
    return c.json({ error: 'organizationId required' }, 400)
  }

  const { data: member } = await supabaseAdmin
    .from('organization_members')
    .select('role')
    .eq('organization_id', orgId)
    .eq('user_id', user.id)
    .single()

  if (!member) {
    return c.json({ error: 'Not authorized' }, 403)
  }

  const { data: org } = await supabaseAdmin
    .from('organizations')
    .select(`
      current_period_minutes_used, current_period_start, current_period_end,
      plan:plans (included_minutes, overage_rate_per_minute)
    `)
    .eq('id', orgId)
    .single()

  if (!org) {
    return c.json({ error: 'Organization not found' }, 404)
  }

  const plan = org.plan as { included_minutes: number; overage_rate_per_minute: number }
  const minutesUsed = org.current_period_minutes_used || 0
  const includedMinutes = plan?.included_minutes || 0
  const overageMinutes = Math.max(0, minutesUsed - includedMinutes)
  const overageRate = plan?.overage_rate_per_minute || 8

  // Get daily breakdown
  const { data: dailyUsage } = await supabaseAdmin
    .from('daily_usage')
    .select('date, total_calls, total_minutes')
    .eq('organization_id', orgId)
    .gte('date', org.current_period_start?.split('T')[0] || new Date().toISOString().split('T')[0])
    .order('date', { ascending: true })

  return c.json({
    usage: {
      minutesUsed,
      minutesIncluded: includedMinutes,
      minutesRemaining: Math.max(0, includedMinutes - minutesUsed),
      overageMinutes,
      overageCost: overageMinutes * overageRate,
      periodStart: org.current_period_start,
      periodEnd: org.current_period_end,
      percentUsed: includedMinutes > 0 ? Math.round((minutesUsed / includedMinutes) * 100) : 0,
      dailyBreakdown: dailyUsage || [],
    }
  })
})

// Create checkout session
app.post('/checkout', async (c) => {
  const user = c.get('user')
  const { organizationId, priceId } = await c.req.json()

  const { data: member } = await supabaseAdmin
    .from('organization_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', user.id)
    .single()

  if (!member || !['owner', 'admin'].includes(member.role)) {
    return c.json({ error: 'Not authorized' }, 403)
  }

  const { data: org } = await supabaseAdmin
    .from('organizations')
    .select('stripe_customer_id, primary_email, name')
    .eq('id', organizationId)
    .single()

  if (!org) {
    return c.json({ error: 'Organization not found' }, 404)
  }

  // Create or get Stripe customer
  let customerId = org.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: org.primary_email,
      name: org.name,
      metadata: { organizationId },
    })
    customerId = customer.id

    await supabaseAdmin
      .from('organizations')
      .update({ stripe_customer_id: customerId })
      .eq('id', organizationId)
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.APP_URL}/dashboard/billing?success=true`,
    cancel_url: `${process.env.APP_URL}/dashboard/billing?canceled=true`,
    subscription_data: {
      metadata: { organizationId },
    },
  })

  return c.json({ checkoutUrl: session.url })
})

// Create billing portal session
app.post('/portal', async (c) => {
  const user = c.get('user')
  const { organizationId } = await c.req.json()

  const { data: member } = await supabaseAdmin
    .from('organization_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', user.id)
    .single()

  if (!member || !['owner', 'admin'].includes(member.role)) {
    return c.json({ error: 'Not authorized' }, 403)
  }

  const { data: org } = await supabaseAdmin
    .from('organizations')
    .select('stripe_customer_id')
    .eq('id', organizationId)
    .single()

  if (!org?.stripe_customer_id) {
    return c.json({ error: 'No billing account found' }, 400)
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: org.stripe_customer_id,
    return_url: `${process.env.APP_URL}/dashboard/billing`,
  })

  return c.json({ portalUrl: session.url })
})

// Get invoices
app.get('/invoices', async (c) => {
  const user = c.get('user')
  const orgId = c.req.query('organizationId')

  if (!orgId) {
    return c.json({ error: 'organizationId required' }, 400)
  }

  const { data: member } = await supabaseAdmin
    .from('organization_members')
    .select('role')
    .eq('organization_id', orgId)
    .eq('user_id', user.id)
    .single()

  if (!member) {
    return c.json({ error: 'Not authorized' }, 403)
  }

  const { data: org } = await supabaseAdmin
    .from('organizations')
    .select('stripe_customer_id')
    .eq('id', orgId)
    .single()

  if (!org?.stripe_customer_id) {
    return c.json({ invoices: [] })
  }

  const invoices = await stripe.invoices.list({
    customer: org.stripe_customer_id,
    limit: 12,
  })

  return c.json({
    invoices: invoices.data.map((inv) => ({
      id: inv.id,
      number: inv.number,
      status: inv.status,
      amount: inv.amount_paid,
      currency: inv.currency,
      created: inv.created,
      invoicePdf: inv.invoice_pdf,
      hostedUrl: inv.hosted_invoice_url,
    }))
  })
})

export default app
