/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Background (Soft Light Gray)
        bgLight: "#F5F6F8",
        // Primary Button / Accent (Muted Mauve)
        primary: "#9B6A73",
        // Input Field Background (Off White)
        inputBg: "#FFFFFF",
        // Primary Text (Dark Charcoal)
        textDark: "#2D2D2D",
        // Secondary colors for variations
        secondary: "#B88A95",
        accent: "#D4A5B0",
        light: "#E8E9EB",
        // Dark mode colors
        darkBg: "#1A1A1A",
        darkCard: "#2D2D2D",
        darkText: "#E5E5E5",
        darkBorder: "#404040",
      },
    },
  },
  plugins: [],
};

