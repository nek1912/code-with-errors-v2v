/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0F172A', // Main app background
          800: '#1E293B', // Card/Panel backgrounds
          700: '#334155', // Borders and dividers
          600: '#475569', // Muted text
        },
        royal: {
          600: '#1E3A8A', // Secondary buttons, active states
          500: '#3B82F6', // Primary interactive elements, links
        },
        gold: {
          500: '#F59E0B', // SOS Button, Critical Alerts
          400: '#FBBF24', // Gold hover states
          300: '#FCD34D', // Gold text highlights
        },
        copper: '#D97706', // Warnings
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'], // Ensure a clean, modern font
      }
    },
  },
  plugins: [],
}
