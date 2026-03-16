# Testing Strategy (Solo Project, Reliability-First)

This project is maintained in spare time, so tests must maximize confidence while minimizing maintenance burden.

## Goals

- Prevent regressions in core logging workflows
- Catch data-loss and sync bugs early
- Keep test suite fast enough to run frequently
- Make failures easy to understand and fix

## Test pyramid

Prefer this distribution:

- **Unit tests (~65%)**
  - Pure logic: schedule generation, due-item calculation, streak computation
  - Validation/parsing of log entries
  - Conflict resolution rules (event merge and latest-state derivation)
- **Integration tests (~25%)**
  - API + database behavior
  - Sync queue semantics (idempotency by `event_id`)
  - Reminder scheduling and deduping logic
- **End-to-end tests (~10%)**
  - Critical happy paths only:
    - create tracker
    - log value
    - offline log + later sync
    - reminder action path

## Non-negotiable scenarios

These are mandatory before adding growth features:

1. **Offline write, online sync** does not lose data
2. **Duplicate sync submission** is idempotent
3. **Conflicting writes** resolve deterministically and preserve audit trail
4. **Timezone boundaries** (day/week rollover) behave correctly
5. **Reminder suppression** after user logs item works
6. **Export** contains complete and correctly ordered data

## Suggested tooling (PWA-first)

- Unit/component: Vitest + Testing Library
- API/integration: Vitest/Jest + Testcontainers (or local ephemeral DB)
- E2E: Playwright
- Contract/schema validation: Zod (or equivalent) + contract tests
- Coverage: built-in coverage reporters with threshold gates on critical modules

## Quality gates for every PR

1. Lint + type-check
2. Unit tests
3. Integration tests (at least changed modules)
4. Critical E2E smoke tests

A change should not be merged if core logging or sync invariants are failing.

## Definition of done (feature level)

A feature is done only when:

- Behavior is documented
- Happy path and key edge cases are tested
- Telemetry/error logs are added where debugging would otherwise be hard
- Migration/backfill impact is considered (if data model changes)

## Reliability patterns to adopt early

- Append-only event table for log submissions
- Idempotency keys for sync API
- Explicit server timestamps and timezone-aware day bucketing
- Background reconciliation job to detect sync drift
- Safe reprocessing support for reminders and insight jobs

## Cadence for a solo maintainer

- Run full suite before merge
- Nightly scheduled CI for full regression + flaky test detection
- Weekly “test debt” review: remove brittle tests, add missing invariants

## Practical rule of thumb

When time is limited, test in this order:

1. Data correctness
2. Sync correctness
3. UX polish

This keeps the personal tracker trustworthy even when the product surface expands slowly.
