/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#141414',
        mute: '#6f6f6f',
        line: '#e7e5e1',
        paper: '#faf9f7',
        tile: '#f0eeea',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      letterSpacing: { label: '.14em' },
    },
  },
  plugins: [],
}
