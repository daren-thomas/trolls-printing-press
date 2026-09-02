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

test("horizontal score-and-modifier tables use the same ability grid", () => {
  const result = compactAbilityTable([
    ["STR", "DEX", "CON", "INT", "WIS", "CHA"],
    ["1 (-5)", "12 (+1)", "8 (-1)", "1 (-5)", "10 (+0)", "2 (-4)"],
  ]);
  assert.equal(result, "#ability-grid([], [STR], [DEX], [CON], [INT], [WIS], [CHA], [SCORE], [1], [12], [8], [1], [10], [2], [MOD], [-5], [+1], [-1], [-5], [+0], [-4])");
});

test("horizontal modifier-only tables use a MOD row", () => {
  const result = compactAbilityTable([
    ["STR", "DEX", "CON", "INT", "WIS", "CHA"],
    ["+2", "+1", "+1", "-4", "+0", "-3"],
  ]);
  assert.equal(result, "#ability-grid([], [STR], [DEX], [CON], [INT], [WIS], [CHA], [MOD], [+2], [+1], [+1], [-4], [+0], [-3])");
});
