# CallFlex Development Plan - Phase 1

> **Goal:** Launch MVP for 0-500 customers
> **Monthly Cost Target:** ~$25 (Supabase Pro)
> **Architecture:** Simple stack - VAPI → Hono API → Supabase Postgres

---

## Phase 1.1: Project Setup & Infrastructure

**Objective:** Set up the development environment, project structure, and core infrastructure.

- [x] Initialize Next.js 14 project with TypeScript
  - [x] Configure Tailwind CSS
  - [x] Set up folder structure (`/app`, `/components`, `/lib`, `/services`)
  - [x] Configure environment variables (.env.local, .env.example)
- [x] Initialize Hono backend project
  - [x] Set up TypeScript configuration
  - [x] Configure CORS and middleware
  - [x] Set up folder structure (`/routes`, `/services`, `/lib`, `/middleware`)
- [x] Create Supabase project
  - [x] Enable required extensions (uuid-ossp, pg_trgm, btree_gin)
  - [ ] Configure connection pooling (PgBouncer)
  - [ ] Set up Storage buckets for recordings
- [ ] Set up external service accounts
  - [ ] Create VAPI account and get API keys
  - [ ] Create Twilio account and get credentials
  - [ ] Create Stripe account and set up products/prices
  - [ ] Create Resend account for transactional emails
- [x] Configure deployment
  - [x] Set up Railway project for frontend
  - [x] Set up Railway project for backend API
  - [x] Configure environment variables in Railway
  - [ ] Set up custom domains (optional)

---

## Phase 1.2: Database Schema & Core Tables

**Objective:** Deploy the complete database schema with partitioning strategy.

- [x] Deploy reference tables
  - [x] Create `industries` table and seed data
  - [x] Create `plans` table and seed pricing tiers
- [x] Deploy core business tables
  - [x] Create `organizations` table with settings JSONB
  - [x] Create `users` table
  - [x] Create `organization_members` table with roles
- [x] Deploy template system tables
  - [x] Create `templates` table with variables schema
  - [x] Seed initial templates (logistics, legal, healthcare, home services, restaurant, general)
- [x] Deploy assistant & phone tables
  - [x] Create `assistants` table with VAPI sync fields
  - [x] Create `phone_numbers` table with routing rules
- [x] Deploy call data tables (PARTITIONED)
  - [x] Create `calls` table with monthly partitioning
  - [x] Create initial partitions (current month + 12 months ahead)
  - [x] Create `call_transcripts` table
  - [x] Create `call_recordings` table
  - [x] Create `call_actions` table
- [x] Deploy supporting tables
  - [x] Create `contacts` table
  - [x] Create `integrations` table
  - [x] Create `daily_usage` table
  - [x] Create `billing_events` table
- [x] Set up Row Level Security (RLS)
  - [x] Create `get_user_org_ids()` helper function
  - [x] Enable RLS on all tenant tables
  - [x] Create SELECT/INSERT/UPDATE/DELETE policies
- [x] Create indexes
  - [x] Add indexes for common query patterns
  - [x] Add GIN index on transcripts (for future search)
- [x] Create triggers
  - [x] `update_updated_at` trigger on relevant tables
  - [x] `increment_template_use` trigger on assistants

---

## Phase 1.3: Authentication & User Management

**Objective:** Implement complete auth flow and organization management.

- [ ] Set up Supabase Auth
  - [ ] Configure email/password auth
  - [ ] Configure OAuth providers (Google, optional)
  - [ ] Set up email templates (confirmation, reset password)
  - [ ] Configure redirect URLs
- [x] Build auth API endpoints (Hono)
  - [x] `POST /api/v1/auth/signup` - Create account + organization
  - [x] `POST /api/v1/auth/signin` - Sign in
  - [x] `POST /api/v1/auth/signout` - Sign out
  - [x] `POST /api/v1/auth/forgot-password` - Request reset
  - [ ] `POST /api/v1/auth/reset-password` - Reset password
  - [x] `GET /api/v1/auth/me` - Get current user
- [x] Build auth UI (Next.js)
  - [x] Sign up page with organization creation
  - [x] Sign in page
  - [x] Forgot password page
  - [ ] Reset password page
  - [x] Auth layout wrapper
- [x] Build organization management
  - [x] `GET /api/v1/organizations` - List user's orgs
  - [ ] `POST /api/v1/organizations` - Create org
  - [x] `GET /api/v1/organizations/:id` - Get org details
  - [x] `PATCH /api/v1/organizations/:id` - Update org
  - [ ] Organization settings page
- [x] Build team management
  - [x] `GET /api/v1/organizations/:id/members` - List members
  - [x] `POST /api/v1/organizations/:id/members` - Invite member
  - [x] `PATCH /api/v1/organizations/:id/members/:uid` - Update role
  - [x] `DELETE /api/v1/organizations/:id/members/:uid` - Remove member
  - [ ] Team management UI
- [x] Implement auth middleware
  - [x] JWT validation middleware for Hono
  - [x] Organization context middleware
  - [ ] Role-based access control helpers

---

## Phase 1.4: Template System & Assistant Builder

**Objective:** Build the template browsing and assistant creation experience.

- [x] Build template API endpoints
  - [x] `GET /api/v1/templates` - List templates (filterable by industry)
  - [x] `GET /api/v1/templates/:slug` - Get template details
- [x] Build template browsing UI
  - [x] Industry selection page (onboarding step 1)
  - [x] Template gallery by industry
  - [x] Template detail/preview modal
  - [ ] Sample conversation preview
- [x] Build assistant API endpoints
  - [x] `GET /api/v1/assistants` - List org's assistants
  - [x] `POST /api/v1/assistants` - Create from template or custom
  - [x] `GET /api/v1/assistants/:id` - Get assistant details
  - [x] `PATCH /api/v1/assistants/:id` - Update assistant
  - [x] `DELETE /api/v1/assistants/:id` - Delete assistant
- [x] Build template configuration UI
  - [x] Dynamic form generator from template variables
  - [x] Variable types: text, phone, email, hours, select, textarea, multiselect
  - [ ] Real-time prompt preview with variable substitution
  - [x] Validation for required fields
- [x] Build custom assistant builder
  - [x] Step 1: Basic info (name, industry)
  - [x] Step 2: Greeting & personality
  - [ ] Step 3: Instructions (free-form prompt editor)
  - [x] Step 4: Capabilities (functions to enable)
  - [x] Step 5: Voice selection & test
- [x] Build assistant management UI
  - [x] Assistant list/grid view
  - [x] Assistant detail page
  - [x] Edit assistant flow
  - [ ] Duplicate assistant
  - [x] Status indicators (draft, active, paused)

---

## Phase 1.5: Phone Number Provisioning & VAPI Integration

**Objective:** Connect Twilio and VAPI for actual call handling.

- [ ] Build Twilio service layer
  - [ ] `searchAvailableNumbers(areaCode)` - Search numbers
  - [ ] `provisionNumber(params)` - Purchase number
  - [ ] `releaseNumber(sid)` - Release number
  - [ ] `updateNumberWebhook(sid, url)` - Update voice URL
- [x] Build phone number API endpoints
  - [x] `POST /api/v1/phone-numbers/search` - Search available
  - [x] `POST /api/v1/phone-numbers` - Provision new number
  - [x] `GET /api/v1/phone-numbers` - List org's numbers
  - [x] `GET /api/v1/phone-numbers/:id` - Get number details
  - [x] `PATCH /api/v1/phone-numbers/:id` - Update config
  - [x] `DELETE /api/v1/phone-numbers/:id` - Release number
- [ ] Build VAPI service layer
  - [ ] `createVapiAssistant(params)` - Create assistant in VAPI
  - [ ] `updateVapiAssistant(id, params)` - Update assistant
  - [ ] `deleteVapiAssistant(id)` - Delete assistant
  - [ ] `getVapiAssistant(id)` - Get assistant details
- [ ] Build VAPI sync logic
  - [ ] Generate system prompt from template + variables
  - [ ] Configure voice settings
  - [ ] Configure function definitions
  - [ ] Set webhook URL per organization
  - [x] `POST /api/v1/assistants/:id/sync` - Manual sync to VAPI
- [x] Build phone number UI
  - [x] Number search by area code
  - [x] Number provisioning flow
  - [x] Number list with assignment status
  - [x] Assign number to assistant
  - [ ] Number settings/routing rules
- [ ] Build test call functionality
  - [ ] `POST /api/v1/phone-numbers/:id/test` - Trigger test call
  - [ ] `POST /api/v1/assistants/:id/test` - Test assistant
  - [ ] "Call me" feature (enter number, receive test call)
- [ ] Connect the flow
  - [ ] On assistant creation → Create in VAPI
  - [ ] On number provisioning → Configure Twilio webhook
  - [ ] On number assignment → Link to VAPI assistant

---

## Phase 1.6: Call Handling & Webhooks

**Objective:** Process incoming calls, store data, and send notifications.

- [x] Build VAPI webhook handler
  - [x] Signature verification middleware
  - [x] `POST /api/webhooks/vapi/:organizationId` - Main handler
  - [x] Handle `call-start` event → Create call record
  - [x] Handle `call-end` event → Update call, store transcript
  - [x] Handle `transcript` event → Real-time updates
  - [x] Handle `function-call` event → Execute functions
  - [ ] Handle `hang` event → Log hang-ups
- [x] Implement VAPI function handlers
  - [x] `transferCall` - Transfer to configured destination
  - [x] `takeMessage` - Log message, send notifications
  - [x] `scheduleCallback` - Log callback request
  - [ ] `logDriverCallout` - Log driver callout (logistics)
  - [x] Return appropriate responses to VAPI
- [x] Build call storage
  - [x] Store call records in partitioned table
  - [x] Store transcripts with segments
  - [x] Store recording metadata (URL from VAPI)
  - [x] Store call actions
- [ ] Build notification service
  - [ ] SMS notifications via Twilio
  - [ ] Email notifications via Resend
  - [ ] Notification settings per organization
  - [ ] Notification templates
- [x] Build real-time updates (Supabase Realtime)
  - [x] Broadcast `call_started` event
  - [x] Broadcast `call_ended` event
  - [x] Broadcast `transcript_update` event
  - [ ] Subscribe in dashboard for live updates
- [x] Build Twilio webhook handler
  - [x] `POST /api/webhooks/twilio/status` - Call status updates
  - [ ] Handle SMS delivery status (if using SMS)
- [x] Build call API endpoints
  - [x] `GET /api/v1/calls` - List calls (paginated, filtered)
  - [x] `GET /api/v1/calls/:id` - Get call details
  - [x] `GET /api/v1/calls/:id/transcript` - Get transcript
  - [x] `GET /api/v1/calls/:id/recording` - Get recording URL
  - [x] `GET /api/v1/calls/:id/actions` - Get call actions
  - [x] `GET /api/v1/calls/stats` - Get statistics
- [x] Build call UI
  - [x] Call list with filters (date, assistant, status)
  - [x] Call detail page
  - [x] Transcript viewer with speaker labels
  - [x] Audio player for recordings
  - [x] Actions taken during call
  - [ ] Real-time "active calls" indicator

---

## Phase 1.7: Billing & Dashboard

**Objective:** Implement Stripe billing and the main dashboard experience.

- [x] Build Stripe service layer
  - [ ] `createCustomer(email, name)` - Create Stripe customer
  - [x] `createCheckoutSession(params)` - Start checkout
  - [x] `createBillingPortalSession(customerId)` - Customer portal
  - [ ] `reportUsage(subscriptionItemId, quantity)` - Metered billing
- [x] Build Stripe webhook handler
  - [x] `POST /api/webhooks/stripe` - Main handler
  - [x] Handle `checkout.session.completed` - Activate subscription
  - [x] Handle `customer.subscription.updated` - Update status
  - [x] Handle `customer.subscription.deleted` - Cancel
  - [x] Handle `invoice.paid` - Reset usage, log event
  - [x] Handle `invoice.payment_failed` - Mark past due
- [x] Build billing API endpoints
  - [x] `GET /api/v1/billing` - Get billing overview
  - [x] `GET /api/v1/billing/usage` - Get current usage
  - [x] `POST /api/v1/billing/checkout` - Create checkout session
  - [x] `POST /api/v1/billing/portal` - Create portal session
  - [x] `GET /api/v1/billing/invoices` - List invoices
- [ ] Build usage tracking
  - [ ] Increment `minutes_used` on call end
  - [ ] Update `daily_usage` table
  - [ ] Check limits before allowing new calls
  - [ ] Overage tracking
- [x] Build billing UI
  - [x] Plan selection/upgrade page
  - [x] Current plan & usage display
  - [x] Usage progress bar (X of Y minutes)
  - [x] Upgrade prompts when approaching limits
  - [x] Billing history/invoices
  - [x] Stripe Customer Portal link
- [x] Build main dashboard
  - [x] Overview stats (calls today, minutes used, active assistants)
  - [x] Recent calls list
  - [x] Quick actions (test call, view transcripts)
  - [ ] Active calls indicator (real-time)
  - [x] Usage alerts (80%, 100% of minutes)
- [x] Build settings pages
  - [x] Organization settings
  - [x] Notification preferences (SMS numbers, email addresses)
  - [ ] Business hours configuration
  - [ ] Default voice settings
  - [x] API keys (if on Business plan)
- [x] Build landing page
  - [x] Hero section
  - [x] Industry showcase
  - [x] Features section
  - [x] Pricing section
  - [ ] Testimonials
  - [x] CTA sections
  - [x] Footer

---

## Post-Phase 1 Checklist

Before moving to Phase 2, ensure:

- [ ] All core flows work end-to-end
- [ ] Error handling is comprehensive
- [ ] Logging is in place for debugging
- [ ] Basic monitoring/alerts configured
- [ ] Documentation for common operations
- [ ] Backup strategy for database
- [ ] Security review completed
  - [ ] RLS policies tested
  - [ ] Webhook signatures verified
  - [ ] API rate limiting in place
  - [ ] Input validation on all endpoints

---

## Phase 2 Triggers (When to Scale)

Watch for these signals before adding infrastructure:

- [ ] Dashboard queries >200ms consistently
- [ ] VAPI function calls timing out
- [ ] Webhook delivery failures >1%
- [ ] 50+ concurrent calls regularly
- [ ] Customers requesting transcript search
- [ ] Approaching 500 customers

**Phase 2 additions:** Redis (Upstash), Temporal Cloud, GIN index for search

---

## Notes

- **Do not add Redis or Temporal in Phase 1** - Supabase handles the load
- **Partition calls table from day 1** - Only hard migration to do later
- **Keep it simple** - Add complexity only when you feel the pain
- **Cost target:** $25/month infrastructure until traction proven
