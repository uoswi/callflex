import { Context, Next } from 'hono'
import { supabaseAdmin } from '../lib/supabase'

interface User {
  id: string
  auth_id: string
  email: string
  full_name: string | null
}

declare module 'hono' {
  interface ContextVariableMap {
    user: User
    organizationId?: string
  }
}

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const token = authHeader.slice(7)

  try {
    const { data: { user: authUser }, error } = await supabaseAdmin.auth.getUser(token)

    if (error || !authUser) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    // Get user from our users table
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, auth_id, email, full_name')
      .eq('auth_id', authUser.id)
      .single()

    if (userError || !user) {
      return c.json({ error: 'User not found' }, 401)
    }

    c.set('user', user as User)
    await next()
  } catch {
    return c.json({ error: 'Unauthorized' }, 401)
  }
}

// Middleware to check organization access
export async function orgMiddleware(c: Context, next: Next) {
  const user = c.get('user')
  const orgId = c.req.param('orgId') || c.req.header('X-Organization-ID')

  if (!orgId) {
    return c.json({ error: 'Organization ID required' }, 400)
  }

  const { data: member } = await supabaseAdmin
    .from('organization_members')
    .select('role')
    .eq('organization_id', orgId)
    .eq('user_id', user.id)
    .single()

  if (!member) {
    return c.json({ error: 'Not a member of this organization' }, 403)
  }

  c.set('organizationId', orgId)
  await next()
}
