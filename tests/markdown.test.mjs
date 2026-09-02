import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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

test("session-note nested lists are compact and visually subordinate", async () => {
  const template = await readFile(new URL("../src/templates/session-note.typ", import.meta.url), "utf8");
  assert.match(template, /marker: \(\[•\], \[–\]\)/);
  assert.match(template, /#show list\.item: it => block\(spacing: 0\.32em, it\)/);
});

test("session notes use the bundled Alegreya type system", async () => {
  const template = await readFile(new URL("../src/templates/session-note.typ", import.meta.url), "utf8");
  assert.match(template, /lang: "de",\s+region: "CH"/);
  assert.match(template, /font: "Alegreya",\s+size: 9\.2pt/);
  assert.match(template, /#set par\(justify: true, leading: 0\.58em\)/);
  assert.match(template, /font: "Alegreya Sans"/);
});

test("session-note page furniture preserves the two-column reading area", async () => {
  const template = await readFile(new URL("../src/templates/session-note.typ", import.meta.url), "utf8");
  assert.match(template, /margin: 8mm/);
  assert.match(template, /#set list\([^\n]*indent: 0em/);
  assert.match(template, /#set enum\(indent: 0em/);
  assert.match(template, /size: 18pt[^\n]*\[\$title\$\]/);
  assert.match(template, /spacing: 1\.5mm/);
  assert.match(template, /#columns\(2, gutter: 6mm\)/);
});

test("level-one headings keep their rule close and body clear", async () => {
  const template = await readFile(new URL("../src/templates/session-note.typ", import.meta.url), "utf8");
  assert.match(template, /heading\.where\(level: 1\):[\s\S]*?below: 2\.2mm/);
  assert.match(template, /heading\.where\(level: 1\):[\s\S]*?spacing: 0\.8mm/);
});

test("session ability grids override the generic white table header", async () => {
  const template = await readFile(new URL("../src/templates/session-note.typ", import.meta.url), "utf8");
  assert.match(template, /#let ability-grid[\s\S]*?#show table\.cell\.where\(y: 0\): set text\(fill: black/);
});
