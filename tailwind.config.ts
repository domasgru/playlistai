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
          brandHover: "#2FE471",
        },
        foreground: {
          light: "#EAEBEA",
          dark: "#0A0B0A",
        },
        border: {
          brand: "#61FFA8",
        },
        gray: {
          200: "D9D9D9",
          300: "#C1C6C3",
          500: "#949494",
          700: "#404040",
          750: "#212121",
          800: "#1F1F1F",
        },
      },
      borderRadius: {
        sm: "1px",
        DEFAULT: "16px",
        full: "9999px",
      },
      borderColor: {
        input: "rgb(255 255 255 / 0.16)",
      },
      fontSize: {
        sm: ["1rem", "1.63em"],
        base: ["1.25rem", "1.6em"],
        baseCompact: ["1.25rem", "1.4em"],
        lg: ["1.5rem", "1.6em"],
        heading: ["2.375rem", "1.4em"],
      },
      fontFamily: {
        sans: ["Nunito Sans", "system ui"],
      },
      spacing: {
        0: "0",
        1: "0.0625rem",
        2: "0.125rem",
        4: "0.25rem",
        6: "0.375rem",
        8: "0.5rem",
        10: "0.625rem",
        12: "0.75rem",
        14: "0.875rem",
        16: "1rem",
        20: "1.25rem",
        22: "1.375rem",
        23: "1.4375rem",
        24: "1.5rem",
        28: "1.75rem",
        32: "2rem",
        36: "2.25rem",
        40: "2.5rem",
        48: "3rem",
        52: "3.25rem",
        56: "3.5rem",
        64: "4rem",
        80: "5rem",
        88: "5.5rem",
        162: "10.125rem",
      },
      boxShadow: {
        innerGlow: "inset 0px 0px 5px 1px rgba(255,255,255,0.08)",
        elevation:
          "0px 2px 3px 0px rgba(0,0,0,0.26), 0px 8px 16px 0px rgba(0,0,0,0.22)",
        elevationWithInnerGlow:
          "inset 0px 0px 5px 1px rgba(255,255,255,0.08), 0px 2px 3px 0px rgba(0,0,0,0.26), 0px 8px 16px 0px rgba(0,0,0,0.22)",
        sm: "0px 1px 2px 0px rgba(0,0,0,0.40)",
      },
    },
  },
  plugins: [],
};
export default config;
