# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CallFlex is an AI receptionist platform that provides customizable AI phone assistants for businesses across industries (logistics, legal, healthcare, home services, restaurants, etc.). The platform uses a template-based system where users select industry-specific templates and customize them with their business details.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 on Railway |
| Backend | Hono on Railway |
| Database | Supabase Postgres (partitioned tables) |
| Auth | Supabase Auth |
| Realtime | Supabase Realtime |
| Storage | Supabase Storage (recordings) |
| Cache | Redis (Upstash) |
| Background Jobs | Temporal Cloud |
| Voice AI | VAPI |
| Telephony | Twilio |
| Billing | Stripe |
| Email | Resend |

## Architecture

```
VAPI ──► Hono API ──┬──► Redis (cache + counters)
                    │
                    └──► Temporal Cloud (workflows)
                              │
                              ▼
                         Supabase Postgres
                              │
                              ├── calls (PARTITIONED by month)
                              ├── call_transcripts (GIN index for search)
                              └── daily_usage (pre-aggregated)
```

### Key Data Flow

1. **Inbound Call**: VAPI webhook → Hono API → Temporal workflow → DB writes + notifications
2. **Dashboard Load**: API → Redis cache check → DB (on cache miss)

## Database Design Principles

- **Calls table is partitioned by month** - this was a day-1 decision and is hard to change later
- Hot data (organizations, assistants, templates) is heavily cached
- Warm data (recent calls, transcripts) uses partitioned tables
- Full-text search uses PostgreSQL GIN indexes on `call_transcripts.search_vector`

### Critical Schema Notes

- Always include date range when querying `calls` table for partition pruning
- Use pre-aggregated `daily_usage` table instead of counting from `calls`
- Template variables use `{{variable_name}}` syntax in prompts

## Key Abstractions

### Templates
Pre-built AI configurations with variable placeholders. Located in `templates` table. Variables are JSON schema defining what users can customize.

### Assistants
User's configured AI instances created from templates (or custom). Linked to VAPI assistants via `vapi_assistant_id`.

### Phone Numbers
Provisioned via Twilio, linked to assistants. Support schedule-based routing rules.

## Temporal Workflows

- `CallProcessingWorkflow` - Post-call processing (transcript storage, AI summarization, notifications)
- `WebhookDeliveryWorkflow` - Reliable webhook delivery with exponential backoff
- `BillingCycleWorkflow` - End-of-period usage reporting to Stripe
- `UsageAggregationWorkflow` - Daily cron for usage stats aggregation

## API Structure

```
/api/v1/
├── auth/
├── organizations/
├── phone-numbers/
├── assistants/
├── templates/
├── calls/
├── contacts/
├── integrations/
└── billing/

/api/webhooks/
├── vapi/:organizationId
├── twilio/
├── stripe/
└── integrations/
```

## VAPI Integration

- Assistants are synced to VAPI via `vapi_assistant_id`
- Webhook endpoint: `/api/webhooks/vapi/:organizationId`
- Function calls (transferCall, takeMessage, bookAppointment, etc.) are handled server-side and return results to VAPI
- Always verify webhook signatures using `x-vapi-signature` header

## Scaling Thresholds

| Trigger | Action |
|---------|--------|
| Dashboard queries >200ms | Add Redis cache |
| Webhook failures >1% | Add Temporal |
| Supabase connections >60 | Enable PgBouncer |
| 1M+ calls in DB | Consider read replica |

## Environment Variables

Key variables needed:
- `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`
- `VAPI_API_KEY`, `VAPI_WEBHOOK_SECRET`
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `TEMPORAL_ADDRESS`, `TEMPORAL_NAMESPACE`, `TEMPORAL_CLIENT_CERT`, `TEMPORAL_CLIENT_KEY`
- `UPSTASH_REDIS_URL`, `UPSTASH_REDIS_TOKEN`
