/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{svelte,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'pop-sm': '0 3px 0 0 rgba(0,0,0,0.15)',
        'pop': '0 4px 0 0 rgba(0,0,0,0.2)',
        'pop-lg': '0 6px 0 0 rgba(0,0,0,0.25)',
      }
    },
  },
  plugins: [],
};
