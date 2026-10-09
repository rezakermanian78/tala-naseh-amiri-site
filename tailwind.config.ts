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
      },
      fontSize: {
        display: ['clamp(2.75rem, 9vw + 0.5rem, 6.25rem)', { lineHeight: '1.02', letterSpacing: '-0.035em' }],
        h2: ['clamp(2rem, 5vw + 0.5rem, 3.5rem)', { lineHeight: '1.08', letterSpacing: '-0.025em' }],
      },
      boxShadow: {
        soft: '0 10px 40px -12px rgb(var(--rose) / 0.25)',
        lift: '0 24px 60px -20px rgb(var(--rose) / 0.4)',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-14px)' } },
        spin360: { to: { transform: 'rotate(360deg)' } },
        ping2: { '0%': { transform: 'scale(1)', opacity: '0.7' }, '80%,100%': { transform: 'scale(2.4)', opacity: '0' } },
        glow: { '0%,100%': { opacity: '0.45' }, '50%': { opacity: '0.8' } },
      },
      animation: {
        float: 'float 9s ease-in-out infinite',
        'float-slow': 'float 13s ease-in-out infinite',
        ring: 'spin360 9s linear infinite',
        ping2: 'ping2 1.8s cubic-bezier(0,0,0.2,1) infinite',
        glow: 'glow 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
