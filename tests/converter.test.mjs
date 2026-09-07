import assert from "node:assert/strict";
import test from "node:test";
import { markdownToTypst } from "./helpers/converter.mjs";

test("a standalone scissors line interrupts a paragraph without blank lines", () => {
  const { body } = markdownToTypst("Before\n✂️---\nAfter");
  assert.match(body, /Before\s+#pagebreak\(weak: true\)\s+After/);
});

test("scissors markers inside code remain literal", () => {
  for (const source of ["```\n✂️---\n```", "    ✂️---", "Before `✂️---` after"]) {
    assert.doesNotMatch(markdownToTypst(source).body, /#pagebreak/);
  }
});

test("scissors inside quotes and lists do not break their containers", () => {
  for (const source of ["> ✂️---", "- ✂️---", "- Entry\n\n  ✂️---"]) {
    assert.doesNotMatch(markdownToTypst(source).body, /#pagebreak/);
  }
});

test("tables with few but lengthy rows remain free to paginate", () => {
  const source = `| Name | Description |\n| --- | --- |\n| Entry | ${"Lengthy text. ".repeat(400)} |`;
  const { body } = markdownToTypst(source);
  assert.match(body, /#table\(/);
  assert.doesNotMatch(body, /breakable: false/);
});
