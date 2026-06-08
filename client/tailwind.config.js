/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef7ff',
          100: '#d8ecff',
          500: '#1976d2',
          600: '#135fb0',
          700: '#104f91',
        },
        ink: '#172033',
      },
      boxShadow: {
        soft: '0 20px 45px rgba(23, 32, 51, 0.08)',
      },
    },
  },
  plugins: [],
};
