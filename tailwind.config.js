/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        mono:  ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        brand: {
          sand:   '#D3B9A2',
          accent: '#8B6F5A',
          bg:     '#F7F4F1',
          bgAlt:  '#EFE5DB',
          border: '#DCCABB',
          text:   '#2F2F2F',
          muted:  '#666666',
          success:'#5F7A61',
          warning:'#C59A5A',
          error:  '#B85C5C',
        },
      },
      animation: {
        'fade-in':  'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'shimmer':  'shimmer 2s infinite',
      },
      keyframes: {
        'fade-in':  { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-up': { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'shimmer':  { '0%': { backgroundPosition: '200% 0' }, '100%': { backgroundPosition: '-200% 0' } },
      },
    },
  },
  plugins: [],
};
