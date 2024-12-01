/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          100: '#3B82F6',
          200: '#639fff',
        },
        accent: {
          100: '#FFB800)',
        },
        bg: {
          100: '#020b1a',
          200: '#001b4b',
          300: '#002769',
        },
        text: {
          100: '#FFFFFF',
          200: '#A3A3A3',
        },
      },
      keyframes: {
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' }
        }
      },
      animation: {
        'bounce-gentle': 'bounce-gentle 2s ease-in-out 1'
      }
    },
  },
  plugins: [],
}

