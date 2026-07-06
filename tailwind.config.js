/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // clair par défaut (aucune classe .dark ajoutée) ; les dark: restent prêts pour un futur toggle
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dashboard colors (Adaptive)
        primary: "var(--color-primary)",
        primaryDark: "var(--color-primary-dark)",
        primaryLight: "var(--color-primary-light)",
        primarySoft: "var(--color-primary-soft)",
        primaryMist: "var(--color-primary-mist)",
        dark: "var(--color-dark)",
        canvas: "var(--color-canvas)",
        background: "var(--color-background)",
        // Landing Page colors
        "l-primary": "#6ffcba",
        "l-background": "#0a141d",
        "surface": "#0a141d",
        "inverse-surface": "#d9e4f1",
        "on-primary-fixed-variant": "#005234",
        "secondary-fixed": "#6efcb9",
        "on-error-container": "#ffdad6",
        "on-secondary": "#003823",
        "outline-variant": "#3c4a41",
        "surface-container": "#16212a",
        "on-error": "#690005",
        "on-secondary-container": "#004028",
        "surface-container-high": "#212b35",
        "on-surface-variant": "#bbcabf",
        "on-background": "#d9e4f1",
        "surface-bright": "#303a44",
        "surface-tint": "#4edf9f",
        "tertiary-fixed-dim": "#bdc8d4",
        "on-secondary-fixed": "#002113",
        "inverse-on-surface": "#27323b",
        "surface-container-highest": "#2b3640",
        "success-glow": "rgba(78, 223, 159, 0.3)",
        "primary-fixed": "#6efcb9",
        "error-alert": "#ffb4ab",
        "secondary": "#4edf9f",
        "secondary-container": "#05b77b",
        "on-surface": "#d9e4f1",
        "tertiary-fixed": "#d8e4f1",
        "on-tertiary-fixed-variant": "#3d4852",
        "surface-glass": "rgba(64, 71, 81, 0.4)",
        "tertiary-container": "#bdc8d5",
        "on-primary-fixed": "#002113",
        "on-tertiary-container": "#49545f",
        "on-primary": "#003823",
        "error-container": "#93000a",
        "outline": "#86948a",
        "surface-container-lowest": "#050f18",
        "on-tertiary-fixed": "#121d26",
        "surface-variant": "#2b3640",
        "on-primary-container": "#005f3e",
        "primary-fixed-dim": "#4edf9f",
        "surface-container-low": "#121d26",
        "on-tertiary": "#27323b",
        "primary-container": "#4edf9f",
        "tertiary": "#d9e4f1",
        "error": "#ffb4ab",
        "inverse-primary": "#006c47",
        "surface-dim": "#0a141d",
        "secondary-fixed-dim": "#4edf9f",
        "on-secondary-fixed-variant": "#005234",
        "surface-deep": "#09141d"
      },
      spacing: {
        "gutter": "24px",
        "margin-mobile": "20px",
        "container-max": "1200px",
        "base": "8px",
        "section-gap": "160px"
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "Inter", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
        "body-md": ["Inter", "sans-serif"],
        "headline-lg": ["'Plus Jakarta Sans'", "sans-serif"],
        "label-sm": ["'JetBrains Mono'", "monospace"],
        "headline-lg-mobile": ["'Plus Jakarta Sans'", "sans-serif"],
        "display-xl": ["'Plus Jakarta Sans'", "sans-serif"]
      },
      boxShadow: {
        'soft': '0 10px 40px -10px rgba(0,0,0,0.05)',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'float-medium': 'float 4s ease-in-out infinite',
        'float-fast': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
}
