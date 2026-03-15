const STORAGE_KEY = "habituator.trackers.v1";

const nameInput = document.getElementById("tracker-name");
const frequencyInput = document.getElementById("frequency");
const valueTypeInput = document.getElementById("value-type");
const goalInput = document.getElementById("goal");
const createButton = document.getElementById("create-tracker");
const trackerList = document.getElementById("tracker-list");
const emptyState = document.getElementById("empty-state");

const readTrackers = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeTrackers = (trackers) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trackers));
};

let trackers = readTrackers();

const canCreateTracker = () => {
  const hasName = typeof nameInput?.value === "string" && nameInput.value.trim().length > 1;
  const hasGoal = typeof goalInput?.value === "string" && goalInput.value.trim().length > 1;
  return hasName && hasGoal;
};

const syncButtonState = () => {
  if (!createButton) {
    return;
  }

  createButton.disabled = !canCreateTracker();
};

const renderTrackers = () => {
  if (!trackerList || !emptyState) {
    return;
  }

  trackerList.innerHTML = "";

  for (const tracker of trackers) {
    const item = document.createElement("li");
    item.className = "tracker-item";
    item.textContent = `${tracker.name} — ${tracker.frequency} — ${tracker.valueType}`;
    trackerList.appendChild(item);
  }

  emptyState.hidden = trackers.length > 0;
};

const clearForm = () => {
  if (!nameInput || !goalInput || !frequencyInput || !valueTypeInput) {
    return;
  }

  nameInput.value = "";
  goalInput.value = "";
  frequencyInput.value = "daily";
  valueTypeInput.value = "binary";
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
    goal: goalInput.value.trim(),
    createdAt: new Date().toISOString()
  };

  trackers = [tracker, ...trackers];
  writeTrackers(trackers);
  renderTrackers();
  clearForm();
  syncButtonState();
};

nameInput?.addEventListener("input", syncButtonState);
goalInput?.addEventListener("input", syncButtonState);
createButton?.addEventListener("click", createTracker);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/src/ui/sw.js").catch(() => {
      // Keep app functional even if service worker registration fails.
    });
  });
}

renderTrackers();
syncButtonState();
