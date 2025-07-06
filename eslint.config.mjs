import { includeIgnoreFile } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import eslintPluginCheckFile from "eslint-plugin-check-file";
import eslintPluginPrettier from "eslint-plugin-prettier";
import { defineConfig } from "eslint/config";
import { fileURLToPath } from "node:url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const gitignorePath = fileURLToPath(new URL(".gitignore", import.meta.url));
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default defineConfig([
  // 来自.gitignore文件的忽略规则，.gitignore中忽略的文件或文件夹，eslint也忽略
  includeIgnoreFile(gitignorePath),

  // next 官方推荐的规则
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  {
    plugins: {
      eslintPluginCheckFile,
      eslintPluginPrettier,
    },
  },

  {
    settings: {
      "import-x/resolver-next": [
        createTypeScriptImportResolver({
          alwaysTryTypes: true, // Always try to resolve types under `<root>@types` directory even if it doesn't contain any source code, like `@types/unist`

          bun: true, // Resolve Bun modules (https://github.com/import-js/eslint-import-resolver-typescript#bun)

          // Choose from one of the "project" configs below or omit to use <root>/tsconfig.json or <root>/jsconfig.json by default

          // Use <root>/path/to/folder/tsconfig.json or <root>/path/to/folder/jsconfig.json
          project: "tsconfig.json",
        }),
      ],
    },
  },
]);
