import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          base: "#0A0B0A",
          input: "#222523",
          brand: "#1CD760",
        },
        foreground: {
          light: "#EAEBEA",
          dark: "#0A0B0A",
        },
        border: {
          brand: "#61FFA8",
        },
        gray: {
          300: "#C1C6C3",
          500: "#949494",
          700: "#404040",
        },
      },
      borderRadius: {
        sm: "1px",
        DEFAULT: "16px",
        full: "9999px",
      },
      fontSize: {
        sm: ["1rem", "1.6em"],
        base: ["1.25rem", "1.6em"],
        baseCompact: ["1.25rem", "1.35em"],
        lg: ["1.5rem", "1.6em"],
        heading: ["2.375rem", "1.4em"],
      },
      fontFamily: {
        sans: ["Nunito Sans", "system ui"],
      },
      spacing: {
        0: "0",
        2: "0.125rem",
        4: "0.25rem",
        6: "0.375rem",
        8: "0.5rem",
        12: "0.75rem",
        14: "0.875rem",
        16: "1rem",
        20: "1.25rem",
        22: "1.375rem",
        24: "1.5rem",
        28: "1.75rem",
        32: "2rem",
        64: "4rem",
        80: "5rem",
      },
      boxShadow: {
        innerGlow: "inset 0px 0px 5px 1px rgba(255,255,255,0.15)",
      },
    },
  },
  plugins: [],
};
export default config;
