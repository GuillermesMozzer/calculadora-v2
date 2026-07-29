/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      colors: {
        taking: {
          DEFAULT: "#FF5A1F",
          hover: "#E84E18",
          muted: "rgba(255, 90, 31, 0.12)",
        },
        surface: {
          DEFAULT: "#111110",
          raised: "#1a1918",
          overlay: "#222120",
        },
      },
      boxShadow: {
        glow: "0 0 60px -12px rgba(255, 90, 31, 0.35)",
      },
      animation: {
        "fade-in": "fadeIn 0.35s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
