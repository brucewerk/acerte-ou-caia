/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      xs: "420px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
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
          "100%": { transform: "rotateY(1080deg)" },
        },
        confete: {
          "0%": { transform: "translateY(0) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(-60px) rotate(180deg)", opacity: "0" },
        },
        confeteCair: {
          "0%": { transform: "translateY(-10vh) translateX(0) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(110vh) translateX(var(--deriva, 40px)) rotate(540deg)", opacity: "0" },
        },
        flutuar: {
          "0%, 100%": { transform: "translateY(0) translateX(0)" },
          "50%": { transform: "translateY(-18px) translateX(8px)" },
        },
        tremor: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-6px)" },
          "40%": { transform: "translateX(5px)" },
          "60%": { transform: "translateX(-4px)" },
          "80%": { transform: "translateX(3px)" },
        },
        brilho: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        piscar: {
          "0%, 100%": { opacity: "0.3", transform: "scale(0.9)" },
          "50%": { opacity: "1", transform: "scale(1.1)" },
        },
      },
      animation: {
        cair: "cair 0.7s ease-in forwards",
        pulsarOuro: "pulsarOuro 1.6s infinite",
        fadeIn: "fadeIn 0.35s ease forwards",
        entrada: "entrada 0.4s ease forwards",
        quicar: "quicar 1.4s ease-in-out infinite",
        girar: "girar 1.1s cubic-bezier(0.4,0.1,0.2,1)",
        confete: "confete 0.9s ease-out forwards",
        confeteCair: "confeteCair linear forwards",
        flutuar: "flutuar 6s ease-in-out infinite",
        tremor: "tremor 0.5s ease-in-out",
        brilho: "brilho 2.5s linear infinite",
        piscar: "piscar 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
