// practx Tailwind adapter mapping CSS variables to utilities
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,html}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          700: "var(--color-primary-700)",
          800: "var(--color-primary-800)",
          900: "var(--color-primary-900)"
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          800: "var(--color-accent-800)"
        },
        neutral: {
          100: "var(--color-neutral-100)",
          300: "var(--color-neutral-300)",
          500: "var(--color-neutral-500)",
          700: "var(--color-neutral-700)",
          900: "var(--color-neutral-900)"
        },
        white: "var(--color-white)",
        deepnavy: "var(--color-deep-navy)"
      },
      borderRadius: {
        sm:"var(--radius-sm)", md:"var(--radius-md)", lg:"var(--radius-lg)", xl:"var(--radius-xl)", full:"var(--radius-pill)"
      },
      boxShadow: { sm:"var(--shadow-sm)", md:"var(--shadow-md)", xl:"var(--shadow-xl)" },
      fontFamily: { heading: "var(--font-heading)", body: "var(--font-body)" }
    }
  }
};