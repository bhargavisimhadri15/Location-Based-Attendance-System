/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0b0d',
        surface: '#16181d',
        primary: {
          light: '#6366f1',
          DEFAULT: '#4f46e5',
          dark: '#3730a3',
        },
        secondary: '#10b981',
        accent: '#f59e0b',
        danger: '#ef4444',
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    },
  },
  plugins: [],
}
