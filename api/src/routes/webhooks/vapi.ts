import { Hono } from 'hono'
import { supabaseAdmin } from '../../lib/supabase'
import crypto from 'crypto'

const app = new Hono()

// Verify VAPI webhook signature
function verifySignature(body: string, signature: string | undefined): boolean {
  if (!signature || !process.env.VAPI_WEBHOOK_SECRET) {
    return false
  }

  const expectedSignature = crypto
    .createHmac('sha256', process.env.VAPI_WEBHOOK_SECRET)
    .update(body)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

// Main webhook handler
app.post('/:organizationId', async (c) => {
  const organizationId = c.req.param('organizationId')
  const signature = c.req.header('x-vapi-signature')
  const rawBody = await c.req.text()

  // Verify signature in production
  if (process.env.NODE_ENV === 'production' && !verifySignature(rawBody, signature)) {
    return c.json({ error: 'Invalid signature' }, 401)
  }

  const event = JSON.parse(rawBody)
  console.log(`VAPI webhook: ${event.type} for org ${organizationId}`)

  try {
    switch (event.type) {
      case 'call-start':
        await handleCallStart(organizationId, event)
        break

      case 'call-end':
        await handleCallEnd(organizationId, event)
        break

      case 'transcript':
        await handleTranscript(organizationId, event)
        break

      case 'function-call':
        return await handleFunctionCall(organizationId, event, c)

      default:
        console.log(`Unhandled VAPI event: ${event.type}`)
    }

    return c.json({ received: true })
  } catch (error) {
    console.error('VAPI webhook error:', error)
    return c.json({ error: 'Webhook processing failed' }, 500)
  }
})

async function handleCallStart(organizationId: string, event: { call: Record<string, unknown> }) {
  const { call } = event

  await supabaseAdmin.from('calls').insert({
    organization_id: organizationId,
    vapi_call_id: call.id as string,
    from_number: (call.customer as { number?: string })?.number || 'unknown',
    to_number: (call.phoneNumber as { number?: string })?.number || 'unknown',
    started_at: new Date().toISOString(),
    status: 'in-progress',
    direction: 'inbound',
    phone_number_id: (call.phoneNumber as { id?: string })?.id,
    assistant_id: (call.assistant as { id?: string })?.id,
  })

  // Broadcast to realtime
  await supabaseAdmin.channel(`org:${organizationId}`).send({
    type: 'broadcast',
    event: 'call_started',
    payload: {
      callId: call.id,
      from: (call.customer as { number?: string })?.number,
    },
  })
}

async function handleCallEnd(organizationId: string, event: { call: Record<string, unknown> }) {
  const { call } = event

  // Find existing call record
  const { data: existingCall } = await supabaseAdmin
    .from('calls')
    .select('id, created_at')
    .eq('vapi_call_id', call.id as string)
    .single()

  if (existingCall) {
    // Update call record
    await supabaseAdmin
      .from('calls')
      .update({
        ended_at: new Date().toISOString(),
        duration_seconds: call.duration as number,
        status: 'completed',
        ended_reason: call.endedReason as string,
        cost_cents: Math.round(((call.cost as number) || 0) * 100),
        summary: call.summary as string,
      })
      .eq('id', existingCall.id)
      .eq('created_at', existingCall.created_at)

    // Store transcript
    if (call.transcript) {
      await supabaseAdmin.from('call_transcripts').insert({
        call_id: existingCall.id,
        call_created_at: existingCall.created_at,
        organization_id: organizationId,
        transcript_text: call.transcript as string,
        transcript_segments: call.messages as unknown,
        summary: call.summary as string,
      })
    }

    // Store recording metadata
    if (call.recordingUrl) {
      await supabaseAdmin.from('call_recordings').insert({
        call_id: existingCall.id,
        call_created_at: existingCall.created_at,
        organization_id: organizationId,
        storage_path: call.recordingUrl as string,
        duration_seconds: call.duration as number,
      })
    }

    // Update usage
    const minutes = Math.ceil((call.duration as number) / 60)
    await supabaseAdmin.rpc('increment_usage', {
      org_id: organizationId,
      minutes_to_add: minutes,
    }).catch(() => {
      // If RPC doesn't exist, update directly
      supabaseAdmin
        .from('organizations')
        .update({
          current_period_minutes_used: supabaseAdmin.rpc('increment', {
            x: minutes,
          }),
        })
        .eq('id', organizationId)
    })
  }

  // Broadcast to realtime
  await supabaseAdmin.channel(`org:${organizationId}`).send({
    type: 'broadcast',
    event: 'call_ended',
    payload: {
      callId: call.id,
      duration: call.duration,
      summary: call.summary,
    },
  })
}

async function handleTranscript(organizationId: string, event: { call: { id: string }; transcript: string }) {
  // Real-time transcript update
  await supabaseAdmin.channel(`org:${organizationId}`).send({
    type: 'broadcast',
    event: 'transcript_update',
    payload: {
      callId: event.call.id,
      transcript: event.transcript,
    },
  })
}

async function handleFunctionCall(
  organizationId: string,
  event: { call: Record<string, unknown>; functionCall: { name: string; parameters: Record<string, unknown> } },
  c: Parameters<Parameters<typeof app.post>[1]>[0]
) {
  const { call, functionCall } = event

  // Get org settings
  const { data: org } = await supabaseAdmin
    .from('organizations')
    .select('settings')
    .eq('id', organizationId)
    .single()

  let result: Record<string, unknown>

  switch (functionCall.name) {
    case 'transferCall':
      result = await executeTransferCall(organizationId, org, functionCall.parameters, call)
      break

    case 'takeMessage':
      result = await executeTakeMessage(organizationId, org, functionCall.parameters, call)
      break

    case 'scheduleCallback':
      result = await executeScheduleCallback(organizationId, functionCall.parameters, call)
      break

    default:
      result = { success: false, message: 'Unknown function' }
  }

  return c.json({ result })
}

async function executeTransferCall(
  organizationId: string,
  org: { settings?: Record<string, unknown> } | null,
  params: Record<string, unknown>,
  call: Record<string, unknown>
) {
  const settings = org?.settings as { transfer_numbers?: Record<string, string> } | undefined
  const destinations = settings?.transfer_numbers || {}
  const destination = params.destination as string
  const phoneNumber = destinations[destination]

  if (!phoneNumber) {
    return {
      success: false,
      message: `Sorry, I don't have a ${destination} number configured. Let me take a message instead.`,
    }
  }

  // Log action
  await supabaseAdmin.from('call_actions').insert({
    call_id: call.id as string,
    call_created_at: new Date().toISOString(),
    organization_id: organizationId,
    action_type: 'transfer',
    action_data: {
      destination,
      phone_number: phoneNumber,
      reason: params.reason,
    },
    status: 'completed',
    triggered_at: new Date().toISOString(),
  })

  return {
    success: true,
    message: `I'm transferring you to ${destination} now. Please hold.`,
    transfer: { number: phoneNumber },
  }
}

async function executeTakeMessage(
  organizationId: string,
  org: { settings?: Record<string, unknown> } | null,
  params: Record<string, unknown>,
  call: Record<string, unknown>
) {
  // Log action
  await supabaseAdmin.from('call_actions').insert({
    call_id: call.id as string,
    call_created_at: new Date().toISOString(),
    organization_id: organizationId,
    action_type: 'message_taken',
    action_data: params,
    status: 'completed',
    triggered_at: new Date().toISOString(),
  })

  // TODO: Send SMS/email notification

  return {
    success: true,
    message: `I've taken your message${params.messageFor ? ` for ${params.messageFor}` : ''}. Someone will get back to you soon.`,
  }
}

async function executeScheduleCallback(
  organizationId: string,
  params: Record<string, unknown>,
  call: Record<string, unknown>
) {
  // Log action
  await supabaseAdmin.from('call_actions').insert({
    call_id: call.id as string,
    call_created_at: new Date().toISOString(),
    organization_id: organizationId,
    action_type: 'callback_scheduled',
    action_data: params,
    status: 'pending',
    triggered_at: new Date().toISOString(),
  })

  return {
    success: true,
    message: `Perfect, I've scheduled a callback for you. Someone will call you at ${params.phoneNumber} ${params.preferredTime ? `around ${params.preferredTime}` : 'as soon as possible'}.`,
  }
}

export default app
