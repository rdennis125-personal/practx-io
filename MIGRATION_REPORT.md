# Practx Brand System Migration Report

## Discovery Summary
- **Application stack:** Next.js 14 (App Router) with TypeScript 5.3, Tailwind CSS 3.4, PostCSS, and ESLint. Package manifest located at `practix/apps/web/package.json`.
- **Entry points:** Global layout defined in `app/layout.tsx` and global stylesheet `app/globals.css`. App router pages live under `app/`.
- **Styling today:** Source-of-truth tokens now live in `UX/brand.css` and are imported once at the app shell. Legacy `src/styles/*` files were removed.
- **Assets:** Brand artifacts located in `UX/` (tokens.json, brand.css, practx-tailwind.config.js, component-gallery.html, README). Gallery replicated to `public/brand-gallery.html` for quick QA.

## Immediate Action Items
1. Wire `UX/brand.css` globally from the app shell and load DM Sans from Google Fonts via `<link>`.
2. Introduce a theme controller utility that hydrates `[data-theme]` with localStorage + prefers-color-scheme fallback.
3. Merge Tailwind adapters from `UX/practx-tailwind.config.js` into the app config without losing existing utilities.
4. Build typed UI primitives in `src/ui` (Button, Input, Card, Alert, Navbar, Tabs, Toast, Modal) powered by the new CSS primitives, with Storybook docs & RTL + axe tests.
5. Create a codemod/report to map legacy hard-coded tokens to the new variables and begin incremental refactors.
6. Publish docs: update root README with brand system usage, place the gallery in `/public`, add “Developer Guide: Using Practx Tokens” to this report.

## Work Status
- [x] Global brand wiring & DM Sans link (inline theme bootstrap script + `<head>` font preload)
- [x] Theme controller + toggle (shared `src/lib/theme-controller.ts` + `ThemeToggle` client component)
- [x] Tailwind config merge (adopted Practx adapter in `tailwind.config.ts`)
- [x] UI primitives & adapters (new `src/ui` suite + alias updates)
- [x] Tabs/Toast/Modal with tests (Jest + RTL + axe integration)
- [x] Hard-coded styles audit & replacements (added `npm run scan:tokens` script; removed legacy token files)
- [ ] Docs (README + Storybook + gallery placement) ← README + MIGRATION updated, gallery copied; Storybook setup still TODO

## Mapping Table (Legacy → Practx tokens)

| Legacy usage | Replacement |
| --- | --- |
| `var(--color-brand-500)` | `var(--color-primary)` |
| `var(--color-brand-700)` | `var(--color-primary-800)` |
| `var(--color-accent)` (legacy) | `var(--color-accent)` (Practx) |
| `var(--color-surface)` | `var(--color-white)` or `var(--color-neutral-100)` depending on depth |
| `var(--color-text)` | `var(--color-neutral-900)` |
| `bg-surface-muted` utility | `bg-[color:var(--color-neutral-100)]` |
| `text-text-muted` utility | `text-neutral-600` |
| `btn--subtle` (legacy) | `btn btn--accent` |

Ambiguities: custom logo gradients remain hard-coded in SVG components and should be evaluated by the brand team before swapping to new variables.

## Tests Added
- Jest + Testing Library coverage for Button, Input, Tabs, Toast, and Modal with `jest-axe` accessibility assertions.
- `npm test` now runs the suite; sample output captured in CI logs.

## Developer Guide: Using Practx Tokens
1. Import `UX/brand.css` exactly once (handled in `app/globals.css`).
2. Consume colors, spacing, radius, and typography via CSS variables or Tailwind aliases—never hard-code hex values.
3. Use `@/ui` primitives to inherit brand classes, focus treatments, and accessibility defaults.
4. Call `ThemeToggle` or `setTheme` from `src/lib/theme-controller` for dark-mode persistence.
5. Run `npm run scan:tokens` after refactors to surface legacy styling hotspots; replace matches with the mapping above.
6. Validate UI with `npm test` and manual WCAG contrast checks before shipping.

## Risks & Next Steps
- **Storybook integration outstanding:** create a brand section and component stories mirroring the new primitives.
- **Legacy pages:** additional feature areas still reference deprecated utilities; follow-up tickets should schedule per-page migrations using the new components.
- **Logos:** evaluate whether logo color constants need to map to the new token palette or remain bespoke.
