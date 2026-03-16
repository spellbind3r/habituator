# MVP Specification (PWA-First)

## Scope

A personal-use daily logger with minimal-friction capture and reliable sync.

## Core user stories

1. As a user, I can create a tracker with:
   - title
   - frequency (hourly/daily/weekly/monthly/specific dates/as-needed)
   - value type (binary, keyword, list, time)
   - one or more goals
   - list options (when value type is list), provided via comma/newline separated items
2. As a user, I can quickly submit today's log value in one interaction where possible.
3. As a user, I can log while offline and sync when back online.
4. As a user, I can receive reminders and mark completion directly.
5. As a user, I can export my data in CSV/JSON.

## Data model (initial)

- `tracker`
  - `id`, `user_id`, `name`, `frequency_type`, `frequency_config_json`, `value_type`, `goals_json`, `list_items_json`, `created_at`
- `log_event` (append-only)
  - `event_id` (client UUID), `user_id`, `tracker_id`, `period_key`, `value_json`, `client_ts`, `server_ts`, `device_id`
- `reminder_rule`
  - `id`, `tracker_id`, `channel`, `time_local`, `quiet_hours_json`, `enabled`

## Conflict policy (MVP)

- For single-value trackers per period: **server-timestamp last-write-wins**
- All prior events remain in `log_event` for audit/recovery
- Duplicate `event_id` is ignored (idempotent success)

## API sketch

- `POST /auth/magic-link/request`
- `POST /auth/magic-link/verify`
- `POST /trackers`
- `GET /trackers`
- `POST /sync/events` (batch)
- `GET /timeline?from=...&to=...`
- `POST /exports` + `GET /exports/:id`

## Performance target

- First interaction on “Today” screen under 1s on warm load
- Log submission perceived latency under 150ms online (optimistic local write offline)

## Out of scope (explicit)

- Native apps
- HealthKit / Apple Health ingestion
- Causal inference claims in insights


## Notes on list-value trackers

- List items are defined during tracker setup as comma-separated and/or newline-separated text.
- Parsing trims whitespace, drops empty items, and de-duplicates values.
- Example: `Home cooked, Takeaway\nSkipped` -> `["Home cooked", "Takeaway", "Skipped"]`.
