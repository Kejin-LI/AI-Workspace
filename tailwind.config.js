/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
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
        background: "#FFFFFF", // Pure White
        foreground: "#111111", // Nearly Black
        
        // Google Labs Inspired Palette
        lab: {
          dark: "#1A1A1A",
          gray: "#F2F2F2",
          purple: "#B28CFF", // Electric Purple
          yellow: "#DBFF00", // Acid Yellow
          blue: "#4D8EFF",   // Bright Blue
          pink: "#FF8F8F",   // Soft Pink
          green: "#00E699",  // Mint Green
        },

        sidebar: {
          DEFAULT: "#F9F9F9", // Very Light Gray
          hover: "#EFEFEF",
          active: "#E5E5E5",
          border: "#EFEFEF",
        },
        primary: {
          DEFAULT: "#111111", // Black Primary
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F2F2F2",
          foreground: "#111111",
        },
        muted: {
          DEFAULT: "#F5F5F5",
          foreground: "#737373",
        },
        accent: {
          DEFAULT: "#DBFF00", // Acid Yellow Accent
          foreground: "#111111",
        },
      },
      borderRadius: {
        lg: "24px", // More rounded like Google Labs pills
        md: "16px",
        sm: "12px",
      },
      fontFamily: {
        sans: ["Inter", "Space Grotesk", "sans-serif"],
        display: ["Space Grotesk", "Inter", "sans-serif"], // For Headings
      },
      boxShadow: {
        'lab': '0 0 0 1px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)',
        'lab-hover': '0 0 0 1px rgba(0,0,0,0.1), 0 8px 24px rgba(0,0,0,0.08)',
        'glow': '0 0 20px rgba(178, 140, 255, 0.4)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'marquee': 'marquee 40s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
    },
  },
  plugins: [],
};
