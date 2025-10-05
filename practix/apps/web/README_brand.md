# Practx Brand System

This guide summarizes the Practx brand look and feel implemented in this repository. It covers the design tokens, base
theme, reusable components, and logo usage requirements so you can extend the experience with confidence.

## Design Tokens (`UX/brand.css`)

The DM Sans-based token set now lives in `UX/brand.css` and is imported globally via `app/globals.css`. Tokens cover:

- **Color** – Primary (`--color-primary-*`), accent (`--color-accent-*`), deep navy, and neutral scales with a matching dark
  theme toggled by `[data-theme="dark"]`.
- **Typography** – DM Sans for headings/body (`--font-heading`, `--font-body`) plus the responsive type ramp (`--fs-*`) and
  supporting line heights/weights.
- **Spacing & Radii** – Modular space increments (`--space-*`) and rounded corners (`--radius-*`) tuned for pill badges and
  large cards.
- **Elevation** – Shadow tokens (`--shadow-sm`, `--shadow-md`, `--shadow-xl`) to keep elevations consistent across cards and
  modals.

Consume tokens with `var(--token-name)` or Tailwind shorthands (see below). Never introduce bespoke hex values—reach for the
defined custom properties.

## Base Theme (`app/globals.css`)

`app/globals.css` imports the source-of-truth CSS and layers a few utility classes:

- Global resets, DM Sans font-family application, and light/dark background defaults.
- Utility helpers for stack spacing (`.stack-md`, `.stack-lg`) and component add-ons such as `.btn__spinner`, `.card__header`,
  `.alert__title`, and `.modal__footer`.
- The file is the only place we augment the vendor CSS—avoid duplicating variables in components.

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

## UI Components (`src/ui`)

The new primitives are colocated in `src/ui` and power Storybook/tests:

- **Button** – Primary, accent, and ghost variants with loading state support and spinner helper classes.
- **Input** – Supports text and textarea controls with helper/error messaging and accessible IDs.
- **Card** – Card, header, content, footer, title, and description helpers that wire up the `.card` primitives from the
  stylesheet.
- **Alert** – Info/accent/success/warn/danger callouts with semantic roles.
- **Navbar** – Brand-aligned top navigation with slot-based actions.
- **Tabs** – Keyboard-accessible tablist using the `.tabs__*` CSS primitives.
- **Toast & useToast** – Portal-based notifications with auto-dismiss behavior.
- **Modal** – Accessible dialog with ESC + click-outside dismissal and focus trapping.
- **ThemeToggle** – Client component that calls the shared theme controller.

Tests live beside the components in `src/ui/__tests__` and run with Jest + Testing Library + jest-axe.

## Accessibility Checklist

- Minimum contrast ratios: body text ≥ 4.5:1, large headings ≥ 3:1, buttons and badges tested for WCAG AA compliance.
- Focus styles: 2 px brand-colored outline + soft glow via `--shadow-focus` on focus-visible states.
- Hit targets: All primary actions and nav items are at least 44×44 px.
- Reduced motion: Animations respect `prefers-reduced-motion` and fall back to near-zero durations.

## Implementation Tips

1. Import `UX/brand.css` exactly once (already handled in `app/globals.css`).
2. Use the Tailwind semantic colors (`bg-primary-700`, `text-neutral-600`, etc.) defined in `tailwind.config.ts`—they resolve
   directly to CSS variables.
3. Prefer `@/ui` primitives over bespoke markup to inherit accessibility, focus management, and brand tokens.
4. Run `npm run scan:tokens` after touching legacy areas to locate hard-coded colors/radii/shadows that still require
   migration.
5. Validate pages with `npm test` (component + axe smoke tests) and manual contrast checks when introducing new backgrounds or
   typography.

For questions or updates to the brand system, document changes in this file so future contributors inherit the latest guidance.
