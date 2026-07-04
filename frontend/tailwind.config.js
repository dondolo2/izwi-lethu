/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // African Neon Orange palette
        neon: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // Base orange
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        // Dark mode background palette
        dark: {
          100: '#1a1a2e',
          200: '#16213e',
          300: '#0f3460',
          400: '#0a0a1a',
          500: '#050510',
        }
      },
      fontFamily: {
        'display': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}