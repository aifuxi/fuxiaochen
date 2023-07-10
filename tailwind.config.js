const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '2rem',
        sm: '4rem',
        lg: '8rem',
        xl: '10rem',
        '2xl': '12rem',
      },
    },
    extend: {
      colors: {
        primary: colors.indigo,
      },
      fontFamily: {
        sans: [
          'Poppins',
          'PingFang SC',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'sans-serif',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'Noto Color Emoji',
        ],
        serif: [
          'ui-serif',
          'Georgia',
          'Cambria',
          'Times New Roman',
          'Times',
          'serif',
        ],
        mono: [
          'Fira Code',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'Liberation Mono',
          'Courier New',
          'monospace',
        ],
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
        typing: {
          from: { width: '0' },
          to: { width: '18ch' },
        },
        blink: {
          from: { 'border-right-color': 'transparent' },
          to: { 'border-right-color': 'black' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'spin-slow': 'spin 6s linear infinite',
        typing: 'typing 2s steps(18), blink 1s infinite',
      },
    },
  },
  plugins: [
    require('tailwindcss-theming')({
      variants: {
        dark: true,
        light: true,
      },
      themes: false,
    }),
    require('@tailwindcss/forms'),
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
    require('tailwindcss-debug-screens'),
  ],
};
