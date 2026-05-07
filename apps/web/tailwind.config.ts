import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        command: {
          950: "#05070d",
          900: "#09111f",
          800: "#101c2c",
          700: "#17253a"
        }
      },
      boxShadow: {
        "intel": "0 24px 80px rgba(0,0,0,.38)"
      }
    }
  },
  plugins: []
};

export default config;
