import test from 'node:test';
import assert from 'node:assert/strict';
import { computeLatestState, dedupeByEventId } from './sync.js';

const makeEvent = (overrides = {}) => ({
  eventId: 'event-1',
  userId: 'user-1',
  trackerId: 'tracker-1',
  periodKey: '2026-03-16',
  value: { kind: 'binary', value: true },
  clientTimestamp: '2026-03-16T07:00:00.000Z',
  serverTimestamp: '2026-03-16T07:00:01.000Z',
  deviceId: 'device-1',
  ...overrides
});

test('dedupeByEventId keeps first event when duplicates are retried', () => {
  const events = [
    makeEvent({ eventId: 'e1', serverTimestamp: '2026-03-16T07:00:01.000Z' }),
    makeEvent({ eventId: 'e1', serverTimestamp: '2026-03-16T08:00:01.000Z' }),
    makeEvent({ eventId: 'e2' })
  ];

  const deduped = dedupeByEventId(events);
  assert.equal(deduped.length, 2);
  assert.equal(deduped[0].serverTimestamp, '2026-03-16T07:00:01.000Z');
});

test('computeLatestState applies last-write-wins using serverTimestamp', () => {
  const events = [
    makeEvent({ eventId: 'e1', value: { kind: 'binary', value: false } }),
    makeEvent({
      eventId: 'e2',
      value: { kind: 'binary', value: true },
      serverTimestamp: '2026-03-16T10:00:01.000Z'
    })
  ];

  const [state] = computeLatestState(events);
  assert.equal(state.latestEventId, 'e2');
  assert.deepEqual(state.value, { kind: 'binary', value: true });
});

test('computeLatestState computes independent state per period key', () => {
  const events = [
    makeEvent({ eventId: 'e1', periodKey: '2026-03-16' }),
    makeEvent({ eventId: 'e2', periodKey: '2026-03-17', value: { kind: 'binary', value: false } })
  ];

  const state = computeLatestState(events);
  assert.equal(state.length, 2);
  assert.deepEqual(
    state.map((entry) => entry.periodKey),
    ['2026-03-16', '2026-03-17']
  );
});
