/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        earth: {
          50: '#fbf8f3',
          100: '#f4ede1',
          200: '#e7d8c2',
          300: '#d6be9c',
          400: '#c29f74',
          500: '#ab8454',
          600: '#946c43',
          700: '#795337',
          800: '#644431',
          900: '#53392a',
        }
      }
    },
  },
  plugins: [],
}
