/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'accent': '#ff4800',
        'accent-dark': '#e04000',
        'bg-dark': '#0a0a0a',
        'bg-darker': '#000000',
        'text-gray': '#b0b0b0',
        'text-dark': '#707070',
        'border': '#1a1a1a',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
