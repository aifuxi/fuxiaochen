# Design System — ui-design-guide.md Spec

> Dark-first, minimal tech aesthetic. Reference: Vercel / Linear.
> ALL design decisions follow ui-design-guide.md.

---

## Product Context

A personal tech blog and portfolio site with:
- **Public site**: Home (hero + featured posts), Blog listing, Blog post detail, About, Changelog, Login
- **Admin panel**: Dashboard, Blogs CRUD, Categories, Tags, Users, Changelogs management
- **Tone**: Developer-focused, technical, clean, minimal

---

## Core Design Principles

| Principle | Rule |
|-----------|------|
| **Dark-first** | Default dark mode. Background near-pure black `oklch(0.07 0 0)` |
| **Purple accent** | ALL interactive colors use `hue: 280` purple. No blue, no Bootstrap colors |
| **Mono font identity** | Logo, tags, dates, metadata → `Geist Mono` |
| **Minimal borders** | Low-contrast borders `oklch(0.22)`. Brighten on hover only |
| **Micro-animations** | All interactions 150–350ms, `ease-out` / cubic-bezier |
| **Dot-grid background** | 24px dot pattern + radial gradient mask |

---

## Color System

### Dark Mode (Default)

```css
/* Backgrounds */
--background:          oklch(0.07 0 0);          /* near-pure black */
--background-subtle:   oklch(0.10 0 0);
--background-elevated: oklch(0.12 0.005 280);    /* hover bg, purple tint */

/* Text */
--foreground:          oklch(0.97 0 0);          /* near-white */
--foreground-muted:    oklch(0.55 0 0);          /* secondary text */
--foreground-subtle:   oklch(0.32 0 0);          /* auxiliary text */

/* Cards */
--card:                oklch(0.10 0.005 280);    /* purple-tinted */
--card-hover:          oklch(0.13 0.008 280);

/* Borders */
--border:              oklch(0.22 0.005 280);    /* default border */
--border-subtle:       oklch(0.14 0.003 280);    /* dividers */
--border-hover:        oklch(0.36 0.016 280);    /* hover border */

/* Primary (Purple) */
--primary:             oklch(0.72 0.12 280);     /* bright purple */
--primary-glow:        oklch(0.72 0.12 280 / 0.15);

/* Tags */
--tag-bg:              oklch(0.14 0.008 280);
--tag-fg:              oklch(0.68 0.10 280);
--tag-border:          oklch(0.26 0.014 280);

/* Special */
--nav-blur-bg:         oklch(0.07 0 0 / 0.85);
--code-bg:             oklch(0.11 0.006 280);
--blockquote-border:   oklch(0.72 0.12 280);
--blockquote-bg:       oklch(0.72 0.12 280 / 0.06);
--dot-color:           oklch(0.20 0 0);
```

### Light Mode

```css
--background:          oklch(0.98 0 0);
--background-subtle:   oklch(0.95 0 0);
--background-elevated: oklch(0.93 0.003 280);
--foreground:          oklch(0.10 0 0);
--foreground-muted:    oklch(0.42 0 0);
--foreground-subtle:   oklch(0.62 0 0);
--card:                oklch(1.0 0 0);
--card-hover:          oklch(0.97 0 0);
--border:              oklch(0.86 0.004 280);
--border-subtle:       oklch(0.90 0.002 280);
--border-hover:        oklch(0.70 0.012 280);
--primary:             oklch(0.52 0.14 280);
--primary-glow:        oklch(0.52 0.14 280 / 0.12);
--tag-bg:              oklch(0.94 0.006 280);
--tag-fg:              oklch(0.48 0.12 280);
--tag-border:          oklch(0.84 0.010 280);
```

### Color Rules
- **NEVER use blue** (`#007bff`, `blue-500`, etc.) — all primary = hue:280 purple
- Background layers max 3: `background` → `background-subtle` → `background-elevated`
- Foreground contrast: main >7:1, muted ~4.5:1

---

## Typography

### Font Stack
```css
--font-sans:  'Plus Jakarta Sans', 'DM Sans', system-ui, sans-serif;
--font-mono:  'Geist Mono', 'JetBrains Mono', 'Fira Code', monospace;
--font-serif: 'Lora', 'Playfair Display', Georgia, serif;
```

### Font Size Scale
| Size | px | Usage |
|------|----|-------|
| `0.65rem` | 10.4px | Section labels (all-caps + wide tracking) |
| `0.68rem` | 10.9px | Small tag text |
| `0.72rem` | 11.5px | Dates, metadata, footer |
| `0.75rem` | 12px | Eyebrow labels (all-caps) |
| `0.82rem` | 13px | Small body, supplementary text |
| `0.85–0.9rem` | 13.6–14.4px | Nav links, card subtitles |
| `0.95–1.0rem` | 15.2–16px | List titles, body text |
| `1.35rem` | 21.6px | Article h2 |
| `clamp(1.75rem, 4vw, 2.4rem)` | fluid | Article main title |
| `clamp(2.5rem, 6vw, 3.75rem)` | fluid | Hero headline |

### Font Weight
| Weight | Usage |
|--------|-------|
| 300 | Light body (rare) |
| 400 | Nav links, body |
| 500 | Logo, buttons, tags |
| 600 | Card titles, h3 |
| 700 | Hero title, h1/h2 |

### Letter Spacing
| Context | value |
|---------|-------|
| Hero headline | `-0.04em` |
| Article title | `-0.03em` |
| Nav Logo (Mono) | `-0.02em` |
| Section labels (uppercase) | `+0.10em` |
| Eyebrow (uppercase) | `+0.12em` |

### Line Height
| Context | value |
|---------|-------|
| Hero headline | `1.05` |
| Article title | `1.15` |
| Card title | `1.4` |
| Body | `1.6–1.7` |
| Long-form reading | `1.8` |

---

## Spacing System

Base unit: `4px` (0.25rem)

| Name | rem | px |
|------|-----|----|
| xs | 0.25rem | 4px |
| sm | 0.5rem | 8px |
| md | 0.75rem | 12px |
| lg | 1rem | 16px |
| xl | 1.5rem | 24px |
| 2xl | 2rem | 32px |
| 3xl | 3rem | 48px |

### Layout Widths
| Usage | max-width |
|-------|-----------|
| Blog post / narrow | 720px |
| Article with sidebar | 1100px (body column 680px) |
| Wide / app layout | 1280px |

---

## Border Radius

```css
--radius-sm:   0.25rem;   /* 4px — tags, badges */
--radius:      0.5rem;    /* 8px — buttons, cards, inputs */
--radius-lg:   0.75rem;   /* 12px — large cards, modals */
--radius-full: 9999px;    /* pill buttons, avatars */
```

---

## Shadows

```css
--shadow-xs:         0 1px 2px oklch(0 0 0 / 0.4);
--shadow-sm:         0 2px 8px oklch(0 0 0 / 0.5);
--shadow-md:         0 4px 16px oklch(0 0 0 / 0.6);
--shadow-glow:       0 0 24px oklch(0.72 0.12 280 / 0.12);
--shadow-card-hover: 0 8px 32px oklch(0 0 0 / 0.7),
                     0 0 0 1px oklch(0.72 0.12 280 / 0.10);
```

Rules:
- Default cards: no shadow or `shadow-xs`
- Hover cards: `shadow-card-hover`
- Logo glow dot: `box-shadow: 0 0 8px var(--primary)`
- Progress bar / active indicator: `box-shadow: 0 0 8px var(--primary)`

---

## Background & Texture

### Dot-grid (signature)
```css
body::before {
  background-image: radial-gradient(circle, var(--dot-color) 1px, transparent 1px);
  background-size: 24px 24px;
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
}
body::after {
  background: radial-gradient(ellipse 80% 60% at 50% 0%, transparent 40%, var(--background) 100%);
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
}
nav, main, footer { position: relative; z-index: 1; }
```

### Nav Blur (scroll-triggered)
```css
nav.scrolled {
  background: var(--nav-blur-bg);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-subtle);
}
```

---

## Components

### Navigation Bar
- Fixed top, height 60px
- Logo: Mono font, `font-size: 0.9rem`, `font-weight: 500`, purple pulsing dot
- Nav links: `0.85rem`, `font-weight: 400`, `color: foreground-muted`
- Active: `color: foreground` + bottom dot indicator (`4px × 4px` circle, purple glow)
- Hover: `background: background-elevated`
- CTA button: outlined style (border + foreground-muted text)
- Scroll → frosted glass blur effect

### Buttons
- Base: `border-radius: 0.5rem`, `font-size: 0.875rem`, `font-weight: 500`, `min-height: 2.25rem`
- **Primary**: `bg: primary`, `color: oklch(0.07 0 0)` (dark text on purple)
- **Outline**: transparent + `border: border` + foreground text
- **Ghost**: transparent + foreground-muted text
- Sizes: sm (`min-h: 2rem`), default, lg (`min-h: 2.75rem`), icon (`2.25rem × 2.25rem`)

### Cards
- `background: card`, `border: 1px solid border`, `border-radius: 0.5rem`, `padding: 1.5rem`
- Hover: `translateY(-3px)` + `shadow-card-hover` + `border-color: border-hover`
- Transition: 250ms ease

### Tags / Badges
- Font: Mono, `0.72rem`
- Colors: `tag-bg` / `tag-fg` / `tag-border`
- Hover → purple border + text
- Status badges: red/yellow/green oklch variants

### Form Inputs
- `border: 1px solid border`, `border-radius: 0.5rem`, `font-size: 0.875rem`
- Focus: `border-color: primary` + `0 0 0 3px oklch(0.72 0.12 280 / 0.15)` glow
- Placeholder: `foreground-subtle`

### Blog List Row
- Flex row: date (Mono, 70px min-width) + title/excerpt + arrow
- Border-top between rows (`border-subtle`)
- Hover: `background: card` + left purple bar (2px, `scaleY(0→1)`)
- Arrow slides 3px right on hover

### Article Typography
- Body: Serif font, `1.0rem`, `line-height: 1.8`, `color: foreground-muted`
- h2: Sans font, `1.35rem`, `font-weight: 700`, `letter-spacing: -0.025em`
- h3: Sans font, `1.05rem`, `font-weight: 600`
- Inline code: Mono font, `0.82em`, `background: code-bg`, `color: primary`
- Blockquote: left border 3px primary, `background: blockquote-bg`, italic
- Article layout: 3-column grid (TOC sidebar + 680px body + share sidebar)

### Footer
- `border-top: 1px solid border-subtle`, `padding: 2rem 0`
- Inner: max-width 720px, flex row (copyright left, links right)
- All text: Mono font, `0.72rem`, `color: foreground-subtle`

---

## Animations

### Keyframes
```css
@keyframes fade-up {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(0.75); }
}
```

### Page Load — Hero stagger
```css
.hero-eyebrow { animation: fade-up 0.5s ease-out 0.10s both; }
.hero-name    { animation: fade-up 0.6s ease-out 0.20s both; }
.hero-role    { animation: fade-up 0.6s ease-out 0.35s both; }
.hero-bio     { animation: fade-up 0.6s ease-out 0.45s both; }
.hero-tags    { animation: fade-up 0.6s ease-out 0.55s both; }
article       { animation: fade-up 0.6s ease-out 0.15s both; }
```

### Scroll-triggered (Intersection Observer)
- Elements start: `opacity: 0; transform: translateY(14px)`
- On enter viewport: `opacity: 1; transform: translateY(0)`, transition 450ms ease
- Sibling stagger: 70ms delay per index

### Reading Progress Bar
- `position: fixed; top: 60px; height: 2px; background: primary`
- `box-shadow: 0 0 8px var(--primary)`

### Theme Toggle
- Sun/moon icon rotate + scale, `cubic-bezier(0.34, 1.56, 0.64, 1)`, 350ms

### Timing Reference
| Context | Duration | Easing |
|---------|----------|--------|
| Micro (hover color/border) | 150ms | ease |
| Button / nav link | 150–200ms | ease |
| Card hover (move + shadow) | 250ms | ease |
| Page element entry | 450–600ms | ease-out |
| Sidebar / modal | 350ms | ease-out |
| Theme switch | 350ms | ease |

---

## Responsive Breakpoints

| Breakpoint | Query | Changes |
|-----------|-------|---------|
| Mobile | ≤640px | Hide excerpts, adjust nav padding, single column |
| Tablet | ≤900px | Hide article sidebars, single column |
| Desktop | >900px | Full 3-col layout, multi-col project grid |

---

## Admin Panel Design

For the admin panel, apply the same dark-first design system with:
- Sidebar: `background-subtle` bg, `border-right: 1px solid border`, 240px wide
- Sidebar items: `0.85rem`, `font-weight: 400`, icon + label
- Active sidebar item: `background: background-elevated`, `color: primary`, left border bar
- Content area: white bg (light) / `background` (dark), top padding below header
- Tables: `border: 1px solid border`, rows separated by `border-subtle`
- Stat cards: same card style with purple accent icons
- Form pages: max-width 720px, clean single-column

---

## CDN Dependencies (for design drafts)

```html
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Geist+Mono:wght@300;400;500&family=Lora:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
```

---

## HARD CONSTRAINTS

1. **NO blue primary colors** — all primary = oklch purple hue:280
2. **NO Bootstrap/Tailwind raw colors** — use CSS variables only
3. **Dark mode is default** — `data-theme="dark"` on html
4. **Mono font** for logos, tags, dates, metadata, code
5. **Dot-grid background** is signature — always include it
6. **Cards lift on hover** — `translateY(-3px)` + shadow
7. **Nav blur on scroll** — frosted glass effect
8. **Pulsing dot** in nav logo
