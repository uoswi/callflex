# Database Architecture for Scale

## Overview

This document covers database design decisions optimized for:
- **High write throughput** (calls, transcripts, events)
- **Fast reads** (dashboard queries, real-time updates)
- **Multi-tenant isolation** (RLS + query patterns)
- **Cost efficiency** (minimize Supabase egress, smart caching)

---

## Final Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 14 on Railway | Dashboard, landing pages |
| **Backend** | Hono on Railway | API, webhooks |
| **Database** | Supabase Postgres | Primary data store |
| **Auth** | Supabase Auth | User authentication |
| **Realtime** | Supabase Realtime | Live dashboard updates |
| **Storage** | Supabase Storage | Call recordings |
| **Cache** | Redis (Upstash) | Rate limiting, sessions, counters |
| **Background Jobs** | **Temporal Cloud** | Durable workflows |
| **Voice AI** | VAPI | Call handling |
| **Telephony** | Twilio | Phone numbers, SMS |
| **Billing** | Stripe | Subscriptions, usage |
| **Email** | Resend | Transactional emails |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENTS                                            │
│                    Dashboard, Mobile App, API Consumers                              │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                               HONO API (Railway)                                     │
│                                                                                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                     │
│  │  Read Endpoints │  │ Write Endpoints │  │ Webhook Handlers│                     │
│  │  (cached)       │  │ (direct to DB)  │  │ (async via      │                     │
│  │                 │  │                 │  │  Temporal)      │                     │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘                     │
└───────────┼─────────────────────┼───────────────────┼────────────────────────────────┘
            │                     │                   │
            ▼                     │                   ▼
┌───────────────────────┐         │         ┌───────────────────────┐
│    REDIS (Upstash)    │         │         │    TEMPORAL CLOUD     │
│                       │         │         │                       │
│  • Dashboard cache    │         │         │  • CallProcessing     │
│  • Session store      │         │         │  • WebhookDelivery    │
│  • Rate limiting      │         │         │  • BillingCycle       │
│  • Real-time counters │         │         │  • UsageAggregation   │
│  • Org settings cache │         │         │  • OnboardingFlow     │
└───────────┬───────────┘         │         └───────────┬───────────┘
            │                     │                     │
            │ cache miss          │                     │
            ▼                     ▼                     ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              SUPABASE POSTGRES                                       │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                           HOT DATA (Frequent Access)                         │   │
│  │                                                                              │   │
│  │  • organizations (small, heavily cached)                                     │   │
│  │  • assistants (small, cached on read)                                        │   │
│  │  • phone_numbers (small, cached)                                             │   │
│  │  • templates (read-only, heavily cached)                                     │   │
│  │  • users, organization_members                                               │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                          WARM DATA (Recent, Queryable)                       │   │
│  │                                                                              │   │
│  │  • calls (partitioned by month) ──────────────────────────────┐             │   │
│  │  • call_transcripts                                            │ PARTITIONED │   │
│  │  • call_actions                                                │             │   │
│  │  • daily_usage                                                 ┘             │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                          COLD DATA (Archive, Infrequent)                     │   │
│  │                                                                              │   │
│  │  • calls_YYYY_MM (old partitions) → Consider moving to S3/Glacier           │   │
│  │  • call_recordings (metadata only, files in Supabase Storage)               │   │
│  │  • billing_events (audit trail)                                             │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                            SUPABASE STORAGE                                          │
│                                                                                      │
│  • Call recordings (audio files)                                                    │
│  • Organized by: /{org_id}/{year}/{month}/{call_id}.wav                            │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Patterns

### Pattern 1: Inbound Call (Write-Heavy)

```
VAPI Webhook → API → Temporal Workflow → Multiple DB Writes + Notifications

Timeline:
0ms     VAPI sends call.started webhook
5ms     API receives, validates signature
10ms    API starts Temporal workflow (async)
15ms    API returns 200 to VAPI (fast response critical)
        
        [Temporal Workflow - Durable]
20ms    Insert into calls table
25ms    Broadcast to Supabase Realtime
        
        [On call.ended]
0ms     VAPI sends call.ended webhook  
10ms    API starts CallProcessingWorkflow
        
        [Temporal Workflow - Can retry on failure]
        Activity 1: Update call record (duration, status)
        Activity 2: Store transcript
        Activity 3: Store recording metadata
        Activity 4: Extract action items (AI)
        Activity 5: Send notifications (SMS, email)
        Activity 6: Update usage counters
        Activity 7: Deliver webhooks to integrations
```

### Pattern 2: Dashboard Load (Read-Heavy)

```
Dashboard Request → API → Cache Check → DB (if miss) → Response

With caching layers:

┌─────────────────────────────────────────────────────────────────┐
│                      Dashboard Load                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Organization Settings    ───→  Redis (TTL: 5 min)           │
│     (name, plan, features)         Hit rate: ~95%               │
│                                                                  │
│  2. Today's Stats            ───→  Redis (TTL: 30 sec)          │
│     (call count, minutes)          Real-time counter            │
│                                                                  │
│  3. Recent Calls (page 1)    ───→  Redis (TTL: 10 sec)          │
│     (last 20 calls)                Hit rate: ~80%               │
│                                                                  │
│  4. Active Assistants        ───→  Redis (TTL: 5 min)           │
│     (list with config)             Hit rate: ~90%               │
│                                                                  │
│  Total DB queries if all cached: 0                              │
│  Total DB queries if none cached: 4                             │
│  Average DB queries: 0.5                                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Temporal Cloud Workflows

### Setup

```typescript
// lib/temporal.ts
import { Client, Connection } from '@temporalio/client';

let client: Client | null = null;

export async function getTemporalClient(): Promise<Client> {
  if (client) return client;

  const connection = await Connection.connect({
    address: process.env.TEMPORAL_ADDRESS!,  // xxx.tmprl.cloud:7233
    tls: {
      clientCertPair: {
        crt: Buffer.from(process.env.TEMPORAL_CLIENT_CERT!, 'base64'),
        key: Buffer.from(process.env.TEMPORAL_CLIENT_KEY!, 'base64'),
      },
    },
  });

  client = new Client({
    connection,
    namespace: process.env.TEMPORAL_NAMESPACE!,  // e.g., 'production'
  });

  return client;
}
```

### Workflow 1: Call Processing

```typescript
// workflows/call-processing.ts
import { proxyActivities, sleep } from '@temporalio/workflow';
import type * as activities from '../activities/call-activities';

const {
  updateCallRecord,
  storeTranscript,
  storeRecording,
  extractActionItems,
  sendNotifications,
  updateUsageCounters,
  deliverWebhooks,
  broadcastToRealtime,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '30 seconds',
  retry: {
    initialInterval: '1 second',
    backoffCoefficient: 2,
    maximumAttempts: 5,
  },
});

export interface CallProcessingInput {
  organizationId: string;
  callId: string;
  vapiCallData: any;
}

export async function CallProcessingWorkflow(input: CallProcessingInput): Promise<void> {
  const { organizationId, callId, vapiCallData } = input;

  // Step 1: Update call record (critical)
  await updateCallRecord({
    callId,
    organizationId,
    duration: vapiCallData.duration,
    status: 'completed',
    endedReason: vapiCallData.endedReason,
    cost: vapiCallData.cost,
  });

  // Step 2: Store transcript (if exists)
  if (vapiCallData.transcript) {
    await storeTranscript({
      callId,
      organizationId,
      transcript: vapiCallData.transcript,
      messages: vapiCallData.messages,
      summary: vapiCallData.summary,
    });
  }

  // Step 3: Store recording metadata
  if (vapiCallData.recordingUrl) {
    await storeRecording({
      callId,
      organizationId,
      recordingUrl: vapiCallData.recordingUrl,
      duration: vapiCallData.duration,
    });
  }

  // Step 4: Extract action items (AI-powered)
  const actionItems = await extractActionItems({
    callId,
    transcript: vapiCallData.transcript,
  });

  // Step 5: Send notifications (parallel)
  await sendNotifications({
    organizationId,
    callId,
    summary: vapiCallData.summary,
    actionItems,
  });

  // Step 6: Update usage counters
  await updateUsageCounters({
    organizationId,
    minutes: Math.ceil(vapiCallData.duration / 60),
  });

  // Step 7: Deliver webhooks to integrations
  await deliverWebhooks({
    organizationId,
    event: 'call.completed',
    payload: { callId, ...vapiCallData },
  });

  // Step 8: Broadcast to real-time dashboard
  await broadcastToRealtime({
    organizationId,
    event: 'call_completed',
    data: { callId, duration: vapiCallData.duration },
  });
}
```

### Workflow 2: Webhook Delivery (with retries)

```typescript
// workflows/webhook-delivery.ts
import { proxyActivities, sleep } from '@temporalio/workflow';
import type * as activities from '../activities/webhook-activities';

const { deliverWebhook, logDeliveryAttempt } = proxyActivities<typeof activities>({
  startToCloseTimeout: '10 seconds',
  retry: {
    initialInterval: '5 seconds',
    backoffCoefficient: 2,
    maximumAttempts: 5,
    nonRetryableErrorTypes: ['WebhookDisabledError'],
  },
});

export interface WebhookDeliveryInput {
  organizationId: string;
  integrationId: string;
  webhookUrl: string;
  event: string;
  payload: any;
}

export async function WebhookDeliveryWorkflow(input: WebhookDeliveryInput): Promise<void> {
  const { organizationId, integrationId, webhookUrl, event, payload } = input;

  try {
    const result = await deliverWebhook({
      url: webhookUrl,
      event,
      payload,
    });

    await logDeliveryAttempt({
      organizationId,
      integrationId,
      status: 'success',
      responseCode: result.statusCode,
    });

  } catch (error) {
    await logDeliveryAttempt({
      organizationId,
      integrationId,
      status: 'failed',
      error: error.message,
    });
    throw error;  // Temporal will retry
  }
}
```

### Workflow 3: Daily Usage Aggregation (Scheduled)

```typescript
// workflows/usage-aggregation.ts
import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities/billing-activities';

const {
  getActiveOrganizations,
  calculateDailyStats,
  upsertDailyUsage,
  checkUsageAlerts,
  sendUsageAlertEmail,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '5 minutes',
  retry: { maximumAttempts: 3 },
});

export interface UsageAggregationInput {
  date: string;  // YYYY-MM-DD
}

export async function UsageAggregationWorkflow(input: UsageAggregationInput): Promise<void> {
  const { date } = input;

  // Get all active organizations
  const orgs = await getActiveOrganizations();

  for (const org of orgs) {
    // Calculate stats from calls table
    const stats = await calculateDailyStats({
      organizationId: org.id,
      date,
    });

    // Upsert into daily_usage
    await upsertDailyUsage({
      organizationId: org.id,
      date,
      stats,
    });

    // Check if approaching limits
    const alert = await checkUsageAlerts({
      organizationId: org.id,
      currentUsage: stats.totalMinutes,
      planLimit: org.planMinutes,
    });

    if (alert.shouldNotify) {
      await sendUsageAlertEmail({
        organizationId: org.id,
        percentage: alert.percentage,
      });
    }
  }
}

// Schedule: Run at 2 AM daily
// Set up via Temporal schedules
```

### Workflow 4: Billing Cycle Reset

```typescript
// workflows/billing-cycle.ts
export async function BillingCycleWorkflow(input: { organizationId: string }): Promise<void> {
  const { organizationId } = input;

  // Reset usage counter
  await resetUsageCounter({ organizationId });

  // Calculate overage from previous period
  const overage = await calculateOverage({ organizationId });

  if (overage.minutes > 0) {
    // Report to Stripe for metered billing
    await reportStripeUsage({
      organizationId,
      quantity: overage.minutes,
    });
  }

  // Update period dates
  await updateBillingPeriod({ organizationId });

  // Log billing event
  await logBillingEvent({
    organizationId,
    event: 'period_reset',
    overage: overage.minutes,
  });
}
```

### Starting Workflows from API

```typescript
// routes/webhooks/vapi.ts
import { getTemporalClient } from '../../lib/temporal';
import { CallProcessingWorkflow } from '../../workflows/call-processing';

app.post('/vapi/:organizationId', async (c) => {
  const organizationId = c.req.param('organizationId');
  const event = await c.req.json();

  if (event.type === 'call-end') {
    // Start Temporal workflow
    const client = await getTemporalClient();

    await client.workflow.start(CallProcessingWorkflow, {
      taskQueue: 'call-processing',
      workflowId: `call-${event.call.id}`,
      args: [{
        organizationId,
        callId: event.call.id,
        vapiCallData: event.call,
      }],
    });
  }

  // Return immediately - workflow processes async
  return c.json({ received: true });
});
```

---

## Redis Cache Strategy

### Cache Keys

```
┌─────────────────────────────────────────────────────────────────┐
│                      Redis Key Patterns                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ENTITY CACHES (Object storage)                                 │
│  ─────────────────────────────                                  │
│  org:{id}                    → Organization JSON (TTL: 5 min)   │
│  org:{id}:settings           → Settings JSON (TTL: 5 min)       │
│  assistant:{id}              → Assistant JSON (TTL: 5 min)      │
│  template:{slug}             → Template JSON (TTL: 1 hour)      │
│  user:{id}                   → User JSON (TTL: 10 min)          │
│                                                                  │
│  LIST CACHES (Query results)                                    │
│  ───────────────────────────                                    │
│  org:{id}:calls:recent       → Last 20 calls (TTL: 10 sec)     │
│  org:{id}:assistants         → Assistant list (TTL: 5 min)     │
│  org:{id}:phone_numbers      → Phone list (TTL: 5 min)         │
│                                                                  │
│  COUNTERS (Real-time metrics)                                   │
│  ────────────────────────────                                   │
│  org:{id}:usage:{period}     → Minutes used (no TTL, reset)    │
│  org:{id}:calls:today        → Today's call count (TTL: 1 day) │
│  org:{id}:active_calls       → Currently active (TTL: 1 hour)  │
│                                                                  │
│  RATE LIMITING                                                  │
│  ─────────────                                                  │
│  ratelimit:{ip}:{endpoint}   → Request count (TTL: 1 min)      │
│  ratelimit:org:{id}:api      → API calls (TTL: 1 hour)         │
│                                                                  │
│  SESSIONS                                                       │
│  ────────                                                       │
│  session:{token}             → Session data (TTL: 24 hours)    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Implementation

```typescript
// lib/cache.ts
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// Generic cache wrapper
export async function cached<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = await redis.get<T>(key);
  if (cached) return cached;

  const fresh = await fetcher();
  await redis.setex(key, ttlSeconds, JSON.stringify(fresh));
  return fresh;
}

// Organization cache
export async function getOrganization(id: string) {
  return cached(`org:${id}`, 300, async () => {
    const { data } = await supabase
      .from('organizations')
      .select('*, plans(*)')
      .eq('id', id)
      .single();
    return data;
  });
}

// Invalidation
export async function invalidateOrg(id: string) {
  await redis.del([
    `org:${id}`,
    `org:${id}:settings`,
    `org:${id}:calls:recent`,
    `org:${id}:assistants`,
  ]);
}

// Real-time counters
export async function incrementUsage(orgId: string, minutes: number) {
  const periodKey = `org:${orgId}:usage:${getCurrentPeriod()}`;
  await redis.incrby(periodKey, minutes);
}

export async function getUsage(orgId: string): Promise<number> {
  const periodKey = `org:${orgId}:usage:${getCurrentPeriod()}`;
  return (await redis.get<number>(periodKey)) || 0;
}
```

---

## Query Optimization

### Indexes Strategy

```sql
-- HOT TABLES: Minimal indexes, heavily cached

-- organizations: Only slug lookup
CREATE INDEX idx_org_slug ON organizations(slug) WHERE deleted_at IS NULL;

-- templates: Industry + featured browsing
CREATE INDEX idx_templates_browse ON templates(industry_id, is_featured, is_active);

-- WARM TABLES: Optimized for common queries

-- calls: Partitioned, key lookups
CREATE INDEX idx_calls_org_date ON calls(organization_id, created_at DESC);
CREATE INDEX idx_calls_assistant ON calls(assistant_id, created_at DESC);
CREATE INDEX idx_calls_from ON calls(from_number, created_at DESC);
CREATE INDEX idx_calls_status ON calls(organization_id, status) 
    WHERE status = 'in-progress';

-- transcripts: Full-text search
CREATE INDEX idx_transcripts_search ON call_transcripts USING GIN(search_vector);
CREATE INDEX idx_transcripts_call ON call_transcripts(call_id, call_created_at);

-- daily_usage: Date range queries
CREATE INDEX idx_usage_org_date ON daily_usage(organization_id, date DESC);
```

### Expensive Queries to Avoid

```sql
-- ❌ BAD: Full table scan
SELECT COUNT(*) FROM calls WHERE organization_id = 'xxx';

-- ✅ GOOD: Use pre-aggregated data
SELECT SUM(total_calls) FROM daily_usage 
WHERE organization_id = 'xxx' AND date >= '2025-01-01';

-- ❌ BAD: No partition pruning
SELECT * FROM calls WHERE organization_id = 'xxx';

-- ✅ GOOD: Include date range
SELECT * FROM calls 
WHERE organization_id = 'xxx' 
AND created_at >= NOW() - INTERVAL '7 days';

-- ❌ BAD: ILIKE text search
SELECT * FROM call_transcripts 
WHERE transcript_text ILIKE '%keyword%';

-- ✅ GOOD: Full-text search
SELECT * FROM call_transcripts 
WHERE search_vector @@ to_tsquery('keyword');
```

---

## Scaling Thresholds

| Component | Trigger | Action |
|-----------|---------|--------|
| Supabase DB | Size > 8GB | Upgrade plan |
| Supabase DB | Connections > 60 | Enable PgBouncer |
| Supabase DB | Query > 100ms avg | Review indexes |
| Redis | Commands > 10K/sec | Upgrade tier |
| Redis | Memory > 256MB | Review TTLs |
| Temporal | Workflows > 10K/day | Add workers |
| API | Response > 200ms | Cache more |
| API | CPU > 80% | Scale horizontally |

---

## Environment Variables

```bash
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_KEY=xxx
DATABASE_URL=postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres

# Redis (Upstash)
UPSTASH_REDIS_URL=https://xxx.upstash.io
UPSTASH_REDIS_TOKEN=xxx

# Temporal Cloud
TEMPORAL_ADDRESS=xxx.tmprl.cloud:7233
TEMPORAL_NAMESPACE=production
TEMPORAL_CLIENT_CERT=base64-encoded-cert
TEMPORAL_CLIENT_KEY=base64-encoded-key

# VAPI
VAPI_API_KEY=xxx
VAPI_WEBHOOK_SECRET=xxx

# Twilio
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx

# Stripe
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Resend
RESEND_API_KEY=xxx
```

---

## Summary

| Layer | Technology | Strategy |
|-------|------------|----------|
| **Primary DB** | Supabase Postgres | Partitioned tables, RLS, connection pooling |
| **Cache** | Redis (Upstash) | Aggressive caching, real-time counters |
| **Background** | Temporal Cloud | Durable workflows, retries, scheduling |
| **Realtime** | Supabase Realtime | Dashboard live updates |
| **Storage** | Supabase Storage | Call recordings by org/date |

This architecture handles **100K+ calls/month** with clear paths to scale further.
