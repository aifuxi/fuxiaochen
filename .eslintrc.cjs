/** @type {import("eslint").Linter.Config} */
const config = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
  settings: {
    react: { version: "detect" },
    "import/resolver": {
      typescript: {},
    },
  },
  plugins: ["@typescript-eslint", "check-file"],
  extends: [
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
  ],
  rules: {
    "prettier/prettier": "error",
    // These opinionated rules are enabled in stylistic-type-checked above.
    // Feel free to reconfigure them to your own preference.
    "@typescript-eslint/array-type": "off",
    "@typescript-eslint/consistent-type-definitions": "off",
    "@typescript-eslint/prefer-nullish-coalescing": "warn",

    // 修复: 'React' must be in scope when using JSXeslint
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
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "@typescript-eslint/no-misused-promises": [
      2,
      {
        checksVoidReturn: { attributes: false },
      },
    ],
    "no-console": "error",
    "@next/next/no-img-element": "off",
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          "@/features/*/*",
          "@/types/*",
          "@/config/*",
          "@/constants/*",
          "@/providers/*",
        ],
      },
    ],
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
  ignorePatterns: [
    "node_modules",
    "dist",
    "build",
    "public",
    ".gitignore",
    "pnpm-lock.yaml",
  ],
};

module.exports = config;
