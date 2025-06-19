/** @type {import('prettier').Config & import('@trivago/prettier-plugin-sort-imports').PluginConfig} */
const config = {
  plugins: [
    "prettier-plugin-tailwindcss",
    "@trivago/prettier-plugin-sort-imports",
  ],
  tabWidth: 2,
  trailingComma: "all",
  singleQuote: false,
  jsxSingleQuote: false,
  semi: true,
  endOfLine: "lf",
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrder: [
    "^react",
    "^next",
    "<THIRD_PARTY_MODULES>",
    "highlight.js*",

    "@/actions/(.*)",
    "@/lib/(.*)",
    "@/utils/(.*)",

    "@/components/ui/(.*)",
    "@/components/(.*)",

    "@/.*",
    "^./(.*)",
    "^../(.*)",
    /** 样式文件单独分组，放最下面 */
    ".(css|less|scss|sass|stylus)$",
  ],
  tailwindFunctions: ["clsx", "cn", "cva", "twMerge", "twJoin"],
};

module.exports = config;
