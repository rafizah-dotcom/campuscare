import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        campus: {
          blue: {
            50: "#eff6ff",
            100: "#dbeafe",
            200: "#bfdbfe",
            300: "#93c5fd",
            400: "#60a5fa",
            500: "#3b82f6",
            600: "#2563eb",
            700: "#1d4ed8",
            800: "#1e40af",
            900: "#1e3a8a",
            950: "#172554",
          },
          purple: {
            50: "#faf5ff",
            100: "#f3e8ff",
            200: "#e9d5ff",
            300: "#d8b4fe",
            400: "#c084fc",
            500: "#a855f7",
            600: "#9333ea",
            700: "#7e22ce",
            800: "#6b21a8",
            900: "#581c87",
            950: "#3b0764",
          },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "brand-gradient": "linear-gradient(135deg, #1e40af 0%, #6b21a8 100%)",
        "brand-gradient-hover": "linear-gradient(135deg, #1d4ed8 0%, #7e22ce 100%)",
        "brand-glow": "radial-gradient(circle at 50% 50%, rgba(147, 51, 234, 0.15) 0%, rgba(37, 99, 235, 0.05) 50%, transparent 100%)",
      },
      boxShadow: {
        "brand-sm": "0 2px 8px -2px rgba(99, 102, 241, 0.15)",
        "brand-md": "0 8px 24px -4px rgba(99, 102, 241, 0.2)",
        "brand-lg": "0 16px 32px -8px rgba(126, 34, 206, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
