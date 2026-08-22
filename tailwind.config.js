/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        fintech: {
          bg: '#090D16',
          panel: '#0F172A',
          card: '#131C2E',
          'card-hover': '#1B273F',
          border: '#1E293B',
          'border-subtle': '#162235',
          accent: '#6366F1',
          'accent-hover': '#4F46E5',
          cyan: '#0EA5E9',
          success: '#10B981',
          'success-bg': 'rgba(16, 185, 129, 0.12)',
          warning: '#F59E0B',
          'warning-bg': 'rgba(245, 158, 11, 0.12)',
          danger: '#F43F5E',
          'danger-bg': 'rgba(244, 63, 94, 0.12)',
          text: '#F8FAFC',
          muted: '#94A3B8',
          subtle: '#64748B',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
