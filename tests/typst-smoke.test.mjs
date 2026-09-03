import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { Worker } from "node:worker_threads";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createTypstCompiler } from "typst-wasm";

const readPackageFile = async (specifier) => {
  return new Uint8Array(await fs.readFile(fileURLToPath(import.meta.resolve(specifier))));
};

test("bundled Typst stack can produce a PDF", { timeout: 120_000 }, async () => {
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
  await compiler.addFonts(
    new Uint8Array(await fs.readFile(new URL("../src/fonts/alegreya/Alegreya.ttf", import.meta.url))),
    new Uint8Array(await fs.readFile(new URL("../src/fonts/alegreya/Alegreya-Italic.ttf", import.meta.url))),
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
  await compiler.dispose();
});
