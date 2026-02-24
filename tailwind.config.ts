
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B2C', // Orange
        background: '#0F0F1A', // Near-black
        surface: '#1A1A2E', // Card/panel background
        'surface-hover': '#252540',
        border: '#2A2A45',
        'text-primary': '#FFFFFF',
        'text-secondary': '#9CA3AF', // gray-400
        'text-muted': '#6B7280', // gray-500
        success: '#22C55E',
        error: '#EF4444',
        // Trade colors for badges
        'trade-vinyl-wrap': '#FF6B2C',
        'trade-window-tint': '#3B82F6',
        'trade-ppf': '#22C55E',
        'trade-ceramic-coating': '#A855F7',
        'trade-auto-detailing': '#EAB308',
        'trade-paint-correction': '#EC4899',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};

export default config;
