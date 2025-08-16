/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}"
    // Gebruik je /src/app? Vervang dan "./app/**" door "./src/app/**"
  ],
  theme: { extend: {} },
  plugins: [],
};
