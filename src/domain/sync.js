const keyFor = (event) => `${event.trackerId}::${event.periodKey}`;

export function dedupeByEventId(events) {
  const seen = new Set();
  const deduped = [];

  for (const event of events) {
    if (seen.has(event.eventId)) {
      continue;
    }

    seen.add(event.eventId);
    deduped.push(event);
  }

  return deduped;
}

const shouldReplace = (current, incoming) => {
  if (incoming.serverTimestamp > current.serverTimestamp) {
    return true;
  }

  if (incoming.serverTimestamp < current.serverTimestamp) {
    return false;
  }

  return incoming.eventId > current.latestEventId;
};

export function computeLatestState(events) {
  const stateByKey = new Map();

  for (const event of dedupeByEventId(events)) {
    const compositeKey = keyFor(event);
    const current = stateByKey.get(compositeKey);

    if (!current || shouldReplace(current, event)) {
      stateByKey.set(compositeKey, {
        trackerId: event.trackerId,
        periodKey: event.periodKey,
        latestEventId: event.eventId,
        value: event.value,
        serverTimestamp: event.serverTimestamp
      });
    }
  }

  return [...stateByKey.values()].sort((left, right) =>
    `${left.trackerId}:${left.periodKey}`.localeCompare(`${right.trackerId}:${right.periodKey}`)
  );
}
