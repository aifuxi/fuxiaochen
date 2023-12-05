import { radixThemePreset } from 'radix-themes-tw';

import { type Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  // your existing configuration
  presets: [radixThemePreset],
  theme: {
    debugScreens: {
      position: ['bottom', 'right'],
      ignore: ['dark'],
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
    // 开发模式下加载显示屏幕大小的插件
    process.env.NODE_ENV === 'development' &&
      require('tailwindcss-debug-screens'),
  ],
} satisfies Config;
