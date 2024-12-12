/* eslint-disable */
// @ts-nocheck
import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import checkFile from "eslint-plugin-check-file";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

const configs = [
  {
    ignores: [
      "**/node_modules",
      "**/dist",
      "**/build",
      "**/public",
      "**/.gitignore",
      "**/pnpm-lock.yaml",
    ],
  },
  ...fixupConfigRules(
    compat.extends(
      "next/core-web-vitals",
      "plugin:@typescript-eslint/recommended-type-checked",
      "plugin:@typescript-eslint/stylistic-type-checked",
      "eslint:recommended",
      "plugin:import/errors",
      "plugin:import/warnings",
      "plugin:import/typescript",
      "plugin:@typescript-eslint/recommended",
      "plugin:react/recommended",
      "plugin:prettier/recommended",
      "plugin:react-hooks/recommended",
      "plugin:tailwindcss/recommended",
    ),
  ),
  {
    plugins: {
      // @ts-ignore
      "@typescript-eslint": fixupPluginRules(typescriptEslint),
      "check-file": checkFile,
    },

    languageOptions: {
      parser: tsParser,
      ecmaVersion: 5,
      sourceType: "script",

      parserOptions: {
        project: true,
      },
    },

    settings: {
      react: {
        version: "detect",
      },

      "import/resolver": {
        typescript: {},
      },
    },

    rules: {
      "prettier/prettier": "error",
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/prefer-nullish-coalescing": "warn",
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react/prop-types": "off",

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

      "no-console": "error",
      "@next/next/no-img-element": "off",
      // "no-restricted-imports": [
      //   "error",
      //   {
      //     patterns: [
      //       "@/features/*/*",
      //       "@/types/*",
      //       "@/config/*",
      //       "@/constants/*",
      //       "@/providers/*",
      //     ],
      //   },
      // ],
      "import/default": "off",
      "import/no-named-as-default-member": "off",
      "import/no-named-as-default": "off",

      "check-file/filename-naming-convention": [
        "error",
        {
          "**/*.{ts,tsx}": "KEBAB_CASE",
        },
        {
          ignoreMiddleExtensions: true,
        },
      ],
    },
  },
];

export default configs;
