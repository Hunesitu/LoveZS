/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 温馨浪漫的配色方案
        primary: {
          50: '#fdf4f0',
          100: '#fce7dc',
          200: '#f8cdb9',
          300: '#f3ab8f',
          400: '#ec8260',
          500: '#e46040',
          600: '#d54a35',
          700: '#b13c2e',
          800: '#8e3328',
          900: '#742e24',
        },
        secondary: {
          50: '#fef2f2',
          100: '#fde3e3',
          200: '#fbcdcd',
          300: '#f7a9a9',
          400: '#f17676',
          500: '#e64c4c',
          600: '#d32f2f',
          700: '#b02525',
          800: '#922323',
          900: '#792323',
        },
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'serif': ['Playfair Display', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}