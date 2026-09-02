import assert from "node:assert/strict";
import test from "node:test";
import { paragraphSeparator, parseTaskText, prepareMarkdown } from "../src/markdown.js";

test("publishing removes YAML front matter", () => {
  const markdown = prepareMarkdown(`---
campaign: monster-und-schurken
type: session
---
## Strong Start
`);
  assert.equal(markdown, "## Strong Start\n");
});

test("publishing turns task markers into printable checkboxes", () => {
  assert.deepEqual(parseTaskText("[ ] A hidden door"), { checked: false, text: "A hidden door" });
  assert.deepEqual(parseTaskText("[x] The found key"), { checked: true, text: "The found key" });
  assert.equal(parseTaskText("Ordinary list item"), null);
});

test("tight-list paragraphs do not create a paragraph gap before nested lists", () => {
  assert.equal(paragraphSeparator(true), "\n");
  assert.equal(paragraphSeparator(false), "\n\n");
});
