import eslint from "@eslint/js";
import * as parser from "@typescript-eslint/parser";
// @ts-expect-error 忽略类型错误，因为 next 库的类型定义有问题 实际有这个方法
import nextVitals from "eslint-config-next/core-web-vitals";
// @ts-expect-error 忽略类型错误，因为 next 库的类型定义有问题 实际有这个方法
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";
import checkFile from "eslint-plugin-check-file";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

import eslintPluginBetterTailwindcss from "eslint-plugin-better-tailwindcss";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        programs: [parser.createProgram("tsconfig.json")],
      },
      globals: {
        // 全局变量配置
        ...globals.browser,
        ...globals.node,
        React: "readonly",
        ReactDOM: "readonly",
      },
    },
    plugins: {
      "better-tailwindcss": eslintPluginBetterTailwindcss,
    },
    rules: {
      // @ts-expect-error 忽略类型错误
      ...eslintPluginBetterTailwindcss.configs["recommended-warn"].rules,
      // @ts-expect-error 忽略类型错误
      ...eslintPluginBetterTailwindcss.configs["recommended-error"].rules,

      // or configure rules individually
      "better-tailwindcss/enforce-consistent-line-wrapping": [
        "warn",
        { printWidth: 120 },
      ],
    },
    settings: {
      "better-tailwindcss": {
        // tailwindcss 4: the path to the entry file of the css based tailwind config (eg: `src/global.css`)
        entryPoint: "styles/global.css",
      },
    },
  },
  prettier,
  globalIgnores([
    "**/.next",
    "**/node_modules",
    "**/dist",
    "**/build",
    "**/public",
    "**/.gitignore",
    "generated/**/*",
    "**/pnpm-lock.yaml",
  ]),
  {
    rules: {
      "@typescript-eslint/no-unsafe-member-access": "warn",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "no-console": "warn",
      "@next/next/no-img-element": "off",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "after-used",
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-misused-promises": [
        2,
        {
          checksVoidReturn: {
            attributes: false,
          },
        },
      ],
      "@typescript-eslint/no-unsafe-argument": "warn",
      "@typescript-eslint/no-floating-promises": "warn",
    },
  },

  // 检查文件命名
  {
    files: [
      "app/**/*",
      "components/**/*",
      "pages/**/*",
      "styles/**/*",
      "constants/**/*",
      "utils/**/*",
      "hooks/**/*",
      "types/**/*",
      "lib/**/*",
    ],
    plugins: {
      "check-file": checkFile,
    },
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        {
          "**/*.{ts,tsx,js,jsx,cjs,mjs,mts}": "KEBAB_CASE",
        },
        {
          // 忽略中间扩展名，例如：`index.module.css` `eslint.config.mjs` `aa.bb.cc`
          ignoreMiddleExtensions: true,
        },
      ],
    },
    ignores: [
      "node_modules/*",
      "public/*",
      ".husky/*",
      ".next/*",
      ".vscode/*",
      "generated/**/*",
      "*.md",
    ],
  },
]);
