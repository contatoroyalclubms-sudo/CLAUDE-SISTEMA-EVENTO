/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta Supreme Neon
        'neon-blue': '#00D4FF',
        'neon-purple': '#8B00FF',
        'neon-pink': '#FF0080',
        'neon-green': '#00FF88',
        'neon-yellow': '#FFD700',
        'neon-orange': '#FF8C00',
        'neon-red': '#FF0044',
        'neon-cyan': '#00FFE5',
        // Backgrounds
        'dark-bg': '#0A0A0B',
        'card-bg': 'rgba(255, 255, 255, 0.05)',
        'glass-bg': 'rgba(255, 255, 255, 0.1)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'neon-gradient': 'linear-gradient(45deg, #00D4FF, #8B00FF, #FF0080)',
        'hero-gradient': 'linear-gradient(135deg, #00D4FF 0%, #8B00FF 50%, #FF0080 100%)',
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 3s ease infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'pulse-neon': {
          '0%, 100%': {
            opacity: 1,
            boxShadow: '0 0 20px #00D4FF, 0 0 40px #00D4FF, 0 0 60px #00D4FF',
          },
          '50%': {
            opacity: 0.8,
            boxShadow: '0 0 10px #00D4FF, 0 0 20px #00D4FF, 0 0 30px #00D4FF',
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'glow': {
          '0%': { textShadow: '0 0 20px #00D4FF, 0 0 30px #00D4FF, 0 0 40px #00D4FF' },
          '100%': { textShadow: '0 0 10px #00D4FF, 0 0 20px #00D4FF, 0 0 30px #00D4FF' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        '7xl': '5rem',
        '8xl': '6rem',
        '9xl': '7rem',
      },
    },
  },
  plugins: [],
}