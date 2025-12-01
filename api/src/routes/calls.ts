import { Hono } from 'hono'
import { supabaseAdmin } from '../lib/supabase'
import { authMiddleware } from '../middleware/auth'

const app = new Hono()

app.use('*', authMiddleware)

// List calls for organization
app.get('/', async (c) => {
  const user = c.get('user')
  const orgId = c.req.query('organizationId')
  const assistantId = c.req.query('assistantId')
  const status = c.req.query('status')
  const limit = parseInt(c.req.query('limit') || '50')
  const offset = parseInt(c.req.query('offset') || '0')
  const startDate = c.req.query('startDate')
  const endDate = c.req.query('endDate')

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

  let query = supabaseAdmin
    .from('calls')
    .select(`
      id, vapi_call_id, from_number, to_number,
      started_at, ended_at, duration_seconds, status,
      direction, call_type, sentiment, summary,
      was_transferred, appointment_booked, created_at,
      assistant:assistants (id, name),
      phone_number:phone_numbers (id, phone_number, friendly_name)
    `, { count: 'exact' })
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (assistantId) {
    query = query.eq('assistant_id', assistantId)
  }

  if (status) {
    query = query.eq('status', status)
  }

  // Important: Always include date range for partition pruning
  if (startDate) {
    query = query.gte('created_at', startDate)
  } else {
    // Default to last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    query = query.gte('created_at', thirtyDaysAgo.toISOString())
  }

  if (endDate) {
    query = query.lte('created_at', endDate)
  }

  const { data, error, count } = await query

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json({
    calls: data,
    pagination: {
      total: count,
      limit,
      offset,
      hasMore: count ? offset + limit < count : false,
    }
  })
})

// Get call details
app.get('/:id', async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')
  const createdAt = c.req.query('createdAt') // Required for partition key

  let query = supabaseAdmin
    .from('calls')
    .select(`
      *,
      assistant:assistants (id, name),
      phone_number:phone_numbers (id, phone_number, friendly_name)
    `)
    .eq('id', id)

  // If createdAt provided, use it for partition pruning
  if (createdAt) {
    query = query.eq('created_at', createdAt)
  }

  const { data: call, error } = await query.single()

  if (error || !call) {
    return c.json({ error: 'Call not found' }, 404)
  }

  const { data: member } = await supabaseAdmin
    .from('organization_members')
    .select('role')
    .eq('organization_id', call.organization_id)
    .eq('user_id', user.id)
    .single()

  if (!member) {
    return c.json({ error: 'Not authorized' }, 403)
  }

  return c.json({ call })
})

// Get call transcript
app.get('/:id/transcript', async (c) => {
  const user = c.get('user')
  const callId = c.req.param('id')

  const { data: transcript, error } = await supabaseAdmin
    .from('call_transcripts')
    .select('*')
    .eq('call_id', callId)
    .single()

  if (error || !transcript) {
    return c.json({ error: 'Transcript not found' }, 404)
  }

  const { data: member } = await supabaseAdmin
    .from('organization_members')
    .select('role')
    .eq('organization_id', transcript.organization_id)
    .eq('user_id', user.id)
    .single()

  if (!member) {
    return c.json({ error: 'Not authorized' }, 403)
  }

  return c.json({ transcript })
})

// Get call recording
app.get('/:id/recording', async (c) => {
  const user = c.get('user')
  const callId = c.req.param('id')

  const { data: recording, error } = await supabaseAdmin
    .from('call_recordings')
    .select('*')
    .eq('call_id', callId)
    .single()

  if (error || !recording) {
    return c.json({ error: 'Recording not found' }, 404)
  }

  const { data: member } = await supabaseAdmin
    .from('organization_members')
    .select('role')
    .eq('organization_id', recording.organization_id)
    .eq('user_id', user.id)
    .single()

  if (!member) {
    return c.json({ error: 'Not authorized' }, 403)
  }

  // Generate signed URL if stored in Supabase Storage
  // For now, return the storage path
  return c.json({ recording })
})

// Get call actions
app.get('/:id/actions', async (c) => {
  const user = c.get('user')
  const callId = c.req.param('id')

  const { data: actions, error } = await supabaseAdmin
    .from('call_actions')
    .select('*')
    .eq('call_id', callId)
    .order('triggered_at', { ascending: true })

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  if (!actions.length) {
    return c.json({ actions: [] })
  }

  const { data: member } = await supabaseAdmin
    .from('organization_members')
    .select('role')
    .eq('organization_id', actions[0].organization_id)
    .eq('user_id', user.id)
    .single()

  if (!member) {
    return c.json({ error: 'Not authorized' }, 403)
  }

  return c.json({ actions })
})

// Get call statistics
app.get('/stats/overview', async (c) => {
  const user = c.get('user')
  const orgId = c.req.query('organizationId')
  const period = c.req.query('period') || 'today' // today, week, month

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

  // Calculate date range
  const now = new Date()
  let startDate: Date

  switch (period) {
    case 'week':
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 7)
      break
    case 'month':
      startDate = new Date(now)
      startDate.setMonth(now.getMonth() - 1)
      break
    default: // today
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  }

  // Get stats from daily_usage table (pre-aggregated)
  const { data: usage } = await supabaseAdmin
    .from('daily_usage')
    .select('total_calls, total_minutes')
    .eq('organization_id', orgId)
    .gte('date', startDate.toISOString().split('T')[0])

  const totalCalls = usage?.reduce((sum, d) => sum + (d.total_calls || 0), 0) || 0
  const totalMinutes = usage?.reduce((sum, d) => sum + (d.total_minutes || 0), 0) || 0

  // Get current active calls
  const { count: activeCalls } = await supabaseAdmin
    .from('calls')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', orgId)
    .eq('status', 'in-progress')
    .gte('created_at', startDate.toISOString())

  return c.json({
    stats: {
      totalCalls,
      totalMinutes,
      activeCalls: activeCalls || 0,
      period,
    }
  })
})

export default app
