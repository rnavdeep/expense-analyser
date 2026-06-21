# Expense Analyser — Design System

Shared visual language for the redesign. Apply these tokens consistently across
every page so new work matches the mockups in `assets/mockups/`.

## Color tokens

| Token | Value | Usage |
|---|---|---|
| Ink | `#1a1d28` | Nav background, headings, primary buttons |
| Emerald | `#2f9e6f` | CTAs, active links, accents |
| Emerald light | `#6ee7b7` | Eyebrow labels on dark backgrounds |
| Emerald tint | `#ecfdf5` | Icon chips, subtle fills |
| Paper | `#faf9f6` | Page background |
| Surface | `#ffffff` | Cards |
| Border | `#e8e5df` | Card borders, dividers |
| Muted | `#6b7280` | Secondary text |
| Error | `#dc2626` | Error states |
| Success | `#16a34a` | Success states |

## Typography

| Role | Font | Notes |
|---|---|---|
| Display | `Space Grotesk` | Headings, nav, card titles. Weight 600. Letter-spacing `-0.02em`. |
| Body | `Hanken Grotesk` | All body text, buttons. Weights 400–700. |
| Mono | `Space Mono` | Amounts, labels, codes, eyebrow text. |

Load via Google Fonts in `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Hanken+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
```

## CSS variables (`src/assets/base.css` → `:root`)

```css
:root {
  --ea-ink:     #1a1d28;
  --ea-emerald: #2f9e6f;
  --ea-paper:   #faf9f6;
  --ea-surface: #ffffff;
  --ea-border:  #e8e5df;
  --ea-muted:   #6b7280;
  --ea-mono:    'Space Mono', monospace;
  --ea-display: 'Space Grotesk', sans-serif;
}
```

Set `body { font-family: 'Hanken Grotesk', -apple-system, BlinkMacSystemFont, sans-serif; }`.

## Vuetify theme (`src/main.ts`)

Map tokens into the Vuetify `light` theme so `color="primary"` / `color="secondary"`
resolve everywhere without per-component overrides:

- `primary` → `#1a1d28` (ink)
- `secondary` → `#2f9e6f` (emerald)
- `error` → `#dc2626`, `success` → `#16a34a`
- `surface` → `#ffffff`, `background` → `#faf9f6`

Set `defaults` for `VTextField` (outlined, comfortable density, `hideDetails: 'auto'`),
`VBtn` (Hanken Grotesk 700, `text-transform: none`, `rounded: 'lg'`), and
`VCard` (`rounded: 'lg'`, `elevation: 0`). Full snippet in
[redesign-plan-phase-1.md](redesign-plan-phase-1.md) Step 0c.

## Reusable patterns

- **Auth card** (`.login-card`): centered, max-width 460px, white surface, 1px border,
  18px radius, soft shadow, 6px emerald top accent stripe. Reuse for Login and Register.
- **Feature card**: white surface, 1px border, 16px radius, emerald-tint icon chip,
  hover lift (`translateY(-3px)` + shadow).
- **Hero**: ink background, white text, mono eyebrow in emerald light, Space Grotesk
  heading with `clamp()` sizing.
