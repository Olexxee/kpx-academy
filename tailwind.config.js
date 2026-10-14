/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1d4ed8", // Royal Blue
        secondary: "#8b1e5a", // Deep Magenta
        neutral: "#faf8f5", // Warm White
        "accent-blush": "#f4dcd6", // Soft Blush
        "accent-charcoal": "#212529", // Dark Charcoal
        background: "#faf8f5", // Warm White
        surface: "#ffffff", // Pure White
        text: "#212529", // Dark Charcoal for sharp readability
        "text-muted": "#6b7280", // Neutral muted gray
        border: "#e5e2dc", // Soft border matching warm tones
        success: "#237a52",
        warning: "#946200",
        error: "#b42318",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        display: ["Sora", "system-ui", "sans-serif"],
        heading: ["Sora", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
        control: "8px",
      },
      maxWidth: {
        container: "1280px",
      },
    },
  },
  plugins: [],
};
