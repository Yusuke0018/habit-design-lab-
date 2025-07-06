/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'fadeInUp': 'fadeInUp 0.6s ease-out forwards',
        'slideIn': 'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'blob': 'blob 7s infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'success-bounce': 'successBounce 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'confetti': 'confetti 3s ease-out forwards',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        slideIn: {
          '0%': {
            transform: 'translateX(-100%)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateX(0)',
            opacity: '1',
          },
        },
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'var(--primary-gradient)',
        'gradient-mesh': 'radial-gradient(at 20% 80%, hsl(var(--gradient-start) / 0.3) 0px, transparent 50%), radial-gradient(at 80% 20%, hsl(var(--gradient-middle) / 0.3) 0px, transparent 50%), radial-gradient(at 40% 40%, hsl(var(--gradient-end) / 0.3) 0px, transparent 50%)',
      },
      colors: {
        'gradient-start': 'hsl(var(--gradient-start) / <alpha-value>)',
        'gradient-middle': 'hsl(var(--gradient-middle) / <alpha-value>)',
        'gradient-end': 'hsl(var(--gradient-end) / <alpha-value>)',
        'success': 'hsl(var(--success) / <alpha-value>)',
        'warning': 'hsl(var(--warning) / <alpha-value>)',
        'info': 'hsl(var(--info) / <alpha-value>)',
      },
    },
  },
  plugins: [],
}