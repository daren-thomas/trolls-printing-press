import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  balanceColumns,
  displayWikilinks,
  frontmatterValue,
  headingLabel,
  isPageBreak,
  isShortList,
  paragraphSeparator,
  parseTaskText,
  prepareMarkdown,
  resolveDocumentLanguage,
  spansColumns,
} from "../src/markdown.js";

test("publishing removes YAML front matter", () => {
  const markdown = prepareMarkdown(`---
campaign: monster-und-schurken
type: session
---
## Strong Start
`);
  assert.equal(markdown, "## Strong Start\n");
});

test("publishing defaults to English and accepts a frontmatter language opt-in", () => {
  assert.deepEqual(resolveDocumentLanguage("# Goblin"), { language: "en", region: "US" });
  assert.deepEqual(resolveDocumentLanguage("---\nlanguage: de\n---\n# Goblin"), { language: "de", region: "CH" });
  assert.deepEqual(resolveDocumentLanguage("---\nlang: de-DE\n---\n# Goblin"), { language: "de", region: "DE" });
  assert.deepEqual(resolveDocumentLanguage("---\nlanguage: German\n---\n# Goblin"), { language: "de", region: "CH" });
});

test("publishing turns task markers into printable checkboxes", () => {
  assert.deepEqual(parseTaskText("[ ] A hidden door"), { checked: false, text: "A hidden door" });
  assert.deepEqual(parseTaskText("[x] The found key"), { checked: true, text: "The found key" });
  assert.equal(parseTaskText("Ordinary list item"), null);
});

test("heading wikilinks retain an internal destination", () => {
  assert.equal(
    displayWikilinks("Letzte Session: [[#Session 19 - 17.08.2026]]"),
    "Letzte Session: [Session 19 - 17.08.2026](#Session%2019%20-%2017.08.2026)",
  );
  assert.equal(displayWikilinks("[[#Session 19|zur letzten Session]]"), "[zur letzten Session](#Session%2019)");
  assert.equal(displayWikilinks("[[Another Note|display text]]"), "display text");
});

test("Obsidian embeds with spaces become valid Markdown images", () => {
  assert.equal(displayWikilinks("![[Schwert des Irixthius.png]]"), "![](Schwert%20des%20Irixthius.png)");
  assert.equal(displayWikilinks("![[Leichenkammer unter Waisenhaus.png|600]]"), "![](Leichenkammer%20unter%20Waisenhaus.png)");
});

test("heading labels are stable and insensitive to URI encoding", () => {
  assert.equal(headingLabel("Session 19 - 17.08.2026"), headingLabel("Session%2019%20-%2017.08.2026"));
  assert.match(headingLabel("Session 19 - 17.08.2026"), /^heading-[0-9a-f]{8}$/);
});

test("tight-list paragraphs do not create a paragraph gap before nested lists", () => {
  assert.equal(paragraphSeparator(true), "\n");
  assert.equal(paragraphSeparator(false), "\n\n");
});

test("the house style owns typography, headings, lists, and stat grids", async () => {
  const template = await readFile(new URL("../src/templates/base.typ", import.meta.url), "utf8");
  assert.match(template, /font: "Alegreya", size: size/);
  assert.match(template, /size: 9\.2pt,/);
  assert.match(template, /set par\(justify: true, leading: 0\.58em\)/);
  assert.match(template, /marker: \(\[•\], \[–\]\)/);
  assert.match(template, /show list: spaced-list/);
  assert.match(template, /show enum: spaced-list/);
  assert.match(template, /show list: set par\(justify: false\)/);
  assert.match(template, /#let picture\(path, wide: false\)/);
  assert.match(template, /#let flow\(columns: 1, gutter: 6mm, body\)/);
  assert.match(template, /heading\.where\(level: 1\):[\s\S]*?font: "Alegreya Sans"/);
  assert.match(template, /heading\.where\(level: 2\):[\s\S]*?fill: ink/);
  assert.match(template, /heading\.where\(level: 3\):[\s\S]*?line\(length: 100%/);
  assert.match(template, /#let ability-grid/);
  assert.match(template, /#let callout/);
  assert.match(template, /#let callout[\s\S]*?#set par\(justify: false\)/);
  assert.doesNotMatch(template, /show link:[^\r\n]*it\.body/);
});

test("all publishing templates receive document language placeholders", async () => {
  for (const name of ["session-note.typ", "index-card.typ", "book.typ"]) {
    const template = await readFile(new URL(`../src/templates/${name}`, import.meta.url), "utf8");
    assert.match(template, /#import "base\.typ": house-style[^\r\n]*callout/);
    assert.match(template, /#house-style\(language: "\$language\$", region: "\$region\$"/);
  }
});

test("session-note page furniture preserves the two-column reading area", async () => {
  const template = await readFile(new URL("../src/templates/session-note.typ", import.meta.url), "utf8");
  assert.match(template, /margin: 8mm/);
  assert.match(template, /size: 18pt[^\n]*\[\$title\$\]/);
  assert.match(template, /spacing: 1\.5mm/);
  assert.match(template, /#flow\(columns: 2, gutter: 6mm\)/);
});

test("the book prints its title, numbers pages on the outer edge, and can flow two columns", async () => {
  const template = await readFile(new URL("../src/templates/book.typ", import.meta.url), "utf8");
  assert.match(template, /#let column-count = \$columns\$/);
  assert.match(template, /size: \$size\$/);
  assert.match(template, /size: 22pt[^\n]*\[\$title\$\]/);
  assert.match(template, /calc\.odd\(physical-page\)/);
  assert.match(template, /#flow\(columns: column-count, gutter: 6mm, reading\)/);
});

test("index cards accept the body size the publisher settles on", async () => {
  const template = await readFile(new URL("../src/templates/index-card.typ", import.meta.url), "utf8");
  assert.match(template, /size: \$size\$/);
  assert.match(template, /flow\(columns: 2, gutter: 2em\)/);
});

test("a scissors rule requests a page break", () => {
  assert.equal(isPageBreak("✂️---"), true);
  assert.equal(isPageBreak("✂ ---"), true);
  assert.equal(isPageBreak("✂️ —"), true);
  assert.equal(isPageBreak("---"), false);
  assert.equal(isPageBreak("✂️ cut here"), false);
});

test("embed aliases carry a placement hint but drop pixel sizes", () => {
  assert.equal(displayWikilinks("![[map.png|wide]]"), "![wide](map.png)");
  assert.equal(displayWikilinks("![[map.png|600x400]]"), "![](map.png)");
  assert.equal(spansColumns("wide"), true);
  assert.equal(spansColumns("widescreen"), false);
  assert.equal(spansColumns(""), false);
});

test("long lists of short entries are balanced into columns", () => {
  const names = Array.from({ length: 17 }, (_, index) => `Name ${index + 1}`);
  assert.equal(isShortList(names), true);
  assert.equal(isShortList(names.slice(0, 15)), false);
  assert.equal(isShortList([...names, "A much longer entry that reads like a sentence"]), false);
  assert.deepEqual(balanceColumns([1, 2, 3, 4, 5], 2), [[1, 2, 3], [4, 5]]);
  assert.deepEqual(balanceColumns([1, 2, 3], 3), [[1], [2], [3]]);
});

test("level-one headings keep their rule close and body clear", async () => {
  const template = await readFile(new URL("../src/templates/base.typ", import.meta.url), "utf8");
  assert.match(template, /heading\.where\(level: 1\):[\s\S]*?below: 2\.2mm/);
  assert.match(template, /heading\.where\(level: 1\):[\s\S]*?spacing: 0\.8mm/);
});

test("ability grids override the generic white table header", async () => {
  const template = await readFile(new URL("../src/templates/base.typ", import.meta.url), "utf8");
  assert.match(template, /#let ability-grid[\s\S]*?#show table\.cell\.where\(y: 0\): set text\(fill: black/);
});

test("level-three headings bind their rule to the title and clear the body", async () => {
  const template = await readFile(new URL("../src/templates/base.typ", import.meta.url), "utf8");
  assert.match(template, /heading\.where\(level: 3\):[\s\S]*?below: 1\.6mm/);
  assert.match(template, /heading\.where\(level: 3\):[\s\S]*?spacing: 0\.5mm/);
});

test("frontmatter can name a book and give it a subtitle", () => {
  const source = "---\ntitle: \"The Next Session\"\nsubtitle: Random Tables for Fast Prep\nlang: en\n---\n## Start";
  assert.equal(frontmatterValue(source, "title"), "The Next Session");
  assert.equal(frontmatterValue(source, "subtitle"), "Random Tables for Fast Prep");
  assert.equal(frontmatterValue(source, "author"), null);
  assert.equal(frontmatterValue("## Start", "title"), null);
});

test("frontmatter titles follow YAML comments, quoting, and multiline syntax", () => {
  const value = (field) => frontmatterValue(`---\n${field}\n---\nBody`, "title");
  assert.equal(value("title: My Book # editorial comment"), "My Book");
  assert.equal(value('title: "Book #1"'), "Book #1");
  assert.equal(value("title: 'The Trolls'' Book'"), "The Trolls' Book");
  assert.equal(value("title: >-\n  My Book\n  of Tables"), "My Book of Tables");
  assert.equal(value("title: |-\n  My Book\n  of Tables"), "My Book\nof Tables");
  assert.equal(value("title: null"), null);
  assert.equal(value("title: [one, two]"), null);
  assert.equal(value("title: 1984"), "1984");
});
