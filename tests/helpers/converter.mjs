import { build } from "esbuild";
import { createRequire } from "node:module";
import { runInThisContext } from "node:vm";

// Exercise the production converter without starting the browser-only compiler.
const result = await build({
  stdin: {
    contents: 'export { markdownToTypst } from "./src/publisher.ts";',
    resolveDir: process.cwd(),
  },
  bundle: true,
  write: false,
  platform: "node",
  format: "cjs",
  plugins: [{
    name: "unused-publishing-assets",
    setup(build) {
      build.onResolve({ filter: /(?:\.typ|\?raw|\?brotli)$/ }, (args) => ({
        path: args.path, namespace: "unused-asset",
      }));
      build.onLoad({ filter: /.*/, namespace: "unused-asset" }, () => ({ contents: "export default null" }));
    },
  }],
});

const module = { exports: {} };
const evaluate = runInThisContext(`(function(require, module, exports) {\n${result.outputFiles[0].text}\n})`, {
  filename: "converter-test-bundle.cjs",
});
evaluate(createRequire(import.meta.url), module, module.exports);
export const { markdownToTypst } = module.exports;
