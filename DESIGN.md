# Design System Strategy: The Technical Monolith

## 1. Overview & Creative North Star

**Creative North Star: "The Technical Monolith"**

This design system is a study in precision, engineered to feel like a high-end physical instrument. Inspired by the brutalist efficiency of Vercel and the atmospheric depth of Linear, it rejects the "bubbly" consumer web in favor of a sharp, editorial aesthetic.

We break the "standard template" look through **Extreme Precision**. By utilizing a strict `0px` border-radius and a pure black foundation, we create a layout that feels carved rather than rendered. The system moves away from traditional structural lines, relying instead on intentional asymmetry, massive shifts in typographic scale, and the sophisticated layering of dark tones to guide the user’s eye through technical complexity.

---

## 2. Colors: Tonal Depth & The "No-Line" Rule

The palette is rooted in the void. We use `#131313` (Surface) and `#0e0e0e` (Surface Container Lowest) to create a canvas where content doesn't just sit—it emerges.

- **Primary & Accents:** Our primary teal (`#486e6f`) and muted red accents (`#dd9999`) are used sparingly to denote state and intent, never for decoration.

- **The "No-Line" Rule:** To achieve a premium, seamless feel, 1px solid borders for sectioning are strictly prohibited. Boundaries must be defined through background color shifts. For example, a `surface-container-low` section should sit against a `surface` background to create a "ledge" rather than a "fence."

- **Surface Hierarchy & Nesting:** Treat the UI as a series of physical layers.
  - _Level 0:_ `surface_container_lowest` (#0e0e0e) for the deep background.

  - _Level 1:_ `surface_container` (#1f1f1f) for main content blocks.

  - _Level 2:_ `surface_container_high` (#2a2a2a) for interactive elements and floating menus.

- **The Glass & Gradient Rule:** To soften the sharp edges, use backdrop blurs on `surface_container_highest` with 60% opacity. For primary CTAs, use a subtle linear gradient from `primary` (#a6cecf) to `primary_container` (#486e6f) at a 135-degree angle to provide "visual soul."

---

## 3. Typography: Editorial Rigor

The typography is centered on **Inter** (and **Geist** for mono/technical accents), optimized for both English and high-density Chinese characters.

- **The Scale:** We utilize a high-contrast scale. `display-lg` (3.5rem) is used for hero statements to create an "authoritative" presence, while `body-sm` (0.75rem) provides the technical detail.

- **Hierarchy as Identity:**
  - **Headlines:** Heavy weight, tight letter spacing (-0.02em), and `on_surface` color for maximum impact.

  - **Body:** Medium weight, increased line-height (1.6) using `on_surface_variant` (#c0c8c8) to reduce eye fatigue against the black background.

  - **Chinese Support:** When rendering Simplified/Traditional Chinese, ensure `font-optical-sizing: auto` is enabled and use a fallback to _PingFang SC_. The density of Chinese characters requires 10% more line-height than English counterparts.

---

## 4. Elevation & Depth: Tonal Layering

In this system, depth is a function of light, not structure.

- **The Layering Principle:** Depth is achieved by "stacking" tones. Place a `surface_container_lowest` card on a `surface_container_low` section to create a recessed effect. This "inset" look feels more technical and precise than a traditional "raised" shadow.

- **Ambient Shadows:** If an element must float (e.g., a dropdown), use an extra-diffused shadow.
  - _Spec:_ `0px 20px 50px rgba(0, 0, 0, 0.5)`. The shadow must never be gray; it must be a deeper black, effectively "occluding" the background light.

- **The "Ghost Border" Fallback:** For high-density data where tonal shifts aren't enough, use a Ghost Border. This is an `outline_variant` (#414848) at 15% opacity. It should be felt, not seen.

- **Glassmorphism:** Use `backdrop-filter: blur(12px)` on navigation bars and floating panels. This allows the primary teal and accent reds to bleed through subtly as the user scrolls, creating a sense of environmental light.

---

## 5. Components: Sharp-Edge Primitives

### Buttons

- **Primary:** Sharp corners (`0px`), background `primary_container`, text `on_primary_container`. Hover state: shift background to `primary`.

- **Tertiary:** No background or border. `label-md` uppercase typography with 1px letter spacing.

### Input Fields

- **Style:** `surface_container_lowest` background with a bottom-only Ghost Border.

- **Focus State:** The bottom border transforms into a 2px solid `primary` (#486e6f). No "glow" or outer rings.

### Code Snippets

- **Container:** `surface_container_highest` (#353535) background.

- **Syntax Highlighting:** Use high-contrast tokens. Comments in `outline` (#8a9292), keywords in `secondary` (#fcb4b4), and strings in `primary` (#a6cecf).

### Cards & Lists

- **Forbid Dividers:** Do not use horizontal rules (`

`). Use 48px or 64px of vertical whitespace to separate list items or subtle background shifts on hover.

- **The "Monolith" Card:** A card should have no border. It is simply a block of `surface_container` that provides a safe harbor for text against the pure black background.

---

## 6. Do's and Don'ts

### Do

- **Do** embrace the void. Use `#000000` (Surface Lowest) to let content breathe.

- **Do** use asymmetrical layouts (e.g., a left-aligned headline with a right-aligned body block) to create a custom, high-end editorial feel.

- **Do** ensure that all interactive states (hover/active) are snappy (150ms ease-out) to match the high-tech persona.

### Don't

- **Don't** use border-radius. Every corner in this system must be a sharp 90-degree angle.

- **Don't** use pure white text. Use `on_surface` (#e2e2e2) or `on_surface_variant` (#c0c8c8) to prevent "halidom" (the blurring of white text on black screens).

- **Don't** use standard "drop shadows." If it doesn't look like a physical object in a dark room, the shadow is too heavy.
