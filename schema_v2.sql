-- ============================================================================
-- AI Receptionist Platform - Database Schema v2
-- Industry-agnostic with template system
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Industries (Reference table)
-- ----------------------------------------------------------------------------
CREATE TABLE industries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(50) UNIQUE NOT NULL,       -- 'logistics', 'legal', 'healthcare'
    name VARCHAR(100) NOT NULL,              -- 'Logistics & Delivery'
    description TEXT,
    icon VARCHAR(50),                        -- Emoji or icon name
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed industries
INSERT INTO industries (slug, name, icon, sort_order) VALUES
('logistics', 'Logistics & Delivery', '🚚', 1),
('legal', 'Legal', '⚖️', 2),
('healthcare', 'Healthcare', '🏥', 3),
('home-services', 'Home Services', '🔧', 4),
('restaurant', 'Restaurant & Hospitality', '🍽️', 5),
('real-estate', 'Real Estate', '🏠', 6),
('retail', 'Retail', '🏪', 7),
('professional-services', 'Professional Services', '💼', 8),
('other', 'Other', '✨', 99);

-- ----------------------------------------------------------------------------
-- Organizations (Tenants)
-- ----------------------------------------------------------------------------
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic info
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    
    -- Business details
    industry_id UUID REFERENCES industries(id),
    business_type VARCHAR(100),              -- Free-form: "Family Law Firm", "HVAC Contractor"
    timezone VARCHAR(50) DEFAULT 'America/New_York',
    
    -- Contact
    primary_email VARCHAR(255) NOT NULL,
    primary_phone VARCHAR(20),
    website VARCHAR(255),
    
    -- Address (for local number provisioning)
    address_city VARCHAR(100),
    address_state VARCHAR(50),
    address_country VARCHAR(2) DEFAULT 'US',
    address_postal VARCHAR(20),
    
    -- Billing
    stripe_customer_id VARCHAR(255) UNIQUE,
    stripe_subscription_id VARCHAR(255),
    plan_id UUID REFERENCES plans(id),
    billing_email VARCHAR(255),
    
    -- Usage tracking
    current_period_minutes_used INTEGER DEFAULT 0,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    
    -- Status
    status VARCHAR(20) DEFAULT 'trial',
    trial_ends_at TIMESTAMPTZ,
    
    -- Settings
    settings JSONB DEFAULT '{}',
    /*
    {
        "notifications": {
            "sms": { "enabled": true, "numbers": ["+1..."] },
            "email": { "enabled": true, "addresses": ["..."] },
            "slack": { "enabled": false, "webhook": null }
        },
        "business_hours": {
            "timezone": "America/New_York",
            "schedule": {
                "monday": { "open": "09:00", "close": "17:00" },
                ...
            }
        },
        "call_recording": true,
        "transcription": true,
        "default_voice": { "provider": "11labs", "voice_id": "..." }
    }
    */
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_organizations_slug ON organizations(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_organizations_industry ON organizations(industry_id);

-- ----------------------------------------------------------------------------
-- Plans
-- ----------------------------------------------------------------------------
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    name VARCHAR(50) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    
    -- Pricing
    price_monthly INTEGER NOT NULL,          -- Cents
    price_yearly INTEGER,
    
    -- Limits
    included_minutes INTEGER NOT NULL,
    max_phone_numbers INTEGER NOT NULL,
    max_assistants INTEGER,                  -- NULL = unlimited
    max_team_members INTEGER,
    
    -- Overage
    overage_rate_per_minute INTEGER NOT NULL,
    
    -- Features
    features JSONB DEFAULT '[]',
    /*
    ["sms_notifications", "zapier", "custom_prompts", "api_access", "priority_support"]
    */
    
    -- Stripe
    stripe_product_id VARCHAR(255),
    stripe_price_id_monthly VARCHAR(255),
    stripe_price_id_yearly VARCHAR(255),
    
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed plans
INSERT INTO plans (name, display_name, price_monthly, included_minutes, max_phone_numbers, max_assistants, overage_rate_per_minute, features, sort_order) VALUES
('starter', 'Starter', 2900, 100, 1, 1, 8, '["email_notifications"]', 1),
('pro', 'Pro', 7900, 500, 3, 10, 8, '["email_notifications", "sms_notifications", "zapier", "custom_prompts"]', 2),
('business', 'Business', 19900, 2000, 10, -1, 8, '["email_notifications", "sms_notifications", "zapier", "custom_prompts", "api_access", "priority_support", "analytics"]', 3);

-- ----------------------------------------------------------------------------
-- Templates (Pre-built AI configurations)
-- ----------------------------------------------------------------------------
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identity
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    short_description VARCHAR(255),
    
    -- Categorization
    industry_id UUID REFERENCES industries(id),
    category VARCHAR(50),                    -- 'intake', 'scheduling', 'support', 'general'
    tags TEXT[] DEFAULT '{}',
    icon VARCHAR(50),
    
    -- AI Configuration
    system_prompt TEXT NOT NULL,
    first_message TEXT,
    end_call_message TEXT,
    voice_provider VARCHAR(20) DEFAULT '11labs',
    voice_id VARCHAR(100),
    model_provider VARCHAR(20) DEFAULT 'openai',
    model_name VARCHAR(50) DEFAULT 'gpt-4o-mini',
    temperature DECIMAL(2,1) DEFAULT 0.7,
    
    -- Variables for customization
    variables JSONB DEFAULT '[]',
    /*
    [
        {
            "key": "business_name",
            "label": "Business Name",
            "type": "text",
            "required": true,
            "placeholder": "Acme Corp",
            "helpText": "Your company name as callers should hear it",
            "validation": null
        },
        {
            "key": "practice_areas",
            "label": "Practice Areas",
            "type": "multiselect",
            "required": true,
            "options": ["Personal Injury", "Family Law", "Criminal Defense"],
            "helpText": "Select all areas you practice"
        },
        {
            "key": "business_hours",
            "label": "Business Hours",
            "type": "hours",
            "required": true,
            "default": {"weekdays": "9am-5pm"}
        },
        {
            "key": "urgent_phone",
            "label": "Urgent Contact Phone",
            "type": "phone",
            "required": false,
            "helpText": "For emergencies outside business hours"
        }
    ]
    */
    
    -- Functions the AI can use
    available_functions JSONB DEFAULT '[]',
    default_function_config JSONB DEFAULT '{}',
    /*
    available_functions: ["transferCall", "bookAppointment", "takeMessage", "sendSms"]
    
    default_function_config: {
        "bookAppointment": {
            "duration_options": [15, 30, 60],
            "default_duration": 30,
            "buffer_minutes": 15
        }
    }
    */
    
    -- Sample conversation for preview
    sample_conversation JSONB DEFAULT '[]',
    /*
    [
        {"role": "assistant", "content": "Thank you for calling..."},
        {"role": "user", "content": "Hi, I need to schedule..."},
        {"role": "assistant", "content": "I'd be happy to help..."}
    ]
    */
    
    -- Metadata
    estimated_setup_minutes INTEGER DEFAULT 5,
    difficulty VARCHAR(20) DEFAULT 'easy',   -- 'easy', 'medium', 'advanced'
    is_premium BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Author (for marketplace)
    author_type VARCHAR(20) DEFAULT 'official',  -- 'official', 'partner', 'community'
    author_id UUID,
    author_name VARCHAR(100),
    
    -- Stats
    use_count INTEGER DEFAULT 0,
    rating_average DECIMAL(2,1),
    rating_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_templates_industry ON templates(industry_id) WHERE is_active = TRUE;
CREATE INDEX idx_templates_category ON templates(category) WHERE is_active = TRUE;
CREATE INDEX idx_templates_featured ON templates(is_featured, industry_id) WHERE is_active = TRUE;
CREATE INDEX idx_templates_search ON templates USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- ----------------------------------------------------------------------------
-- Assistants (User's configured AI instances)
-- ----------------------------------------------------------------------------
CREATE TABLE assistants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Source
    template_id UUID REFERENCES templates(id),  -- NULL if custom built
    
    -- Identity
    name VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- AI Configuration
    system_prompt TEXT NOT NULL,
    first_message TEXT,
    end_call_message TEXT,
    voice_provider VARCHAR(20) DEFAULT '11labs',
    voice_id VARCHAR(100),
    model_provider VARCHAR(20) DEFAULT 'openai',
    model_name VARCHAR(50) DEFAULT 'gpt-4o-mini',
    temperature DECIMAL(2,1) DEFAULT 0.7,
    
    -- Template variable values
    variable_values JSONB DEFAULT '{}',
    /*
    {
        "business_name": "Johnson & Associates",
        "practice_areas": ["Personal Injury", "Family Law"],
        "business_hours": "Monday-Friday 9am-5pm",
        "urgent_phone": "+15551234567"
    }
    */
    
    -- Functions configuration
    enabled_functions JSONB DEFAULT '[]',
    function_config JSONB DEFAULT '{}',
    /*
    {
        "transferCall": {
            "destinations": [
                {"name": "Sales", "phone": "+15551234567", "conditions": "pricing questions"},
                {"name": "Support", "phone": "+15551234568", "conditions": "technical issues"},
                {"name": "Emergency", "phone": "+15551234569", "conditions": "urgent matters"}
            ]
        },
        "bookAppointment": {
            "calendar_integration": "google",
            "calendar_id": "primary",
            "duration": 30,
            "buffer": 15,
            "availability": {
                "monday": ["09:00-12:00", "13:00-17:00"],
                "tuesday": ["09:00-12:00", "13:00-17:00"]
            }
        },
        "takeMessage": {
            "required_fields": ["name", "phone", "message"],
            "notify_via": ["sms", "email"]
        }
    }
    */
    
    -- Call handling settings
    max_duration_seconds INTEGER DEFAULT 600,
    silence_timeout_seconds INTEGER DEFAULT 30,
    background_sound VARCHAR(20) DEFAULT 'off',  -- 'off', 'office', 'cafe'
    
    -- VAPI sync
    vapi_assistant_id VARCHAR(100),
    vapi_synced_at TIMESTAMPTZ,
    vapi_sync_error TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft',          -- 'draft', 'active', 'paused', 'error'
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assistants_org ON assistants(organization_id);
CREATE INDEX idx_assistants_template ON assistants(template_id);
CREATE INDEX idx_assistants_status ON assistants(organization_id, status);

-- ----------------------------------------------------------------------------
-- Phone Numbers
-- ----------------------------------------------------------------------------
CREATE TABLE phone_numbers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Number details
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    friendly_name VARCHAR(100),
    
    -- Location
    country VARCHAR(2) DEFAULT 'US',
    region VARCHAR(50),
    locality VARCHAR(100),
    
    -- Provider info
    provider VARCHAR(20) DEFAULT 'twilio',
    provider_sid VARCHAR(100),
    
    -- Assignment
    assistant_id UUID REFERENCES assistants(id) ON DELETE SET NULL,
    
    -- Routing rules
    routing_rules JSONB DEFAULT '{}',
    /*
    {
        "default_assistant_id": "uuid",
        "schedule_based": [
            {
                "assistant_id": "uuid",
                "schedule": {
                    "weekdays": {"start": "09:00", "end": "17:00"}
                }
            },
            {
                "assistant_id": "uuid-after-hours",
                "fallback": true
            }
        ]
    }
    */
    
    -- Status
    status VARCHAR(20) DEFAULT 'active',
    capabilities JSONB DEFAULT '{"voice": true, "sms": true}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_phone_numbers_org ON phone_numbers(organization_id);
CREATE INDEX idx_phone_numbers_assistant ON phone_numbers(assistant_id);

-- ----------------------------------------------------------------------------
-- Users & Memberships
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID UNIQUE NOT NULL,
    
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    phone VARCHAR(20),
    
    email_verified BOOLEAN DEFAULT FALSE,
    last_sign_in_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_users_email ON users(LOWER(email));

CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    role VARCHAR(20) NOT NULL DEFAULT 'member',
    
    invited_by UUID REFERENCES users(id),
    invited_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(organization_id, user_id)
);

-- ============================================================================
-- CALL DATA (Partitioned for scale)
-- ============================================================================

CREATE TABLE calls (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    
    -- Identifiers
    vapi_call_id VARCHAR(100),
    provider_call_sid VARCHAR(100),
    
    -- Parties
    phone_number_id UUID,
    assistant_id UUID,
    from_number VARCHAR(20) NOT NULL,
    to_number VARCHAR(20) NOT NULL,
    
    -- Timing
    started_at TIMESTAMPTZ NOT NULL,
    answered_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    
    -- Status
    status VARCHAR(20) NOT NULL,
    direction VARCHAR(10) DEFAULT 'inbound',
    ended_reason VARCHAR(50),
    
    -- Analysis
    call_type VARCHAR(50),
    sentiment VARCHAR(20),
    summary TEXT,
    
    -- Actions
    was_transferred BOOLEAN DEFAULT FALSE,
    transfer_destination VARCHAR(100),
    voicemail_left BOOLEAN DEFAULT FALSE,
    appointment_booked BOOLEAN DEFAULT FALSE,
    
    -- Cost
    cost_cents INTEGER,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Create partitions
CREATE TABLE calls_2025_01 PARTITION OF calls FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE calls_2025_02 PARTITION OF calls FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
CREATE TABLE calls_2025_03 PARTITION OF calls FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');
CREATE TABLE calls_2025_04 PARTITION OF calls FOR VALUES FROM ('2025-04-01') TO ('2025-05-01');
CREATE TABLE calls_2025_05 PARTITION OF calls FOR VALUES FROM ('2025-05-01') TO ('2025-06-01');
CREATE TABLE calls_2025_06 PARTITION OF calls FOR VALUES FROM ('2025-06-01') TO ('2025-07-01');
CREATE TABLE calls_2025_07 PARTITION OF calls FOR VALUES FROM ('2025-07-01') TO ('2025-08-01');
CREATE TABLE calls_2025_08 PARTITION OF calls FOR VALUES FROM ('2025-08-01') TO ('2025-09-01');
CREATE TABLE calls_2025_09 PARTITION OF calls FOR VALUES FROM ('2025-09-01') TO ('2025-10-01');
CREATE TABLE calls_2025_10 PARTITION OF calls FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');
CREATE TABLE calls_2025_11 PARTITION OF calls FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');
CREATE TABLE calls_2025_12 PARTITION OF calls FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');
CREATE TABLE calls_2026_01 PARTITION OF calls FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE INDEX idx_calls_org_date ON calls(organization_id, created_at DESC);
CREATE INDEX idx_calls_assistant ON calls(assistant_id, created_at DESC);
CREATE INDEX idx_calls_from ON calls(from_number, created_at DESC);

-- Transcripts
CREATE TABLE call_transcripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_id UUID NOT NULL,
    call_created_at TIMESTAMPTZ NOT NULL,
    organization_id UUID NOT NULL,
    
    transcript_text TEXT,
    transcript_segments JSONB,
    summary TEXT,
    extracted_data JSONB DEFAULT '{}',
    
    search_vector TSVECTOR,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transcripts_call ON call_transcripts(call_id, call_created_at);
CREATE INDEX idx_transcripts_search ON call_transcripts USING GIN(search_vector);

-- Recordings
CREATE TABLE call_recordings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_id UUID NOT NULL,
    call_created_at TIMESTAMPTZ NOT NULL,
    organization_id UUID NOT NULL,
    
    storage_bucket VARCHAR(50) DEFAULT 'recordings',
    storage_path TEXT NOT NULL,
    
    duration_seconds INTEGER,
    file_size_bytes BIGINT,
    mime_type VARCHAR(50) DEFAULT 'audio/wav',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Actions taken during calls
CREATE TABLE call_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_id UUID NOT NULL,
    call_created_at TIMESTAMPTZ NOT NULL,
    organization_id UUID NOT NULL,
    
    action_type VARCHAR(50) NOT NULL,
    action_data JSONB DEFAULT '{}',
    
    status VARCHAR(20) DEFAULT 'completed',
    error_message TEXT,
    
    triggered_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_actions_call ON call_actions(call_id, call_created_at);

-- ============================================================================
-- CONTACTS
-- ============================================================================

CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    name VARCHAR(255),
    
    contact_type VARCHAR(50),
    tags TEXT[] DEFAULT '{}',
    
    custom_fields JSONB DEFAULT '{}',
    
    total_calls INTEGER DEFAULT 0,
    last_call_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(organization_id, phone_number)
);

CREATE INDEX idx_contacts_org ON contacts(organization_id);
CREATE INDEX idx_contacts_phone ON contacts(phone_number);

-- ============================================================================
-- INTEGRATIONS
-- ============================================================================

CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    provider VARCHAR(50) NOT NULL,
    
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    
    config JSONB DEFAULT '{}',
    
    status VARCHAR(20) DEFAULT 'active',
    last_sync_at TIMESTAMPTZ,
    error_message TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(organization_id, provider)
);

-- ============================================================================
-- ANALYTICS & BILLING
-- ============================================================================

CREATE TABLE daily_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    
    total_calls INTEGER DEFAULT 0,
    total_minutes INTEGER DEFAULT 0,
    
    calls_by_assistant JSONB DEFAULT '{}',
    calls_by_outcome JSONB DEFAULT '{}',
    
    total_cost_cents INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(organization_id, date)
);

CREATE TABLE billing_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    
    event_type VARCHAR(50) NOT NULL,
    
    stripe_event_id VARCHAR(100),
    stripe_invoice_id VARCHAR(100),
    
    amount_cents INTEGER,
    currency VARCHAR(3) DEFAULT 'usd',
    description TEXT,
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SEED DATA: Templates
-- ============================================================================

-- Get industry IDs
DO $$
DECLARE
    logistics_id UUID;
    legal_id UUID;
    healthcare_id UUID;
    home_services_id UUID;
    restaurant_id UUID;
    other_id UUID;
BEGIN
    SELECT id INTO logistics_id FROM industries WHERE slug = 'logistics';
    SELECT id INTO legal_id FROM industries WHERE slug = 'legal';
    SELECT id INTO healthcare_id FROM industries WHERE slug = 'healthcare';
    SELECT id INTO home_services_id FROM industries WHERE slug = 'home-services';
    SELECT id INTO restaurant_id FROM industries WHERE slug = 'restaurant';
    SELECT id INTO other_id FROM industries WHERE slug = 'other';

    -- LOGISTICS TEMPLATES
    INSERT INTO templates (slug, name, short_description, description, industry_id, category, icon, system_prompt, first_message, variables, available_functions, is_featured) VALUES
    (
        'logistics-driver-hotline',
        'Driver Hotline',
        'Handle driver callouts, vehicle issues, and route problems',
        'Perfect for delivery companies. Handles driver callouts, vehicle breakdowns, route issues, and schedule questions. Automatically notifies dispatch.',
        logistics_id,
        'support',
        '🚚',
        'You are the AI receptionist for {{business_name}}, a delivery company.

Your primary role is to help drivers who are calling about:
- Calling out sick or late
- Vehicle breakdowns or accidents
- Route issues or delays
- Schedule questions

For callouts:
1. Get the driver''s name
2. Get their route number or area
3. Get the reason (sick, emergency, vehicle issue)
4. Ask if they know when they can return
5. Confirm you''ll notify dispatch immediately

For vehicle issues:
1. Confirm driver safety first
2. Get location
3. Get vehicle number
4. Get description of issue
5. Transfer to dispatch for immediate help if it''s an emergency

Always be empathetic but efficient. Drivers are often stressed when calling.',
        'Hello, this is {{business_name}} driver support. How can I help you today?',
        '[
            {"key": "business_name", "label": "Business Name", "type": "text", "required": true},
            {"key": "dispatch_phone", "label": "Dispatch Phone", "type": "phone", "required": true, "helpText": "For urgent transfers"}
        ]'::jsonb,
        '["transferCall", "takeMessage", "sendSmsNotification"]'::jsonb,
        true
    ),
    (
        'logistics-customer-status',
        'Customer Delivery Status',
        'Handle "where''s my package?" calls professionally',
        'For customer-facing delivery inquiries. Empathetically handles package status questions, collects information, and schedules callbacks.',
        logistics_id,
        'support',
        '📦',
        'You are the customer service AI for {{business_name}}.

When customers call about deliveries:
1. Greet them warmly
2. Ask for their tracking number or address
3. Explain that you''ll have someone look into their delivery
4. Take their callback number
5. Confirm someone will call them back within {{callback_time}}

You cannot access real-time tracking. Your job is to:
- Acknowledge their concern
- Collect their information
- Ensure they get a callback

If they''re upset, empathize: "I completely understand how frustrating it is to wait for a package..."',
        'Thank you for calling {{business_name}}. How can I help you with your delivery today?',
        '[
            {"key": "business_name", "label": "Business Name", "type": "text", "required": true},
            {"key": "callback_time", "label": "Callback Time Promise", "type": "text", "required": true, "default": "2 hours", "helpText": "How quickly will you call back?"}
        ]'::jsonb,
        '["scheduleCallback", "takeMessage"]'::jsonb,
        false
    );

    -- LEGAL TEMPLATES
    INSERT INTO templates (slug, name, short_description, description, industry_id, category, icon, system_prompt, first_message, variables, available_functions, is_featured) VALUES
    (
        'legal-client-intake',
        'Client Intake',
        'Qualify potential clients and schedule consultations',
        'Screen potential clients, capture case details, check for basic conflicts, and schedule consultations. Perfect for solo practitioners and small firms.',
        legal_id,
        'intake',
        '📋',
        'You are the intake receptionist for {{firm_name}}, a law firm specializing in {{practice_areas}}.

When potential clients call:
1. Greet them professionally
2. Ask what type of legal matter they need help with
3. Determine if it falls within our practice areas
4. If yes, gather basic information:
   - Their name and contact info
   - Brief description of their situation
   - When the issue occurred
   - Whether they''ve spoken with other attorneys
5. Offer to schedule a {{consultation_type}} consultation
6. If scheduling, confirm date, time, and any consultation fee

If the matter is outside our practice areas, politely explain and suggest they contact the state bar for a referral.

Be empathetic - people calling lawyers are often stressed. But also be efficient and professional.',
        'Thank you for calling {{firm_name}}. This is our intake line. How may I assist you today?',
        '[
            {"key": "firm_name", "label": "Firm Name", "type": "text", "required": true},
            {"key": "practice_areas", "label": "Practice Areas", "type": "text", "required": true, "placeholder": "Personal Injury, Family Law, Employment"},
            {"key": "consultation_type", "label": "Consultation Type", "type": "select", "required": true, "options": ["free", "paid"], "default": "free"},
            {"key": "consultation_fee", "label": "Consultation Fee", "type": "text", "required": false, "helpText": "If paid consultations, enter the fee"}
        ]'::jsonb,
        '["bookAppointment", "takeMessage", "sendSmsNotification"]'::jsonb,
        true
    ),
    (
        'legal-after-hours',
        'After-Hours Legal',
        'Handle calls outside business hours professionally',
        'Takes messages, handles urgent matters, and sets expectations for callbacks. Includes escalation for true emergencies.',
        legal_id,
        'support',
        '🌙',
        'You are the after-hours answering service for {{firm_name}}.

Our office hours are {{business_hours}}.

For general inquiries:
- Take a detailed message including name, phone, and brief description
- Explain we will return their call the next business day
- If they mention it''s urgent, ask more about why to assess true urgency

For emergencies (imminent arrest, restraining order issues, custody emergencies):
- Gather essential details quickly
- Transfer to the emergency line at {{emergency_phone}}

Help callers understand what constitutes an emergency vs. what can wait until business hours.

Be calm and reassuring, but don''t make promises about outcomes.',
        'You''ve reached {{firm_name}} after hours. I can take a message or assist with urgent matters. How may I help you?',
        '[
            {"key": "firm_name", "label": "Firm Name", "type": "text", "required": true},
            {"key": "business_hours", "label": "Business Hours", "type": "text", "required": true, "default": "Monday through Friday, 9 AM to 5 PM"},
            {"key": "emergency_phone", "label": "Emergency Phone", "type": "phone", "required": true, "helpText": "For true legal emergencies"}
        ]'::jsonb,
        '["transferCall", "takeMessage"]'::jsonb,
        false
    );

    -- HEALTHCARE TEMPLATES
    INSERT INTO templates (slug, name, short_description, description, industry_id, category, icon, system_prompt, first_message, variables, available_functions, is_featured) VALUES
    (
        'healthcare-appointment-booking',
        'Appointment Booking',
        'Schedule and manage patient appointments',
        'Handle appointment scheduling, rescheduling, and cancellations. Integrates with your calendar to show real-time availability.',
        healthcare_id,
        'scheduling',
        '📅',
        'You are the scheduling assistant for {{practice_name}}, a {{practice_type}} practice.

When patients call to schedule:
1. Ask if they are a new or existing patient
2. Ask what type of appointment they need
3. Check availability and offer options
4. Confirm the appointment details
5. Remind them of any preparation needed (fasting, forms to bring, etc.)

For new patients, collect:
- Full name
- Date of birth
- Phone number
- Insurance information (carrier and member ID)

For rescheduling or cancellations:
- Get their name and date of birth to find their appointment
- Process the change
- If rescheduling, offer new times

Always remind patients of the {{cancellation_policy}}.

Be warm and professional. Medical appointments can cause anxiety.',
        'Thank you for calling {{practice_name}}. How can I help you with scheduling today?',
        '[
            {"key": "practice_name", "label": "Practice Name", "type": "text", "required": true},
            {"key": "practice_type", "label": "Practice Type", "type": "text", "required": true, "placeholder": "dental, medical, veterinary"},
            {"key": "cancellation_policy", "label": "Cancellation Policy", "type": "text", "required": true, "default": "24-hour cancellation policy"}
        ]'::jsonb,
        '["bookAppointment", "takeMessage"]'::jsonb,
        true
    );

    -- HOME SERVICES TEMPLATES
    INSERT INTO templates (slug, name, short_description, description, industry_id, category, icon, system_prompt, first_message, variables, available_functions, is_featured) VALUES
    (
        'home-services-booking',
        'Service Booking',
        'Schedule service calls and collect job details',
        'For plumbers, electricians, HVAC, and other home service providers. Collects job details, schedules appointments, and handles emergency dispatching.',
        home_services_id,
        'scheduling',
        '🔧',
        'You are the scheduling assistant for {{business_name}}, providing {{service_types}} services.

When customers call:
1. Ask what service they need
2. Determine if it''s an emergency or can be scheduled
3. Get their address and contact info
4. Describe the issue briefly
5. Offer available appointment times

For emergencies ({{emergency_examples}}):
- Get their address and phone immediately
- Describe the issue
- Transfer to dispatch at {{dispatch_phone}} or explain a technician will call back within {{emergency_response_time}}

For quotes:
- Gather all details about the project
- Schedule an estimate visit or explain we''ll call back with a quote

Be helpful and knowledgeable. Customers often don''t know the right terms - help them describe their issue.',
        'Thanks for calling {{business_name}}. How can we help you today?',
        '[
            {"key": "business_name", "label": "Business Name", "type": "text", "required": true},
            {"key": "service_types", "label": "Service Types", "type": "text", "required": true, "placeholder": "plumbing, heating, cooling"},
            {"key": "emergency_examples", "label": "Emergency Examples", "type": "text", "required": true, "default": "burst pipes, no heat in winter, gas smell"},
            {"key": "dispatch_phone", "label": "Dispatch Phone", "type": "phone", "required": true},
            {"key": "emergency_response_time", "label": "Emergency Response Time", "type": "text", "default": "15 minutes"}
        ]'::jsonb,
        '["bookAppointment", "transferCall", "takeMessage"]'::jsonb,
        true
    );

    -- RESTAURANT TEMPLATES
    INSERT INTO templates (slug, name, short_description, description, industry_id, category, icon, system_prompt, first_message, variables, available_functions, is_featured) VALUES
    (
        'restaurant-reservations',
        'Reservations',
        'Handle table reservations and inquiries',
        'Take reservations, answer questions about hours and menu, and manage booking changes. Perfect for any restaurant.',
        restaurant_id,
        'scheduling',
        '🍽️',
        'You are the host for {{restaurant_name}}, a {{cuisine_type}} restaurant.

For reservations:
1. Ask for the date and time they''d like
2. Ask how many guests
3. Check availability
4. Get their name and phone number
5. Confirm all details
6. Mention any special notes (dress code, parking, etc.)

Common questions to answer:
- Hours: {{hours}}
- Location: {{address}}
- Parking: {{parking_info}}
- Dress code: {{dress_code}}

For large parties ({{large_party_threshold}}+ guests):
- Take their info and have a manager call back
- Or transfer to {{manager_phone}}

Be warm and welcoming - set the tone for their dining experience.',
        'Thank you for calling {{restaurant_name}}. How may I help you?',
        '[
            {"key": "restaurant_name", "label": "Restaurant Name", "type": "text", "required": true},
            {"key": "cuisine_type", "label": "Cuisine Type", "type": "text", "required": true},
            {"key": "hours", "label": "Hours", "type": "text", "required": true},
            {"key": "address", "label": "Address", "type": "text", "required": true},
            {"key": "parking_info", "label": "Parking Info", "type": "text", "required": false, "default": "Street parking available"},
            {"key": "dress_code", "label": "Dress Code", "type": "text", "required": false, "default": "Smart casual"},
            {"key": "large_party_threshold", "label": "Large Party Size", "type": "text", "default": "8"},
            {"key": "manager_phone", "label": "Manager Phone", "type": "phone", "required": false}
        ]'::jsonb,
        '["bookAppointment", "takeMessage", "transferCall"]'::jsonb,
        true
    );

    -- GENERAL TEMPLATES
    INSERT INTO templates (slug, name, short_description, description, industry_id, category, icon, system_prompt, first_message, variables, available_functions, is_featured) VALUES
    (
        'general-receptionist',
        'Basic Receptionist',
        'Professional call answering for any business',
        'A flexible template that works for any business. Answer calls, take messages, transfer to the right person, and handle common questions.',
        other_id,
        'general',
        '📞',
        'You are the receptionist for {{business_name}}.

Your responsibilities:
1. Answer calls professionally
2. Determine what the caller needs
3. Take messages for team members
4. Answer basic questions about the business
5. Transfer calls when appropriate

About the business:
{{business_description}}

Hours: {{business_hours}}

Common questions to answer:
{{faq}}

Transfer destinations:
{{transfer_info}}

Be professional, friendly, and helpful. If you don''t know something, offer to take a message and have someone call back.',
        'Thank you for calling {{business_name}}. How may I direct your call?',
        '[
            {"key": "business_name", "label": "Business Name", "type": "text", "required": true},
            {"key": "business_description", "label": "About Your Business", "type": "textarea", "required": true, "helpText": "Brief description for the AI to understand your business"},
            {"key": "business_hours", "label": "Business Hours", "type": "text", "required": true},
            {"key": "faq", "label": "Common Questions & Answers", "type": "textarea", "required": false, "helpText": "List common questions and how to answer them"},
            {"key": "transfer_info", "label": "Transfer Destinations", "type": "textarea", "required": false, "helpText": "Who to transfer to for different types of calls"}
        ]'::jsonb,
        '["transferCall", "takeMessage"]'::jsonb,
        true
    );

END $$;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE phone_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- Helper function
CREATE OR REPLACE FUNCTION get_user_org_ids()
RETURNS UUID[] AS $$
    SELECT COALESCE(ARRAY_AGG(organization_id), '{}')
    FROM organization_members
    WHERE user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Basic policies (expand as needed)
CREATE POLICY "Users can view their organizations"
    ON organizations FOR SELECT
    USING (id = ANY(get_user_org_ids()));

CREATE POLICY "Members can view their org's assistants"
    ON assistants FOR SELECT
    USING (organization_id = ANY(get_user_org_ids()));

CREATE POLICY "Members can view their org's calls"
    ON calls FOR SELECT
    USING (organization_id = ANY(get_user_org_ids()));

-- Templates are public read
CREATE POLICY "Anyone can view active templates"
    ON templates FOR SELECT
    USING (is_active = TRUE);

-- Industries are public read
CREATE POLICY "Anyone can view industries"
    ON industries FOR SELECT
    USING (is_active = TRUE);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON assistants FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON phone_numbers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON templates FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Increment template use count when assistant created
CREATE OR REPLACE FUNCTION increment_template_use()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.template_id IS NOT NULL THEN
        UPDATE templates SET use_count = use_count + 1 WHERE id = NEW.template_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_assistant_insert
    AFTER INSERT ON assistants
    FOR EACH ROW EXECUTE FUNCTION increment_template_use();
