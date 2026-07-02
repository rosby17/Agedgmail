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
        // Vert de marque assombri pour l'accessibilité : l'ancien #13B87A ne
        // donnait que 2.57:1 de contraste sur blanc (WCAG AA exige 4.5:1
        // pour le texte, 3:1 pour les composants). #0D7A52 atteint ~5.35:1.
        // Reste la couleur DOMINANTE (badges, prix, stock, liens, catégories).
        primary: "#0D7A52",
        primaryDark: "#0A5F40",
        // Accent or/ambre pour les boutons d'action (Acheter, Payer, Recharger)
        // — inspiré de la palette Coolors fournie, assombri pour un contraste
        // de 5.42:1 en texte blanc (calcul vérifié).
        accent: "#9C5A08",
        accentDark: "#7A4606",
        dark: "#121212",
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
