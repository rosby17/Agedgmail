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
        // Le vert redevient la couleur dominante (boutons d'action, prix,
        // liens, catégories) — rampe de plusieurs nuances pour varier
        // cartes/contours/textes/hover au lieu d'un vert plat partout.
        // Contrastes vérifiés sur blanc : primary 5.35:1, primaryLight 3.84:1
        // (réservé aux éléments larges/gras, pas au texte fin).
        primary: "#0D7A52",       // boutons, prix, liens — texte/CTA
        primaryDark: "#0A5F40",   // hover/active des boutons
        primaryLight: "#189464",  // variante plus claire (icônes, accents larges)
        primarySoft: "#EAF7F1",   // fond très pâle (hover de carte, badges alternatifs)
        primaryMist: "#DCF0E6",   // un cran plus soutenu que primarySoft (contours au survol)
        dark: "#10241B",
        // Fond de page : léger lavis vert au lieu d'un blanc uni plat. Les
        // cartes restent bg-white pour ressortir dessus.
        canvas: "#F4FAF7",
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
