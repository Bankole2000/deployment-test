/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brandPurple: "#8B72B0",
        brandDarkPurple: "#4600AE",
        brandBlack: "#10021C",
        brandLightPurple: "#9203E0",
      },
    },
  },
  plugins: [],
};
