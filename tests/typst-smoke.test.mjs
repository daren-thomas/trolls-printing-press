import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { Worker } from "node:worker_threads";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createTypstCompiler } from "typst-wasm";
import { PDFDocument } from "pdf-lib";
import { markdownToTypst } from "./helpers/converter.mjs";

const readPackageFile = async (specifier) => {
  return new Uint8Array(await fs.readFile(fileURLToPath(import.meta.resolve(specifier))));
};

test("bundled Typst stack renders publishing layouts", { timeout: 120_000 }, async (t) => {
  const workerPath = fileURLToPath(import.meta.resolve("typst-wasm/worker/worker-thread"));
  const workerSource = await fs.readFile(workerPath, "utf8");
  const workerUrl = new URL(`data:text/javascript;base64,${Buffer.from(workerSource).toString("base64")}`);
  const compiler = await createTypstCompiler({
    backend: "worker",
    packageCache: false,
    worker: () => {
      const worker = new Worker(workerUrl, { execArgv: [] });
      return {
        listen: (onMessage, onError) => {
          worker.on("message", onMessage);
          worker.on("error", onError);
        },
        postMessage: (data) => worker.postMessage(data),
        terminate: () => worker.terminate(),
      };
    },
    coreModules: {
      "engine.core.wasm": WebAssembly.compile(await readPackageFile("typst-wasm/engine/engine.core.wasm")),
      "engine.core2.wasm": WebAssembly.compile(await readPackageFile("typst-wasm/engine/engine.core2.wasm")),
      "engine.core3.wasm": WebAssembly.compile(await readPackageFile("typst-wasm/engine/engine.core3.wasm")),
    },
  });
  t.after(() => compiler.dispose());
  await compiler.addFonts(
    new Uint8Array(await fs.readFile(new URL("../src/fonts/alegreya/Alegreya.ttf", import.meta.url))),
    new Uint8Array(await fs.readFile(new URL("../src/fonts/alegreya/Alegreya-Italic.ttf", import.meta.url))),
    new Uint8Array(await fs.readFile(new URL("../src/fonts/alegreya/Alegreya-Bold.ttf", import.meta.url))),
    new Uint8Array(await fs.readFile(new URL("../src/fonts/alegreya/Alegreya-BoldItalic.ttf", import.meta.url))),
    new Uint8Array(await fs.readFile(new URL("../src/fonts/alegreya-sans/AlegreyaSans-Bold.ttf", import.meta.url))),
  );
  await compiler.addSource(
    "base.typ",
    await fs.readFile(new URL("../src/templates/base.typ", import.meta.url), "utf8"),
  );
  await compiler.addSource(
    "main.typ",
    '#import "base.typ": house-style\n#house-style()[= Printing Press\n\n- One\n- Two\n\n== Shared style]',
  );
  await compiler.setMain("main.typ");
  const result = await compiler.compile({ format: "pdf" });
  assert.equal(new TextDecoder().decode(result.output.slice(0, 5)), "%PDF-");

  const render = async (profile, markdown, columns = 1, size = "9.2pt") => {
    const template = await fs.readFile(new URL(`../src/templates/${profile}.typ`, import.meta.url), "utf8");
    const values = {
      title: "Regression fixture", subtitle: "Publishing layouts", language: "en", region: "US",
      columns: String(columns), size, body: markdownToTypst(markdown).body,
    };
    const source = template.replace(/\$(\w+)\$/g, (_, key) => values[key]);
    await compiler.addSource("main.typ", source);
    const output = await compiler.compile({ format: "pdf" }).catch((error) => {
      throw new Error(`${error.message}: ${JSON.stringify(error.diagnostics ?? error)}`, { cause: error });
    });
    return PDFDocument.load(output.output);
  };

  for (const [profile, columns] of [["session-note", 2], ["book", 1], ["book", 2], ["index-card", 2]]) {
    await t.test(`${profile} (${columns} columns) honors a page break adjacent to text`, async () => {
      const pdf = await render(profile, "Before\n✂️---\nAfter", columns);
      assert.equal(pdf.getPageCount(), 2);
    });
    await t.test(`${profile} (${columns} columns) paginates a table taller than a page`, async () => {
      const rows = Array.from({ length: 10 }, (_, index) => `| ${index} | ${"Long cell text. ".repeat(100)} |`);
      const pdf = await render(profile, `| Roll | Description |\n| --- | --- |\n${rows.join("\n")}`, columns);
      assert.ok(pdf.getPageCount() > 1, "oversized tables must flow onto additional pages");
    });
  }

  await compiler.addFile("resources/map.svg", new TextEncoder().encode(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100"><rect width="200" height="100" fill="black"/></svg>',
  ));
  await t.test("two-column books render wide pictures", async () => {
    const pdf = await render("book", "![[map.svg|wide]]\n\nPicture caption.", 2);
    assert.equal(pdf.getPageCount(), 1);
  });
  await t.test("index cards render wide pictures on one card", async () => {
    const pdf = await render("index-card", "![[map.svg|wide]]", 2);
    assert.equal(pdf.getPageCount(), 1);
  });
  for (const size of ["9.2pt", "8.8pt", "8.4pt"]) {
    await t.test(`cards compile with fitted body size ${size}`, async () => {
      const pdf = await render("index-card", "**Bold text** and ***bold italic text***.", 2, size);
      assert.equal(pdf.getPageCount(), 1);
    });
  }
});
