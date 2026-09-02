import assert from "node:assert/strict";
import test from "node:test";
import { compactAbilityTable } from "../src/tables.js";

test("vertical ability tables pivot into the compact stat grid", () => {
  const result = compactAbilityTable([
    ["STAT", "SCORE", "MOD", "SAVE"],
    ["STR", "21", "+5", "+5"],
    ["DEX", "8", "-1", "-1"],
    ["CON", "17", "+3", "+3"],
    ["INT", "6", "-2", "-2"],
    ["WIS", "10", "+0", "+0"],
    ["CHA", "8", "-1", "-1"],
  ]);
  assert.equal(result, "#ability-grid([], [STR], [DEX], [CON], [INT], [WIS], [CHA], [SCORE], [21], [8], [17], [6], [10], [8], [MOD], [+5], [-1], [+3], [-2], [+0], [-1], [SAVE], [+5], [-1], [+3], [-2], [+0], [-1])");
});

test("ordinary tables are not rewritten as ability grids", () => {
  assert.equal(compactAbilityTable([["Name", "Value"], ["AC", "12"]]), null);
});
