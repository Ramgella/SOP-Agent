/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: '#0B0F17',
          soft: '#0E1320',
        },
        surface: {
          DEFAULT: '#121826',
          elevated: '#1A2333',
          hover: '#1F2A3D',
        },
        border: {
          DEFAULT: '#232C3D',
          soft: '#1B2333',
        },
        ink: {
          DEFAULT: '#E6E9F0',
          muted: '#8B94A8',
          faint: '#5B6478',
        },
        accent: {
          50: '#F1EEFF',
          200: '#C9C0FF',
          400: '#8A78FF',
          500: '#6E5BFF',
          600: '#5A47E8',
          700: '#4836C2',
        },
        success: '#34D399',
        warning: '#FBBF24',
        danger: '#F87171',
      },
      fontFamily: {
        display: ['Sora', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(110,91,255,0.25), 0 8px 24px -8px rgba(110,91,255,0.45)',
        card: '0 1px 0 rgba(255,255,255,0.04) inset, 0 12px 24px -16px rgba(0,0,0,0.6)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.25s ease-out',
        slideUp: 'slideUp 0.3s ease-out',
        pulseGlow: 'pulseGlow 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
