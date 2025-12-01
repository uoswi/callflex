# AI Receptionist Platform - Architecture Plan v2

## Product: CallFlex / ReceptionistAI / OpenLine (working names)

**Tagline:** "Your AI receptionist, customized for your industry"

**Model:** Industry-agnostic platform with template-based customization

**Target:** Any SMB that answers phone calls
- **Initial GTM:** Logistics (your distribution advantage)
- **Expansion:** Legal, Healthcare, Home Services, Restaurants, Real Estate, etc.

---

## Core Concept

The platform is **completely industry-agnostic**. Customization happens through:

1. **Pre-built templates** - Industry-specific, ready in 5 minutes
2. **Custom builder** - User creates from scratch with guided prompt editor
3. **Template marketplace** - Community/partner templates (future)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PLATFORM CORE                                    │
│                                                                          │
│  • Phone number provisioning    • Call handling engine                  │
│  • Billing & usage tracking     • Dashboard & analytics                 │
│  • Webhooks & integrations      • Team management                       │
│  • Recording & transcription    • Notification system                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
        ┌───────────────┬───────────┼───────────┬───────────────┐
        ▼               ▼           ▼           ▼               ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  LOGISTICS  │ │    LEGAL    │ │  HEALTHCARE │ │HOME SERVICES│ │   CUSTOM    │
│  Templates  │ │  Templates  │ │  Templates  │ │  Templates  │ │   Builder   │
├─────────────┤ ├─────────────┤ ├─────────────┤ ├─────────────┤ ├─────────────┤
│• Driver     │ │• Client     │ │• Appointment│ │• Booking    │ │• Prompt     │
│  Hotline    │ │  Intake     │ │  Booking    │ │  Requests   │ │  Editor     │
│• Customer   │ │• Scheduling │ │• Rx Refills │ │• Quote      │ │• Variables  │
│  Status     │ │• After-Hrs  │ │• After-Hrs  │ │  Requests   │ │• Functions  │
│• Recruiting │ │• Conflict   │ │• Triage     │ │• Emergency  │ │• Voice      │
│• After-Hrs  │ │  Check      │ │             │ │  Dispatch   │ │  Selection  │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

---

## Template System Deep Dive

### What is a Template?

A template is a **complete AI assistant configuration** that users can deploy in minutes:

```typescript
interface Template {
  id: string;
  slug: string;                    // "legal-client-intake"
  name: string;                    // "Client Intake for Law Firms"
  description: string;
  
  // Categorization
  industry: string;                // "legal", "healthcare", "logistics", etc.
  category: string;                // "intake", "scheduling", "support"
  tags: string[];
  
  // AI Configuration
  systemPrompt: string;            // With {{variable}} placeholders
  firstMessage: string;            // What AI says first
  voice: VoiceConfig;
  
  // Capabilities
  availableFunctions: string[];    // ["transferCall", "bookAppointment", ...]
  
  // Customization
  variables: TemplateVariable[];   // Fields user must fill in
  
  // Metadata
  estimatedSetupTime: string;      // "5 minutes"
  isPremium: boolean;              // Requires paid plan
  author: string;                  // "official" or partner ID
}

interface TemplateVariable {
  key: string;                     // "business_name"
  label: string;                   // "Business Name"
  type: "text" | "phone" | "email" | "hours" | "select" | "textarea";
  required: boolean;
  default?: string;
  placeholder?: string;
  helpText?: string;
  options?: string[];              // For select type
  validation?: string;             // Regex pattern
}
```

### Variable System

Variables let users customize templates without touching prompts:

**Template Prompt:**
```
You are the receptionist for {{business_name}}, a {{business_type}} in {{location}}.

Our business hours are {{business_hours}}.

When someone calls about {{primary_service}}, you should:
1. {{service_instruction_1}}
2. {{service_instruction_2}}

For urgent matters, transfer to {{urgent_contact_phone}}.
For scheduling, {{scheduling_instructions}}.

Always be {{tone}} and {{communication_style}}.
```

**User Configuration UI:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Configure Your Receptionist                                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Business Name *                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ Riverside Family Dental                                          │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Business Type *                        Location                         │
│  ┌──────────────────────┐              ┌────────────────────────────┐   │
│  │ Dental Practice    ▼ │              │ Portland, Oregon           │   │
│  └──────────────────────┘              └────────────────────────────┘   │
│                                                                          │
│  Business Hours *                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ Monday-Friday 8am-5pm, Saturday 9am-2pm                         │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Urgent Contact Phone *                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ (503) 555-1234                                                   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│  ℹ️ For dental emergencies outside business hours                       │
│                                                                          │
│  Tone                                   Communication Style              │
│  ┌──────────────────────┐              ┌────────────────────────────┐   │
│  │ ○ Professional       │              │ ○ Formal                   │   │
│  │ ● Warm & Friendly    │              │ ● Conversational           │   │
│  │ ○ Casual             │              │ ○ Brief & Efficient        │   │
│  └──────────────────────┘              └────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Industry Template Library

### Logistics Templates

| Template | Use Case | Key Functions |
|----------|----------|---------------|
| **Driver Hotline** | Drivers calling about callouts, vehicle issues | Log callout, notify dispatch, transfer |
| **Customer Status** | "Where's my package?" calls | Take info, schedule callback |
| **Recruiting Line** | Job applicant screening | Screen questions, capture info, schedule interview |
| **Dispatch After-Hours** | Emergency calls outside hours | Triage, transfer to on-call, take message |

### Legal Templates

| Template | Use Case | Key Functions |
|----------|----------|---------------|
| **Client Intake** | New potential clients calling | Qualify lead, capture case info, schedule consult |
| **Scheduling** | Existing client appointments | Check calendar, book/reschedule |
| **After-Hours Legal** | Urgent legal matters | Triage urgency, transfer if needed, take message |
| **Conflict Check** | Check for conflicts before intake | Ask parties involved, flag for review |

### Healthcare Templates

| Template | Use Case | Key Functions |
|----------|----------|---------------|
| **Appointment Booking** | Schedule/reschedule visits | Check availability, book, send confirmation |
| **Prescription Refills** | Refill requests | Collect Rx info, patient info, route to pharmacy |
| **Medical Triage** | Determine urgency | Ask symptoms, route appropriately, emergency escalation |
| **After-Hours Medical** | Off-hours calls | Triage, nurse line transfer, take message |

### Home Services Templates

| Template | Use Case | Key Functions |
|----------|----------|---------------|
| **Service Booking** | Schedule service calls | Capture issue, check availability, book |
| **Quote Requests** | Estimate requests | Gather project details, schedule estimate visit |
| **Emergency Dispatch** | Urgent service calls | Assess emergency, dispatch or schedule, take info |
| **Follow-Up Scheduling** | Post-service follow-ups | Schedule follow-up, collect feedback |

### Restaurant Templates

| Template | Use Case | Key Functions |
|----------|----------|---------------|
| **Reservations** | Table bookings | Check availability, party size, book, confirm |
| **Takeout Orders** | Phone orders | Take order, collect payment, give time estimate |
| **Hours & Info** | General inquiries | Answer FAQs, hours, location, menu questions |
| **Event Inquiries** | Private events, catering | Capture event details, schedule callback |

### Real Estate Templates

| Template | Use Case | Key Functions |
|----------|----------|---------------|
| **Property Inquiries** | Questions about listings | Capture interest, schedule showing |
| **Buyer Qualification** | Screen potential buyers | Pre-qualify, capture criteria |
| **Seller Intake** | Homeowners wanting to sell | Capture property info, schedule evaluation |
| **Showing Scheduling** | Book property viewings | Check agent availability, book, confirm |

### General Templates

| Template | Use Case | Key Functions |
|----------|----------|---------------|
| **Basic Receptionist** | Answer calls professionally | Take messages, transfer, basic FAQs |
| **Message Taking** | Simple voicemail alternative | Capture caller info, message, deliver |
| **Call Screening** | Filter calls | Qualify callers, route appropriately |
| **Appointment Booking** | Generic scheduling | Calendar integration, book, confirm |

---

## Custom Assistant Builder

For users who need full control:

### Builder UI Flow

```
Step 1: Basic Info
┌─────────────────────────────────────────────────────────────────────────┐
│  What should your receptionist be called?                                │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ Lisa - Front Desk                                                │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  What industry are you in? (helps us suggest best practices)            │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ ○ Logistics    ○ Legal       ○ Healthcare    ○ Home Services     │   │
│  │ ○ Restaurant   ○ Real Estate ○ Retail        ● Other             │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘

Step 2: Greeting & Personality
┌─────────────────────────────────────────────────────────────────────────┐
│  What should your receptionist say when answering?                       │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ Thank you for calling Acme Corp, this is Lisa. How can I help   │    │
│  │ you today?                                                       │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Personality                                                             │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Professional but warm. Patient with callers. Speaks clearly.    │   │
│  │ Uses caller's name when possible.                                │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘

Step 3: Instructions
┌─────────────────────────────────────────────────────────────────────────┐
│  What are the main things your receptionist should do?                   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ Main tasks:                                                      │    │
│  │ 1. Answer questions about our products and services              │    │
│  │ 2. Schedule demo calls with our sales team                       │    │
│  │ 3. Take messages for specific team members                       │    │
│  │ 4. Transfer urgent calls to the on-call person                   │    │
│  │                                                                   │    │
│  │ Important info:                                                   │    │
│  │ - Our main product is project management software                │    │
│  │ - Pricing starts at $29/month                                    │    │
│  │ - We offer a 14-day free trial                                   │    │
│  │ - Support hours are 9am-6pm Eastern                              │    │
│  │                                                                   │    │
│  │ If someone asks about enterprise pricing, take their info and   │    │
│  │ schedule a call with sales.                                       │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  💡 Tip: Be specific! The more detail you give, the better your        │
│     receptionist will perform.                                          │
└─────────────────────────────────────────────────────────────────────────┘

Step 4: Capabilities
┌─────────────────────────────────────────────────────────────────────────┐
│  What should your receptionist be able to do?                            │
│                                                                          │
│  ☑ Transfer calls                                                        │
│    └─ Destinations:                                                      │
│       [+ Add transfer destination]                                       │
│       ┌────────────────┬─────────────────┬──────────────────┐           │
│       │ Name           │ Phone           │ When to transfer │           │
│       ├────────────────┼─────────────────┼──────────────────┤           │
│       │ Sales          │ (555) 123-4567  │ Demo requests    │           │
│       │ Support        │ (555) 123-4568  │ Technical issues │           │
│       │ Emergency      │ (555) 123-4569  │ Urgent matters   │           │
│       └────────────────┴─────────────────┴──────────────────┘           │
│                                                                          │
│  ☑ Take messages                                                         │
│    └─ Notify via: ☑ SMS  ☑ Email  ☐ Slack                              │
│                                                                          │
│  ☑ Book appointments                                                     │
│    └─ Calendar: [Connect Google Calendar]                               │
│                                                                          │
│  ☐ Collect payments                                                      │
│  ☐ Custom function (advanced)                                            │
└─────────────────────────────────────────────────────────────────────────┘

Step 5: Voice & Test
┌─────────────────────────────────────────────────────────────────────────┐
│  Choose a voice for your receptionist                                    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ ○ Sarah - Professional Female    [▶ Preview]                    │    │
│  │ ● Emily - Warm Female            [▶ Preview]                    │    │
│  │ ○ Michael - Professional Male    [▶ Preview]                    │    │
│  │ ○ James - Friendly Male          [▶ Preview]                    │    │
│  │ ○ Sofia - Bilingual (EN/ES)      [▶ Preview]                    │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Ready to test?                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                                                                  │    │
│  │  📞  Call (555) 987-6543 to test your receptionist              │    │
│  │                                                                  │    │
│  │      Or enter your phone and we'll call you:                    │    │
│  │      ┌──────────────────────┐  [Call Me]                        │    │
│  │      │ (555) 111-2222       │                                   │    │
│  │      └──────────────────────┘                                   │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Onboarding Flow (Updated)

### Step 1: Industry Selection

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│  What industry is your business in?                                      │
│                                                                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │     🚚      │ │     ⚖️      │ │     🏥      │ │     🔧      │       │
│  │  Logistics  │ │    Legal    │ │ Healthcare  │ │Home Services│       │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘       │
│                                                                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │     🍽️      │ │     🏠      │ │     🏪      │ │     ✨      │       │
│  │ Restaurant  │ │ Real Estate │ │   Retail    │ │    Other    │       │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘       │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  🛠️  I want to build a custom receptionist from scratch         │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Step 2: Template Selection (if industry chosen)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│  ⚖️ Legal Templates                                                      │
│                                                                          │
│  Choose one to start (you can add more later)                           │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ 📋 Client Intake                                     [Popular]   │    │
│  │                                                                  │    │
│  │ Qualify potential clients, capture case details, and schedule   │    │
│  │ consultations. Perfect for solo practitioners and small firms.  │    │
│  │                                                                  │    │
│  │ Setup time: ~5 min     Functions: Qualify, Schedule, Message    │    │
│  │                                                    [Select →]    │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ 📅 Appointment Scheduling                                        │    │
│  │                                                                  │    │
│  │ Handle scheduling calls for existing clients. Integrates with   │    │
│  │ your calendar to book and reschedule appointments.              │    │
│  │                                                                  │    │
│  │ Setup time: ~3 min     Functions: Check calendar, Book, Confirm │    │
│  │                                                    [Select →]    │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ 🌙 After-Hours                                                   │    │
│  │                                                                  │    │
│  │ Answer calls outside business hours. Takes messages, handles    │    │
│  │ urgent matters, and sets expectations for callbacks.            │    │
│  │                                                                  │    │
│  │ Setup time: ~3 min     Functions: Message, Triage, Transfer     │    │
│  │                                                    [Select →]    │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  ➕  Create custom for Legal                                     │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Step 3: Configure Template

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│  Configure: Client Intake for Law Firms                                  │
│  ══════════════════════════════════════                                  │
│                                                                          │
│  Business Details                                                        │
│  ─────────────────                                                       │
│                                                                          │
│  Firm Name *                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ Johnson & Associates                                             │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Practice Areas * (select all that apply)                               │
│  ☑ Personal Injury    ☐ Criminal Defense    ☑ Family Law               │
│  ☐ Estate Planning    ☑ Employment          ☐ Real Estate              │
│  ☐ Business Law       ☐ Immigration         ☐ Other: ________          │
│                                                                          │
│  Intake Questions                                                        │
│  ─────────────────                                                       │
│                                                                          │
│  What should the AI ask potential clients? (we'll ask these in order)   │
│                                                                          │
│  1. ┌───────────────────────────────────────────────────────────────┐   │
│     │ What type of legal matter do you need help with?              │   │
│     └───────────────────────────────────────────────────────────────┘   │
│  2. ┌───────────────────────────────────────────────────────────────┐   │
│     │ When did this issue occur?                                    │   │
│     └───────────────────────────────────────────────────────────────┘   │
│  3. ┌───────────────────────────────────────────────────────────────┐   │
│     │ Have you spoken with any other attorneys about this?         │   │
│     └───────────────────────────────────────────────────────────────┘   │
│  [+ Add question]                                                        │
│                                                                          │
│  Consultation Scheduling                                                 │
│  ────────────────────────                                               │
│                                                                          │
│  Consultation type: ○ Free  ● Paid ($___150___)                        │
│  Duration: [30 min ▼]                                                   │
│  Calendar: [Connect Google Calendar]                                    │
│                                                                          │
│  [Back]                                            [Continue →]          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema Updates

The template system requires these additions:

```sql
-- Enhanced templates table
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identity
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Categorization
    industry VARCHAR(50) NOT NULL,           -- 'logistics', 'legal', 'healthcare', etc.
    category VARCHAR(50),                     -- 'intake', 'scheduling', 'support'
    tags TEXT[] DEFAULT '{}',
    icon VARCHAR(50),
    
    -- Configuration
    system_prompt TEXT NOT NULL,
    first_message TEXT,
    voice_provider VARCHAR(20) DEFAULT '11labs',
    voice_id VARCHAR(100),
    
    -- Variables schema
    variables JSONB DEFAULT '[]',
    /*
    [
        {
            "key": "business_name",
            "label": "Business Name",
            "type": "text",
            "required": true,
            "placeholder": "Acme Corp",
            "helpText": "Your company name as you want it spoken"
        },
        {
            "key": "practice_areas",
            "label": "Practice Areas",
            "type": "multiselect",
            "required": true,
            "options": ["Personal Injury", "Family Law", "Criminal Defense", ...]
        }
    ]
    */
    
    -- Functions
    available_functions JSONB DEFAULT '[]',
    default_function_config JSONB DEFAULT '{}',
    
    -- Metadata
    estimated_setup_minutes INTEGER DEFAULT 5,
    is_premium BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    author_type VARCHAR(20) DEFAULT 'official',  -- 'official', 'partner', 'community'
    author_id UUID,
    
    -- Stats
    use_count INTEGER DEFAULT 0,
    rating_average DECIMAL(2,1),
    rating_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for browsing
CREATE INDEX idx_templates_industry ON templates(industry, is_active);
CREATE INDEX idx_templates_featured ON templates(is_featured, industry) WHERE is_active = TRUE;

-- User's custom assistants (from templates or scratch)
CREATE TABLE assistants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Source
    template_id UUID REFERENCES templates(id),  -- NULL if custom built
    
    -- Configuration
    name VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- AI Config (can override template)
    system_prompt TEXT NOT NULL,
    first_message TEXT,
    voice_provider VARCHAR(20) DEFAULT '11labs',
    voice_id VARCHAR(100),
    
    -- Variable values (if from template)
    variable_values JSONB DEFAULT '{}',
    
    -- Functions enabled
    enabled_functions JSONB DEFAULT '[]',
    function_config JSONB DEFAULT '{}',
    /*
    {
        "transferCall": {
            "destinations": {
                "sales": "+15551234567",
                "support": "+15551234568"
            }
        },
        "bookAppointment": {
            "calendarId": "primary",
            "duration": 30
        }
    }
    */
    
    -- VAPI sync
    vapi_assistant_id VARCHAR(100),
    vapi_synced_at TIMESTAMPTZ,
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft',  -- 'draft', 'active', 'paused'
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Pricing (Updated)

Same tiers, but framed for any industry:

| Plan | Price | Minutes | Numbers | Templates | Features |
|------|-------|---------|---------|-----------|----------|
| **Starter** | $29/mo | 100 | 1 | 1 active | Email notifications |
| **Pro** | $79/mo | 500 | 3 | Unlimited | SMS, Zapier, Custom prompts |
| **Business** | $199/mo | 2,000 | 10 | Unlimited | API, Priority support, Analytics |
| **Enterprise** | Custom | Unlimited | Unlimited | Unlimited | White-label, SLA, Dedicated CSM |

---

## Landing Page Strategy

**Main landing page:** Generic, showcases all industries

**Industry landing pages:** SEO-optimized pages for each vertical
- `/legal` - AI Receptionist for Law Firms
- `/healthcare` - AI Receptionist for Medical Practices  
- `/logistics` - AI Receptionist for Delivery Companies
- `/home-services` - AI Receptionist for Contractors
- `/restaurants` - AI Receptionist for Restaurants

Each industry page:
- Industry-specific headlines and copy
- Relevant templates showcased
- Testimonials from that industry
- Industry-specific objection handling

---

## GTM Strategy (Updated)

**Phase 1: Logistics Launch (Weeks 1-4)**
- Your existing distribution
- 4 logistics templates
- Prove the model works

**Phase 2: Legal Expansion (Weeks 5-8)**
- Legal templates (high value vertical)
- Target solo attorneys, small firms
- Partner with legal tech influencers
- Integrate with Clio, MyCase

**Phase 3: Healthcare + Home Services (Weeks 9-12)**
- Two high-volume verticals
- Healthcare: dentists, vets, clinics
- Home Services: plumbers, HVAC, electricians
- Local SEO play

**Phase 4: Marketplace (Month 4+)**
- Open template creation to partners
- Revenue share model
- Community templates
- API for custom integrations

---

## Key Differences from v1

| Aspect | v1 (Logistics Only) | v2 (Platform) |
|--------|---------------------|---------------|
| Target market | DSPs, ISPs only | Any SMB |
| Templates | 4 logistics | 20+ across industries |
| Customization | Limited | Full custom builder |
| Pricing | Logistics-focused | Industry-agnostic |
| GTM | Single vertical | Multi-vertical expansion |
| Defensibility | Distribution only | Network effects + marketplace |
| TAM | ~50,000 businesses | Millions |

This gives you a much larger opportunity while still leveraging your logistics advantage for initial traction.
