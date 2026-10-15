/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        strawberry: '#E99AA8',
        rose: '#C95C70',
        blush: '#FBE2E2',
        cream: '#FFF9F3',
        lavender: '#DCD3E8',
        mint: '#E0EBDD',
        butter: '#F7E8B0',
        cocoa: '#38272B',
        muted: '#82777A',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        hand: ['Caveat', 'cursive'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.75rem',
      },
      boxShadow: {
        soft: '0 18px 50px -22px rgba(56,39,43,0.28)',
        card: '0 10px 30px -18px rgba(56,39,43,0.35)',
      },
      keyframes: {
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        floatySlow: {
          '0%,100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(3deg)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(18px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        floaty: 'floaty 6s ease-in-out infinite',
        floatySlow: 'floatySlow 9s ease-in-out infinite',
        fadeUp: 'fadeUp 0.7s ease-out both',
      },
    },
  },
  plugins: [],
};
