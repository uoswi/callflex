import { Hono } from 'hono'
import { supabaseAdmin } from '../../lib/supabase'

const app = new Hono()

// Call status callback
app.post('/status', async (c) => {
  const body = await c.req.parseBody()

  console.log('Twilio status callback:', body)

  const callSid = body.CallSid as string
  const status = body.CallStatus as string
  const duration = body.CallDuration as string

  // Update call record if we're tracking by Twilio SID
  if (callSid && status) {
    const { data: call } = await supabaseAdmin
      .from('calls')
      .select('id, created_at')
      .eq('provider_call_sid', callSid)
      .single()

    if (call) {
      await supabaseAdmin
        .from('calls')
        .update({
          status: mapTwilioStatus(status),
          duration_seconds: duration ? parseInt(duration) : undefined,
        })
        .eq('id', call.id)
        .eq('created_at', call.created_at)
    }
  }

  return c.text('OK')
})

// SMS status callback
app.post('/sms-status', async (c) => {
  const body = await c.req.parseBody()

  console.log('Twilio SMS status callback:', body)

  // Log SMS delivery status if needed
  // For now just acknowledge

  return c.text('OK')
})

function mapTwilioStatus(status: string): string {
  switch (status) {
    case 'queued':
    case 'ringing':
    case 'in-progress':
      return 'in-progress'
    case 'completed':
      return 'completed'
    case 'busy':
    case 'failed':
    case 'no-answer':
    case 'canceled':
      return 'failed'
    default:
      return status
  }
}

export default app
