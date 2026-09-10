import esbuild from "esbuild";
import process from "node:process";
import { builtinModules } from "node:module";
import fs from "node:fs/promises";
import path from "node:path";
import { brotliCompressSync, constants } from "node:zlib";
import { fileURLToPath } from "node:url";

const production = process.argv[2] === "production";

// Imports ending in "?raw" or "?brotli" are resolved to the import specifier
// itself rather than an absolute path, so the bundle is byte-identical no
// matter which directory it was built in.
function resolveAsset(specifier, resolveDir) {
  if (specifier.startsWith(".")) return path.resolve(resolveDir, specifier);
  return fileURLToPath(import.meta.resolve(specifier));
}

const assetPlugin = {
  name: "assets",
  setup(build) {
    build.onResolve({ filter: /\?(raw|brotli)$/ }, (args) => {
      const [specifier, kind] = args.path.split("?");
      return { path: specifier, namespace: kind, pluginData: resolveAsset(specifier, args.resolveDir) };
    });
    build.onLoad({ filter: /.*/, namespace: "raw" }, async (args) => ({
      contents: await fs.readFile(args.pluginData, "utf8"),
      loader: "text",
    }));
    build.onLoad({ filter: /.*/, namespace: "brotli" }, async (args) => {
      const data = await fs.readFile(args.pluginData);
      const params = {
        [constants.BROTLI_PARAM_QUALITY]: constants.BROTLI_MAX_QUALITY,
        [constants.BROTLI_PARAM_SIZE_HINT]: data.length,
      };
      return { contents: brotliCompressSync(data, { params }), loader: "binary" };
    });
  },
};

const context = await esbuild.context({
  entryPoints: ["src/main.ts"],
  bundle: true,
  external: ["obsidian", "electron", ...builtinModules, "node:*"],
  format: "cjs",
  target: "es2021",
  logLevel: "info",
  sourcemap: production ? false : "inline",
  treeShaking: true,
  outfile: "main.js",
  loader: { ".typ": "text" },
  plugins: [assetPlugin],
});

if (production) {
  await context.rebuild();
  await context.dispose();
} else {
  await context.watch();
}
