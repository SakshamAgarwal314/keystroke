/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ["'JetBrains Mono'", "monospace"],
        display: ["'Outfit'", "sans-serif"],
      },
      colors: {
        surface: {
          0: "#0a0a0f",
          1: "#12121a",
          2: "#1a1a26",
          3: "#222233",
        },
        accent: {
          DEFAULT: "#e2b714",
          dim: "#b89510",
          glow: "#f5d54a",
        },
        ink: {
          DEFAULT: "#d1d0c5",
          dim: "#646669",
          faint: "#2c2e31",
        },
        speed: {
          low: "#ca4754",
          mid: "#e2b714",
          high: "#7bc96f",
          peak: "#4af5a1",
        },
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
        "count-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out forwards",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "count-up": "count-up 0.4s ease-out forwards",
      },
    },
  },
  plugins: [],
};
