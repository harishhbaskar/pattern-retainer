// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Page backgrounds
        primary: "#101828",    // matching web picked color
        secondary: "#101828",  // same, used interchangeably
        // Card surfaces
        card: "#1f2937",       // gray-800
        "card-border": "#374151", // gray-700
        // Accent
        accent: "#6366f1",     // indigo-500
        "accent-hover": "#4f46e5", // indigo-600
        // Text
        "text-primary": "#ffffff",
        "text-secondary": "#d1d5db", // gray-300
        "text-muted": "#9ca3af",     // gray-400
        // Inputs
        "input-bg": "#374151",   // gray-700
        "input-border": "#4b5563", // gray-600
        // Status colors
        danger: "#ef4444",   // red-500
        success: "#22c55e",  // green-500
        warning: "#f59e0b",  // amber-500
        // Keep these for any legacy references
        dark: {
          100: "#1f2937",
          200: "#374151",
        },
        light: {
          100: "#f3f4f6",
          200: "#d1d5db",
          300: "#9ca3af",
        },
      },
    },
  },
  plugins: [],
};