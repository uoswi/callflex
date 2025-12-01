import { Hono } from 'hono'
import { supabaseAdmin } from '../lib/supabase'
import { authMiddleware } from '../middleware/auth'

const app = new Hono()

app.use('*', authMiddleware)

// List phone numbers for organization
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

  const { data, error } = await supabaseAdmin
    .from('phone_numbers')
    .select(`
      *,
      assistant:assistants (id, name, status)
    `)
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json({ phoneNumbers: data })
})

// Search available numbers
app.post('/search', async (c) => {
  const user = c.get('user')
  const { organizationId, areaCode, country = 'US' } = await c.req.json()

  const { data: member } = await supabaseAdmin
    .from('organization_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', user.id)
    .single()

  if (!member) {
    return c.json({ error: 'Not authorized' }, 403)
  }

  // TODO: Implement Twilio search
  // const numbers = await twilioService.searchNumbers(areaCode, country)

  // Return mock data for now
  return c.json({
    availableNumbers: [
      { phoneNumber: `+1${areaCode}5551234`, locality: 'San Francisco', region: 'CA' },
      { phoneNumber: `+1${areaCode}5551235`, locality: 'San Francisco', region: 'CA' },
      { phoneNumber: `+1${areaCode}5551236`, locality: 'Oakland', region: 'CA' },
    ]
  })
})

// Provision new number
app.post('/', async (c) => {
  const user = c.get('user')
  const { organizationId, phoneNumber, friendlyName } = await c.req.json()

  const { data: member } = await supabaseAdmin
    .from('organization_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', user.id)
    .single()

  if (!member || !['owner', 'admin'].includes(member.role)) {
    return c.json({ error: 'Not authorized' }, 403)
  }

  // Check plan limits
  const { data: org } = await supabaseAdmin
    .from('organizations')
    .select('plan:plans (max_phone_numbers)')
    .eq('id', organizationId)
    .single()

  const { count } = await supabaseAdmin
    .from('phone_numbers')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)

  const maxNumbers = (org?.plan as { max_phone_numbers: number })?.max_phone_numbers || 1
  if (count && count >= maxNumbers) {
    return c.json({ error: 'Phone number limit reached. Please upgrade your plan.' }, 403)
  }

  // TODO: Provision via Twilio
  // const twilioNumber = await twilioService.provision(phoneNumber)

  const { data: number, error } = await supabaseAdmin
    .from('phone_numbers')
    .insert({
      organization_id: organizationId,
      phone_number: phoneNumber,
      friendly_name: friendlyName,
      provider: 'twilio',
      provider_sid: `SID_${Date.now()}`, // Mock SID
      status: 'active',
    })
    .select()
    .single()

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json({ phoneNumber: number }, 201)
})

// Get phone number details
app.get('/:id', async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')

  const { data: number } = await supabaseAdmin
    .from('phone_numbers')
    .select(`
      *,
      assistant:assistants (*)
    `)
    .eq('id', id)
    .single()

  if (!number) {
    return c.json({ error: 'Phone number not found' }, 404)
  }

  const { data: member } = await supabaseAdmin
    .from('organization_members')
    .select('role')
    .eq('organization_id', number.organization_id)
    .eq('user_id', user.id)
    .single()

  if (!member) {
    return c.json({ error: 'Not authorized' }, 403)
  }

  return c.json({ phoneNumber: number })
})

// Update phone number (assign assistant, update name)
app.patch('/:id', async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')
  const body = await c.req.json()

  const { data: number } = await supabaseAdmin
    .from('phone_numbers')
    .select('organization_id')
    .eq('id', id)
    .single()

  if (!number) {
    return c.json({ error: 'Phone number not found' }, 404)
  }

  const { data: member } = await supabaseAdmin
    .from('organization_members')
    .select('role')
    .eq('organization_id', number.organization_id)
    .eq('user_id', user.id)
    .single()

  if (!member) {
    return c.json({ error: 'Not authorized' }, 403)
  }

  const allowedFields = ['friendly_name', 'assistant_id', 'routing_rules']
  const updates: Record<string, unknown> = {}
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates[field] = body[field]
    }
  }

  const { data: updated, error } = await supabaseAdmin
    .from('phone_numbers')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json({ phoneNumber: updated })
})

// Release phone number
app.delete('/:id', async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')

  const { data: number } = await supabaseAdmin
    .from('phone_numbers')
    .select('organization_id, provider_sid')
    .eq('id', id)
    .single()

  if (!number) {
    return c.json({ error: 'Phone number not found' }, 404)
  }

  const { data: member } = await supabaseAdmin
    .from('organization_members')
    .select('role')
    .eq('organization_id', number.organization_id)
    .eq('user_id', user.id)
    .single()

  if (!member || !['owner', 'admin'].includes(member.role)) {
    return c.json({ error: 'Not authorized' }, 403)
  }

  // TODO: Release from Twilio
  // await twilioService.release(number.provider_sid)

  const { error } = await supabaseAdmin
    .from('phone_numbers')
    .delete()
    .eq('id', id)

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json({ success: true })
})

export default app
