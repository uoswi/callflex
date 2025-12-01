# API Architecture & VAPI Integration

## Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                        │
│                         Next.js on Railway                                   │
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Landing    │  │    Auth      │  │  Dashboard   │  │   Settings   │   │
│  │    Pages     │  │   Flows      │  │    App       │  │    Panel     │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ API Calls
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                               BACKEND                                        │
│                          Hono on Railway                                     │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                           API Routes                                  │  │
│  │                                                                       │  │
│  │  /api/v1/                    /api/webhooks/                          │  │
│  │  ├── auth/                   ├── vapi/          (VAPI events)        │  │
│  │  ├── organizations/          ├── twilio/        (Twilio events)      │  │
│  │  ├── phone-numbers/          ├── stripe/        (Billing events)     │  │
│  │  ├── assistants/             └── integrations/  (Zapier, etc.)       │  │
│  │  ├── calls/                                                          │  │
│  │  ├── contacts/                                                       │  │
│  │  └── integrations/                                                   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                      │                                       │
│  ┌──────────────┐                    │         ┌──────────────┐            │
│  │   Services   │                    │         │   Realtime   │            │
│  │   (Twilio,   │                    │         │  (Supabase)  │            │
│  │    VAPI)     │                    │         │              │            │
│  └──────────────┘                    │         └──────────────┘            │
└──────────────────────────────────────┼─────────────────────────────────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
                    ▼                  ▼                  ▼
┌───────────────────────┐  ┌───────────────────────┐  ┌───────────────────────┐
│    TEMPORAL CLOUD     │  │       SUPABASE        │  │        REDIS          │
│                       │  │                       │  │   (Upstash/Railway)   │
│  ┌─────────────────┐  │  │  ┌──────┐ ┌───────┐  │  │                       │
│  │ Call Processing │  │  │  │ Auth │ │Postgres│  │  │  • Rate limiting      │
│  │ Workflow        │  │  │  └──────┘ └───────┘  │  │  • Session cache       │
│  ├─────────────────┤  │  │  ┌──────┐ ┌───────┐  │  │  • Real-time counters  │
│  │ Webhook Delivery│  │  │  │Store │ │Realtime│  │  │  • Pub/sub            │
│  │ Workflow        │  │  │  └──────┘ └───────┘  │  │                       │
│  ├─────────────────┤  │  │                       │  │                       │
│  │ Billing Cycle   │  │  └───────────────────────┘  └───────────────────────┘
│  │ Workflow        │  │
│  ├─────────────────┤  │
│  │ Onboarding      │  │
│  │ Workflow        │  │
│  └─────────────────┘  │
└───────────────────────┘
```

---

## Tech Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 14 on Railway | Dashboard, landing pages |
| Backend | Hono on Railway | API, webhooks |
| Database | Supabase Postgres | Primary data store |
| Auth | Supabase Auth | User authentication |
| Realtime | Supabase Realtime | Live dashboard updates |
| Storage | Supabase Storage | Call recordings |
| Cache | Redis (Upstash) | Rate limiting, sessions, counters |
| Background Jobs | **Temporal Cloud** | Durable workflows |
| Voice AI | VAPI | Call handling |
| Telephony | Twilio | Phone numbers, SMS |
| Billing | Stripe | Subscriptions, usage |
| Email | Resend | Transactional emails |

---

## API Routes

### Authentication

```
POST   /api/v1/auth/signup              Create account
POST   /api/v1/auth/signin              Sign in
POST   /api/v1/auth/signout             Sign out
POST   /api/v1/auth/forgot-password     Request password reset
POST   /api/v1/auth/reset-password      Reset password
GET    /api/v1/auth/me                  Get current user
```

### Organizations

```
GET    /api/v1/organizations            List user's organizations
POST   /api/v1/organizations            Create organization
GET    /api/v1/organizations/:id        Get organization details
PATCH  /api/v1/organizations/:id        Update organization
DELETE /api/v1/organizations/:id        Delete organization

GET    /api/v1/organizations/:id/members       List members
POST   /api/v1/organizations/:id/members       Invite member
PATCH  /api/v1/organizations/:id/members/:uid  Update member role
DELETE /api/v1/organizations/:id/members/:uid  Remove member
```

### Phone Numbers

```
GET    /api/v1/phone-numbers                   List org's numbers
POST   /api/v1/phone-numbers                   Provision new number
GET    /api/v1/phone-numbers/:id               Get number details
PATCH  /api/v1/phone-numbers/:id               Update number config
DELETE /api/v1/phone-numbers/:id               Release number

POST   /api/v1/phone-numbers/search            Search available numbers
POST   /api/v1/phone-numbers/:id/test          Trigger test call
```

### Assistants

```
GET    /api/v1/assistants                      List assistants
POST   /api/v1/assistants                      Create assistant
GET    /api/v1/assistants/:id                  Get assistant
PATCH  /api/v1/assistants/:id                  Update assistant
DELETE /api/v1/assistants/:id                  Delete assistant

POST   /api/v1/assistants/:id/sync             Sync to VAPI
POST   /api/v1/assistants/:id/test             Test assistant
```

### Templates

```
GET    /api/v1/templates                       List available templates
GET    /api/v1/templates/:slug                 Get template details
```

### Calls

```
GET    /api/v1/calls                           List calls (paginated)
GET    /api/v1/calls/:id                       Get call details
GET    /api/v1/calls/:id/transcript            Get transcript
GET    /api/v1/calls/:id/recording             Get recording URL
GET    /api/v1/calls/:id/actions               Get call actions

GET    /api/v1/calls/stats                     Get call statistics
```

### Contacts

```
GET    /api/v1/contacts                        List contacts
POST   /api/v1/contacts                        Create contact
GET    /api/v1/contacts/:id                    Get contact
PATCH  /api/v1/contacts/:id                    Update contact
DELETE /api/v1/contacts/:id                    Delete contact

GET    /api/v1/contacts/:id/calls              Get contact's calls
```

### Integrations

```
GET    /api/v1/integrations                    List integrations
POST   /api/v1/integrations/:provider/connect  Start OAuth flow
DELETE /api/v1/integrations/:provider          Disconnect
PATCH  /api/v1/integrations/:provider          Update config
POST   /api/v1/integrations/:provider/test     Test integration
```

### Billing

```
GET    /api/v1/billing                         Get billing overview
GET    /api/v1/billing/usage                   Get current usage
POST   /api/v1/billing/portal                  Create Stripe portal session
POST   /api/v1/billing/checkout                Create checkout session
GET    /api/v1/billing/invoices                List invoices
```

---

## VAPI Integration Details

### Setup Flow

```
1. Customer creates assistant in our app
   ↓
2. We generate system prompt from template + variables
   ↓
3. We create assistant in VAPI via API
   ↓
4. We provision Twilio number
   ↓
5. We configure Twilio to forward to VAPI
   ↓
6. We store VAPI assistant ID with phone number
   ↓
7. Customer's line is live
```

### VAPI Assistant Creation

```typescript
// services/vapi.ts

import Vapi from '@vapi-ai/server-sdk';

const vapi = new Vapi({ apiKey: process.env.VAPI_API_KEY });

interface CreateAssistantParams {
  organizationId: string;
  name: string;
  systemPrompt: string;
  voiceId?: string;
  functions?: VapiFunction[];
}

export async function createVapiAssistant(params: CreateAssistantParams) {
  const assistant = await vapi.assistants.create({
    name: params.name,
    
    model: {
      provider: 'openai',
      model: 'gpt-4o-mini',
      temperature: 0.7,
      systemPrompt: params.systemPrompt,
    },
    
    voice: {
      provider: '11labs',
      voiceId: params.voiceId || 'pNInz6obpgDQGcFmaJgB', // Default: Adam
      stability: 0.5,
      similarityBoost: 0.75,
    },
    
    // First message the AI says
    firstMessage: "Hello, thanks for calling. How can I help you today?",
    
    // End call conditions
    endCallMessage: "Thanks for calling. Goodbye!",
    endCallPhrases: ["goodbye", "bye", "that's all", "thank you bye"],
    
    // Transcription settings
    transcriber: {
      provider: 'deepgram',
      model: 'nova-2',
      language: 'en',
    },
    
    // Functions the AI can call
    functions: params.functions || [],
    
    // Webhook for events
    serverUrl: `${process.env.API_URL}/api/webhooks/vapi/${params.organizationId}`,
    serverUrlSecret: process.env.VAPI_WEBHOOK_SECRET,
    
    // Recording
    recordingEnabled: true,
    
    // Interruption handling
    silenceTimeoutSeconds: 30,
    maxDurationSeconds: 600, // 10 min max
    backgroundSound: 'office',
    
    // Metadata we'll receive in webhooks
    metadata: {
      organizationId: params.organizationId,
    },
  });
  
  return assistant;
}
```

### VAPI Function Definitions

```typescript
// services/vapi-functions.ts

export const vapiTransferCall: VapiFunction = {
  name: 'transferCall',
  description: 'Transfer the call to another number (dispatch, manager, etc.)',
  parameters: {
    type: 'object',
    properties: {
      destination: {
        type: 'string',
        enum: ['dispatch', 'manager', 'emergency'],
        description: 'Who to transfer to',
      },
      reason: {
        type: 'string',
        description: 'Brief reason for the transfer',
      },
      warm: {
        type: 'boolean',
        description: 'Whether to do a warm transfer (announce caller first)',
        default: false,
      },
    },
    required: ['destination', 'reason'],
  },
};

export const vapiLogDriverCallout: VapiFunction = {
  name: 'logDriverCallout',
  description: 'Log when a driver calls out sick or unavailable',
  parameters: {
    type: 'object',
    properties: {
      driverName: {
        type: 'string',
        description: 'Name of the driver',
      },
      reason: {
        type: 'string',
        enum: ['sick', 'emergency', 'vehicle_issue', 'personal', 'other'],
        description: 'Reason for calling out',
      },
      routeNumber: {
        type: 'string',
        description: 'Route number or area assigned',
      },
      expectedReturn: {
        type: 'string',
        description: 'When they expect to return (e.g., "tomorrow", "Monday")',
      },
      additionalNotes: {
        type: 'string',
        description: 'Any additional information',
      },
    },
    required: ['driverName', 'reason'],
  },
};

export const vapiScheduleCallback: VapiFunction = {
  name: 'scheduleCallback',
  description: 'Schedule a callback for the caller',
  parameters: {
    type: 'object',
    properties: {
      phoneNumber: {
        type: 'string',
        description: 'Phone number to call back',
      },
      callerName: {
        type: 'string',
        description: 'Name of the caller',
      },
      reason: {
        type: 'string',
        description: 'What they need help with',
      },
      preferredTime: {
        type: 'string',
        description: 'When they prefer to be called back',
      },
      urgency: {
        type: 'string',
        enum: ['low', 'normal', 'high'],
        default: 'normal',
      },
    },
    required: ['phoneNumber', 'reason'],
  },
};

export const vapiTakeMessage: VapiFunction = {
  name: 'takeMessage',
  description: 'Take a message for someone',
  parameters: {
    type: 'object',
    properties: {
      callerName: {
        type: 'string',
      },
      callerPhone: {
        type: 'string',
      },
      messageFor: {
        type: 'string',
        description: 'Who the message is for',
      },
      message: {
        type: 'string',
        description: 'The message content',
      },
      urgent: {
        type: 'boolean',
        default: false,
      },
    },
    required: ['message'],
  },
};
```

### VAPI Webhook Handler

```typescript
// routes/webhooks/vapi.ts

import { Hono } from 'hono';
import { supabase } from '../../lib/supabase';
import { sendSmsNotification } from '../../services/notifications';
import { processTransferCall } from '../../services/call-actions';

const app = new Hono();

// Verify webhook signature
app.use('/*', async (c, next) => {
  const signature = c.req.header('x-vapi-signature');
  const body = await c.req.text();
  
  if (!verifyVapiSignature(body, signature)) {
    return c.json({ error: 'Invalid signature' }, 401);
  }
  
  c.set('body', JSON.parse(body));
  await next();
});

// Main webhook endpoint: /api/webhooks/vapi/:organizationId
app.post('/:organizationId', async (c) => {
  const organizationId = c.req.param('organizationId');
  const event = c.get('body');
  
  console.log(`VAPI webhook: ${event.type} for org ${organizationId}`);
  
  switch (event.type) {
    case 'call-start':
      await handleCallStart(organizationId, event);
      break;
      
    case 'call-end':
      await handleCallEnd(organizationId, event);
      break;
      
    case 'transcript':
      await handleTranscript(organizationId, event);
      break;
      
    case 'function-call':
      return await handleFunctionCall(organizationId, event, c);
      
    case 'hang':
      await handleHang(organizationId, event);
      break;
      
    case 'speech-update':
      // Real-time speech updates - could broadcast via Supabase Realtime
      break;
      
    default:
      console.log(`Unhandled VAPI event type: ${event.type}`);
  }
  
  return c.json({ success: true });
});

// ============================================================================
// Event Handlers
// ============================================================================

async function handleCallStart(organizationId: string, event: any) {
  const { call } = event;
  
  // Create call record
  await supabase.from('calls').insert({
    organization_id: organizationId,
    vapi_call_id: call.id,
    from_number: call.customer?.number || 'unknown',
    to_number: call.phoneNumber?.number || 'unknown',
    started_at: new Date().toISOString(),
    status: 'in-progress',
    direction: 'inbound',
    phone_number_id: call.phoneNumber?.id,
    assistant_id: call.assistant?.id,
    metadata: {
      vapi_phone_number_id: call.phoneNumber?.id,
      vapi_assistant_id: call.assistant?.id,
    },
  });
  
  // Broadcast to dashboard via Supabase Realtime
  await supabase
    .channel(`org:${organizationId}`)
    .send({
      type: 'broadcast',
      event: 'call_started',
      payload: {
        callId: call.id,
        from: call.customer?.number,
      },
    });
}

async function handleCallEnd(organizationId: string, event: any) {
  const { call } = event;
  
  // Update call record
  const { data: existingCall } = await supabase
    .from('calls')
    .select('id, created_at')
    .eq('vapi_call_id', call.id)
    .single();
    
  if (existingCall) {
    await supabase
      .from('calls')
      .update({
        ended_at: new Date().toISOString(),
        duration_seconds: call.duration,
        status: 'completed',
        ended_reason: call.endedReason,
        vapi_cost_cents: Math.round((call.cost || 0) * 100),
        total_cost_cents: Math.round((call.cost || 0) * 100),
      })
      .eq('id', existingCall.id)
      .eq('created_at', existingCall.created_at);
      
    // Store transcript
    if (call.transcript) {
      await supabase.from('call_transcripts').insert({
        call_id: existingCall.id,
        call_created_at: existingCall.created_at,
        organization_id: organizationId,
        transcript_text: call.transcript,
        transcript_segments: call.messages,
        summary: call.summary,
        extracted_data: call.analysis || {},
      });
    }
    
    // Store recording
    if (call.recordingUrl) {
      await supabase.from('call_recordings').insert({
        call_id: existingCall.id,
        call_created_at: existingCall.created_at,
        organization_id: organizationId,
        storage_path: call.recordingUrl, // We might want to download and store in Supabase Storage
        duration_seconds: call.duration,
      });
    }
  }
  
  // Get org settings for notifications
  const { data: org } = await supabase
    .from('organizations')
    .select('settings')
    .eq('id', organizationId)
    .single();
    
  // Send SMS summary if enabled
  if (org?.settings?.notifications?.sms_enabled) {
    const smsNumbers = org.settings.notifications.sms_numbers || [];
    for (const number of smsNumbers) {
      await sendSmsNotification({
        to: number,
        body: formatCallSummary(call),
      });
    }
  }
  
  // Broadcast to dashboard
  await supabase
    .channel(`org:${organizationId}`)
    .send({
      type: 'broadcast',
      event: 'call_ended',
      payload: {
        callId: call.id,
        duration: call.duration,
        summary: call.summary,
      },
    });
}

async function handleTranscript(organizationId: string, event: any) {
  // Real-time transcript updates
  // Could be used for live dashboard updates
  const { call, transcript } = event;
  
  await supabase
    .channel(`org:${organizationId}`)
    .send({
      type: 'broadcast',
      event: 'transcript_update',
      payload: {
        callId: call.id,
        transcript: transcript,
      },
    });
}

async function handleFunctionCall(organizationId: string, event: any, c: any) {
  const { call, functionCall } = event;
  
  // Get org config for function execution
  const { data: org } = await supabase
    .from('organizations')
    .select('settings')
    .eq('id', organizationId)
    .single();
    
  let result: any;
  
  switch (functionCall.name) {
    case 'transferCall':
      result = await executeTransferCall(organizationId, org, functionCall.parameters, call);
      break;
      
    case 'logDriverCallout':
      result = await executeLogDriverCallout(organizationId, org, functionCall.parameters, call);
      break;
      
    case 'scheduleCallback':
      result = await executeScheduleCallback(organizationId, functionCall.parameters, call);
      break;
      
    case 'takeMessage':
      result = await executeTakeMessage(organizationId, org, functionCall.parameters, call);
      break;
      
    default:
      result = { success: false, error: 'Unknown function' };
  }
  
  // Return result to VAPI - this determines what the AI says next
  return c.json({ result });
}

// ============================================================================
// Function Executors
// ============================================================================

async function executeTransferCall(
  organizationId: string,
  org: any,
  params: { destination: string; reason: string; warm?: boolean },
  call: any
) {
  // Get transfer destination from org settings
  const destinations: Record<string, string> = {
    dispatch: org?.settings?.transfer_numbers?.dispatch,
    manager: org?.settings?.transfer_numbers?.manager,
    emergency: org?.settings?.transfer_numbers?.emergency,
  };
  
  const phoneNumber = destinations[params.destination];
  
  if (!phoneNumber) {
    return {
      success: false,
      message: `Sorry, I don't have a ${params.destination} number configured. Let me take a message instead.`,
    };
  }
  
  // Log the action
  await supabase.from('call_actions').insert({
    call_id: call.id,
    call_created_at: new Date().toISOString(), // Would need to look up actual
    organization_id: organizationId,
    action_type: 'transfer',
    action_data: {
      destination: params.destination,
      phone_number: phoneNumber,
      reason: params.reason,
      warm: params.warm || false,
    },
    status: 'completed',
    triggered_at: new Date().toISOString(),
  });
  
  // Return transfer instruction to VAPI
  return {
    success: true,
    message: `I'm transferring you to ${params.destination} now. Please hold.`,
    transfer: {
      number: phoneNumber,
      warm: params.warm || false,
    },
  };
}

async function executeLogDriverCallout(
  organizationId: string,
  org: any,
  params: {
    driverName: string;
    reason: string;
    routeNumber?: string;
    expectedReturn?: string;
    additionalNotes?: string;
  },
  call: any
) {
  // Log the callout
  await supabase.from('call_actions').insert({
    call_id: call.id,
    call_created_at: new Date().toISOString(),
    organization_id: organizationId,
    action_type: 'driver_callout',
    action_data: params,
    status: 'completed',
    triggered_at: new Date().toISOString(),
  });
  
  // Send immediate notification to dispatch
  if (org?.settings?.notifications?.sms_enabled) {
    const smsNumbers = org.settings.notifications.sms_numbers || [];
    
    const message = `🚨 DRIVER CALLOUT\n` +
      `Driver: ${params.driverName}\n` +
      `Reason: ${params.reason}\n` +
      (params.routeNumber ? `Route: ${params.routeNumber}\n` : '') +
      (params.expectedReturn ? `Return: ${params.expectedReturn}\n` : '') +
      (params.additionalNotes ? `Notes: ${params.additionalNotes}` : '');
    
    for (const number of smsNumbers) {
      await sendSmsNotification({ to: number, body: message });
    }
  }
  
  return {
    success: true,
    message: `Got it, ${params.driverName}. I've logged your ${params.reason} and notified dispatch. ` +
      `Take care and we'll see you ${params.expectedReturn || 'when you're feeling better'}.`,
  };
}

async function executeScheduleCallback(
  organizationId: string,
  params: {
    phoneNumber: string;
    callerName?: string;
    reason: string;
    preferredTime?: string;
    urgency?: string;
  },
  call: any
) {
  // Log callback request
  await supabase.from('call_actions').insert({
    call_id: call.id,
    call_created_at: new Date().toISOString(),
    organization_id: organizationId,
    action_type: 'callback_scheduled',
    action_data: params,
    status: 'pending',
    triggered_at: new Date().toISOString(),
  });
  
  return {
    success: true,
    message: `Perfect, I've scheduled a callback for you. ` +
      `Someone will call you at ${params.phoneNumber} ` +
      (params.preferredTime ? `around ${params.preferredTime}` : 'as soon as possible') + '.',
  };
}

async function executeTakeMessage(
  organizationId: string,
  org: any,
  params: {
    callerName?: string;
    callerPhone?: string;
    messageFor?: string;
    message: string;
    urgent?: boolean;
  },
  call: any
) {
  // Log message
  await supabase.from('call_actions').insert({
    call_id: call.id,
    call_created_at: new Date().toISOString(),
    organization_id: organizationId,
    action_type: 'message_taken',
    action_data: params,
    status: 'completed',
    triggered_at: new Date().toISOString(),
  });
  
  // If urgent, send SMS immediately
  if (params.urgent && org?.settings?.notifications?.sms_enabled) {
    const message = `⚠️ URGENT MESSAGE\n` +
      (params.callerName ? `From: ${params.callerName}\n` : '') +
      (params.callerPhone ? `Phone: ${params.callerPhone}\n` : '') +
      `Message: ${params.message}`;
    
    for (const number of org.settings.notifications.sms_numbers || []) {
      await sendSmsNotification({ to: number, body: message });
    }
  }
  
  return {
    success: true,
    message: `I've taken your message` +
      (params.messageFor ? ` for ${params.messageFor}` : '') +
      `. Someone will get back to you soon.`,
  };
}

// ============================================================================
// Helpers
// ============================================================================

function formatCallSummary(call: any): string {
  const duration = Math.round(call.duration / 60);
  const from = call.customer?.number || 'Unknown';
  
  return `📞 Call Summary\n` +
    `From: ${from}\n` +
    `Duration: ${duration} min\n` +
    `${call.summary || 'No summary available'}`;
}

function verifyVapiSignature(body: string, signature: string | undefined): boolean {
  if (!signature || !process.env.VAPI_WEBHOOK_SECRET) return false;
  
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', process.env.VAPI_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');
    
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export default app;
```

### Twilio Number Provisioning

```typescript
// services/twilio.ts

import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

interface ProvisionNumberParams {
  organizationId: string;
  areaCode?: string;
  vapiAssistantId: string;
}

export async function searchAvailableNumbers(areaCode: string, limit = 10) {
  const numbers = await client.availablePhoneNumbers('US')
    .local
    .list({
      areaCode,
      voiceEnabled: true,
      smsEnabled: true,
      limit,
    });
    
  return numbers.map(n => ({
    phoneNumber: n.phoneNumber,
    friendlyName: n.friendlyName,
    locality: n.locality,
    region: n.region,
  }));
}

export async function provisionNumber(params: ProvisionNumberParams) {
  // Search for available number
  const available = await searchAvailableNumbers(params.areaCode || '415', 1);
  
  if (available.length === 0) {
    throw new Error('No numbers available in that area code');
  }
  
  const numberToBuy = available[0].phoneNumber;
  
  // Purchase the number
  const purchasedNumber = await client.incomingPhoneNumbers.create({
    phoneNumber: numberToBuy,
    voiceUrl: `https://${process.env.VAPI_PHONE_NUMBER_URL}/${params.vapiAssistantId}`,
    voiceMethod: 'POST',
    statusCallback: `${process.env.API_URL}/api/webhooks/twilio/status`,
    statusCallbackMethod: 'POST',
  });
  
  return {
    phoneNumber: purchasedNumber.phoneNumber,
    sid: purchasedNumber.sid,
    friendlyName: purchasedNumber.friendlyName,
  };
}

export async function releaseNumber(sid: string) {
  await client.incomingPhoneNumbers(sid).remove();
}

export async function updateNumberWebhook(sid: string, vapiAssistantId: string) {
  await client.incomingPhoneNumbers(sid).update({
    voiceUrl: `https://${process.env.VAPI_PHONE_NUMBER_URL}/${vapiAssistantId}`,
  });
}
```

---

## Stripe Integration

### Subscription Setup

```typescript
// services/stripe.ts

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createCustomer(email: string, orgName: string) {
  return stripe.customers.create({
    email,
    name: orgName,
  });
}

export async function createCheckoutSession(params: {
  customerId: string;
  priceId: string;
  organizationId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  return stripe.checkout.sessions.create({
    customer: params.customerId,
    mode: 'subscription',
    line_items: [{ price: params.priceId, quantity: 1 }],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    subscription_data: {
      metadata: {
        organizationId: params.organizationId,
      },
    },
  });
}

export async function createBillingPortalSession(customerId: string, returnUrl: string) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

export async function reportUsage(subscriptionItemId: string, minutes: number) {
  return stripe.subscriptionItems.createUsageRecord(
    subscriptionItemId,
    {
      quantity: minutes,
      timestamp: Math.floor(Date.now() / 1000),
      action: 'increment',
    }
  );
}
```

### Stripe Webhook Handler

```typescript
// routes/webhooks/stripe.ts

import { Hono } from 'hono';
import Stripe from 'stripe';
import { supabase } from '../../lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const app = new Hono();

app.post('/', async (c) => {
  const sig = c.req.header('stripe-signature')!;
  const body = await c.req.text();
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return c.json({ error: 'Invalid signature' }, 400);
  }
  
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutComplete(event.data.object as Stripe.Checkout.Session);
      break;
      
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;
      
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
      
    case 'invoice.paid':
      await handleInvoicePaid(event.data.object as Stripe.Invoice);
      break;
      
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object as Stripe.Invoice);
      break;
  }
  
  return c.json({ received: true });
});

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const organizationId = session.metadata?.organizationId;
  if (!organizationId) return;
  
  await supabase
    .from('organizations')
    .update({
      stripe_subscription_id: session.subscription as string,
      status: 'active',
    })
    .eq('id', organizationId);
    
  // Log billing event
  await supabase.from('billing_events').insert({
    organization_id: organizationId,
    event_type: 'subscription_created',
    stripe_event_id: session.id,
    metadata: { plan: session.metadata?.plan },
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('stripe_subscription_id', subscription.id)
    .single();
    
  if (!org) return;
  
  const status = subscription.status === 'active' ? 'active' :
                 subscription.status === 'past_due' ? 'past_due' :
                 subscription.status === 'canceled' ? 'canceled' : 'active';
  
  await supabase
    .from('organizations')
    .update({ status })
    .eq('id', org.id);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await supabase
    .from('organizations')
    .update({ status: 'canceled' })
    .eq('stripe_subscription_id', subscription.id);
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('stripe_customer_id', invoice.customer as string)
    .single();
    
  if (!org) return;
  
  // Reset usage for new period
  await supabase
    .from('organizations')
    .update({
      current_period_minutes_used: 0,
      current_period_start: new Date(invoice.period_start * 1000).toISOString(),
      current_period_end: new Date(invoice.period_end * 1000).toISOString(),
    })
    .eq('id', org.id);
    
  await supabase.from('billing_events').insert({
    organization_id: org.id,
    event_type: 'invoice_paid',
    stripe_invoice_id: invoice.id,
    amount_cents: invoice.amount_paid,
  });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('stripe_customer_id', invoice.customer as string)
    .single();
    
  if (!org) return;
  
  await supabase
    .from('organizations')
    .update({ status: 'past_due' })
    .eq('id', org.id);
    
  await supabase.from('billing_events').insert({
    organization_id: org.id,
    event_type: 'payment_failed',
    stripe_invoice_id: invoice.id,
    amount_cents: invoice.amount_due,
  });
  
  // TODO: Send email notification about failed payment
}

export default app;
```

---

## Environment Variables

```bash
# .env

# App
API_URL=https://api.callflex.com
APP_URL=https://app.callflex.com

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_KEY=xxx

# Redis (Upstash)
REDIS_URL=redis://xxx

# Temporal Cloud
TEMPORAL_ADDRESS=xxx.tmprl.cloud:7233
TEMPORAL_NAMESPACE=callflex-production
TEMPORAL_TLS_CERT=/path/to/client.pem
TEMPORAL_TLS_KEY=/path/to/client.key

# VAPI
VAPI_API_KEY=xxx
VAPI_WEBHOOK_SECRET=xxx
VAPI_PHONE_NUMBER_URL=phone.vapi.ai

# Twilio
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx

# Stripe
STRIPE_SECRET_KEY=sk_xxx
STRIPE_PUBLISHABLE_KEY=pk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Resend (Email)
RESEND_API_KEY=xxx

# Misc
NODE_ENV=production
```

---

## Temporal Cloud Workflows

Temporal handles all durable, long-running, and retry-sensitive operations.

### Temporal Setup

```typescript
// lib/temporal.ts

import { Connection, Client } from '@temporalio/client';
import { NativeConnection } from '@temporalio/worker';
import fs from 'fs';

// Client for starting workflows from API
export async function getTemporalClient(): Promise<Client> {
  const connection = await Connection.connect({
    address: process.env.TEMPORAL_ADDRESS,
    tls: {
      clientCertPair: {
        crt: fs.readFileSync(process.env.TEMPORAL_TLS_CERT!),
        key: fs.readFileSync(process.env.TEMPORAL_TLS_KEY!),
      },
    },
  });

  return new Client({
    connection,
    namespace: process.env.TEMPORAL_NAMESPACE,
  });
}

// Connection for workers
export async function getWorkerConnection(): Promise<NativeConnection> {
  return await NativeConnection.connect({
    address: process.env.TEMPORAL_ADDRESS,
    tls: {
      clientCertPair: {
        crt: fs.readFileSync(process.env.TEMPORAL_TLS_CERT!),
        key: fs.readFileSync(process.env.TEMPORAL_TLS_KEY!),
      },
    },
  });
}
```

### Worker Setup

```typescript
// workers/main.ts

import { Worker } from '@temporalio/worker';
import { getWorkerConnection } from '../lib/temporal';
import * as activities from './activities';

async function run() {
  const connection = await getWorkerConnection();

  const worker = await Worker.create({
    connection,
    namespace: process.env.TEMPORAL_NAMESPACE!,
    taskQueue: 'callflex-main',
    workflowsPath: require.resolve('./workflows'),
    activities,
  });

  await worker.run();
}

run().catch((err) => {
  console.error('Worker failed:', err);
  process.exit(1);
});
```

---

### Workflow 1: Call Processing

Triggered when a call ends. Handles transcription storage, AI summarization, notifications, and analytics.

```typescript
// workflows/call-processing.ts

import { proxyActivities, sleep } from '@temporalio/workflow';
import type * as activities from '../activities';

const {
  storeTranscript,
  generateCallSummary,
  extractCallData,
  storeRecording,
  sendNotifications,
  updateCallRecord,
  updateContactStats,
  updateDailyUsage,
  broadcastToRealtimeDashboard,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '2 minutes',
  retry: {
    maximumAttempts: 3,
    backoffCoefficient: 2,
  },
});

export interface CallProcessingInput {
  callId: string;
  organizationId: string;
  vapiCallId: string;
  transcript: string;
  transcriptSegments: any[];
  recordingUrl: string | null;
  duration: number;
  fromNumber: string;
  endedReason: string;
  cost: number;
}

export async function processCallWorkflow(input: CallProcessingInput): Promise<void> {
  const { callId, organizationId, transcript, transcriptSegments, recordingUrl } = input;

  // Step 1: Store transcript immediately
  await storeTranscript({
    callId,
    organizationId,
    transcriptText: transcript,
    segments: transcriptSegments,
  });

  // Step 2: AI summarization and data extraction (parallel)
  const [summary, extractedData] = await Promise.all([
    generateCallSummary({ transcript, organizationId }),
    extractCallData({ transcript, organizationId }),
  ]);

  // Step 3: Update call record with summary and extracted data
  await updateCallRecord({
    callId,
    summary,
    extractedData,
    callType: extractedData.callType,
    sentiment: extractedData.sentiment,
  });

  // Step 4: Store recording if available
  if (recordingUrl) {
    await storeRecording({
      callId,
      organizationId,
      sourceUrl: recordingUrl,
      duration: input.duration,
    });
  }

  // Step 5: Update contact stats
  await updateContactStats({
    organizationId,
    phoneNumber: input.fromNumber,
    callId,
  });

  // Step 6: Update daily usage for billing
  await updateDailyUsage({
    organizationId,
    minutes: Math.ceil(input.duration / 60),
    cost: input.cost,
  });

  // Step 7: Send notifications based on org settings
  await sendNotifications({
    organizationId,
    callId,
    summary,
    extractedData,
    fromNumber: input.fromNumber,
    duration: input.duration,
  });

  // Step 8: Broadcast to real-time dashboard
  await broadcastToRealtimeDashboard({
    organizationId,
    event: 'call_processed',
    data: { callId, summary, extractedData },
  });
}
```

### Workflow 2: Webhook Delivery

Reliable webhook delivery with exponential backoff and dead-letter handling.

```typescript
// workflows/webhook-delivery.ts

import { proxyActivities, sleep, continueAsNew } from '@temporalio/workflow';
import type * as activities from '../activities';

const {
  deliverWebhook,
  markWebhookFailed,
  logWebhookAttempt,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '30 seconds',
  retry: {
    maximumAttempts: 1, // We handle retries manually for backoff control
  },
});

export interface WebhookDeliveryInput {
  webhookId: string;
  organizationId: string;
  url: string;
  eventType: string;
  payload: any;
  attemptCount?: number;
  maxAttempts?: number;
}

const BACKOFF_SCHEDULE = [
  0,          // Immediate
  5 * 1000,   // 5 seconds
  30 * 1000,  // 30 seconds
  2 * 60 * 1000,   // 2 minutes
  10 * 60 * 1000,  // 10 minutes
  30 * 60 * 1000,  // 30 minutes
  60 * 60 * 1000,  // 1 hour
];

export async function webhookDeliveryWorkflow(input: WebhookDeliveryInput): Promise<void> {
  const attemptCount = input.attemptCount ?? 0;
  const maxAttempts = input.maxAttempts ?? 7;

  // Wait for backoff period
  if (attemptCount > 0 && attemptCount < BACKOFF_SCHEDULE.length) {
    await sleep(BACKOFF_SCHEDULE[attemptCount]);
  }

  try {
    const result = await deliverWebhook({
      url: input.url,
      payload: input.payload,
      eventType: input.eventType,
    });

    await logWebhookAttempt({
      webhookId: input.webhookId,
      attempt: attemptCount + 1,
      status: 'success',
      responseCode: result.statusCode,
    });

  } catch (error: any) {
    await logWebhookAttempt({
      webhookId: input.webhookId,
      attempt: attemptCount + 1,
      status: 'failed',
      error: error.message,
    });

    if (attemptCount + 1 >= maxAttempts) {
      // Final failure - mark as dead letter
      await markWebhookFailed({
        webhookId: input.webhookId,
        organizationId: input.organizationId,
        finalError: error.message,
      });
      return;
    }

    // Continue with next attempt
    await continueAsNew<typeof webhookDeliveryWorkflow>({
      ...input,
      attemptCount: attemptCount + 1,
    });
  }
}
```

### Workflow 3: Billing Cycle

Runs at end of each billing period to finalize usage and report to Stripe.

```typescript
// workflows/billing-cycle.ts

import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';

const {
  getOrganizationBillingInfo,
  calculatePeriodUsage,
  reportUsageToStripe,
  resetPeriodUsage,
  sendUsageSummaryEmail,
  logBillingEvent,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '5 minutes',
  retry: {
    maximumAttempts: 5,
    backoffCoefficient: 2,
  },
});

export interface BillingCycleInput {
  organizationId: string;
  periodStart: string;  // ISO date
  periodEnd: string;
}

export async function billingCycleWorkflow(input: BillingCycleInput): Promise<void> {
  const { organizationId, periodStart, periodEnd } = input;

  // Step 1: Get org billing info
  const billingInfo = await getOrganizationBillingInfo({ organizationId });

  if (!billingInfo.stripeSubscriptionId) {
    // No active subscription, skip
    return;
  }

  // Step 2: Calculate final usage for period
  const usage = await calculatePeriodUsage({
    organizationId,
    periodStart,
    periodEnd,
  });

  // Step 3: Report overage to Stripe if applicable
  if (usage.overageMinutes > 0) {
    await reportUsageToStripe({
      subscriptionItemId: billingInfo.stripeSubscriptionItemId,
      quantity: usage.overageMinutes,
      timestamp: new Date(periodEnd).getTime() / 1000,
    });
  }

  // Step 4: Log billing event
  await logBillingEvent({
    organizationId,
    eventType: 'period_closed',
    data: {
      periodStart,
      periodEnd,
      totalMinutes: usage.totalMinutes,
      includedMinutes: usage.includedMinutes,
      overageMinutes: usage.overageMinutes,
      overageCost: usage.overageMinutes * billingInfo.overageRate,
    },
  });

  // Step 5: Send usage summary email
  await sendUsageSummaryEmail({
    organizationId,
    usage,
    periodStart,
    periodEnd,
  });

  // Step 6: Reset counters for new period
  await resetPeriodUsage({
    organizationId,
    newPeriodStart: periodEnd,
  });
}
```

### Workflow 4: Customer Onboarding

Multi-step onboarding with progress tracking and recovery.

```typescript
// workflows/customer-onboarding.ts

import { proxyActivities, sleep, defineSignal, setHandler } from '@temporalio/workflow';
import type * as activities from '../activities';

const {
  createVapiAssistant,
  provisionTwilioNumber,
  linkNumberToAssistant,
  createStripeCustomer,
  sendWelcomeEmail,
  updateOnboardingStatus,
  triggerTestCall,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '2 minutes',
  retry: {
    maximumAttempts: 3,
  },
});

export const completeStepSignal = defineSignal<[string]>('completeStep');

export interface OnboardingInput {
  organizationId: string;
  userId: string;
  email: string;
  businessName: string;
  templateId: string;
  variableValues: Record<string, any>;
  areaCode?: string;
}

export interface OnboardingState {
  currentStep: string;
  completedSteps: string[];
  assistantId?: string;
  phoneNumber?: string;
  vapiAssistantId?: string;
  error?: string;
}

export async function customerOnboardingWorkflow(input: OnboardingInput): Promise<OnboardingState> {
  const state: OnboardingState = {
    currentStep: 'creating_assistant',
    completedSteps: [],
  };

  try {
    // Step 1: Create VAPI assistant
    await updateOnboardingStatus({ organizationId: input.organizationId, step: 'creating_assistant' });
    
    const assistant = await createVapiAssistant({
      organizationId: input.organizationId,
      templateId: input.templateId,
      variableValues: input.variableValues,
      businessName: input.businessName,
    });
    
    state.assistantId = assistant.id;
    state.vapiAssistantId = assistant.vapiId;
    state.completedSteps.push('creating_assistant');

    // Step 2: Provision phone number
    state.currentStep = 'provisioning_number';
    await updateOnboardingStatus({ organizationId: input.organizationId, step: 'provisioning_number' });
    
    const phoneNumber = await provisionTwilioNumber({
      organizationId: input.organizationId,
      areaCode: input.areaCode,
    });
    
    state.phoneNumber = phoneNumber.number;
    state.completedSteps.push('provisioning_number');

    // Step 3: Link number to assistant
    state.currentStep = 'linking_number';
    await updateOnboardingStatus({ organizationId: input.organizationId, step: 'linking_number' });
    
    await linkNumberToAssistant({
      phoneNumberId: phoneNumber.id,
      assistantId: assistant.id,
      vapiAssistantId: assistant.vapiId,
    });
    
    state.completedSteps.push('linking_number');

    // Step 4: Create Stripe customer
    state.currentStep = 'setting_up_billing';
    await updateOnboardingStatus({ organizationId: input.organizationId, step: 'setting_up_billing' });
    
    await createStripeCustomer({
      organizationId: input.organizationId,
      email: input.email,
      businessName: input.businessName,
    });
    
    state.completedSteps.push('setting_up_billing');

    // Step 5: Send welcome email with instructions
    state.currentStep = 'sending_welcome';
    await sendWelcomeEmail({
      email: input.email,
      businessName: input.businessName,
      phoneNumber: state.phoneNumber,
    });
    
    state.completedSteps.push('sending_welcome');

    // Step 6: Trigger test call (optional, non-blocking)
    state.currentStep = 'ready_for_testing';
    await updateOnboardingStatus({ 
      organizationId: input.organizationId, 
      step: 'complete',
      phoneNumber: state.phoneNumber,
    });
    
    state.completedSteps.push('complete');
    state.currentStep = 'complete';

  } catch (error: any) {
    state.error = error.message;
    await updateOnboardingStatus({
      organizationId: input.organizationId,
      step: 'error',
      error: error.message,
    });
  }

  return state;
}
```

### Workflow 5: Scheduled Usage Aggregation

Daily job to aggregate usage stats for analytics and billing.

```typescript
// workflows/usage-aggregation.ts

import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';

const {
  getActiveOrganizations,
  aggregateDailyUsage,
  checkUsageThresholds,
  sendUsageAlerts,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '10 minutes',
  retry: { maximumAttempts: 3 },
});

export interface UsageAggregationInput {
  date: string; // YYYY-MM-DD
}

export async function usageAggregationWorkflow(input: UsageAggregationInput): Promise<void> {
  const { date } = input;

  // Get all active organizations
  const organizations = await getActiveOrganizations();

  for (const org of organizations) {
    // Aggregate calls into daily_usage table
    await aggregateDailyUsage({
      organizationId: org.id,
      date,
    });

    // Check if approaching limits
    const thresholds = await checkUsageThresholds({
      organizationId: org.id,
    });

    // Send alerts if needed (80%, 100%, etc.)
    if (thresholds.alerts.length > 0) {
      await sendUsageAlerts({
        organizationId: org.id,
        alerts: thresholds.alerts,
      });
    }
  }
}
```

---

### Activities Implementation

```typescript
// workers/activities.ts

import { supabase } from '../lib/supabase';
import { stripe } from '../lib/stripe';
import { vapi } from '../lib/vapi';
import { twilio } from '../lib/twilio';
import { resend } from '../lib/resend';

// Call Processing Activities
export async function storeTranscript(params: {
  callId: string;
  organizationId: string;
  transcriptText: string;
  segments: any[];
}): Promise<void> {
  await supabase.from('call_transcripts').insert({
    call_id: params.callId,
    call_created_at: new Date().toISOString(),
    organization_id: params.organizationId,
    transcript_text: params.transcriptText,
    transcript_segments: params.segments,
  });
}

export async function generateCallSummary(params: {
  transcript: string;
  organizationId: string;
}): Promise<string> {
  // Use OpenAI or Claude to summarize
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'Summarize this phone call transcript in 2-3 sentences. Focus on: who called, what they needed, and what action was taken.',
      },
      { role: 'user', content: params.transcript },
    ],
    max_tokens: 150,
  });

  return response.choices[0].message.content || 'No summary available';
}

export async function extractCallData(params: {
  transcript: string;
  organizationId: string;
}): Promise<{
  callType: string;
  sentiment: string;
  callerName?: string;
  actionItems: string[];
}> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `Extract structured data from this call transcript. Return JSON with:
- callType: one of [inquiry, complaint, booking, support, sales, other]
- sentiment: one of [positive, neutral, negative]
- callerName: if mentioned
- actionItems: array of follow-up actions needed`,
      },
      { role: 'user', content: params.transcript },
    ],
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content || '{}');
}

export async function sendNotifications(params: {
  organizationId: string;
  callId: string;
  summary: string;
  extractedData: any;
  fromNumber: string;
  duration: number;
}): Promise<void> {
  // Get org notification settings
  const { data: org } = await supabase
    .from('organizations')
    .select('settings')
    .eq('id', params.organizationId)
    .single();

  const settings = org?.settings?.notifications;
  if (!settings) return;

  const message = `📞 New Call\nFrom: ${params.fromNumber}\nDuration: ${Math.ceil(params.duration / 60)}min\n${params.summary}`;

  // SMS notifications
  if (settings.sms?.enabled && settings.sms?.numbers?.length > 0) {
    for (const number of settings.sms.numbers) {
      await twilio.messages.create({
        to: number,
        from: process.env.TWILIO_SMS_FROM,
        body: message,
      });
    }
  }

  // Email notifications
  if (settings.email?.enabled && settings.email?.addresses?.length > 0) {
    await resend.emails.send({
      from: 'CallFlex <notifications@callflex.com>',
      to: settings.email.addresses,
      subject: `New Call: ${params.extractedData.callType || 'Inquiry'}`,
      text: message,
    });
  }
}

// Webhook Activities
export async function deliverWebhook(params: {
  url: string;
  payload: any;
  eventType: string;
}): Promise<{ statusCode: number }> {
  const response = await fetch(params.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Event': params.eventType,
    },
    body: JSON.stringify(params.payload),
  });

  if (!response.ok) {
    throw new Error(`Webhook failed: ${response.status}`);
  }

  return { statusCode: response.status };
}

// Billing Activities
export async function reportUsageToStripe(params: {
  subscriptionItemId: string;
  quantity: number;
  timestamp: number;
}): Promise<void> {
  await stripe.subscriptionItems.createUsageRecord(
    params.subscriptionItemId,
    {
      quantity: params.quantity,
      timestamp: Math.floor(params.timestamp),
      action: 'increment',
    }
  );
}

// Onboarding Activities
export async function createVapiAssistant(params: {
  organizationId: string;
  templateId: string;
  variableValues: Record<string, any>;
  businessName: string;
}): Promise<{ id: string; vapiId: string }> {
  // Get template
  const { data: template } = await supabase
    .from('templates')
    .select('*')
    .eq('id', params.templateId)
    .single();

  // Replace variables in prompt
  let prompt = template.system_prompt;
  for (const [key, value] of Object.entries(params.variableValues)) {
    prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }

  // Create in VAPI
  const vapiAssistant = await vapi.assistants.create({
    name: `${params.businessName} - ${template.name}`,
    model: {
      provider: template.model_provider,
      model: template.model_name,
      systemPrompt: prompt,
    },
    voice: {
      provider: template.voice_provider,
      voiceId: template.voice_id,
    },
    serverUrl: `${process.env.API_URL}/api/webhooks/vapi/${params.organizationId}`,
  });

  // Store in our DB
  const { data: assistant } = await supabase
    .from('assistants')
    .insert({
      organization_id: params.organizationId,
      template_id: params.templateId,
      name: `${params.businessName} - ${template.name}`,
      system_prompt: prompt,
      variable_values: params.variableValues,
      vapi_assistant_id: vapiAssistant.id,
      status: 'active',
    })
    .select()
    .single();

  return { id: assistant.id, vapiId: vapiAssistant.id };
}

export async function provisionTwilioNumber(params: {
  organizationId: string;
  areaCode?: string;
}): Promise<{ id: string; number: string }> {
  // Search for available number
  const available = await twilio.availablePhoneNumbers('US').local.list({
    areaCode: params.areaCode || '415',
    voiceEnabled: true,
    smsEnabled: true,
    limit: 1,
  });

  if (available.length === 0) {
    throw new Error('No numbers available');
  }

  // Purchase
  const purchased = await twilio.incomingPhoneNumbers.create({
    phoneNumber: available[0].phoneNumber,
  });

  // Store in DB
  const { data: phoneNumber } = await supabase
    .from('phone_numbers')
    .insert({
      organization_id: params.organizationId,
      phone_number: purchased.phoneNumber,
      provider: 'twilio',
      provider_sid: purchased.sid,
      status: 'active',
    })
    .select()
    .single();

  return { id: phoneNumber.id, number: purchased.phoneNumber };
}

// ... more activities
```

---

### Starting Workflows from API

```typescript
// routes/webhooks/vapi.ts

import { getTemporalClient } from '../../lib/temporal';
import { processCallWorkflow } from '../../workers/workflows/call-processing';

app.post('/:organizationId', async (c) => {
  const event = await c.req.json();

  if (event.type === 'call-end') {
    // Start Temporal workflow for call processing
    const client = await getTemporalClient();

    await client.workflow.start(processCallWorkflow, {
      taskQueue: 'callflex-main',
      workflowId: `call-processing-${event.call.id}`,
      args: [{
        callId: event.call.id,
        organizationId: c.req.param('organizationId'),
        vapiCallId: event.call.id,
        transcript: event.call.transcript,
        transcriptSegments: event.call.messages,
        recordingUrl: event.call.recordingUrl,
        duration: event.call.duration,
        fromNumber: event.call.customer?.number,
        endedReason: event.call.endedReason,
        cost: event.call.cost,
      }],
    });
  }

  return c.json({ success: true });
});
```

### Scheduled Workflows with Temporal

```typescript
// scripts/schedule-workflows.ts

import { getTemporalClient } from '../lib/temporal';
import { usageAggregationWorkflow } from '../workers/workflows/usage-aggregation';

async function setupSchedules() {
  const client = await getTemporalClient();

  // Daily usage aggregation at 2 AM UTC
  await client.schedule.create({
    scheduleId: 'daily-usage-aggregation',
    spec: {
      cronExpressions: ['0 2 * * *'],
    },
    action: {
      type: 'startWorkflow',
      workflowType: usageAggregationWorkflow,
      taskQueue: 'callflex-main',
      args: [{ date: new Date().toISOString().split('T')[0] }],
    },
  });
}
```
