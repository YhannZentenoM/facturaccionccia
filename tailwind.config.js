/** @type {import("tailwindcss").Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2c4b7a",
        secondary: "#838195",
        warning: "#FFA800",
        danger: "#FF0000",
        success: "#0db45a",
      }
    },
    
  },
  plugins: [],
}

