/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
        emerald: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
      },
      fontFamily: {
        inter: "'Inter', sans-serif",
        amiri: "'Amiri', serif",
      },
      backdropFilter: {
        'blur': 'blur(10px)',
      },
      backgroundImage: {
        'mesh-gradient': `
          linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%,
          rgba(6, 182, 212, 0.1) 25%,
          rgba(15, 23, 42, 0.3) 50%,
          rgba(6, 182, 212, 0.1) 75%,
          rgba(16, 185, 129, 0.1) 100%),
          radial-gradient(at 20% 50%, rgba(34, 197, 94, 0.15) 0px, transparent 50%),
          radial-gradient(at 80% 80%, rgba(6, 182, 212, 0.15) 0px, transparent 50%),
          linear-gradient(to bottom, #0f172a, #1a1a2e)
        `,
      },
      animation: {
        'language-switch': 'languageSwitch 0.3s ease-in-out',
      },
      keyframes: {
        languageSwitch: {
          '0%': { opacity: '0.8', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
