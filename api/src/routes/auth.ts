import { Hono } from 'hono'
import { supabaseAdmin } from '../lib/supabase'
import { z } from 'zod'

const app = new Hono()

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(1),
  organizationName: z.string().min(1),
})

const signinSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

// Sign up - creates user and organization
app.post('/signup', async (c) => {
  try {
    const body = await c.req.json()
    const { email, password, fullName, organizationName } = signupSchema.parse(body)

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    })

    if (authError) {
      return c.json({ error: authError.message }, 400)
    }

    // Create user record
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        auth_id: authData.user.id,
        email,
        full_name: fullName,
      })
      .select()
      .single()

    if (userError) {
      return c.json({ error: userError.message }, 400)
    }

    // Create organization
    const slug = organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const { data: org, error: orgError } = await supabaseAdmin
      .from('organizations')
      .insert({
        name: organizationName,
        slug: `${slug}-${Date.now()}`,
        primary_email: email,
        status: 'trial',
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single()

    if (orgError) {
      return c.json({ error: orgError.message }, 400)
    }

    // Add user as owner
    await supabaseAdmin.from('organization_members').insert({
      organization_id: org.id,
      user_id: user.id,
      role: 'owner',
      accepted_at: new Date().toISOString(),
    })

    return c.json({
      user: { id: user.id, email, fullName },
      organization: { id: org.id, name: org.name, slug: org.slug },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Validation error', details: error.errors }, 400)
    }
    console.error('Signup error:', error)
    return c.json({ error: 'Failed to create account' }, 500)
  }
})

// Sign in
app.post('/signin', async (c) => {
  try {
    const body = await c.req.json()
    const { email, password } = signinSchema.parse(body)

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return c.json({ error: error.message }, 401)
    }

    // Get user with organizations
    const { data: user } = await supabaseAdmin
      .from('users')
      .select(`
        *,
        organization_members (
          role,
          organization:organizations (*)
        )
      `)
      .eq('auth_id', data.user.id)
      .single()

    return c.json({
      session: data.session,
      user,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Validation error', details: error.errors }, 400)
    }
    return c.json({ error: 'Failed to sign in' }, 500)
  }
})

// Sign out
app.post('/signout', async (c) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  // In production, you'd invalidate the session server-side
  return c.json({ success: true })
})

// Get current user
app.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const token = authHeader.slice(7)
  const { data: { user: authUser }, error } = await supabaseAdmin.auth.getUser(token)

  if (error || !authUser) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const { data: user } = await supabaseAdmin
    .from('users')
    .select(`
      *,
      organization_members (
        role,
        organization:organizations (*)
      )
    `)
    .eq('auth_id', authUser.id)
    .single()

  return c.json({ user })
})

// Forgot password
app.post('/forgot-password', async (c) => {
  const { email } = await c.req.json()

  const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.APP_URL}/reset-password`,
  })

  if (error) {
    // Don't reveal if email exists
    console.error('Reset password error:', error)
  }

  return c.json({ message: 'If an account exists, a reset link has been sent.' })
})

export default app
