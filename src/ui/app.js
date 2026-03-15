const nameInput = document.getElementById("tracker-name");
const goalInput = document.getElementById("goal");
const createButton = document.getElementById("create-tracker");

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

nameInput?.addEventListener("input", syncButtonState);
goalInput?.addEventListener("input", syncButtonState);

syncButtonState();
