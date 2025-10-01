// tailwind.config.js
const { heroui } = require("@heroui/react");

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/react/**/*.js",
    "./node_modules/@heroui/button/**/*.js",
    "./node_modules/@heroui/input/**/*.js",
  ],
  theme: { extend: {} },
  plugins: [heroui()],
};
