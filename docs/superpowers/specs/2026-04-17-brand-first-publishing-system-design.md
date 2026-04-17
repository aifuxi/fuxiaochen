# Brand-First Publishing System Design

**Date:** 2026-04-17
**Status:** Approved in conversation, pending written-spec review
**Project:** `fuxiaochen`

## 1. Context

The current product uses an Apple-inspired visual language across both the public
site and the admin console. That system is built around gradients, glassmorphism,
accent colors, thick soft shadows, and light/dark theme switching. It conflicts
directly with the design direction defined in `DESIGN.md`, which calls for a
strict Uber-inspired black-and-white system with pill controls, compact layouts,
bold typography, and minimal visual decoration.

This redesign is not a skin swap. The project will abandon the current UI and
design rules, then rebuild the shared component system, the public site, and the
admin console under one new visual and structural system.

## 2. Product Direction

### Core Positioning

The redesigned product should behave as a **brand-first personal publishing
system**:

- The public site introduces the person first, then routes visitors into writing.
- The blog is the main content destination, but it does not replace the role of
  the homepage.
- The admin console is a single-user content publishing tool, not a general
  multi-user SaaS admin.

### Chosen Direction

The approved top-level direction is:

- **A. Brand-First Publishing System**

This direction was chosen over a more editorial publication model and a more
experimental "personal operating system" model because it best matches the
desired outcome:

- establish who the owner is before asking visitors to read,
- keep writing as the main content product,
- keep admin scope focused and controllable,
- enable phased implementation without turning the project into a CMS rebuild.

## 3. Approved Scope

### Public Navigation

The top-level public modules that must exist are:

- `首页`
- `博客`
- `关于我`
- `更新日志`

### Admin Scope

The admin console is for content publishing only. The core modules are:

- `仪表盘`
- `博客管理`
- `分类管理`
- `标签管理`
- `更新日志管理`

`用户管理` is not part of the redesign target. Authentication remains only as
the login gate for a single-user admin experience.

### Theme Model

The new system is **single-theme only**:

- no theme toggle,
- no full dark mode variant,
- white pages as the default surface,
- black sections used intentionally for contrast and emphasis.

## 4. Goals And Non-Goals

### Goals

- Replace the current Apple-like design system with the black/white Uber-inspired
  language from `DESIGN.md`.
- Rebuild public and admin surfaces so they feel like one brand.
- Make the homepage primarily about identity and positioning.
- Make the blog the main content destination and archive.
- Keep the admin console efficient, compact, and centered on publishing.
- Allow a limited amount of new UX and content modules where they strengthen the
  product direction.

### Non-Goals

- Building a fully configurable CMS for all public copy and layout.
- Preserving the current visual language in any major way.
- Maintaining a full multi-user admin workflow.
- Adding new top-level public sections such as projects, labs, services, or
  newsletters in this redesign.
- Introducing gradients, glass effects, large color accents, or a second design
  language for admin.

## 5. Information Architecture

### Public Site Structure

#### Homepage

The homepage is a branded entry point, not a general content index. It should
answer "who is this person and why should I keep reading?" before asking the
visitor to browse articles.

Required homepage sections:

1. **Brand Hero**
   - identity label,
   - strong headline,
   - concise value proposition,
   - primary CTA to `博客`,
   - secondary CTA to `关于我`.
2. **Featured Writing**
   - one lead article,
   - two to four secondary article entries.
3. **Latest Writing**
   - recent posts to reinforce ongoing activity.
4. **About Snapshot**
   - short, high-signal summary of background, focus, and strengths.
5. **Recent Changelog**
   - latest product/site updates to signal that the site is actively maintained.

#### Blog

The blog is the content discovery and archive center.

Required structure:

- intro/header section,
- category and tag pill navigation,
- featured article slot,
- article list / archive stream,
- search,
- sorting,
- pagination,
- redesigned empty and no-result states.

The blog remains based on the current `Blog`, `Category`, and `Tag` data model.

#### About

The about page is a full personal profile page, not a loose collection of cards.

Required sections:

- intro hero,
- what I do,
- background / journey,
- tech stack,
- work style / interests,
- external links.

#### Changelog

The changelog remains intentionally lightweight, but it should read as a proper
timeline page inside the same brand system.

Required structure:

- page intro,
- reverse-chronological update timeline,
- consistent version/date/content presentation,
- strong rhythm and readability.

### Admin Structure

The admin console is a single-user publishing desk. It should feel related to
the public site, but with denser layouts and stronger utility.

Required modules:

- dashboard,
- blog management,
- category management,
- tag management,
- changelog management.

Optional additions allowed within scope:

- quick actions on the dashboard,
- a limited "featured content" or homepage recommendation workflow,
- small workflow improvements for continuing drafts and publishing updates.

## 6. Design System Direction

### Visual Language

The redesign adopts the `DESIGN.md` visual rules:

- true black `#000000`,
- pure white `#ffffff`,
- minimal grayscale supporting roles,
- flat surfaces,
- extremely restrained shadows,
- pill controls with `999px` radius,
- compact and information-dense layouts,
- bold heading hierarchy,
- no gradients.

The intended feel is:

- confident,
- controlled,
- efficient,
- high-contrast,
- human but not playful.

### Typography

The system should approximate the `UberMove` / `UberMoveText` split defined in
`DESIGN.md`:

- stronger geometric sans-serif styling for headings,
- pragmatic UI/body font for content, controls, and data.

Typography principles:

- headlines carry most of the visual weight,
- body text stays stable and readable,
- hierarchy comes from size and weight more than color,
- no decorative letter-spacing or ornamental display treatments.

### Tokens

The new token system should be rebuilt around:

- black,
- white,
- gray text tiers,
- chip/background grays,
- border black,
- low-opacity black shadows,
- minimal semantic status colors only where operationally useful.

The current accent-driven system should be removed as a primary visual driver.

### Radius

The radius scale should center on:

- `8px` and `12px` for cards, inputs, and containers,
- `999px` for buttons, pills, chips, and similar interactive controls.

### Elevation

Use only low-opacity black shadows. No heavy shadow stacks, glows, or soft
Apple-style depth treatment.

### Public And Admin Relationship

Public and admin surfaces must share the same visual DNA:

- same core tokens,
- same button/chip language,
- same typographic logic,
- same contrast philosophy.

They may differ in density and structure, but not in brand identity.

## 7. Shared Component Strategy

The redesign requires rebuilding the shared UI layer rather than lightly editing
the current one.

Core component families that must be redesigned:

- `Button`
- `Input`
- `Textarea`
- `Select`
- `Checkbox`
- `Radio`
- `Card`
- `Badge`
- `Chip / Filter Pill`
- `Table / DataTable`
- `Pagination`
- `Dialog`
- `AlertDialog`
- `Drawer / Sheet`
- `Empty`
- `Error`
- `Skeleton`

Components or patterns expected to be removed or replaced:

- `theme-toggle`,
- `glass-card`,
- old gradient-heavy or accent-heavy surface treatments,
- page-level visual hacks that bypass shared component rules.

The `ui-preview` route should become the acceptance surface for the rebuilt
design system rather than a showcase for the old one.

## 8. Page-Level Redesign Rules

### Homepage Rules

- Must lead with identity before content.
- Must direct primary attention toward reading, not toward generic exploration.
- Must avoid becoming a noisy "everything page."
- Must keep modules disciplined and limited in number.

Allowed new additions:

- featured writing logic,
- stronger content-distribution modules,
- tighter personal brand snapshot modules.

Not allowed in this phase:

- a large experiments/projects section as a top-level homepage pillar,
- social-feed style modules,
- newsletter-heavy growth mechanics.

### Blog Rules

- Must feel like a browsing environment, not just a filtered CRUD list.
- Must use pill-shaped category/tag controls in the new visual language.
- Must keep discovery features bounded to what current content models can
  support.

Allowed additions:

- featured post treatment,
- stronger metadata presentation,
- more visible category/tag navigation.

Not allowed in this phase:

- topic hubs requiring new editorial structures,
- series systems,
- algorithmic recommendation systems.

### About Rules

- Must present a coherent personal narrative.
- May reuse current information categories such as skills, devices, links, and
  background material.
- Must not preserve the current Apple-style presentation structure.

### Changelog Rules

- Must remain simple.
- Must become visually integrated with the new system.
- Must support both dedicated page reading and homepage summary usage.

### Admin Rules

- Must serve single-user publishing tasks.
- Must feel more like an editorial control desk than a generic SaaS panel.
- Must remove `用户管理` from the main admin navigation.
- Must support efficient list, form, dialog, and quick-action workflows.

## 9. Content And Data Strategy

### Existing Data To Reuse

The current schema already provides the minimum content backbone for the first
phase of the redesign:

- `Blog`
- `Category`
- `Tag`
- `Changelog`

### Minimal Extension Policy

The redesign should avoid turning into a full CMS project.

Recommended content strategy:

- keep `关于我` content locally configured first,
- generate homepage featured-content behavior from existing blog data where
  possible,
- defer broad site-copy editability to a later phase.

### Future-Friendly Extension

It is acceptable to reserve room for a minimal site-content configuration model
later, especially for:

- homepage hero copy,
- homepage featured content slots,
- short personal-intro content.

That extension should be considered a later phase unless implementation reality
proves it is required immediately.

## 10. Implementation Phasing

This redesign should be delivered in phases rather than page-by-page ad hoc
editing.

### Phase 1: Foundation

- rebuild global tokens and shared page foundations,
- remove the dark/light theme path,
- replace old visual primitives,
- identify components and utilities that must be retired.

### Phase 2: Shared UI System

- rebuild the core shared component library,
- update the design preview route to reflect the new system,
- establish reusable patterns before page-level rewrites.

### Phase 3: Public Site

Recommended order:

1. public layout shell,
2. header,
3. footer,
4. homepage,
5. blog list page,
6. blog detail page,
7. about page,
8. changelog page,
9. login, not-found, and error states.

### Phase 4: Admin Console

Recommended order:

1. admin layout shell,
2. admin navigation,
3. dashboard,
4. blog management,
5. category management,
6. tag management,
7. changelog management.

### Phase 5: Cleanup And Consistency

- remove obsolete components and styles,
- eliminate old Apple-style tokens and page-level leftovers,
- normalize spacing, heading levels, control states, and empty/error patterns,
- verify lint, build, and manual smoke checks.

## 11. Risks

### Risk 1: Page-Level Style Coupling

Many existing pages encode the current design language directly in class names
and layout composition. Replacing the shared components alone will not be enough.

### Risk 2: Shared Component Drift

Because public and admin surfaces share many primitives, weak foundations will
create repeated rework and visual inconsistency.

### Risk 3: CMS Scope Creep

If public copy, homepage structure, and about-page content all become admin
editable during the redesign, the project will expand from UI rebuild into CMS
platform work.

### Risk 4: Mixed-Language UI

Complex surfaces such as blog detail pages, filter bars, data tables, forms, and
dialogs are likely places for old and new design patterns to mix unless they are
reviewed deliberately.

## 12. Acceptance Criteria

The redesign is successful only when all of the following are true:

- The public site and admin console no longer read visually as Apple-inspired
  interfaces.
- The old gradient, glass, accent-heavy, theme-toggle-driven language is gone
  from the primary experience.
- `首页`, `博客`, `关于我`, `更新日志`, and the core admin pages all follow the
  new information architecture and design direction.
- Shared components form one coherent system across public and admin.
- The admin console is clearly centered on single-user publishing workflows.
- The implementation passes `pnpm lint` and `pnpm build`.
- Manual smoke checks confirm that the main public routes and core admin flows
  still function after the redesign.

## 13. Open Constraints Carried Into Planning

These decisions are locked for the implementation plan unless explicitly changed:

- Choose the brand-first publishing direction.
- Keep public navigation limited to `首页 / 博客 / 关于我 / 更新日志`.
- Keep admin focused on content publishing.
- Remove multi-user management from redesign scope.
- Use a single-theme black/white system based on `DESIGN.md`.
- Allow selective new modules, but avoid CMS-scale scope expansion.
