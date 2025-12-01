# Design System & Brand Guidelines

## Brand Philosophy

### The Core Problem

Business owners miss calls. Every missed call is:
- A lost customer ($200-2,000 in lifetime value)
- A frustrated existing client
- A reputation hit
- Stress and guilt

They're busy running their business — driving trucks, seeing patients, fixing pipes, serving customers. They can't be glued to the phone.

### The Promise

**"Your business never sleeps. Neither does your receptionist."**

We give small business owners the same professional phone presence as Fortune 500 companies — at a fraction of the cost, set up in 5 minutes.

### Brand Personality

| Trait | Meaning | Avoid |
|-------|---------|-------|
| **Reliable** | Always there, never drops the ball | Flashy, experimental |
| **Professional** | Represents their business well | Casual, playful |
| **Effortless** | Simple to use, no learning curve | Complex, feature-heavy |
| **Confident** | We know this works | Hedging, apologetic |
| **Human-ish** | Warm but clearly AI | Pretending to be human |

### Brand Voice

**Tone:** Confident, clear, helpful. Like a smart colleague who explains things simply.

**Do:**
- "Your AI receptionist is ready"
- "Never miss another call"
- "Set up in 5 minutes"
- "Handles calls like a pro"

**Don't:**
- "Our revolutionary AI-powered solution leverages..."
- "Maybe try our receptionist?"
- "It's like magic!" (overselling)
- "Your virtual assistant bestie!" (too casual)

---

## Target Audience

### Primary: The Busy Owner

```
Demographics:
- Age: 35-55
- Running business 5-15 years
- 2-50 employees
- Revenue: $200K - $5M
- Not tech-savvy, but uses smartphone daily
- Values: Time, family, reliability, reputation

Psychographics:
- "I didn't start a business to answer phones all day"
- "I can't afford a full-time receptionist"
- "My customers deserve better than voicemail"
- "I need this to just work"

Pain points:
- Missed calls during jobs/appointments
- After-hours emergencies
- Inconsistent call handling by staff
- Can't scale without more admin help
```

### Secondary: The Operations Manager

```
Demographics:
- Age: 28-45
- Managing day-to-day ops
- Reports to owner
- More tech-comfortable

Needs:
- Dashboard to monitor calls
- Reports for the boss
- Easy training for staff
- Integration with existing tools
```

---

## Color System

### Philosophy

Colors should feel:
- **Professional** — Not a toy, not a startup gimmick
- **Trustworthy** — Banks and healthcare use these tones
- **Calm** — Reduces anxiety about AI/automation
- **Modern** — Not dated, but not trendy

### Primary Palette

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  PRIMARY BLUE                                                    │
│  ────────────                                                    │
│                                                                  │
│  ██████████  #1E3A5F  (Navy)        - Headers, primary buttons  │
│  ██████████  #2563EB  (Blue)        - Links, accents            │
│  ██████████  #3B82F6  (Light Blue)  - Hover states              │
│  ██████████  #DBEAFE  (Pale Blue)   - Backgrounds, cards        │
│                                                                  │
│  Why blue? Trust, reliability, professionalism.                 │
│  Used by: Banks, healthcare, enterprise software.               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  SECONDARY GREEN                                                 │
│  ───────────────                                                 │
│                                                                  │
│  ██████████  #059669  (Green)       - Success, active, live     │
│  ██████████  #10B981  (Light Green) - Positive indicators       │
│  ██████████  #D1FAE5  (Pale Green)  - Success backgrounds       │
│                                                                  │
│  Why green? Growth, "go", active status, money saved.           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  NEUTRALS                                                        │
│  ────────                                                        │
│                                                                  │
│  ██████████  #111827  (Gray 900)    - Headings, body text       │
│  ██████████  #374151  (Gray 700)    - Secondary text            │
│  ██████████  #6B7280  (Gray 500)    - Muted text, placeholders  │
│  ██████████  #E5E7EB  (Gray 200)    - Borders, dividers         │
│  ██████████  #F9FAFB  (Gray 50)     - Page backgrounds          │
│  ██████████  #FFFFFF  (White)       - Cards, inputs             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  SEMANTIC COLORS                                                 │
│  ───────────────                                                 │
│                                                                  │
│  ██████████  #DC2626  (Red)         - Errors, destructive       │
│  ██████████  #F59E0B  (Amber)       - Warnings, attention       │
│  ██████████  #8B5CF6  (Purple)      - Pro features, upgrade     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Color Usage

| Element | Color | Token |
|---------|-------|-------|
| Primary button | #2563EB | `primary-600` |
| Primary button hover | #1D4ED8 | `primary-700` |
| Secondary button | #FFFFFF border #E5E7EB | `white` / `gray-200` |
| Destructive button | #DC2626 | `red-600` |
| Active call indicator | #10B981 | `green-500` |
| Page background | #F9FAFB | `gray-50` |
| Card background | #FFFFFF | `white` |
| Text primary | #111827 | `gray-900` |
| Text secondary | #6B7280 | `gray-500` |
| Links | #2563EB | `primary-600` |

---

## Typography

### Philosophy

- **Readable** — Business owners skim, don't read essays
- **Professional** — Not playful, not corporate-stiff
- **Accessible** — Works for 55-year-old plumber on phone

### Font Stack

```
Primary: Inter
─────────────────────────────────────
Clean, modern, highly readable. Free from Google Fonts.
Used by: Linear, Vercel, Notion.

Fallback: system-ui, -apple-system, sans-serif

Monospace (code, phone numbers): JetBrains Mono
```

### Type Scale

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADINGS                                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  h1  48px / 1.1   Semi-bold   Hero headlines                    │
│  h2  36px / 1.2   Semi-bold   Section headers                   │
│  h3  24px / 1.3   Semi-bold   Card titles                       │
│  h4  20px / 1.4   Medium      Subsections                       │
│  h5  16px / 1.5   Medium      Small headers                     │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  BODY                                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Large   18px / 1.6   Regular   Hero descriptions               │
│  Base    16px / 1.6   Regular   Body text, UI                   │
│  Small   14px / 1.5   Regular   Secondary info, captions        │
│  XSmall  12px / 1.5   Medium    Labels, badges                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Usage Rules

| Context | Size | Weight | Color |
|---------|------|--------|-------|
| Page title | h1 (48px) | Semi-bold | gray-900 |
| Section header | h2 (36px) | Semi-bold | gray-900 |
| Card title | h3 (24px) | Semi-bold | gray-900 |
| Body text | Base (16px) | Regular | gray-700 |
| Helper text | Small (14px) | Regular | gray-500 |
| Button text | Base (16px) | Medium | varies |
| Input label | Small (14px) | Medium | gray-700 |

---

## Spacing System

### Base Unit: 4px

```
┌─────────────────────────────────────────────────────────────────┐
│  SPACING SCALE                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  0.5   2px    Minimal gaps                                      │
│  1     4px    Tight spacing (icon + text)                       │
│  2     8px    Related elements                                  │
│  3     12px   Form elements                                     │
│  4     16px   Default padding                                   │
│  5     20px   Comfortable padding                               │
│  6     24px   Card padding                                      │
│  8     32px   Section gaps                                      │
│  10    40px   Large sections                                    │
│  12    48px   Hero padding                                      │
│  16    64px   Major sections                                    │
│  20    80px   Page sections                                     │
│  24    96px   Hero sections                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Component Spacing

| Component | Padding | Gap |
|-----------|---------|-----|
| Button (sm) | 8px 12px | — |
| Button (md) | 10px 16px | — |
| Button (lg) | 12px 24px | — |
| Card | 24px | — |
| Input | 10px 14px | — |
| Form fields | — | 16px |
| Section | 64px 0 | 32px |

---

## Component Design

### Buttons

```
┌─────────────────────────────────────────────────────────────────┐
│  PRIMARY                                                         │
│  ────────                                                        │
│  ┌──────────────────────┐                                       │
│  │   Get Started        │  bg: primary-600                      │
│  └──────────────────────┘  text: white                          │
│                            hover: primary-700                   │
│                            radius: 8px                          │
│                            shadow: sm                           │
│                                                                  │
│  SECONDARY                                                       │
│  ─────────                                                       │
│  ┌──────────────────────┐                                       │
│  │   Learn More         │  bg: white                            │
│  └──────────────────────┘  text: gray-700                       │
│                            border: gray-200                     │
│                            hover: gray-50                       │
│                                                                  │
│  DESTRUCTIVE                                                     │
│  ───────────                                                     │
│  ┌──────────────────────┐                                       │
│  │   Delete             │  bg: red-600                          │
│  └──────────────────────┘  text: white                          │
│                            hover: red-700                       │
│                                                                  │
│  GHOST                                                           │
│  ─────                                                           │
│  ┌──────────────────────┐                                       │
│  │   Cancel             │  bg: transparent                      │
│  └──────────────────────┘  text: gray-600                       │
│                            hover: gray-100                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Cards

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                                                            │ │
│  │   Card Title                                    [Icon]     │ │
│  │                                                            │ │
│  │   Secondary text or description goes here.                │ │
│  │   Keep it brief and scannable.                            │ │
│  │                                                            │ │
│  │   ┌─────────────┐  ┌─────────────┐                        │ │
│  │   │  Primary    │  │  Secondary  │                        │ │
│  │   └─────────────┘  └─────────────┘                        │ │
│  │                                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  bg: white                                                      │
│  border: gray-200 (1px)                                         │
│  radius: 12px                                                   │
│  padding: 24px                                                  │
│  shadow: sm                                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Inputs

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Label                                                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Placeholder text                                          │ │
│  └────────────────────────────────────────────────────────────┘ │
│  Helper text appears here                                       │
│                                                                  │
│  STATES:                                                        │
│  Default:  border: gray-300                                     │
│  Focus:    border: primary-500, ring: primary-100 (3px)        │
│  Error:    border: red-500, ring: red-100                      │
│  Disabled: bg: gray-100, text: gray-400                        │
│                                                                  │
│  radius: 8px                                                    │
│  padding: 10px 14px                                             │
│  font-size: 16px (prevents iOS zoom)                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Status Indicators

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  CALL STATUS                                                     │
│  ───────────                                                     │
│                                                                  │
│  ● Active      #10B981 (green)   Pulsing animation             │
│  ● Completed   #6B7280 (gray)    Static                        │
│  ● Missed      #DC2626 (red)     Static                        │
│  ● Transferred #8B5CF6 (purple)  Static                        │
│                                                                  │
│  ASSISTANT STATUS                                                │
│  ────────────────                                                │
│                                                                  │
│  ● Active      #10B981 (green)   Ready to take calls           │
│  ● Paused      #F59E0B (amber)   Temporarily disabled          │
│  ● Error       #DC2626 (red)     Configuration issue           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Dashboard UX Principles

### 1. Glanceability

```
Business owners check the dashboard for 10 seconds between jobs.
They need to see instantly:

┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  "Am I missing calls?"        →  Big number: Calls today        │
│  "Anything urgent?"           →  Alert banner if issues         │
│  "Is it working?"             →  Green status indicator         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Mobile-First

```
70% of users will check on their phone.

Rules:
- Touch targets: 44px minimum
- No hover-dependent interactions
- Thumb-reachable actions
- Single-column layouts on mobile
- Large, readable stats
```

### 3. Progressive Disclosure

```
Don't overwhelm. Show basics first, details on demand.

Level 1: Call count, status, alerts
Level 2: Recent calls list
Level 3: Individual call details + transcript
Level 4: Settings, integrations, advanced
```

### 4. Confidence Builders

```
Users are trusting AI with their customers. Reassure them:

- Live call indicator with real-time transcript
- "AI handled successfully" badges
- Before/after metrics (calls answered vs missed)
- Customer satisfaction indicators
- Playback recordings easily
```

---

## Page Layouts

### Dashboard (Home)

```
┌─────────────────────────────────────────────────────────────────┐
│  Logo                              [Settings] [Profile]          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Good morning, John                                              │
│  Your AI receptionist handled 12 calls today                    │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │    12        │  │   45 min     │  │    $0        │          │
│  │  Calls       │  │  Talk time   │  │  Missed      │          │
│  │  Today       │  │  Today       │  │  Revenue     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  Recent Calls                                      [View All →] │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ ● John Smith    (503) 555-1234    2 min ago    3:24        │ │
│  │   "Scheduling a delivery pickup..."                        │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │ ● Jane Doe      (503) 555-5678    15 min ago   1:45        │ │
│  │   "Checking on package status..."                          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Assistants                                                      │
│  ┌────────────────────────┐  ┌────────────────────────┐        │
│  │ ● Driver Hotline       │  │ ● Customer Status      │        │
│  │   Active               │  │   Active               │        │
│  │   8 calls today        │  │   4 calls today        │        │
│  └────────────────────────┘  └────────────────────────┘        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Onboarding (Template Selection)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│                    What does your business do?                   │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │     🚚      │  │     ⚖️      │  │     🏥      │             │
│  │  Logistics  │  │    Legal    │  │  Healthcare │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │     🔧      │  │     🍽️      │  │     🏠      │             │
│  │   Home      │  │ Restaurant  │  │   Real      │             │
│  │  Services   │  │             │  │   Estate    │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  ✨  Something else? Build a custom assistant              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│                        Step 1 of 4  ────○───○───○               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Iconography

### Style

```
- Style: Outline (not filled)
- Stroke: 1.5px
- Size: 20px default, 24px for emphasis
- Library: Lucide Icons (free, consistent with shadcn)
```

### Core Icons

| Concept | Icon | Usage |
|---------|------|-------|
| Calls | Phone | Navigation, call lists |
| Active call | PhoneIncoming | Live indicator |
| Missed call | PhoneMissed | Status |
| Assistant | Bot | AI references |
| Settings | Settings | User settings |
| Dashboard | LayoutDashboard | Home |
| Transcript | FileText | Call details |
| Recording | Play | Playback |
| Success | CheckCircle | Confirmations |
| Error | AlertCircle | Warnings |
| Add | Plus | Create actions |

---

## Motion & Animation

### Philosophy

- **Purposeful** — Only animate to provide feedback or guide attention
- **Fast** — Users are busy, don't waste their time
- **Subtle** — This is a professional tool, not a game

### Timing

| Type | Duration | Easing |
|------|----------|--------|
| Micro (buttons, toggles) | 150ms | ease-out |
| Small (dropdowns, modals) | 200ms | ease-out |
| Medium (page transitions) | 300ms | ease-in-out |
| Large (onboarding steps) | 400ms | ease-in-out |

### Key Animations

```css
/* Button press */
.button:active {
  transform: scale(0.98);
  transition: transform 100ms ease-out;
}

/* Card hover */
.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: box-shadow 200ms ease-out;
}

/* Live call pulse */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.live-indicator {
  animation: pulse 2s ease-in-out infinite;
}

/* Success checkmark */
@keyframes checkmark {
  0% { stroke-dashoffset: 100; }
  100% { stroke-dashoffset: 0; }
}
```

---

## Accessibility

### Requirements

| Requirement | Standard | Implementation |
|-------------|----------|----------------|
| Color contrast | WCAG AA (4.5:1) | All text passes |
| Focus states | Visible | 3px ring on all interactive |
| Touch targets | 44px minimum | All buttons, links |
| Screen readers | ARIA labels | All icons, actions |
| Keyboard nav | Full support | Tab order, escape to close |
| Reduced motion | Respect preference | `prefers-reduced-motion` |

### Focus States

```css
/* Visible focus for keyboard users */
:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.3);
}
```

---

## Dark Mode (Future)

```
Not in v1, but design with it in mind:

- Use CSS variables for all colors
- Avoid pure white (#FFFFFF) — use gray-50
- Avoid pure black (#000000) — use gray-900
- Test readability at both extremes
```

---

## File Naming & Structure

```
/components
  /ui
    button.tsx
    card.tsx
    input.tsx
    ...
  /dashboard
    stats-card.tsx
    call-list.tsx
    ...
  /onboarding
    industry-selector.tsx
    template-picker.tsx
    ...

/styles
  globals.css        (Tailwind base + custom properties)
  
/lib
  cn.ts              (classnames utility)
```

---

## Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',  // Primary
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px rgba(0, 0, 0, 0.1)',
        md: '0 4px 6px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
      },
    },
  },
};
```

---

## Summary

| Aspect | Decision |
|--------|----------|
| **Personality** | Reliable, professional, effortless |
| **Primary color** | Blue (#2563EB) — trust, reliability |
| **Secondary** | Green (#10B981) — active, success |
| **Typography** | Inter — clean, readable |
| **Radius** | 8-12px — modern but not bubbly |
| **Shadows** | Subtle — professional, not playful |
| **Motion** | Fast, purposeful — respect user's time |
| **Mobile** | First priority — 70% of usage |

This system says: *"We're the reliable, professional choice. Set it up, trust it, get back to work."*
