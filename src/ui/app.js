import { parseGoals, parseListItems, periodKeyFor, requiresListItems } from "../domain/tracker-config.js";

const TRACKER_STORAGE_KEY = "habituator.trackers.v2";
const LOG_STORAGE_KEY = "habituator.log-events.v1";

const nameInput = document.getElementById("tracker-name");
const frequencyInput = document.getElementById("frequency");
const valueTypeInput = document.getElementById("value-type");
const goalsInput = document.getElementById("goals");
const listItemsInput = document.getElementById("list-items");
const listItemsGroup = document.getElementById("list-items-group");
const createButton = document.getElementById("create-tracker");
const trackerList = document.getElementById("tracker-list");
const emptyState = document.getElementById("empty-state");
const loggerList = document.getElementById("logger-list");
const loggerEmptyState = document.getElementById("logger-empty-state");
const logList = document.getElementById("log-list");
const logEmptyState = document.getElementById("log-empty-state");

const readJson = (storageKey, fallback = []) => {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (storageKey, value) => {
  localStorage.setItem(storageKey, JSON.stringify(value));
};

let trackers = readJson(TRACKER_STORAGE_KEY);
let logEvents = readJson(LOG_STORAGE_KEY);

const canCreateTracker = () => {
  const hasName = typeof nameInput?.value === "string" && nameInput.value.trim().length > 1;
  const hasGoal = parseGoals(goalsInput?.value || "").length > 0;
  const listNeeded = requiresListItems(valueTypeInput?.value);
  const hasListItems = parseListItems(listItemsInput?.value || "").length > 0;
  return hasName && hasGoal && (!listNeeded || hasListItems);
};

const syncButtonState = () => {
  if (createButton) {
    createButton.disabled = !canCreateTracker();
  }
};

const setListInputVisibility = () => {
  if (!listItemsGroup || !valueTypeInput) {
    return;
  }

  listItemsGroup.hidden = !requiresListItems(valueTypeInput.value);
};

const formatValue = (eventValue) => {
  if (eventValue.kind === "binary") {
    return eventValue.value ? "Done" : "Not done";
  }

  return String(eventValue.value);
};

const renderTrackers = () => {
  if (!trackerList || !emptyState) {
    return;
  }

  trackerList.innerHTML = "";

  for (const tracker of trackers) {
    const item = document.createElement("li");
    item.className = "tracker-item";
    item.innerHTML = `<strong>${tracker.name}</strong> · ${tracker.frequency} · ${tracker.valueType}<br/><span class="muted">Goals: ${tracker.goals.join(", ")}</span>`;
    trackerList.appendChild(item);
  }

  emptyState.hidden = trackers.length > 0;
};

const saveEvent = (tracker, value) => {
  const now = new Date();
  const event = {
    eventId: crypto.randomUUID(),
    trackerId: tracker.id,
    periodKey: periodKeyFor(tracker, now),
    value,
    clientTimestamp: now.toISOString(),
    serverTimestamp: now.toISOString()
  };

  logEvents = [event, ...logEvents].slice(0, 100);
  writeJson(LOG_STORAGE_KEY, logEvents);
  renderRecentLogs();
};

const renderLogger = () => {
  if (!loggerList || !loggerEmptyState) {
    return;
  }

  loggerList.innerHTML = "";

  for (const tracker of trackers) {
    const item = document.createElement("li");
    item.className = "tracker-item";

    const header = document.createElement("div");
    header.className = "row";
    header.innerHTML = `<strong>${tracker.name}</strong><span class="muted">${tracker.frequency}</span>`;
    item.appendChild(header);

    const controls = document.createElement("div");
    controls.className = "row";

    if (tracker.valueType === "binary") {
      const done = document.createElement("button");
      done.type = "button";
      done.textContent = "Done";
      done.addEventListener("click", () => saveEvent(tracker, { kind: "binary", value: true }));

      const notDone = document.createElement("button");
      notDone.type = "button";
      notDone.className = "secondary";
      notDone.textContent = "Not done";
      notDone.addEventListener("click", () => saveEvent(tracker, { kind: "binary", value: false }));

      controls.append(done, notDone);
    }

    if (tracker.valueType === "keyword") {
      const input = document.createElement("input");
      input.placeholder = "Keyword";
      const save = document.createElement("button");
      save.type = "button";
      save.textContent = "Save";
      save.addEventListener("click", () => {
        if (input.value.trim()) {
          saveEvent(tracker, { kind: "keyword", value: input.value.trim() });
          input.value = "";
        }
      });
      controls.append(input, save);
    }

    if (tracker.valueType === "list") {
      const select = document.createElement("select");
      for (const optionValue of tracker.listItems) {
        const option = document.createElement("option");
        option.value = optionValue;
        option.textContent = optionValue;
        select.appendChild(option);
      }

      const save = document.createElement("button");
      save.type = "button";
      save.textContent = "Save";
      save.addEventListener("click", () => {
        saveEvent(tracker, { kind: "list", value: select.value });
      });
      controls.append(select, save);
    }

    if (tracker.valueType === "time") {
      const input = document.createElement("input");
      input.type = "time";
      const save = document.createElement("button");
      save.type = "button";
      save.textContent = "Save";
      save.addEventListener("click", () => {
        if (input.value) {
          saveEvent(tracker, { kind: "time", value: input.value });
          input.value = "";
        }
      });
      controls.append(input, save);
    }

    item.appendChild(controls);
    loggerList.appendChild(item);
  }

  loggerEmptyState.hidden = trackers.length > 0;
};

const renderRecentLogs = () => {
  if (!logList || !logEmptyState) {
    return;
  }

  logList.innerHTML = "";

  for (const event of logEvents.slice(0, 10)) {
    const tracker = trackers.find((entry) => entry.id === event.trackerId);
    const item = document.createElement("li");
    item.className = "tracker-item";
    item.innerHTML = `<strong>${tracker?.name || "Unknown tracker"}</strong> · ${formatValue(event.value)}<br/><span class="muted">${event.clientTimestamp}</span>`;
    logList.appendChild(item);
  }

  logEmptyState.hidden = logEvents.length > 0;
};

const clearForm = () => {
  if (!nameInput || !goalsInput || !frequencyInput || !valueTypeInput || !listItemsInput) {
    return;
  }

  nameInput.value = "";
  goalsInput.value = "";
  frequencyInput.value = "daily";
  valueTypeInput.value = "binary";
  listItemsInput.value = "";
};

const createTracker = () => {
  if (!canCreateTracker()) {
    return;
  }

  const tracker = {
    id: crypto.randomUUID(),
    name: nameInput.value.trim(),
    frequency: frequencyInput.value,
    valueType: valueTypeInput.value,
    goals: parseGoals(goalsInput.value),
    listItems: parseListItems(listItemsInput?.value || ""),
    createdAt: new Date().toISOString()
  };

  trackers = [tracker, ...trackers];
  writeJson(TRACKER_STORAGE_KEY, trackers);
  renderTrackers();
  renderLogger();
  clearForm();
  setListInputVisibility();
  syncButtonState();
};

nameInput?.addEventListener("input", syncButtonState);
goalsInput?.addEventListener("input", syncButtonState);
listItemsInput?.addEventListener("input", syncButtonState);
valueTypeInput?.addEventListener("change", () => {
  setListInputVisibility();
  syncButtonState();
});
createButton?.addEventListener("click", createTracker);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/src/ui/sw.js").catch(() => {
      // Keep app functional even if service worker registration fails.
    });
  });
}

renderTrackers();
renderLogger();
renderRecentLogs();
setListInputVisibility();
syncButtonState();
