# Extractable Layout Components

These are the main layout/navigation components that can be reused or extracted.

---

## Header

**Source:** `/components/layout/header.tsx`

**Description:** Sticky top navigation bar with glassmorphism effect. Shows site logo, desktop nav links with active indicator, admin link, theme toggle button, and mobile hamburger menu with animated slide-down.

**Props:** None (all data is hardcoded — navItems array, logo path)

**Extractable Props:**
```tsx
interface HeaderProps {
  logo?: { src: string; alt: string; label: string };
  navItems?: { href: string; label: string }[];
  adminHref?: string;
  showThemeToggle?: boolean;
}
```

**Visual characteristics:**
- Height: `h-16`
- Background: `bg-background/80 backdrop-blur-xl` (glassmorphism)
- Border: `border-b border-border/50`
- Position: `sticky top-0 z-50`
- Max width: `max-w-6xl mx-auto`
- Decorative top gradient line: `h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent`
- Active nav: bottom underline `h-0.5 rounded-full bg-primary`
- Mobile menu: animated max-height transition (`max-h-80` when open, `max-h-0` when closed)

---

## Footer

**Source:** `/components/layout/footer.tsx`

**Description:** Two-column footer with brand info (logo, slogan, social icons) on the left and navigation links + ICP/public security registration numbers on the right.

**Props:** None (all data from `@/constants/info`)

**Extractable Props:**
```tsx
interface FooterProps {
  brand?: {
    logo?: string;
    name: string;
    slogan: string;
  };
  navLinks?: { href: string; label: string }[];
  socialLinks?: { href: string; icon: React.ComponentType; label: string }[];
  copyright?: {
    year?: number;
    siteName: string;
    icpNumber?: string;
    icpLink?: string;
    gonganNumber?: string;
    gonganLink?: string;
  };
}
```

**Visual characteristics:**
- Background: `bg-muted/50 border-t border-border/50 mt-20`
- Decorative bottom gradient: `h-32 bg-gradient-to-t from-primary/5 to-transparent`
- Max width: `max-w-6xl mx-auto`
- Padding: `py-12 md:py-16`
- Social icons: `rounded-full border border-border bg-muted h-9 w-9`
- Responsive: stacked on mobile, side-by-side on md+

---

## AdminSidebar

**Source:** `/app/(admin)/admin-sidebar.tsx`

**Description:** Fixed left sidebar for the admin area. Shows site logo/name, navigation items with icon + label, and a user profile panel pinned to the bottom.

**Props:**
```tsx
interface AdminSidebarProps {
  user: {
    name: string;
    role: number; // 1: admin, 2: normal
    image?: string | null;
  };
}
```

**Extractable Props (if generalized):**
```tsx
interface AdminSidebarProps {
  logo?: { src: string; href: string; name: string };
  navItems?: { href: string; label: string; icon: React.ComponentType }[];
  user: { name: string; role: number; image?: string | null };
  onLogout?: () => void;
}
```

**Visual characteristics:**
- Position: `fixed inset-y-0 left-0 z-50`
- Width: `w-64`
- Background: `bg-muted`
- Border: `border-r border-border`
- Header: `h-16 border-b border-border px-6` — logo + site name
- Nav items: `rounded-xl px-4 py-3` with icon (h-5 w-5) + label
- Active item: `bg-primary text-primary-foreground shadow-sm`
- Inactive item: `text-muted-foreground hover:bg-accent hover:text-foreground`
- User panel: absolute bottom, `border-t border-border p-4`

---

## UserNav

**Source:** `/app/(admin)/user-nav.tsx`

**Description:** User profile panel shown at the bottom of the admin sidebar. Displays avatar (image or placeholder), name, role label, and a logout button that opens an AlertDialog confirmation.

**Props:**
```tsx
interface UserNavProps {
  user: {
    name: string;
    role: number; // 1: admin → "Admin", 2: normal → "Normal"
    image?: string | null;
  };
}
```

**Visual characteristics:**
- Container: `flex items-center gap-3 rounded-lg border border-border bg-muted p-3`
- Avatar: `h-10 w-10 rounded-full bg-primary/10 p-0.5`
- Name: `text-sm font-semibold text-foreground truncate`
- Role: `text-xs text-muted-foreground truncate`
- Logout button: `Button variant="ghost" size="icon"` with `LogOut` icon

---

## BackToTop

**Source:** `/components/ui/back-to-top.tsx`

**Description:** Fixed bottom-right floating button that appears after 300px scroll. Smooth scrolls to top on click with hover lift animation.

**Props:** None (behavior is self-contained)

**Extractable Props:**
```tsx
interface BackToTopProps {
  threshold?: number;        // default: 300 (px scroll threshold)
  position?: string;         // default: "right-8 bottom-8"
}
```

**Visual characteristics:**
- Position: `fixed right-8 bottom-8 z-40`
- Shape: `rounded-full h-12 w-12`
- Background: `bg-muted border border-border`
- Hover: `hover:-translate-y-1 hover:shadow-lg`
- Hidden state: `opacity-0 translate-y-10 pointer-events-none`
- Visible state: `opacity-100 translate-y-0`
- Icon: `ArrowUp h-5 w-5 text-foreground`

---

## ThemeToggle

**Source:** `components/theme-toggle.tsx` (referenced but not read in detail)

**Description:** Button that toggles between light/dark/system theme via next-themes. Used in the Header.

**Extractable Props:**
```tsx
interface ThemeToggleProps {
  size?: "sm" | "default";
  className?: string;
}
```

---

## BlogFilterBar

**Source:** `/components/blog/blog-filter-bar.tsx`

**Description:** Full-width filter bar for the blog listing page. Contains search input, category pills, tag pills, sort dropdown, and reset button. Syncs state with URL search params.

**Props:**
```tsx
interface BlogFilterBarProps {
  categories: Category[];
  tags: Tag[];
  currentFilters: {
    title?: string;
    categoryId?: string;
    tagId?: string;
    sortBy?: "createdAt" | "updatedAt";
    order?: "asc" | "desc";
  };
}
```

**Visual characteristics:**
- Search: `rounded-2xl border border-border bg-muted/50 py-4 px-12 text-base focus:ring-4 focus:ring-primary/20`
- Category/tag pills: `rounded-full px-4 py-2 text-sm` — active: `bg-primary text-primary-foreground`
- Sort select: `rounded-full w-36 border-border bg-muted/50`

---

## BlogCard

**Source:** `/components/blog/blog-card.tsx`

**Description:** Horizontal blog card with optional cover image, title, description, category/tag badges, and date.

**Props:**
```tsx
interface BlogCardProps {
  blog: Blog; // { id, slug, title, description, cover, category, tags, createdAt }
}
```

**Visual characteristics:**
- Card: `rounded-2xl p-0 overflow-hidden hover:-translate-y-0.5 hover:shadow-lg`
- Layout: horizontal flex with cover image (shrink-0 w-40 h-40) + content area
- Title: `line-clamp-1 text-lg font-semibold group-hover:text-primary`
- Description: `line-clamp-2 text-sm text-muted-foreground`
- Category: `Badge variant="secondary"`
- Tags: `Badge variant="outline"`

---

## TableOfContents

**Source:** `/components/blog/table-of-contents.tsx`

**Description:** Floating sidebar table of contents for blog detail pages. Shown as `hidden lg:block` sidebar (w-64).

**Props:** None (reads headings from DOM)

---

## ModalProvider

**Source:** `components/modal-provider.tsx` (referenced, not read in detail)

**Description:** NiceModal provider wrapping the entire app. Enables `NiceModal.show(Component, props)` pattern for dialogs.

**Usage in layout:**
```tsx
<ModalProvider>{children}</ModalProvider>
```
