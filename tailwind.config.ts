import { type Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'image-carousel': {
          '0%': { opacity: '0' },
          '5%': { opacity: '0.1' },
          '47.5%': { opacity: '0.1' },
          '52.5%': { opacity: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'image-carousel': 'image-carousel 40s infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
