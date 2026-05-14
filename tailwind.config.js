/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Anchors from docs/DESIGN_NOTES.md
        bg: "#0F0A1E",
        ink: "#1A0F2E",
        paper: "#F5F2FF",
        lime: "#A8FF3E",
        hot: "#FF3EA5",
        cyan: "#3EFFE9",
        blood: "#FF5C3E",
        muted: "#7A6B99",
      },
      fontFamily: {
        display: ["SpaceGrotesk_700Bold", "system-ui", "sans-serif"],
        body: ["Inter_400Regular", "system-ui", "sans-serif"],
        mono: ["JetBrainsMono_400Regular", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
