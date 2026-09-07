import { defineConfig } from "eslint/config";
import obsidianmd from "eslint-plugin-obsidianmd";

export default defineConfig([
  { ignores: ["main.js", "node_modules/**", "tests/**", "test-vault/**", "scripts/**", "esbuild.config.mjs", "version-bump.mjs"] },
  ...obsidianmd.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        projectService: { allowDefaultProject: ["eslint.config.mjs"] },
      },
    },
  },
]);
