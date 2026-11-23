/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        pitch: {
          50: '#effcf3',
          100: '#d8f7e2',
          200: '#b3edc8',
          300: '#7edda6',
          400: '#43c77c',
          500: '#22a862',
          600: '#178a4f',
          700: '#166d42',
          800: '#175638',
          900: '#164730',
        },
        navy: {
          50: '#eef2f8',
          100: '#d5deec',
          200: '#adbdd9',
          300: '#7c96bd',
          400: '#50709c',
          500: '#33507c',
          600: '#22395f',
          700: '#172a4a',
          800: '#0f1f38',
          900: '#0a1628',
        },
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'sheet-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'sheet-up': 'sheet-up 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
      },
      boxShadow: {
        card: '0 1px 2px rgba(10, 22, 40, 0.04), 0 8px 24px -12px rgba(10, 22, 40, 0.12)',
        lift: '0 2px 4px rgba(10, 22, 40, 0.06), 0 18px 40px -16px rgba(10, 22, 40, 0.28)',
      },
    },
  },
  plugins: [],
};
