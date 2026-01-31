/** @type {import('prettier').Config & import('@trivago/prettier-plugin-sort-imports').PluginConfig} */
const config = {
  plugins: ["@trivago/prettier-plugin-sort-imports"],
  tabWidth: 2,
  trailingComma: "all",
  singleQuote: false,
  jsxSingleQuote: false,
  semi: true,
  endOfLine: "lf",
  importOrder: [
    "^react",
    "^next",
    "<THIRD_PARTY_MODULES>",
    "highlight.js*",
    "@/app/(.*)",
    "@/config",
    "@/types",
    "@/providers",
    "@/components/ui/(.*)",
    "@/components/(.*)",
    "@/libs/(.*)",
    "@/utils/(.*)",
    "@/routes/(.*)",
    "@/.*",
    "^./(.*)",
    "^../(.*)",
    /** 样式文件单独分组，放最下面 */
    ".(css|less|scss|sass|stylus)$",
  ],
};

module.exports = config;
