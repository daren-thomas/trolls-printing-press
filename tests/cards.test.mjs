import assert from "node:assert/strict";
import test from "node:test";
import { splitIndexCards } from "../src/cards.js";

test("index-card sections retain their Markdown bodies", () => {
  const cards = splitIndexCards(`# Sea Horse

**Armor Class** 11

- **Charge.** Move and attack.

# Warhorse

**Armor Class** 12
`);
  assert.deepEqual(cards.map((card) => card.title), ["Sea Horse", "Warhorse"]);
  assert.match(cards[0].body, /Armor Class/);
  assert.match(cards[0].body, /Charge/);
  assert.match(cards[1].body, /Armor Class/);
});
