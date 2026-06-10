/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E87A4D',
          light: '#F09A76',
          dark: '#C45A2D',
        },
        accent: '#F5A623',
        bg: {
          DEFAULT: '#FFF8F0',
          surface: '#FEF3E8',
          card: '#FFFFFF',
        },
        espresso: {
          DEFAULT: '#3D2B1F',
          muted: '#7A5C4E',
          light: '#B8967E',
        },
        sage: {
          DEFAULT: '#7CAF8A',
          light: '#A8CEB4',
          dark: '#4E8A5E',
        },
        amber: '#F5A623',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        warm: '0 4px 24px -4px rgba(61, 43, 31, 0.12)',
        'warm-lg': '0 8px 40px -8px rgba(61, 43, 31, 0.18)',
        card: '0 2px 12px -2px rgba(61, 43, 31, 0.10)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
