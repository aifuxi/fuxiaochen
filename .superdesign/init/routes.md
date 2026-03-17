# Routes

This is a Next.js 16 App Router project. Routes are organized into two route groups.

---

## Route Groups

### `(site)` — Public frontend (with Header + Footer layout)
Layout: `app/(site)/layout.tsx` → renders `<Header /> + {children} + <Footer /> + <BackToTop />`

### `(admin)` — Admin backend (with Sidebar layout)
Layout: `app/(admin)/layout.tsx` → requires auth session, renders `<AdminSidebar /> + <main>`

---

## Public Routes `(site)`

| URL | File | Description |
|-----|------|-------------|
| `/` | `app/(site)/page.tsx` | Home page — Hero, FeaturedPosts, CategoryNav, BottomCTA |
| `/blog` | `app/(site)/blog/page.tsx` | Blog listing — Hero with filter, BlogList with pagination |
| `/blog/[slug]` | `app/(site)/blog/[slug]/page.tsx` | Blog detail — article + TableOfContents sidebar |
| `/about` | `app/(site)/about/page.tsx` | About page — Hero, Skills (tech stack), Devices, BottomCTA |
| `/changelog` | `app/(site)/changelog/page.tsx` | Changelog listing page |
| `/login` | `app/(site)/login/page.tsx` | Login/register page — email + GitHub OAuth |
| `/ui-preview` | `app/(site)/ui-preview/page.tsx` | UI component showcase page |
| `*` (404) | `app/(site)/not-found.tsx` | 404 not found page |
| (error) | `app/(site)/error.tsx` | Error boundary page |

---

## Admin Routes `(admin)`

| URL | File | Description |
|-----|------|-------------|
| `/admin` | `app/(admin)/admin/page.tsx` | Dashboard — stats cards, recent blogs table |
| `/admin/blogs` | `app/(admin)/admin/blogs/page.tsx` | Blog list management |
| `/admin/blogs/new` | `app/(admin)/admin/blogs/new/page.tsx` | Create new blog |
| `/admin/blogs/[id]` | `app/(admin)/admin/blogs/[id]/page.tsx` | Edit blog |
| `/admin/categories` | `app/(admin)/admin/categories/page.tsx` | Category management |
| `/admin/tags` | `app/(admin)/admin/tags/page.tsx` | Tag management |
| `/admin/changelogs` | `app/(admin)/admin/changelogs/page.tsx` | Changelog management |
| `/admin/users` | `app/(admin)/admin/users/page.tsx` | User management |

---

## API Routes

| URL | Description |
|-----|-------------|
| `/api/auth/[...all]` | Better Auth handler (GitHub OAuth, email/password) |

---

## App Router File Structure

```
app/
├── layout.tsx                          # Root layout (ThemeProvider, ModalProvider, Toaster)
├── (site)/
│   ├── layout.tsx                      # Site layout (Header + Footer)
│   ├── page.tsx                        # / — Home
│   ├── not-found.tsx
│   ├── error.tsx
│   ├── blog/
│   │   ├── page.tsx                    # /blog
│   │   └── [slug]/
│   │       └── page.tsx                # /blog/[slug]
│   ├── about/
│   │   └── page.tsx                    # /about
│   ├── changelog/
│   │   └── page.tsx                    # /changelog
│   ├── login/
│   │   └── page.tsx                    # /login
│   └── ui-preview/
│       ├── page.tsx
│       └── components/
│           ├── preview-card.tsx
│           ├── section-wrapper.tsx
│           └── previews/
│               ├── button-preview.tsx
│               ├── data-table-preview.tsx
│               ├── dialog-preview.tsx
│               ├── display-preview.tsx
│               ├── form-preview.tsx
│               ├── input-preview.tsx
│               ├── layout-preview.tsx
│               └── typography-preview.tsx
├── (admin)/
│   ├── layout.tsx                      # Admin layout (auth guard + sidebar)
│   ├── admin-sidebar.tsx
│   ├── user-nav.tsx
│   └── admin/
│       ├── page.tsx                    # /admin — Dashboard
│       ├── blogs/
│       │   ├── page.tsx
│       │   ├── new/page.tsx
│       │   ├── [id]/page.tsx
│       │   ├── blog-form.tsx
│       │   ├── blog-list.tsx
│       │   └── delete-alert.tsx
│       ├── categories/
│       │   ├── page.tsx
│       │   ├── category-dialog.tsx
│       │   ├── category-list.tsx
│       │   └── delete-alert.tsx
│       ├── tags/
│       │   ├── page.tsx
│       │   ├── tag-dialog.tsx
│       │   ├── tag-list.tsx
│       │   └── delete-alert.tsx
│       ├── changelogs/
│       │   ├── page.tsx
│       │   ├── changelog-dialog.tsx
│       │   ├── changelog-list.tsx
│       │   └── delete-alert.tsx
│       └── users/
│           ├── page.tsx
│           ├── user-dialog.tsx
│           ├── user-list.tsx
│           └── delete-alert.tsx
└── actions/                            # Server Actions
    ├── blog.ts
    ├── category.ts
    ├── tag.ts
    ├── changelog.ts
    ├── user.ts
    ├── upload.ts
    └── dashboard.ts
```

---

## Search Params

### `/blog`
- `page` — current page number (default: 1)
- `pageSize` — items per page (default: 10)
- `title` — search by title
- `categoryId` — filter by category ID
- `tagId` — filter by tag ID
- `sortBy` — `"createdAt"` | `"updatedAt"` (default: `"createdAt"`)
- `order` — `"asc"` | `"desc"` (default: `"desc"`)

### `/blog/[slug]`
- `slug` — URL-friendly blog identifier

### `/admin/blogs/[id]`
- `id` — blog ID for editing
