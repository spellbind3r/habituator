import test from "node:test";
import assert from "node:assert/strict";
import { parseGoals, parseListItems, periodKeyFor, requiresListItems } from "./tracker-config.js";

test("parseGoals returns unique goal list from commas/newlines", () => {
  const goals = parseGoals("Improve sleep, reduce stress\nImprove sleep");
  assert.deepEqual(goals, ["Improve sleep", "reduce stress"]);
});

test("parseListItems returns unique options for list trackers", () => {
  const items = parseListItems("Home\nTakeaway, Home");
  assert.deepEqual(items, ["Home", "Takeaway"]);
});

test("requiresListItems only for list value type", () => {
  assert.equal(requiresListItems("list"), true);
  assert.equal(requiresListItems("binary"), false);
});

test("periodKeyFor uses unique occurrence key for as_needed trackers", () => {
  const key = periodKeyFor({ frequency: "as_needed" }, new Date("2026-03-16T10:00:00.000Z"));
  assert.equal(key, "occurrence:2026-03-16T10:00:00.000Z");
});
