/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0f1117',
        surface: '#1a1e2e',
        surface2: '#232840',
        'app-border': '#2e3454',
        accent: '#a3e635',
        'accent-dim': '#4d6e18',
        danger: '#f87171',
        'danger-dim': '#7f1d1d',
        warn: '#fbbf24',
        'warn-dim': '#78350f',
        muted: '#64748b',
        prose: '#e2e8f0',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Mono"', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
