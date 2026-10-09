import type { Config } from 'tailwindcss'

const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        rose: { DEFAULT: token('rose'), soft: token('rose-soft'), ink: token('rose-ink') },
        blush: { DEFAULT: token('blush'), deep: token('blush-deep') },
        plum: token('plum'),
        muted: token('muted'),
        canvas: token('canvas'),
        surface: token('surface'),
        line: token('line'),
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans Variable"', 'Vazirmatn', 'system-ui', 'sans-serif'],
        fa: ['Vazirmatn', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 40px -12px rgb(var(--rose) / 0.25)',
      },
    },
  },
  plugins: [],
} satisfies Config
