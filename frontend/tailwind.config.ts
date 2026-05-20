import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4ff', 100: '#dce8ff', 200: '#b9d1ff', 300: '#85afff',
          400: '#4a80ff', 500: '#1a56ff', 600: '#0035f5', 700: '#0028cc',
          800: '#001fa3', 900: '#001780', 950: '#000d4d',
        },
        luxury: {
          gold: '#c9a84c', 'gold-light': '#e8c97e', 'gold-dark': '#8a6a2a',
          dark: '#0a0a0f', 'dark-2': '#12121a', 'dark-3': '#1a1a2e',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
        display: ['var(--font-geist-sans)', 'sans-serif'],
      },
      backgroundImage: {
        'luxury-gradient': 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0a0a0f 100%)',
        'brand-gradient': 'linear-gradient(135deg, #1a56ff, #0035f5)',
        'gold-gradient': 'linear-gradient(135deg, #c9a84c, #e8c97e, #c9a84c)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-20px)' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        shimmer: { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
      },
      boxShadow: {
        'luxury': '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
        'brand': '0 10px 40px rgba(26, 86, 255, 0.3)',
        'gold': '0 10px 40px rgba(201, 168, 76, 0.2)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
};

export default config;
