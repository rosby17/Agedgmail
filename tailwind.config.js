/** @type {import('tailwindcss').Config} */
export default {

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
        "l-primary": "var(--color-l-primary)",
        "l-background": "var(--color-l-background)",
        "surface": "var(--color-surface)",
        "on-surface": "var(--color-on-surface)",
        "on-surface-variant": "var(--color-on-surface-variant)",
        "surface-container": "var(--color-surface-container)",
        "inverse-surface": "var(--color-inverse-surface)",
        "surface-container-high": "var(--color-surface-container-high)",
        "surface-glass": "var(--color-surface-glass)",
        "inverse-on-surface": "var(--color-inverse-on-surface)",
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
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
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
