import { Hono } from 'hono'
import { supabaseAdmin } from '../lib/supabase'
import { authMiddleware } from '../middleware/auth'

const app = new Hono()

// Apply auth middleware to all routes
app.use('*', authMiddleware)

// List user's organizations
app.get('/', async (c) => {
  const user = c.get('user')

  const { data, error } = await supabaseAdmin
    .from('organization_members')
    .select(`
      role,
      organization:organizations (
        id, name, slug, status, industry_id,
        current_period_minutes_used, plan_id,
        plans (name, included_minutes)
      )
    `)
    .eq('user_id', user.id)

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json({ organizations: data.map((m) => ({ ...m.organization, role: m.role })) })
})

// Get organization details
app.get('/:id', async (c) => {
  const orgId = c.req.param('id')
  const user = c.get('user')

  // Check membership
  const { data: member } = await supabaseAdmin
    .from('organization_members')
    .select('role')
    .eq('organization_id', orgId)
    .eq('user_id', user.id)
    .single()

  if (!member) {
    return c.json({ error: 'Not found' }, 404)
  }

  const { data: org, error } = await supabaseAdmin
    .from('organizations')
    .select(`
      *,
      industry:industries (*),
      plan:plans (*)
    `)
    .eq('id', orgId)
    .single()

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json({ organization: org, role: member.role })
})

// Update organization
app.patch('/:id', async (c) => {
  const orgId = c.req.param('id')
  const user = c.get('user')
  const body = await c.req.json()

  // Check admin/owner role
  const { data: member } = await supabaseAdmin
    .from('organization_members')
    .select('role')
    .eq('organization_id', orgId)
    .eq('user_id', user.id)
    .single()

  if (!member || !['owner', 'admin'].includes(member.role)) {
    return c.json({ error: 'Forbidden' }, 403)
  }

  const allowedFields = ['name', 'business_type', 'timezone', 'primary_phone', 'website', 'settings']
  const updates: Record<string, unknown> = {}
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates[field] = body[field]
    }
  }

  const { data: org, error } = await supabaseAdmin
    .from('organizations')
    .update(updates)
    .eq('id', orgId)
    .select()
    .single()

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json({ organization: org })
})

// List organization members
app.get('/:id/members', async (c) => {
  const orgId = c.req.param('id')
  const user = c.get('user')

  // Check membership
  const { data: member } = await supabaseAdmin
    .from('organization_members')
    .select('role')
    .eq('organization_id', orgId)
    .eq('user_id', user.id)
    .single()

  if (!member) {
    return c.json({ error: 'Not found' }, 404)
  }

  const { data: members, error } = await supabaseAdmin
    .from('organization_members')
    .select(`
      id, role, created_at, accepted_at,
      user:users (id, email, full_name, avatar_url)
    `)
    .eq('organization_id', orgId)

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json({ members })
})

// Invite member
app.post('/:id/members', async (c) => {
  const orgId = c.req.param('id')
  const user = c.get('user')
  const { email, role = 'member' } = await c.req.json()

  // Check admin/owner role
  const { data: member } = await supabaseAdmin
    .from('organization_members')
    .select('role')
    .eq('organization_id', orgId)
    .eq('user_id', user.id)
    .single()

  if (!member || !['owner', 'admin'].includes(member.role)) {
    return c.json({ error: 'Forbidden' }, 403)
  }

  // For now, just return a placeholder - implement invite flow later
  return c.json({
    message: 'Invite sent',
    invitation: { email, role, status: 'pending' }
  })
})

// Update member role
app.patch('/:id/members/:userId', async (c) => {
  const orgId = c.req.param('id')
  const targetUserId = c.req.param('userId')
  const user = c.get('user')
  const { role } = await c.req.json()

  // Check owner role
  const { data: member } = await supabaseAdmin
    .from('organization_members')
    .select('role')
    .eq('organization_id', orgId)
    .eq('user_id', user.id)
    .single()

  if (!member || member.role !== 'owner') {
    return c.json({ error: 'Only owners can change roles' }, 403)
  }

  const { error } = await supabaseAdmin
    .from('organization_members')
    .update({ role })
    .eq('organization_id', orgId)
    .eq('user_id', targetUserId)

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json({ success: true })
})

// Remove member
app.delete('/:id/members/:userId', async (c) => {
  const orgId = c.req.param('id')
  const targetUserId = c.req.param('userId')
  const user = c.get('user')

  // Check owner role
  const { data: member } = await supabaseAdmin
    .from('organization_members')
    .select('role')
    .eq('organization_id', orgId)
    .eq('user_id', user.id)
    .single()

  if (!member || member.role !== 'owner') {
    return c.json({ error: 'Only owners can remove members' }, 403)
  }

  // Can't remove yourself if you're the owner
  if (targetUserId === user.id) {
    return c.json({ error: 'Cannot remove yourself' }, 400)
  }

  const { error } = await supabaseAdmin
    .from('organization_members')
    .delete()
    .eq('organization_id', orgId)
    .eq('user_id', targetUserId)

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json({ success: true })
})

export default app
