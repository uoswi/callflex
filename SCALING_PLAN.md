# Scaling Plan — Phased Infrastructure

> **Note:** Revisit after Stage 1 or 2 launch. Start simple, add complexity only when needed.

---

## Pricing Tiers (Reference)

| Tier | Price | Minutes | Calls/Mo |
|------|-------|---------|----------|
| Starter | $29 | 100 | ~33 |
| Pro | $79 | 500 | ~167 |
| Business | $199 | 2,000 | ~667 |

---

## Scale Milestones

| Milestone | Customers | Calls/Mo | DB Size/Year |
|-----------|-----------|----------|--------------|
| Launch | 50 | 5K | 180MB |
| Traction | 500 | 80K | 3GB |
| Scale | 5,000 | 800K | 30GB |

---

## Phase 1: Launch (0-500 customers)

**Keep it simple. Don't over-engineer.**

| Component | Decision | Why |
|-----------|----------|-----|
| VAPI function data | Preload to VAPI | Zero latency, no infrastructure |
| Call partitioning | **Yes, from day 1** | Only hard thing to add later |
| Real-time updates | Supabase Realtime | Free, included |
| Usage tracking | Postgres column | Simple UPDATE |
| Transcripts | Separate table | Clean separation |
| Full-text search | Skip | Add when customers ask |
| Redis | Skip | Supabase is fast enough |
| Temporal | Skip | Overkill for now |

**Monthly cost: $25** (Supabase Pro)

```
Architecture:

VAPI ──► Hono API ──► Supabase Postgres
                          │
                          ├── organizations (minutes_used column)
                          ├── calls (PARTITIONED by month)
                          ├── call_transcripts
                          └── Realtime (websockets)
```

---

## Phase 2: Traction (500-2,000 customers)

**Add caching and background jobs when latency matters.**

| Component | Decision | Why |
|-----------|----------|-----|
| VAPI function data | Redis cache | 50+ concurrent calls |
| Call partitioning | Monthly (already done) | — |
| Real-time updates | Supabase Realtime | Still fine |
| Usage tracking | Redis counter | Atomic, no row locks |
| Transcripts | Add GIN index | Customers want search |
| Full-text search | Postgres GIN | Good enough |
| Redis | Add Upstash | Caching + counters |
| Temporal | Add now | Reliable webhooks matter |

**Monthly cost: ~$60**
- Supabase Pro: $25
- Upstash Redis: $10
- Temporal Cloud: $25

```
Architecture:

VAPI ──► Hono API ──┬──► Redis (cache + counters)
                    │
                    └──► Temporal Cloud
                              │
                              ▼
                         Supabase Postgres
                              │
                              ├── calls (partitioned)
                              ├── call_transcripts (GIN index)
                              └── daily_usage (pre-aggregated)
```

---

## Phase 3: Scale (2,000+ customers)

**Optimize for cost efficiency and reliability.**

| Component | Decision | Why |
|-----------|----------|-----|
| VAPI function data | Redis + preload hybrid | Belt and suspenders |
| Call partitioning | Monthly + archival | Cold storage for old data |
| Real-time updates | Redis Pub/Sub | Lower latency |
| Usage tracking | Redis + hourly Stripe sync | Stripe as source of truth |
| Transcripts | Hybrid: summary in DB, full in Storage | Cost control |
| Full-text search | Consider Typesense | Postgres GIN slows at scale |
| Read replica | Add one | Separate read/write traffic |

**Monthly cost: ~$230**
- Supabase Team: $100
- Upstash Redis Pro: $30
- Temporal Cloud: $100

---

## Migration Complexity

| Change | Difficulty | Downtime | When to Do |
|--------|------------|----------|------------|
| Add Redis cache | Easy | None | Dashboard feels slow |
| Add Temporal | Easy | None | Webhooks failing |
| Add GIN index | Easy | None | Search requested |
| Add read replica | Easy | None | Write contention |
| Partition calls table | **Hard** | Yes | **DO FROM DAY 1** |
| Move transcripts to Storage | Medium | None | Storage costs high |

---

## Critical Day-1 Decision

**Partition the calls table from the start:**

```sql
CREATE TABLE calls (
    id UUID NOT NULL,
    organization_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- ... other columns
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Create first partition
CREATE TABLE calls_2025_01 PARTITION OF calls 
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

Everything else can be added later with zero pain.

---

## Cost Progression

| Phase | Supabase | Redis | Temporal | Total |
|-------|----------|-------|----------|-------|
| Launch | $25 | $0 | $0 | **$25** |
| Traction | $25 | $10 | $25 | **$60** |
| Scale | $100 | $30 | $100 | **$230** |

---

## When to Move to Next Phase

### Phase 1 → Phase 2

Triggers:
- [ ] Dashboard queries >200ms
- [ ] VAPI function calls timing out
- [ ] Webhook delivery failures >1%
- [ ] 50+ concurrent calls regularly
- [ ] Customers requesting transcript search

### Phase 2 → Phase 3

Triggers:
- [ ] Supabase connection limits hitting
- [ ] Redis memory >256MB
- [ ] Transcript storage >10GB
- [ ] Need live transcript streaming
- [ ] 1M+ calls in database

---

## Summary

1. **Day 1:** Partition calls table, keep everything else simple
2. **Add Redis:** When caching needed (~$10/mo)
3. **Add Temporal:** When background reliability needed (~$25/mo)
4. **Add search:** When customers ask (free, just index)
5. **Add read replica:** When write contention appears (~$75/mo)

Don't optimize prematurely. Add infrastructure when you feel the pain.
