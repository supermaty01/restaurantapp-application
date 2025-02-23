/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#93AE72",
        secondary: "#905C36",
        muted: "#E5EAE0",
        destructive: "#B04A3A",
        foreground: "#E5EAE0",
        accent: "#DFE2CF",
        "light-brown": "#CDC8B8",
      }
    },
  },
  plugins: [],
}