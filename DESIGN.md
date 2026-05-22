# cineCircle — Design System & Screen Specs

> **This document is a complete design reference** for implementing the cineCircle app UI in a React codebase. A working HTML prototype (`cineCircle.html`) is included for visual reference — do not copy it directly; instead recreate each screen using your project's component patterns and the spec below.

---

## Fidelity

**High-fidelity.** All colors, typography, spacing, border radii, shadows, and interactions are specified precisely. Recreate pixel-accurately.

---

## Design Tokens

### Colors

```ts
// tokens/colors.ts
export const colors = {
  // Backgrounds — layered dark surfaces
  bg: '#0d0d10', // page background  (CSS: --color-dark → bg-dark)
  bg1: '#121217', // slightly lifted surface (design intent — used inline as bg-white/3 etc.)
  bg2: '#18181f', // card / input background (CSS: --color-bg2 → bg-bg2)
  bg3: '#21212a', // elevated element (hover state bg, chips) (CSS: --color-bg3 → bg-bg3)

  // Borders
  border: 'rgba(255,255,255,0.07)', // default subtle border (used inline as border-white/[0.07])
  border2: 'rgba(255,255,255,0.12)', // slightly more visible border (used inline)

  // Text
  text: '#ece9e3', // primary text (CSS: --color-primary → text-primary)
  muted: 'rgba(236,233,227,0.75)', // secondary text (CSS: --color-secondary → text-secondary)
  dim: 'rgba(236,233,227,0.50)', // tertiary / label text (CSS: --color-dim → text-dim)

  // Accent — pastel mint
  mint: 'oklch(82% 0.10 165)', // ~#a8e6cf (CSS: --color-mint → text-mint / bg-mint)
  mintBg: 'oklch(82% 0.10 165 / 0.12)', // mint tint background (used inline)
  mintGlow: 'oklch(82% 0.10 165 / 0.20)', // mint glow overlay (used inline)

  // Rating stars
  amber: 'oklch(76% 0.14 80)', // ~#e8c547 (used via Tailwind built-in: text-amber-400)

  // Glass / overlay (used inline as bg-white/X or backdrop-filter utilities)
  glass: 'rgba(13,13,16,0.70)',
  glassHi: 'rgba(255,255,255,0.04)',
};
```

> **Token notes:**
>
> - Named CSS variables (`--color-*`) are defined in `src/globals.css` and generate Tailwind utilities directly (e.g. `text-primary`, `bg-mint`).
> - Design values without a named token (`bg1`, `border`, `mintBg`, `glass`, `amber`, etc.) are applied as inline Tailwind opacity utilities: `bg-white/[0.07]`, `border-white/12`, `bg-white/4`, `text-amber-400`, etc.

### Typography

```ts
// Google Fonts:
// "DM Sans" (300/400/500/600 + italic 300/400)
// "DM Serif Display" (regular + italic)
// "DM Mono" (400/500)

export const fonts = {
  sans: "'DM Sans', sans-serif",
  serif: "'DM Serif Display', serif",
  mono: "'DM Mono', monospace",
};

export const type = {
  heroTitle: {
    fontFamily: fonts.serif,
    fontSize: 'clamp(42px, 5.5vw, 72px)',
    fontWeight: 400,
    letterSpacing: '-0.03em',
    lineHeight: 0.95,
  },
  searchHero: {
    fontFamily: fonts.serif,
    fontSize: 52,
    fontWeight: 400,
    letterSpacing: '-0.03em',
    lineHeight: 0.95,
  },
  sectionTitle: {
    fontFamily: fonts.serif,
    fontSize: 48,
    fontWeight: 400,
    letterSpacing: '-0.03em',
    lineHeight: 0.95,
  },
  loginTitle: {
    fontFamily: fonts.serif,
    fontSize: 36,
    fontWeight: 400,
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
  },
  body: { fontFamily: fonts.sans, fontSize: 14, fontWeight: 400 },
  bodySmall: { fontFamily: fonts.sans, fontSize: 13, fontWeight: 400 },
  label: {
    fontFamily: fonts.mono,
    fontSize: 10,
    fontWeight: 400,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
  },
  labelSm: {
    fontFamily: fonts.mono,
    fontSize: 9,
    fontWeight: 400,
    letterSpacing: '0.20em',
    textTransform: 'uppercase',
  },
  navItem: {
    fontFamily: fonts.sans,
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: '0.02em',
  },
  btnLabel: {
    fontFamily: fonts.sans,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.08em',
  },
};
```

### Spacing & Layout

```ts
export const layout = {
  topBarHeight: 56,
  pagePadH: 48, // horizontal page padding
  gap_sm: 8,
  gap_md: 12,
  gap_lg: 20,
  gap_xl: 32,
};
```

### Border Radius

```ts
export const radius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 999,
};
```

### Shadows

```ts
export const shadows = {
  poster: '0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.07)',
  stacked: '0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)',
};
```

### Animations

```ts
export const motion = {
  fadeUp: 'opacity 0→1 + translateY 18px→0, 500ms cubic-bezier(.22,.68,0,1.2)',
  fadeIn: 'opacity 0→1, 400ms ease',
  cardHover: 'translateY(-5px), 220ms cubic-bezier(.22,.68,0,1.2)',
};
```

---

## Shared Components

### TopBar

- `position: absolute`, `top: 0`, full width, `height: 56px`, `z-index: 50`, transparent background
- Left: Logo (26px) + "cineCircle" wordmark `DM Mono 13px / weight 500 / tracking 0.05em`
- Right: "Search" + "Collection" pill nav buttons, `1px` separator, avatar button (32×32px circle)
- Active nav: `background: rgba(255,255,255,0.04)` + `border: 1px solid rgba(255,255,255,0.12)`

### CinematicPoster (poster placeholder)

Each movie has a unique color that drives the gradient:

- Background: `linear-gradient(160deg, {color}ee 0%, {color}66 45%, #0d0d10 100%)`
- Top fade overlay: `linear-gradient(to bottom, rgba(0,0,0,0.25), transparent)`, height 50%
- Bottom content: genre label `DM Mono 8px mint tracking 0.15em`, title `DM Serif Display 14px`, year `DM Mono 8px dim`
- Default size: `width: 100%`, `aspect-ratio: 2/3`

### StarRating

- 5 SVG polygon stars, 26px hit area
- Filled: amber `oklch(76% 0.14 80)`, empty: `rgba(255,255,255,0.10)`
- Interactive: hover preview, click to set, `scale(0.82)` press
- **Only shown after user adds movie to collection**

### MovieCard (collection grid)

- Full column width, `aspect-ratio: 2/3`, `border-radius: 12px`
- Border: `1px solid rgba(255,255,255,0.07)`, hover: mint
- Hover: `translateY(-5px)` + bottom gradient + "VIEW →" mint label
- Below: title `DM Sans 11px / weight 500`, year `10px dim`, optional stars

---

## Screen 1 — Login

**Layout:** Two-column flex, full viewport (`position: fixed; inset: 0`)

### Left column (50%)

- `background: #0d0d10`
- Grid texture: `repeating-linear-gradient` at `48px` intervals, `rgba(255,255,255,0.07)`, `opacity: 0.4`
- Mint radial glow at bottom: `480px`, `oklch(82% 0.10 165 / 0.10)`
- Logo `top: 28px / left: 24px`
- Form (max-width 360px, vertically centered):
  - Heading: `"Welcome"` + newline + `<em color:mint>back.</em>` — DM Serif Display 36px
  - Subtext: `"Sign in to your collection"` — 13px muted
  - Inputs: `height 46px`, `border-radius 12px`, `bg2` bg, focus: mint border + `bg3` bg
  - Labels: DM Mono 10px uppercase dim, `margin-bottom 8px`
  - SIGN IN button: `height 48px`, `border-radius 12px`, mint bg, bg text, hover `opacity 0.82`

### Right column (flex: 1)

- `background: #0d0d10`
- `3×2 CSS grid` of CinematicPoster tiles, `gap: 3px`, fills entire column
- Each tile: `width/height: 100%`, `border-radius: 0`
- Gradient overlays:
  - Right-to-left: `rgba(13,13,16,0.92) → transparent` at 40%
  - Top/bottom vignette
- Bottom-right label: "FILM" DM Serif Display 28px / opacity 0.12 + "TRACK · RATE · SHARE" mono 9px mint / opacity 0.7

---

## Screen 2 — Search / Home

**Layout:** Full viewport flex column. TopBar (absolute) + hero + bottom strip.

### Ambient background (absolute, inset 0)

Three radial gradient blobs from movie colors:

- Blob 1: `top: -30%, left: -5%`, `60% × 130%`, movie[0].color, `blur: 55px`, `opacity: 0.35`
- Blob 2: `top: 10%, right: -10%`, `50% × 80%`, movie[6].color, `blur: 55px`, `opacity: 0.25`
- Blob 3: `bottom: -20%, left: 30%`, `40% × 80%`, mint `oklch(82% 0.10 165 / 0.15)`, `blur: 40px`

### Ghost watermark (absolute, centered)

- "FILM" — DM Serif Display `28vw`, `color: rgba(255,255,255,0.02)`, `letter-spacing: -0.05em`

### Hero content (flex 1, centered)

- Heading: `"What will you"` + `<em color:mint>watch next?</em>` — DM Serif Display 52px, `line-height: 0.95`
- Sub: `"Search any title to add it to your circle"` — 13px muted, centered

### Search bar (max-width 640px)

- `bg1` → `bg2` on focus, `border: 1px solid` (mint on focus), `border-radius: 16px`, `padding: 6px 6px 6px 20px`
- Focus glow: `box-shadow: 0 0 0 3px oklch(82% 0.10 165 / 0.12)`
- Filter chips: "All" / "Movies" / "Series" — active: mint bg; inactive: transparent

### Recently Watched strip (bottom, `padding: 0 48px 32px`)

- Label "RECENTLY WATCHED" DM Mono 9px dim + "SEE ALL →" mint
- Horizontal scroll of `110×165px` CinematicPoster cards, `border-radius: 10px`, `gap: 12px`

---

## Screen 3 — Collection

**Layout:** Full viewport flex column.

### Ambient glow

Two radial blobs from first two visible movie colors, `opacity: 0.12`, `blur: 80px`

### Header (`padding: 72px 48px 20px`)

Left:

- Eyebrow: "MY COLLECTION" — DM Mono 9px mint, tracking 0.2em
- Title: "Watched" (mint italic) or "To Watch" — DM Serif Display 48px, `letter-spacing: -0.03em`
- Count: "N TITLES" — DM Mono 12px dim

Right:

- Filter input: `bg2`, `border`, `border-radius: 10px`
- Tab toggle: active = mint bg; inactive = transparent
- `(count label removed from right — shown under heading)`

### Movie Grid

- CSS Grid: `repeat(6, 1fr)` gap `20px` (poster mode) / `repeat(8, 1fr)` gap `14px` (compact)
- Cards: `MovieCard` component, full column width, aspect-ratio 2/3

---

## Screen 4 — Movie Detail

**Layout:** Full viewport. `position: fixed; inset: 0`

### Cinematic backdrop (2 layers, z-index 0)

1. `radial-gradient(ellipse at 25% 35%, {movie.color} 0%, {movie.color}55 35%, #0d0d10 68%)`
2. `radial-gradient(ellipse at 75% 65%, {movie.color}33 0%, transparent 55%)`

### Vignette overlays (z-index 1)

- Bottom: `linear-gradient(to bottom, rgba(13,13,16,0.55) 0%, rgba(13,13,16,0.1) 40%, rgba(13,13,16,0.75) 100%)`
- Right: `linear-gradient(to right, transparent 35%, rgba(13,13,16,0.72) 100%)`

### Main layout (top: 56px → bottom: 0, flex row)

**Left (40%)**

- Centered, `padding: 32px 16px 32px 64px`
- CinematicPoster: `width: min(100%, 340px)`, `aspect-ratio: 2/3`
- Container: `border-radius: 16px`, `box-shadow: 0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.07)`, `transform: rotate(-1.5deg)`

**Right (flex: 1)**

- `padding: 32px 80px 32px 40px`, centered vertically

Content order:

1. `← BACK TO COLLECTION` — DM Mono 10px dim, hover: mint
2. Genre eyebrow — DM Mono 10px mint, tracking 0.22em
3. **Title** — DM Serif Display `clamp(42px, 5.5vw, 72px)`, `line-height: 0.95`
4. Meta — "DIR." mono label + director + dot + year
5. Mint divider — `48px × 1px`, opacity 0.6
6. **Star rating** — only when `hasBeenAdded === true`
7. **Action buttons** — "I WANT TO WATCH" / "I WATCHED"
   - Active: mint bg + bg text
   - Inactive: `rgba(255,255,255,0.06)` + `backdrop-filter: blur(8px)`
   - Clicking sets `watchState` and reveals rating + notes
8. **Note textarea** — only when `hasBeenAdded === true`

---
