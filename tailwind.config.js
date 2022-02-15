const colors = require('tailwindcss/colors')
module.exports = {
  mode: "jit",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    colors: {
      ...colors,
    },
    extend: {
      animation: {
        "blob-spin": "blobbing 25s linear infinite",
      },
      colors: {
        primary: {
          500: "#B926A7",
          600: "#E72FCC",
        },
      },
    },
  },

  plugins: [],
};
