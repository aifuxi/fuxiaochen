/** @type {import('prettier').Config} */
const config = {
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  tabWidth: 2,
  printWidth: 80,
  importOrder: [
    '^react',
    '<THIRD_PARTY_MODULES>',
    '@/.*',
    '^./(.*)',
    '^../(.*)',
  ],
  plugins: [require('@trivago/prettier-plugin-sort-imports')],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderCaseInsensitive: true,
};

module.exports = config;
