/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      // ── Typography ─────────────────────────────────────────────────────
      // Inter is an excellent choice for Core Web Vitals (variable font,
      // self-hostable, optimized for screens). We load it via BaseHead.astro.
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },

      // ── Colors ─────────────────────────────────────────────────────────
      // A professional, high-contrast palette for a tech blog.
      colors: {
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
      },

      // ── Content Widths ──────────────────────────────────────────────────
      maxWidth: {
        prose: "72ch", // ~672px — optimal reading width for long-form content
      },

      // ── Spacing ─────────────────────────────────────────────────────────
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },

      // ── Typography Plugin (optional, for @tailwindcss/typography) ────────
      // If you install @tailwindcss/typography, these settings apply to
      // prose blocks (Markdown article bodies).
    },
  },
  plugins: [
    // Uncomment to add prose styling for Markdown content:
    // require('@tailwindcss/typography'),
  ],
};
