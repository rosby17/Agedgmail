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
        // Ambre/orange chaud devenu la couleur DOMINANTE (prix, liens,
        // catégories, boutons d'action) — inspiré de la palette Coolors
        // fournie, assombri pour un contraste vérifié de 4.87:1 (texte) /
        // 4.87:1 (texte blanc sur fond) sur blanc, conforme WCAG AA.
        primary: "#B05A08",
        primaryDark: "#8C4706",
        primaryLight: "#FBEBD9",
        // Le vert est volontairement réservé aux statuts positifs ponctuels
        // (badge "Instant", stock disponible) — voir Tailwind green-* utilisé
        // directement à ces endroits précis dans App.jsx, pas ce token.
        dark: "#1F1712",
        background: "#FFFFFF",
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "Inter", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
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
