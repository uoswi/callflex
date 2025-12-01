-- ============================================================================
-- AI Receptionist Platform - Database Schema v2 (Fixed Order)
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- ============================================================================
-- DROP EXISTING TABLES (for clean reset)
-- ============================================================================
DROP TABLE IF EXISTS billing_events CASCADE;
DROP TABLE IF EXISTS daily_usage CASCADE;
DROP TABLE IF EXISTS integrations CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS call_actions CASCADE;
DROP TABLE IF EXISTS call_recordings CASCADE;
DROP TABLE IF EXISTS call_transcripts CASCADE;
DROP TABLE IF EXISTS calls CASCADE;
DROP TABLE IF EXISTS calls_2025_01 CASCADE;
DROP TABLE IF EXISTS calls_2025_02 CASCADE;
DROP TABLE IF EXISTS calls_2025_03 CASCADE;
DROP TABLE IF EXISTS calls_2025_04 CASCADE;
DROP TABLE IF EXISTS calls_2025_05 CASCADE;
DROP TABLE IF EXISTS calls_2025_06 CASCADE;
DROP TABLE IF EXISTS calls_2025_07 CASCADE;
DROP TABLE IF EXISTS calls_2025_08 CASCADE;
DROP TABLE IF EXISTS calls_2025_09 CASCADE;
DROP TABLE IF EXISTS calls_2025_10 CASCADE;
DROP TABLE IF EXISTS calls_2025_11 CASCADE;
DROP TABLE IF EXISTS calls_2025_12 CASCADE;
DROP TABLE IF EXISTS calls_2026_01 CASCADE;
DROP TABLE IF EXISTS phone_numbers CASCADE;
DROP TABLE IF EXISTS assistants CASCADE;
DROP TABLE IF EXISTS organization_members CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS templates CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS plans CASCADE;
DROP TABLE IF EXISTS industries CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS get_user_org_ids() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS increment_template_use() CASCADE;

-- ============================================================================
-- REFERENCE TABLES
-- ============================================================================

-- Industries
CREATE TABLE industries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
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

-- Plans (must be before organizations)
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    price_monthly INTEGER NOT NULL,
    price_yearly INTEGER,
    included_minutes INTEGER NOT NULL,
    max_phone_numbers INTEGER NOT NULL,
    max_assistants INTEGER,
    max_team_members INTEGER,
    overage_rate_per_minute INTEGER NOT NULL,
    features JSONB DEFAULT '[]',
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

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Organizations
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    industry_id UUID REFERENCES industries(id),
    business_type VARCHAR(100),
    timezone VARCHAR(50) DEFAULT 'America/New_York',
    primary_email VARCHAR(255) NOT NULL,
    primary_phone VARCHAR(20),
    website VARCHAR(255),
    address_city VARCHAR(100),
    address_state VARCHAR(50),
    address_country VARCHAR(2) DEFAULT 'US',
    address_postal VARCHAR(20),
    stripe_customer_id VARCHAR(255) UNIQUE,
    stripe_subscription_id VARCHAR(255),
    plan_id UUID REFERENCES plans(id),
    billing_email VARCHAR(255),
    current_period_minutes_used INTEGER DEFAULT 0,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'trial',
    trial_ends_at TIMESTAMPTZ,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_organizations_slug ON organizations(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_organizations_industry ON organizations(industry_id);

-- Users
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

-- Organization Members
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

-- Templates
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    short_description VARCHAR(255),
    industry_id UUID REFERENCES industries(id),
    category VARCHAR(50),
    tags TEXT[] DEFAULT '{}',
    icon VARCHAR(50),
    system_prompt TEXT NOT NULL,
    first_message TEXT,
    end_call_message TEXT,
    voice_provider VARCHAR(20) DEFAULT '11labs',
    voice_id VARCHAR(100),
    model_provider VARCHAR(20) DEFAULT 'openai',
    model_name VARCHAR(50) DEFAULT 'gpt-4o-mini',
    temperature DECIMAL(2,1) DEFAULT 0.7,
    variables JSONB DEFAULT '[]',
    available_functions JSONB DEFAULT '[]',
    default_function_config JSONB DEFAULT '{}',
    sample_conversation JSONB DEFAULT '[]',
    estimated_setup_minutes INTEGER DEFAULT 5,
    difficulty VARCHAR(20) DEFAULT 'easy',
    is_premium BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    author_type VARCHAR(20) DEFAULT 'official',
    author_id UUID,
    author_name VARCHAR(100),
    use_count INTEGER DEFAULT 0,
    rating_average DECIMAL(2,1),
    rating_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_templates_industry ON templates(industry_id) WHERE is_active = TRUE;
CREATE INDEX idx_templates_category ON templates(category) WHERE is_active = TRUE;
CREATE INDEX idx_templates_featured ON templates(is_featured, industry_id) WHERE is_active = TRUE;

-- Assistants
CREATE TABLE assistants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    template_id UUID REFERENCES templates(id),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    system_prompt TEXT NOT NULL,
    first_message TEXT,
    end_call_message TEXT,
    voice_provider VARCHAR(20) DEFAULT '11labs',
    voice_id VARCHAR(100),
    model_provider VARCHAR(20) DEFAULT 'openai',
    model_name VARCHAR(50) DEFAULT 'gpt-4o-mini',
    temperature DECIMAL(2,1) DEFAULT 0.7,
    variable_values JSONB DEFAULT '{}',
    enabled_functions JSONB DEFAULT '[]',
    function_config JSONB DEFAULT '{}',
    max_duration_seconds INTEGER DEFAULT 600,
    silence_timeout_seconds INTEGER DEFAULT 30,
    background_sound VARCHAR(20) DEFAULT 'off',
    vapi_assistant_id VARCHAR(100),
    vapi_synced_at TIMESTAMPTZ,
    vapi_sync_error TEXT,
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assistants_org ON assistants(organization_id);
CREATE INDEX idx_assistants_template ON assistants(template_id);
CREATE INDEX idx_assistants_status ON assistants(organization_id, status);

-- Phone Numbers
CREATE TABLE phone_numbers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    friendly_name VARCHAR(100),
    country VARCHAR(2) DEFAULT 'US',
    region VARCHAR(50),
    locality VARCHAR(100),
    provider VARCHAR(20) DEFAULT 'twilio',
    provider_sid VARCHAR(100),
    assistant_id UUID REFERENCES assistants(id) ON DELETE SET NULL,
    routing_rules JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active',
    capabilities JSONB DEFAULT '{"voice": true, "sms": true}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_phone_numbers_org ON phone_numbers(organization_id);
CREATE INDEX idx_phone_numbers_assistant ON phone_numbers(assistant_id);

-- ============================================================================
-- CALL DATA (Partitioned)
-- ============================================================================

CREATE TABLE calls (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    vapi_call_id VARCHAR(100),
    provider_call_sid VARCHAR(100),
    phone_number_id UUID,
    assistant_id UUID,
    from_number VARCHAR(20) NOT NULL,
    to_number VARCHAR(20) NOT NULL,
    started_at TIMESTAMPTZ NOT NULL,
    answered_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    status VARCHAR(20) NOT NULL,
    direction VARCHAR(10) DEFAULT 'inbound',
    ended_reason VARCHAR(50),
    call_type VARCHAR(50),
    sentiment VARCHAR(20),
    summary TEXT,
    was_transferred BOOLEAN DEFAULT FALSE,
    transfer_destination VARCHAR(100),
    voicemail_left BOOLEAN DEFAULT FALSE,
    appointment_booked BOOLEAN DEFAULT FALSE,
    cost_cents INTEGER,
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

-- Call Transcripts
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

-- Call Recordings
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

-- Call Actions
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
-- SUPPORTING TABLES
-- ============================================================================

-- Contacts
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

-- Integrations
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

-- Daily Usage
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

-- Billing Events
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

-- Policies
CREATE POLICY "Users can view their organizations"
    ON organizations FOR SELECT
    USING (id = ANY(get_user_org_ids()));

CREATE POLICY "Members can view their org's assistants"
    ON assistants FOR SELECT
    USING (organization_id = ANY(get_user_org_ids()));

CREATE POLICY "Members can view their org's calls"
    ON calls FOR SELECT
    USING (organization_id = ANY(get_user_org_ids()));

CREATE POLICY "Anyone can view active templates"
    ON templates FOR SELECT
    USING (is_active = TRUE);

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

-- Increment template use count
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

-- ============================================================================
-- SEED TEMPLATES
-- ============================================================================

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

    -- General Receptionist
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

Be professional, friendly, and helpful.',
        'Thank you for calling {{business_name}}. How may I direct your call?',
        '[{"key": "business_name", "label": "Business Name", "type": "text", "required": true}, {"key": "business_description", "label": "About Your Business", "type": "textarea", "required": true}, {"key": "business_hours", "label": "Business Hours", "type": "text", "required": true}]'::jsonb,
        '["transferCall", "takeMessage"]'::jsonb,
        true
    ),
    -- Legal Intake
    (
        'legal-client-intake',
        'Client Intake',
        'Qualify potential clients and schedule consultations',
        'Screen potential clients, capture case details, and schedule consultations.',
        legal_id,
        'intake',
        '📋',
        'You are the intake receptionist for {{firm_name}}, a law firm specializing in {{practice_areas}}.

When potential clients call:
1. Greet them professionally
2. Ask what type of legal matter they need help with
3. If it falls within our practice areas, gather basic information
4. Offer to schedule a consultation

Be empathetic - people calling lawyers are often stressed.',
        'Thank you for calling {{firm_name}}. How may I assist you today?',
        '[{"key": "firm_name", "label": "Firm Name", "type": "text", "required": true}, {"key": "practice_areas", "label": "Practice Areas", "type": "text", "required": true}]'::jsonb,
        '["bookAppointment", "takeMessage"]'::jsonb,
        true
    ),
    -- Healthcare Booking
    (
        'healthcare-appointment-booking',
        'Appointment Booking',
        'Schedule and manage patient appointments',
        'Handle appointment scheduling, rescheduling, and cancellations.',
        healthcare_id,
        'scheduling',
        '📅',
        'You are the scheduling assistant for {{practice_name}}, a {{practice_type}} practice.

When patients call:
1. Ask if they are new or existing
2. Ask what type of appointment they need
3. Offer available times
4. Confirm details

Be warm and professional.',
        'Thank you for calling {{practice_name}}. How can I help you with scheduling today?',
        '[{"key": "practice_name", "label": "Practice Name", "type": "text", "required": true}, {"key": "practice_type", "label": "Practice Type", "type": "text", "required": true}]'::jsonb,
        '["bookAppointment", "takeMessage"]'::jsonb,
        true
    ),
    -- Home Services
    (
        'home-services-booking',
        'Service Booking',
        'Schedule service calls and collect job details',
        'For plumbers, electricians, HVAC, and other home service providers.',
        home_services_id,
        'scheduling',
        '🔧',
        'You are the scheduling assistant for {{business_name}}, providing {{service_types}} services.

When customers call:
1. Ask what service they need
2. Determine if it''s an emergency
3. Get their address and contact info
4. Schedule an appointment

For emergencies, transfer to dispatch at {{dispatch_phone}}.',
        'Thanks for calling {{business_name}}. How can we help you today?',
        '[{"key": "business_name", "label": "Business Name", "type": "text", "required": true}, {"key": "service_types", "label": "Service Types", "type": "text", "required": true}, {"key": "dispatch_phone", "label": "Dispatch Phone", "type": "phone", "required": true}]'::jsonb,
        '["bookAppointment", "transferCall", "takeMessage"]'::jsonb,
        true
    ),
    -- Restaurant
    (
        'restaurant-reservations',
        'Reservations',
        'Handle table reservations and inquiries',
        'Take reservations, answer questions about hours and menu.',
        restaurant_id,
        'scheduling',
        '🍽️',
        'You are the host for {{restaurant_name}}.

For reservations:
1. Ask for date and time
2. Ask how many guests
3. Get name and phone
4. Confirm details

Hours: {{hours}}
Location: {{address}}',
        'Thank you for calling {{restaurant_name}}. How may I help you?',
        '[{"key": "restaurant_name", "label": "Restaurant Name", "type": "text", "required": true}, {"key": "hours", "label": "Hours", "type": "text", "required": true}, {"key": "address", "label": "Address", "type": "text", "required": true}]'::jsonb,
        '["bookAppointment", "takeMessage"]'::jsonb,
        true
    ),
    -- Logistics Driver
    (
        'logistics-driver-hotline',
        'Driver Hotline',
        'Handle driver callouts, vehicle issues, and route problems',
        'Perfect for delivery companies.',
        logistics_id,
        'support',
        '🚚',
        'You are the AI receptionist for {{business_name}}, a delivery company.

Help drivers calling about:
- Calling out sick or late
- Vehicle breakdowns
- Route issues
- Schedule questions

For emergencies, transfer to dispatch at {{dispatch_phone}}.',
        'Hello, this is {{business_name}} driver support. How can I help you today?',
        '[{"key": "business_name", "label": "Business Name", "type": "text", "required": true}, {"key": "dispatch_phone", "label": "Dispatch Phone", "type": "phone", "required": true}]'::jsonb,
        '["transferCall", "takeMessage"]'::jsonb,
        true
    );
END $$;
