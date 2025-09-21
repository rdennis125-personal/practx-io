# Practx Brand System

This guide summarizes the Practx brand look and feel implemented in this repository. It covers the design tokens, base
theme, reusable components, and logo usage requirements so you can extend the experience with confidence.

## Design Tokens (`src/styles/tokens.css`)

All brand primitives live in `src/styles/tokens.css` and are exposed as CSS custom properties:

- **Color** – Primary brand blues (`--color-brand-*`), derived accent (`--color-accent`), neutral text colors, surfaces, and
  feedback palettes for success, warning, and danger states.
- **Typography** – DM Sans as the display/body family with responsive type ramps (`--fs-*`), line heights, and letter spacing
  values tuned for dense dashboards.
- **Spacing & Radii** – Modular spacing scale (`--space-*`) and rounded corners (`--radius-*`) sized for cards, inputs, and
  badges.
- **Elevation & Motion** – Shadow variables for resting/focus states and shared transition timings.

Reference the tokens via `var(--token-name)` or the Tailwind aliases declared in `tailwind.config.ts`.

## Base Theme (`src/styles/theme.css`)

The base theme consumes the tokens to set global defaults:

- Body copy, headings, and links inherit DM Sans with WCAG AA+ contrast on the light background.
- Links underline on hover/focus and share a 2px brand focus ring across interactive elements.
- Utility classes (`.btn`, `.card`, `.input-base`, `.badge`, `.headline-display`, `.stack-md`, etc.) provide consistent
  structure for shared patterns.
- Motion obeys reduced-motion preferences while keeping hover states at 160 ms.

`app/globals.css` imports both token and theme layers before Tailwind so custom layers can compose with utility classes.

## Tailwind Integration (`tailwind.config.ts`)

Semantic aliases expose the tokens to Tailwind:

- `brand`, `accent`, `surface`, `text`, `border`, `success`, `warning`, and `danger` color families.
- Font families map to the DM Sans stack for `font-sans` and `font-display`.
- Radius, spacing, shadows, and timing functions mirror the custom properties.

Include `@/` paths (`./src/**/*.{ts,tsx}`) in `content` when authoring new components so PurgeCSS finds your classes.

## Logo Components

Two React components render the official Practx marks without manual asset management:

| Component | Usage | Props |
| --- | --- | --- |
| `LogoPrimary` | Full lockup with wordmark | `variant="auto | light | dark"`, `width` (min 140 px) |
| `LogoMark` | Icon-only mark | `variant="auto | light | dark"`, `size` (default 48 px) |

Both components:

- Enforce clear space roughly equal to the “P” glyph height via internal padding.
- Default to `variant="auto"`, detecting the surrounding luminance and swapping to an inverted mark on dark surfaces.
- Render accessible SVGs with gradients derived from the brand palette—never recolor, skew, or stretch.
- Require minimum display sizes: `LogoPrimary` ≥ 140 px wide and `LogoMark` ≥ 32 px tall for clarity.

## UI Components (`src/components/ui`)

Reusable primitives align with the brand system:

- **Button** (`Button.tsx`) – Primary, subtle, ghost, and destructive variants with consistent elevation and focus rings.
- **Input** (`Input.tsx`) – Labeled inputs with helper/error messaging and accessible semantics.
- **Card** (`Card.tsx`) – Card, header, title, description, content, and footer helpers using surface tokens.
- **Header** (`Header.tsx`) – Marketing header/hero with navigation, CTAs, and feature cards ready for landing pages.

Compose them with Tailwind utilities or the provided helper classes to keep spacing, radii, and focus states consistent.

## Accessibility Checklist

- Minimum contrast ratios: body text ≥ 4.5:1, large headings ≥ 3:1, buttons and badges tested for WCAG AA compliance.
- Focus styles: 2 px brand-colored outline + soft glow via `--shadow-focus` on focus-visible states.
- Hit targets: All primary actions and nav items are at least 44×44 px.
- Reduced motion: Animations respect `prefers-reduced-motion` and fall back to near-zero durations.

## Implementation Tips

1. Import `tokens.css` and `theme.css` into any global stylesheet before Tailwind layers.
2. Use the Tailwind semantic colors (`bg-brand-50`, `text-text-muted`, etc.) instead of raw hex values.
3. Prefer the provided `LogoPrimary`/`LogoMark` components over embedding the SVGs directly to maintain spacing rules.
4. When adding new components, rely on `.card`, `.btn`, and `.input-base` utility classes or wrap them with the exported UI
   primitives to stay on-brand.
5. Validate pages with `npm run lint` and manual contrast checks when introducing new backgrounds or typography.

For questions or updates to the brand system, document changes in this file so future contributors inherit the latest guidance.
