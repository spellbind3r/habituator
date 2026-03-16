# Habituator

Habituator is a **personal daily logger** built as a spare-time hobby project. The focus is:

1. **Low friction logging** (fast enough to use every day)
2. **Reliable data capture** (offline-first sync, explicit conflict behavior)
3. **Testing from day one** (so changes stay safe as the project evolves)

## Product direction (solo-first)

This project is intentionally scoped to be useful for one person first, then expandable later.

### Phase 1 — PWA-only personal MVP

- Installable PWA (mobile + desktop browser)
- Simple log template creation:
  - What to log
  - Frequency: hourly/daily/weekly/monthly/specific dates/whenever-occurs
  - One or more goals/motivations
- Log value types:
  - done/not done
  - short keyword (with autocomplete from your own history)
  - select from list (specified as comma/newline-separated items at tracker setup)
  - time value
- Reminder channels:
  - web notifications (where available)
  - email fallback
- Auth (friction-minimizing): magic link first, passkeys later
- Local-first logging with background sync

### Phase 2 — hardening + retention

- Streaks, nudges, missed-log recovery prompts
- Export (CSV/JSON)
- Better analytics around completion patterns
- Multi-device sync hardening and conflict visibility

### Phase 3+ — native extension (only if needed)

- Native mobile app for platform-specific integrations
- Apple Health / HealthKit integration (**native iOS only**)
- Advanced background notification reliability

## Architecture principles

- **Keep it boring**: prioritize maintainability over novelty
- **Event-first logging**: append-only events to preserve history
- **Deterministic conflict policy**: default to server-side last-write-wins, keep prior events
- **Privacy-aware by default**: explicit consent for external data integrations


## Current implementation status

Initial implementation now exists with:

- A PWA-capable web scaffold with manifest + service worker (`index.html`, `public/*`, `src/ui/*`)
- Functional tracker creation flow persisted in localStorage with on-screen tracker list
- Supports unscheduled “whenever it occurs” trackers and multiple goals per tracker
- Includes a “Log now” module and recent event timeline for quick local capture
- Domain sync logic for idempotent event dedupe and server-timestamp last-write-wins
- Node test coverage for core sync invariants

## Local development

```bash
npm test
npm run start  # local dev server on :4173
```

Then open <http://localhost:4173>.

## Immediate implementation docs

- Execution plan: [`docs/next-steps.md`](docs/next-steps.md)
- MVP feature/data/API contract: [`docs/mvp-spec.md`](docs/mvp-spec.md)
- Testing strategy: [`docs/testing-strategy.md`](docs/testing-strategy.md)

## Initial success criteria (personal use)

- Median logging interaction is under ~5 seconds
- Logging remains usable offline and syncs safely later
- No silent data loss during sync conflicts
- Weekly confidence to refactor without fear due to automated tests
