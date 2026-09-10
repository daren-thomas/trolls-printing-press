import { defineConfig } from "eslint/config";
import obsidianmd from "eslint-plugin-obsidianmd";
import tseslint from "typescript-eslint";

export default defineConfig([
  { ignores: ["main.js", "node_modules/**", "tests/**", "test-vault/**", "scripts/**", "esbuild.config.mjs", "version-bump.mjs"] },
  ...obsidianmd.configs.recommended,
  {
    files: ["src/**/*.{ts,js}"],
    plugins: { "@typescript-eslint": tseslint.plugin },
    languageOptions: {
      parserOptions: {
        projectService: { allowDefaultProject: ["eslint.config.mjs"] },
      },
    },
    // The community-directory review runs these type-aware checks; keep them local too.
    rules: {
      "@typescript-eslint/no-unsafe-argument": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-return": "error",
    },
  },
]);
