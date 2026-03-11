/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#2E7D32",
          dark: "#1B5E20",
          light: "#4CAF50",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#81C784",
          dark: "#519657",
          light: "#B2FAB4",
          foreground: "#1B5E20",
        },
        accent: {
          DEFAULT: "#1565C0",
          dark: "#003C8F",
          light: "#5E92F3",
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "#D32F2F",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#F5F5F5",
          foreground: "#6B7280",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#1F2937",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1F2937",
        },
        success: {
          DEFAULT: "#2E7D32",
          foreground: "#ffffff",
        },
        warning: {
          DEFAULT: "#F57C00",
          foreground: "#ffffff",
        },
        info: {
          DEFAULT: "#1565C0",
          foreground: "#ffffff",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        urdu: ["Noto Nastaliq Urdu", "serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
