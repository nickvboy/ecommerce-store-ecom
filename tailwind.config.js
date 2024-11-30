/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          100: '#FF6600',
          200: '#FF7719',
        },
        accent: {
          100: '#4D7C0F',
        },
        bg: {
          100: '#1A1A1A',
          200: '#262626',
          300: '#404040',
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

