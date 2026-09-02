import esbuild from "esbuild";
import process from "node:process";
import builtins from "builtin-modules";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

const production = process.argv[2] === "production";

const context = await esbuild.context({
  entryPoints: ["src/main.ts"],
  bundle: true,
  external: ["obsidian", "electron", ...builtins],
  format: "cjs",
  target: "es2021",
  logLevel: "info",
  sourcemap: production ? false : "inline",
  treeShaking: true,
  outfile: "main.js",
  loader: { ".typ": "text", ".wasm": "binary", ".otf": "binary" },
  plugins: [{
    name: "raw-package-import",
    setup(build) {
      build.onResolve({ filter: /\?raw$/ }, (args) => ({
        path: fileURLToPath(import.meta.resolve(args.path.slice(0, -4))),
        namespace: "raw-package-import",
      }));
      build.onLoad({ filter: /.*/, namespace: "raw-package-import" }, async (args) => ({
        contents: await fs.readFile(args.path, "utf8"),
        loader: "text",
      }));
    },
  }],
});

if (production) {
  await context.rebuild();
  await context.dispose();
} else {
  await context.watch();
}
