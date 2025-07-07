/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef3c7',
          100: '#fde68a',
          200: '#fcd34d',
          300: '#fbbf24',
          400: '#f59e0b',
          500: '#d97706',
          600: '#b45309',
          700: '#92400e',
          800: '#78350f',
          900: '#451a03',
        },
        'warm-gray': {
          50: '#FDFBF8',
          100: '#F7F3EE',
        }
      },
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'caveat': ['Caveat', 'cursive'],
        'nunito': ['Nunito Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}