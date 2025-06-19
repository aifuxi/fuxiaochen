import { includeIgnoreFile } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
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
]);
