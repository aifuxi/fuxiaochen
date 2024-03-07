/** @type {import('prettier').Config & import('@trivago/prettier-plugin-sort-imports').PluginConfig} */
const config = {
  plugins: [
    'prettier-plugin-tailwindcss',
    '@trivago/prettier-plugin-sort-imports',
  ],
  tabWidth: 2,
  trailingComma: 'all',
  singleQuote: true,
  semi: true,
  endOfLine: 'lf',
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrder: [
    '^react',
    '^next',
    '<THIRD_PARTY_MODULES>',
    '@/app/(.*)',
    '@/types',
    '@/config',
    '@/components/ui/(.*)',
    '@/components/(.*)',
    '@/libs/(.*)',
    '@/utils/(.*)',
    '@/.*',
    '^./(.*)',
    '^../(.*)',
    /** 样式文件单独分组，放最下面 */
    '.(css|less|scss|sass|stylus)$',
  ],
  ignore: [
    'node_modules',
    'dist',
    'build',
    'public',
    '.gitignore',
    'pnpm-lock.yaml',
  ],
};

module.exports = config;
