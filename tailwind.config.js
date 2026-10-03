/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Manrope', 'sans-serif'],
      },
      colors: {
        ink: '#20261f',
        paper: '#f6f7f2',
        moss: '#59704d',
        lime: '#c8f169',
      },
    },
  },
  plugins: [],
}