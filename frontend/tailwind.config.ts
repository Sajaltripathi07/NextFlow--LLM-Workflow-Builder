import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}",
    "./src/stores/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        surface: "#0a0d12",
        panel: "#0d1118",
        border: "rgba(255,255,255,0.08)",
        accent: "#22d3ee"
      },
      boxShadow: {
        panel: "0 30px 90px rgba(0,0,0,0.45)",
        card: "0 28px 60px rgba(0,0,0,0.32)"
      },
      keyframes: {
        pulse_glow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(34,211,238,0)" },
          "50%": { boxShadow: "0 0 0 8px rgba(34,211,238,0.18)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        }
      },
      animation: {
        pulse_glow: "pulse_glow 2s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite"
      }
    }
  },
  plugins: []
};

export default config;
