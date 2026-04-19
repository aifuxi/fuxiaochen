# Admin Shell Redesign Design

Date: 2026-04-19

## Summary

This spec defines the redesign of the entire `/admin` area to match the information architecture and interaction model of the provided admin reference while preserving the current project's design system.

The redesign covers:

- `/admin` dashboard
- `/admin/posts`
- `/admin/categories`
- `/admin/tags`
- `/admin/changelog`

The new admin experience will introduce:

- a shared admin shell with fixed sidebar and top toolbar
- resource list pages centered around searchable, filterable, paginated tables
- create and edit flows inside right-side drawers
- resource-level configuration for columns, filters, copy, and form rendering

The redesign will keep the current project's visual language:

- existing dark surfaces and contrast levels
- current radius, border, and spacing rhythm
- current typography and interaction tone

The reference layout is used as a structural target, not as a separate design system to copy verbatim.

## Goals

- Rebuild the entire `/admin` area around one consistent shell and page template.
- Closely follow the reference page's layout pattern: sidebar, top toolbar, table-first content area, filters, and pagination.
- Preserve the current project's design tokens and visual conventions instead of importing a foreign visual system.
- Replace the current split list/editor layout with table pages and drawer-based create/edit flows.
- Make search, filters, sorting, and pagination real working behavior.
- Keep resource-specific complexity isolated to configuration and form modules.

## Non-Goals

- Introducing a rich text editor.
- Adding batch actions, bulk delete, or advanced multi-select workflows.
- Adding role-based permissions or authentication changes.
- Adding custom saved views, column drag-and-drop, or user-specific layout preferences.
- Redesigning non-admin pages.

## Confirmed Product Decisions

- Scope covers the full `/admin` area, not just the admin landing page.
- Visual direction is a close structural recreation of the reference admin.
- Design implementation must follow the current project's design system.
- Resource pages use table-first layouts with drawer-based create/edit flows.
- Search, filters, sorting, and pagination must be functional in this round.
- Text content editing uses plain `textarea` fields, not a rich text editor.

## Current Problems

The existing admin implementation has three structural limits:

1. `/admin` behaves as a lightweight navigation hub instead of a real operations dashboard.
2. Resource pages use a split list/editor layout that does not scale well once records, filters, and actions grow.
3. Data loading is centered around fetching all resources up front, which blocks true pagination and resource-specific query state.

These constraints make the current admin suitable for low-volume manual editing, but not for the table-centric management workflow implied by the reference.

## Proposed Architecture

The redesign will split the admin into stable layout primitives and resource-driven configuration.

```text
app/admin/
  layout.tsx
  page.tsx
  posts/page.tsx
  categories/page.tsx
  tags/page.tsx
  changelog/page.tsx

components/admin/
  admin-shell.tsx
  admin-sidebar.tsx
  admin-toolbar.tsx
  admin-dashboard-view.tsx
  admin-resource-table-page.tsx
  admin-data-table.tsx
  admin-filter-bar.tsx
  admin-pagination.tsx
  admin-resource-drawer.tsx
  admin-empty-state.tsx
  admin-feedback-banner.tsx
  resource-config.tsx
  resource-forms/
    blog-form.tsx
    category-form.tsx
    tag-form.tsx
    changelog-form.tsx
```

## Shell Design

### Shared Admin Shell

All admin routes will render inside one shared shell with three fixed zones:

- left sidebar
- top toolbar
- content canvas

The shell must be visually much closer to the reference than the current implementation, but still use the project's existing tokens from `styles/global.css`.

### Sidebar

The sidebar will be fixed and persistent across all admin routes.

It will include:

- grouped navigation sections
- current route highlight state
- a bottom profile/account block

The grouping and layout rhythm will resemble the reference. The actual labels will stay aligned with this project's admin information architecture.

### Top Toolbar

The toolbar will be shared across admin routes and act as the working header of the console.

It will include:

- a global admin search entry point
- current page context
- shared utility actions
- account/settings affordances

This replaces the current lightweight admin nav bar with a more operational control surface.

## Page Types

### Dashboard Page

`/admin` becomes a real dashboard instead of a navigation-only landing page.

The page will include:

- resource count cards
- quick links to the four managed resources

This round limits the dashboard to counts and quick navigation. Recent activity is explicitly out of scope for the first implementation.

### Resource Table Pages

Each resource page will share the same page skeleton:

- page heading and supporting description
- primary action button
- search and filter bar
- sortable data table
- pagination controls
- right-side drawer for create/edit

Resource-specific behavior will come from configuration, not page-specific ad hoc layout code.

## Interaction Model

### Table-First Workflow

The primary interaction is record management from a table, not editing from a side-by-side form page.

The default workflow becomes:

1. open a resource page
2. search, filter, sort, or paginate
3. open a row in a drawer
4. edit and save
5. refresh the current table context without losing query state

### Drawer Workflow

Create and edit actions both use the same right-side drawer component.

The drawer must support:

- explicit "new" and "edit" modes
- fixed action area for save and delete
- close controls
- dirty-state awareness before dismissing unsaved changes

The drawer is the editing surface. Resource pages should not navigate away to dedicated edit screens in this redesign.

### Feedback States

The new admin must expose clearer system feedback than the current implementation.

Required states:

- initial loading
- table refresh pending state
- empty resource state
- empty search result state
- save success
- delete success
- request failure

These states must feel native to the current project instead of looking like pasted-in admin kit defaults.

## Data and State Model

### Query State

Each resource page will own explicit list state for:

- search term
- filters
- sort key and direction
- page number
- page size

This state should be synchronized to URL query parameters where practical so refresh and navigation preserve the current list view.

### Data Loading

The current `fetchDashboardData()` pattern is not suitable for real pagination.

The redesign will shift resource pages to on-demand list fetching. Each resource page should request only the data it needs for the current table state.

The dashboard can still use a lightweight aggregate fetch if that remains the simplest approach.

### Refresh Behavior

After create, edit, or delete:

- the current list query state must be preserved
- the table should refetch using the active query state
- the user should remain on the same resource page without a hard reset

## Resource Configuration

Each managed resource will expose a configuration object that defines:

- page title and copy
- columns
- searchable fields
- filters
- default sort
- drawer labels
- form renderer

This keeps the admin scalable without over-generalizing the actual form field logic.

## Resource-Specific Requirements

### Posts

This is the most feature-rich resource page and should feel closest to the provided reference.

Table columns:

- `Title`
- `Slug`
- `Category`
- `Status`
- `Featured`
- `Published At`
- `Updated At`

Functional filters:

- keyword search over title and slug
- published status
- category
- featured flag

Drawer fields:

- title
- slug
- description
- cover
- content
- category
- tags
- published
- publishedAt
- featured

Important constraint:

- `content` remains a plain `textarea`
- this round must not introduce a rich text editor

### Categories

This page stays intentionally lightweight.

Table columns:

- `Name`
- `Slug`
- `Description`
- `Updated At`

Functional controls:

- keyword search over name and slug
- default sorting

Drawer fields:

- name
- slug
- description

### Tags

This page mirrors categories in complexity and keeps the interaction compact.

Table columns:

- `Name`
- `Slug`
- `Description`
- `Updated At`

Functional controls:

- keyword search over name and slug
- default sorting

Drawer fields:

- name
- slug
- description

### Changelog

This page sits between lightweight metadata editing and long-form text entry.

Table columns:

- `Version`
- `Release Date`
- `Content Preview`
- `Updated At`

Functional controls:

- keyword search over version
- release date sorting

Drawer fields:

- version
- releaseDate
- content

The `content` field also remains a plain `textarea`.

## Visual System Constraints

The redesign must continue using the project's current design language.

Must preserve:

- current dark neutral base
- existing teal brand accent behavior
- current border softness and panel hierarchy
- current rounded geometry
- current typographic feel

Must avoid:

- introducing the reference page's exact token palette
- bolting on a separate design system just for admin
- using a generic admin UI kit look that breaks site cohesion

In short: the structure should feel like the reference, while the surfaces and motion still feel like this repository.

## Implementation Notes

### Component Strategy

The redesign should favor composable modules with narrow responsibilities:

- shell components handle layout chrome
- resource page components handle list orchestration
- configuration defines page-specific structure
- resource forms handle input details

This avoids rebuilding the current coupling in a new shape.

### Table and Drawer Utilities

If reusable primitives such as table headers, filter chips, pagination controls, or drawer wrappers are missing, they should be introduced inside the admin module rather than scattered across pages.

### Form Inputs

Current simple form controls can be reused where possible, but they should be restyled or wrapped to fit the new console layout. Long text fields should use `textarea`.

## Error Handling

The redesign should treat failures as first-class states.

Requirements:

- request failures must render visible, local feedback
- drawer submission errors must stay attached to the drawer context
- empty data state and empty filtered-result state must be distinct
- loading states should not visually jump the whole layout

## Testing Strategy

This redesign needs behavior-focused coverage rather than broad snapshot-only testing.

The first implementation should cover:

- admin routes render inside the shared shell
- resource pages render the correct table configuration
- query-state changes trigger updated list requests
- drawer create and edit flows render the right forms
- save and delete flows keep resource list context stable

Visual polish can be verified manually, but the interaction model needs automated confidence.

## Delivery Phasing

Recommended implementation order:

1. build the shared shell
2. convert `/admin` dashboard
3. build the generic resource table page
4. migrate `Posts`
5. migrate `Categories`
6. migrate `Tags`
7. migrate `Changelog`
8. add focused tests for shell and resource flows

This order keeps the highest-risk structural work first and lets the simpler resources reuse patterns validated by `Posts`.

## Open Decisions Already Resolved

- Use the full admin-area scope: yes.
- Follow the reference layout closely: yes.
- Keep the current project design system: yes.
- Use drawer-based editing: yes.
- Make search, filters, sorting, and pagination real: yes.
- Use plain `textarea` instead of a rich text editor: yes.
