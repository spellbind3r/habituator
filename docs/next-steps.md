# What Next: Build Plan for a Solo Spare-Time Project

This document translates the strategy into an execution order you can realistically ship in evenings/weekends.

## 1) Lock technical baseline (Day 0)

Choose one stack and commit to it for 2-3 months:

- Frontend: React + Vite + TypeScript + PWA plugin
- Backend: FastAPI (or Node/Fastify) + PostgreSQL
- Jobs: simple queue (e.g., Redis-backed) for reminders
- Auth: magic-link first

Rule: avoid stack churn until Phase 2.

## 2) Build one vertical slice first (Week 1)

Ship the smallest end-to-end loop:

1. Create one tracker (`Walk dog`, daily)
2. Log done/not-done
3. See today's history
4. Works offline and syncs later

If this loop is not fast and reliable, do not build insights/reminders yet.

## 3) Define hard invariants before coding (Week 1)

Add these invariants to tests from the beginning:

- Event submissions are idempotent (`event_id` unique)
- No silent overwrite without historical event preserved
- Day-bucketing is timezone aware
- Replaying sync payloads does not corrupt current state

## 4) Add reminders after core logging is stable (Week 2)

Reminder scope:

- Web push where browser supports it
- Email fallback for unsupported cases
- Snooze and quiet-hours support
- Immediate suppression when user logs item

## 5) Add friction-reduction improvements (Week 3)

- Last-value quick action
- Autocomplete from personal history
- “Log yesterday?” recovery prompt
- Keyboard-first entry on desktop

## 6) Delay native + HealthKit intentionally (Phase 3+)

Explicitly defer:

- iOS native app
- HealthKit integration

Reason: HealthKit requires native iOS and introduces extra maintenance burden. Build it only after personal daily usage proves value.

## 7) Weekly operating rhythm for a solo maintainer

- Mon/Tue: code one small feature branch
- Mid-week: run full tests, merge if green
- Weekend: manual exploratory check + backlog grooming
- End of week: write one short changelog entry

## 8) Concrete definition of MVP done

MVP is done when all are true:

- You can define at least 5 recurring trackers
- Daily logging takes <5 seconds per item on average
- Offline logs reliably sync with no data loss
- Core tests are green and trusted
- You use it daily for 2+ weeks without avoiding it

## 9) Next feature gate (before insights)

Only begin analytics/insights after:

- At least 200 personal log events collected
- Timezone + sync tests are stable for 2 weeks
- Reminder false-positive rate is acceptably low

This gate prevents premature optimization and keeps effort focused on reliability.
