const splitTokens = (input) =>
  input
    .split(/[\n,]/g)
    .map((token) => token.trim())
    .filter(Boolean);

export const parseGoals = (input) => [...new Set(splitTokens(input))];

export const parseListItems = (input) => [...new Set(splitTokens(input))];

export const requiresListItems = (valueType) => valueType === "list";

export const periodKeyFor = (tracker, at = new Date()) => {
  if (tracker.frequency === "as_needed") {
    return `occurrence:${at.toISOString()}`;
  }

  return at.toISOString().slice(0, 10);
};
