/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--brand-primary)',
          primaryDark: 'var(--brand-primary-dark)',
          accent: 'var(--brand-accent)',
          surface: 'var(--brand-surface)',
          muted: 'var(--brand-muted)',
          text: 'var(--brand-text)'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif']
      },
      boxShadow: {
        card: '0 20px 25px -5px rgba(32, 65, 122, 0.15), 0 10px 10px -5px rgba(32, 65, 122, 0.1)'
      }
    }
  },
  plugins: []
};
