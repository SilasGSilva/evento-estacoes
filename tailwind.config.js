/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#002147",
        secondary: "#E2725B",
        accent: "#A7D08D",
        highlight: "#FFD700",
        surface: "#FCF8F4",
      },
    },
  },
  plugins: [],
};

module.exports = config;
