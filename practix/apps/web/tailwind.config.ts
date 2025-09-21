import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0D47A1",
          light: "#5472d3",
          dark: "#002171"
        }
      }
    }
  },
  plugins: []
};

export default config;
