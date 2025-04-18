/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}", 
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: { 900: "#1E3A8A" }, 
        teal: { 500: "#2DD4BF" }, 
        green: { 500: "#22C55E" }, 
        red: { 500: "#EF4444" }, 
        gray: { 600: "#6B7280" }, 
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], 
      },
    },
  },
  plugins: [],
}; 