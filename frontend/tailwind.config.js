/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        palco: {
          950: "#07080C",
          900: "#0B0E14",
          800: "#12151D",
          700: "#1B1F2A",
        },
        ouro: {
          400: "#F5CB4E",
          500: "#F2B705",
          600: "#C99A03",
        },
        queda: {
          500: "#E63946",
          600: "#C22735",
        },
        acerto: {
          400: "#3FD9C7",
          500: "#2EC4B6",
        },
        creme: "#F4F1EA",
      },
      fontFamily: {
        display: ["'Anton'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      boxShadow: {
        holofote: "0 0 120px 20px rgba(242,183,5,0.15)",
      },
      keyframes: {
        cair: {
          "0%": { transform: "translateY(0) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(320px) rotate(25deg)", opacity: "0" },
        },
        pulsarOuro: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(242,183,5,0.5)" },
          "50%": { boxShadow: "0 0 0 12px rgba(242,183,5,0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        entrada: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        quicar: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        girar: {
          "0%": { transform: "rotateY(0deg)" },
          "100%": { transform: "rotateY(360deg)" },
        },
        confete: {
          "0%": { transform: "translateY(0) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(-60px) rotate(180deg)", opacity: "0" },
        },
      },
      animation: {
        cair: "cair 0.7s ease-in forwards",
        pulsarOuro: "pulsarOuro 1.6s infinite",
        fadeIn: "fadeIn 0.35s ease forwards",
        entrada: "entrada 0.4s ease forwards",
        quicar: "quicar 1.4s ease-in-out infinite",
        girar: "girar 0.6s ease-in-out",
        confete: "confete 0.9s ease-out forwards",
      },
    },
  },
  plugins: [],
};
