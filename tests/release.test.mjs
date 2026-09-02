import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

test("manifest and package versions agree", () => {
  const manifest = JSON.parse(fs.readFileSync("manifest.json", "utf8"));
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
  const versions = JSON.parse(fs.readFileSync("versions.json", "utf8"));
  assert.equal(manifest.version, packageJson.version);
  assert.equal(versions[manifest.version], manifest.minAppVersion);
  assert.equal(manifest.id, "trolls-printing-press");
  assert.equal(manifest.isDesktopOnly, true);
});

test("production bundle contains every publishing profile", { skip: !fs.existsSync("main.js") }, () => {
  const bundle = fs.readFileSync("main.js", "utf8");
  for (const marker of [
    "Publish active note as booklet",
    "A6 landscape monster cards",
    "Libertinus Serif",
    "No cards found",
  ]) {
    assert.match(bundle, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("production bundle does not use Node worker threads", { skip: !fs.existsSync("main.js") }, () => {
  const bundle = fs.readFileSync("main.js", "utf8");
  assert.doesNotMatch(bundle, /node:worker_threads/);
});
