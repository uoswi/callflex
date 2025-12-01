import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'

import auth from './routes/auth'
import organizations from './routes/organizations'
import templates from './routes/templates'
import assistants from './routes/assistants'
import phoneNumbers from './routes/phone-numbers'
import calls from './routes/calls'
import billing from './routes/billing'
import webhooksVapi from './routes/webhooks/vapi'
import webhooksStripe from './routes/webhooks/stripe'
import webhooksTwilio from './routes/webhooks/twilio'

const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', prettyJSON())
app.use(
  '*',
  cors({
    origin: [
      'http://localhost:3000',
      process.env.APP_URL || 'https://app.callflex.com',
    ],
    credentials: true,
  })
)

// Health check
app.get('/', (c) => c.json({ status: 'ok', service: 'callflex-api', version: '0.1.0' }))
app.get('/health', (c) => c.json({ status: 'healthy' }))

// API routes
app.route('/api/v1/auth', auth)
app.route('/api/v1/organizations', organizations)
app.route('/api/v1/templates', templates)
app.route('/api/v1/assistants', assistants)
app.route('/api/v1/phone-numbers', phoneNumbers)
app.route('/api/v1/calls', calls)
app.route('/api/v1/billing', billing)

// Webhook routes
app.route('/api/webhooks/vapi', webhooksVapi)
app.route('/api/webhooks/stripe', webhooksStripe)
app.route('/api/webhooks/twilio', webhooksTwilio)

// 404 handler
app.notFound((c) => c.json({ error: 'Not Found' }, 404))

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err)
  return c.json({ error: 'Internal Server Error' }, 500)
})

const port = Number(process.env.PORT) || 8787

console.log(`🚀 CallFlex API running on port ${port}`)

serve({
  fetch: app.fetch,
  port,
})

export default app
