/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {},
      borderRadius: {
        "2xl": "1rem", // 16px
        "3xl": "1.5rem", // 24px
      },
    },
  },
  plugins: [],
};
