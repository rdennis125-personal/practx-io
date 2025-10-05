
# Practx Brand Styles (extracted)

Generated from `practxbrandguide20250921.pdf` + `logo-primary-2025-09-21.png`.
Primary font detected: **DM Sans**. Include via Google Fonts or self-host.

## Files
- `design/tokens.json` — design tokens (colors, type, spacing, shadows).
- `styles/brand.css` — CSS variables + component primitives (buttons, inputs, cards, alerts, navbar).
- `practx-tailwind.config.js` — Tailwind adapter to map variables to utilities.

## Accessibility Notes
- Primary buttons use `--color-primary-700` to ensure **WCAG AA** contrast for white text.
- Accent (orange) buttons use **dark text** because this tone is light; white-on-orange would fail AA.
- If you need orange with white text, use `--color-accent-800` or place text on dark overlays.

## Usage (plain HTML)
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles/brand.css">

<nav class="navbar">
  <div class="navbar__brand"><img src="/logo.svg" alt="" height="24"> Practx</div>
  <div>
    <a class="navbar__link" href="#">Products</a>
    <a class="navbar__link" href="#">Pricing</a>
    <a class="navbar__link" href="#">Docs</a>
  </div>
</nav>

<section class="card">
  <h2>Welcome to Practx</h2>
  <p class="text-muted">Access above all. Empowering smiles. Building community.</p>
  <div style="display:flex; gap:12px; margin-top:16px;">
    <button class="btn btn--primary">Get Started</button>
    <button class="btn btn--accent">Learn More</button>
    <button class="btn btn--ghost">Contact</button>
  </div>
</section>
```

## Usage (Tailwind)
- Add the variables by importing `styles/brand.css` globally.
- Replace your `tailwind.config.js` with `practx-tailwind.config.js` or merge entries.

## Next Steps
- If your guide includes additional tones (success, info, backgrounds), send them and we’ll extend `tokens.json`.
- If you have dark mode, we can add a `[data-theme="dark"]` block with adjusted tokens.
