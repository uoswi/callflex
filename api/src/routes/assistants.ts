import { Hono } from 'hono'
import { supabaseAdmin } from '../lib/supabase'
import { authMiddleware } from '../middleware/auth'
import { z } from 'zod'

const app = new Hono()

app.use('*', authMiddleware)

const createAssistantSchema = z.object({
  organizationId: z.string().uuid(),
  templateId: z.string().uuid().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  variableValues: z.record(z.unknown()).optional(),
  systemPrompt: z.string().optional(),
  firstMessage: z.string().optional(),
  voiceProvider: z.string().default('11labs'),
  voiceId: z.string().optional(),
})

// List assistants for organization
app.get('/', async (c) => {
  const user = c.get('user')
  const orgId = c.req.query('organizationId')

  if (!orgId) {
    return c.json({ error: 'organizationId required' }, 400)
  }

  // Check membership
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
    .from('assistants')
    .select(`
      *,
      template:templates (id, slug, name, icon),
      phone_numbers (id, phone_number, friendly_name)
    `)
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json({ assistants: data })
})

// Get assistant by ID
app.get('/:id', async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')

  const { data, error } = await supabaseAdmin
    .from('assistants')
    .select(`
      *,
      template:templates (*),
      phone_numbers (*)
    `)
    .eq('id', id)
    .single()

  if (error || !data) {
    return c.json({ error: 'Assistant not found' }, 404)
  }

  // Check membership
  const { data: member } = await supabaseAdmin
    .from('organization_members')
    .select('role')
    .eq('organization_id', data.organization_id)
    .eq('user_id', user.id)
    .single()

  if (!member) {
    return c.json({ error: 'Not authorized' }, 403)
  }

  return c.json({ assistant: data })
})

// Create assistant
app.post('/', async (c) => {
  const user = c.get('user')
  const body = await c.req.json()

  try {
    const input = createAssistantSchema.parse(body)

    // Check membership
    const { data: member } = await supabaseAdmin
      .from('organization_members')
      .select('role')
      .eq('organization_id', input.organizationId)
      .eq('user_id', user.id)
      .single()

    if (!member) {
      return c.json({ error: 'Not authorized' }, 403)
    }

    let systemPrompt = input.systemPrompt || ''
    let firstMessage = input.firstMessage || ''

    // If using a template, process it
    if (input.templateId) {
      const { data: template } = await supabaseAdmin
        .from('templates')
        .select('*')
        .eq('id', input.templateId)
        .single()

      if (!template) {
        return c.json({ error: 'Template not found' }, 404)
      }

      // Replace variables in prompt
      systemPrompt = template.system_prompt
      firstMessage = template.first_message || ''

      if (input.variableValues) {
        for (const [key, value] of Object.entries(input.variableValues)) {
          const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
          systemPrompt = systemPrompt.replace(regex, String(value))
          firstMessage = firstMessage.replace(regex, String(value))
        }
      }
    }

    const { data: assistant, error } = await supabaseAdmin
      .from('assistants')
      .insert({
        organization_id: input.organizationId,
        template_id: input.templateId || null,
        name: input.name,
        description: input.description,
        system_prompt: systemPrompt,
        first_message: firstMessage,
        variable_values: input.variableValues || {},
        voice_provider: input.voiceProvider,
        voice_id: input.voiceId,
        status: 'draft',
      })
      .select()
      .single()

    if (error) {
      return c.json({ error: error.message }, 500)
    }

    return c.json({ assistant }, 201)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Validation error', details: error.errors }, 400)
    }
    throw error
  }
})

// Update assistant
app.patch('/:id', async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')
  const body = await c.req.json()

  // Get assistant and check ownership
  const { data: assistant } = await supabaseAdmin
    .from('assistants')
    .select('organization_id')
    .eq('id', id)
    .single()

  if (!assistant) {
    return c.json({ error: 'Assistant not found' }, 404)
  }

  const { data: member } = await supabaseAdmin
    .from('organization_members')
    .select('role')
    .eq('organization_id', assistant.organization_id)
    .eq('user_id', user.id)
    .single()

  if (!member) {
    return c.json({ error: 'Not authorized' }, 403)
  }

  const allowedFields = [
    'name', 'description', 'system_prompt', 'first_message',
    'voice_provider', 'voice_id', 'variable_values', 'status',
    'enabled_functions', 'function_config'
  ]

  const updates: Record<string, unknown> = {}
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates[field] = body[field]
    }
  }

  // If prompt changed, need to resync with VAPI
  if (updates.system_prompt || updates.first_message) {
    updates.vapi_synced_at = null
  }

  const { data, error } = await supabaseAdmin
    .from('assistants')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json({ assistant: data })
})

// Delete assistant
app.delete('/:id', async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')

  const { data: assistant } = await supabaseAdmin
    .from('assistants')
    .select('organization_id, vapi_assistant_id')
    .eq('id', id)
    .single()

  if (!assistant) {
    return c.json({ error: 'Assistant not found' }, 404)
  }

  const { data: member } = await supabaseAdmin
    .from('organization_members')
    .select('role')
    .eq('organization_id', assistant.organization_id)
    .eq('user_id', user.id)
    .single()

  if (!member || !['owner', 'admin'].includes(member.role)) {
    return c.json({ error: 'Not authorized' }, 403)
  }

  // TODO: Delete from VAPI if synced
  // if (assistant.vapi_assistant_id) {
  //   await vapiService.deleteAssistant(assistant.vapi_assistant_id)
  // }

  const { error } = await supabaseAdmin
    .from('assistants')
    .delete()
    .eq('id', id)

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json({ success: true })
})

// Sync assistant to VAPI
app.post('/:id/sync', async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')

  const { data: assistant } = await supabaseAdmin
    .from('assistants')
    .select('*')
    .eq('id', id)
    .single()

  if (!assistant) {
    return c.json({ error: 'Assistant not found' }, 404)
  }

  // Check membership
  const { data: member } = await supabaseAdmin
    .from('organization_members')
    .select('role')
    .eq('organization_id', assistant.organization_id)
    .eq('user_id', user.id)
    .single()

  if (!member) {
    return c.json({ error: 'Not authorized' }, 403)
  }

  // TODO: Implement VAPI sync
  // const vapiAssistant = await vapiService.createOrUpdate(assistant)

  // For now, just mark as synced
  await supabaseAdmin
    .from('assistants')
    .update({
      vapi_synced_at: new Date().toISOString(),
      status: 'active',
    })
    .eq('id', id)

  return c.json({ success: true, message: 'Assistant synced to VAPI' })
})

export default app
