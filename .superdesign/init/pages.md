# Pages — Dependency Trees

---

## Home Page — `app/(site)/page.tsx`

**URL:** `/`

### Dependency Tree

```
app/(site)/page.tsx
├── next/link
├── next/image
├── @/app/actions/blog (getBlogsAction)
├── @/app/actions/category (getCategoriesAction)
├── @/components/ui/card (Card)
└── lucide-react (ArrowRight, Calendar, Clock, Sparkles)
```

### Sections (all defined inline in page.tsx)

1. **`Hero`** — Full-height section with gradient orbs, large headline, CTA buttons
2. **`FeaturedPosts`** — Async server component, fetches 4 latest blogs
   - First post: large aspect-ratio card with cover image overlay
   - Rest: grid of smaller cards with category/date meta
3. **`CategoryNav`** — Async, fetches categories, pill buttons linking to `/blog?categoryId=`
4. **`BottomCTA`** — Gradient section with "浏览全部文章" button

### Key page structure

```tsx
<div className="mx-auto max-w-5xl px-4">
  <Hero />
  <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
  <FeaturedPosts />   {/* async */}
  <CategoryNav />     {/* async */}
  <BottomCTA />
</div>
```

---

## Blog Listing Page — `app/(site)/blog/page.tsx`

**URL:** `/blog`

### Dependency Tree

```
app/(site)/blog/page.tsx
├── react (Suspense)
├── @/app/actions/blog (getBlogsAction)
├── @/app/actions/category (getCategoriesAction)
├── @/app/actions/tag (getTagsAction)
├── @/components/blog/blog-filter-bar (BlogFilterBar)
│   ├── react (useRouter, useSearchParams, useCallback, useRef, useState)
│   └── @/components/ui/select (Select, SelectContent, SelectItem, SelectTrigger, SelectValue)
├── @/components/blog/blog-list (BlogList)
│   ├── @/components/blog/blog-card (BlogCard)
│   │   ├── next/image
│   │   ├── next/link
│   │   ├── @/components/ui/badge (Badge)
│   │   └── @/components/ui/card (Card)
│   ├── @/components/ui/pagination (Pagination, PaginationContent, PaginationItem,
│   │                               PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis)
│   └── @/components/ui/empty (Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription)
├── lucide-react (Loader2)
├── @/types/category
└── @/types/tag
```

### Key page structure

```tsx
// Wrapped in Suspense with Loader2 spinner fallback
<BlogListContent searchParams={searchParams}>
  <Hero categories tags currentFilters />   {/* inline: gradient bg, filter bar */}
  <div className="mx-auto max-w-4xl px-4 pb-16">
    <BlogList blogs total currentPage pageSize baseUrl />
  </div>
</BlogListContent>
```

### `BlogFilterBar` features
- Search input (rounded-2xl, icon left, clear button right)
- Category pill buttons (active = bg-primary)
- Tag pill buttons (active = bg-primary)
- Sort Select dropdown (最新/最早发布/更新)
- Reset button

### `BlogCard` layout
- Horizontal card: cover image (w-40 h-40) left, content right
- Title (line-clamp-1), description (line-clamp-2), category badge, tag badges, date

---

## Blog Detail Page — `app/(site)/blog/[slug]/page.tsx`

**URL:** `/blog/[slug]`

### Dependency Tree

```
app/(site)/blog/[slug]/page.tsx
├── next/navigation (notFound)
├── next/link
├── next/image
├── @/app/actions/blog (getBlogBySlugAction)
├── @/components/blog/blog-content (BlogContent)
│   ├── @bytemd/react (Viewer)
│   ├── @bytemd/plugin-gfm
│   ├── @bytemd/plugin-breaks
│   ├── @bytemd/plugin-highlight-ssr
│   ├── @bytemd/plugin-medium-zoom
│   ├── @/components/blog/plugin-copy-code (custom)
│   └── @/components/blog/plugin-headings (custom)
├── @/components/blog/table-of-contents (TableOfContents)
├── @/components/ui/badge (Badge)
└── @/lib/time (formatSimpleDate)
```

### Page layout

```tsx
<div className="mx-auto max-w-5xl px-4 py-12">
  <Link href="/blog">← 返回博客列表</Link>

  <div className="flex gap-8">
    {/* Main article */}
    <article className="min-w-0 flex-1">
      {/* Cover image: aspect-video */}
      {/* Header: title, date, category badge, reading time */}
      <div className="h-px bg-border" />
      <BlogContent content={blog.content} />  {/* ByteMD Viewer */}
      {/* Tags: Badge variant="outline" */}
    </article>

    {/* Sidebar TOC (lg only) */}
    <aside className="hidden w-64 shrink-0 lg:block">
      <TableOfContents />
    </aside>
  </div>
</div>
```

### `BlogContent`
- Renders `<Viewer>` from ByteMD with plugins
- Wrapped in `<div className="blog-prose mx-auto w-full">`

---

## Admin Dashboard — `app/(admin)/admin/page.tsx`

**URL:** `/admin`

### Dependency Tree

```
app/(admin)/admin/page.tsx
├── next/link
├── lucide-react (ArrowRight, FileText, FolderTree, Tag, Users)
├── @/app/actions/dashboard (getDashboardStatsAction)
├── @/components/ui/badge (Badge)
├── @/components/ui/button (Button)
├── @/components/ui/card (CardContent, CardHeader, CardTitle)
├── @/components/ui/glass-card (GlassCard)
├── @/components/ui/table (Table, TableBody, TableCell, TableHead, TableHeader, TableRow)
└── @/lib/time (formatSimpleDateWithTime)
```

### Page structure

```tsx
<div className="space-y-8">
  <h2>仪表盘</h2>

  {/* Stats grid: 4 columns on lg */}
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
    {stats.map(stat => (
      <Link href={stat.href}>
        <GlassCard>
          <CardHeader> {stat.icon} {stat.title} </CardHeader>
          <CardContent> {stat.value} </CardContent>
        </GlassCard>
      </Link>
    ))}
  </div>

  {/* Recent blogs table */}
  <GlassCard className="p-6">
    <div> "最新文章" + "查看全部" button </div>
    <Table>
      <TableHeader> 标题 / 分类 / 标签 / 发布状态 / 创建时间 </TableHeader>
      <TableBody>
        {recentBlogs.map(blog => (
          <TableRow>
            <TableCell>{blog.title}</TableCell>
            <TableCell><Badge variant="outline">{category}</Badge></TableCell>
            <TableCell>{tags}</TableCell>
            <TableCell><Badge>{已发布/草稿}</Badge></TableCell>
            <TableCell>{date}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </GlassCard>
</div>
```

**Stats tracked:** 总文章数 (+ 已发布), 分类总数, 标签总数, 用户总数

---

## About Page — `app/(site)/about/page.tsx`

**URL:** `/about`

### Dependency Tree

```
app/(site)/about/page.tsx
├── next/link
├── @/components/ui/card (Card)
└── (all inline — no external component imports)
```

### Sections (all inline in page.tsx)

1. **`Hero`** — Animated ping dot "前端开发工程师", large name heading, tech stack pills (React, Go, Tailwind with skill-icons)
2. **`Skills`** — Grid of 15 skill icons (3-6 cols) with hover scale, uses Iconify `icon-[skill-icons--xxx]` classes
3. **`Devices`** — Two featured device cards (MacBook, MSI), other devices as pills
4. **`BottomCTA`** — Gradient section → link to /blog

### Key layout

```tsx
<div className="mx-auto max-w-5xl px-4">
  <Hero />
  <Skills />
  <Devices />
  <BottomCTA />
</div>
```

---

## Login Page — `app/(site)/login/page.tsx`

**URL:** `/login`

### Dependency Tree

```
app/(site)/login/page.tsx (client component)
├── react (useState)
├── lucide-react (ArrowRight, Github, Loader2, Mail, Sparkles)
├── sonner (toast)
├── @/components/ui/button (Button)
├── @/components/ui/input (Input)
└── @/lib/auth-client (authClient)
```

### Page structure

```tsx
<main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-20">
  {/* 4 radial gradient orbs (blue, purple, teal, orange) */}
  {/* Noise texture overlay */}

  <div className="relative z-10 w-full max-w-105">
    {/* Badge: "安全认证" */}
    {/* Title: "欢迎回来" or "创建账号" */}

    {/* Glass card */}
    <div className="rounded-3xl border border-white/10 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-white/5 dark:bg-white/5">
      <form onSubmit={handleEmailSignIn}>
        {/* Name field (animated show/hide for signup) */}
        {/* Email input */}
        {/* Password input */}
        {/* Submit button: h-12, rounded-xl */}
      </form>

      {/* Divider: "或" */}

      {/* GitHub OAuth button */}
      {/* Toggle signup/signin link */}
    </div>

    {/* Footer: "继续即表示您同意我们的服务条款和隐私政策" */}
  </div>
</main>
```

### Features
- Toggle between sign-in / sign-up (animated grid-rows transition for name field)
- Email + password auth via `authClient.signIn.email` / `authClient.signUp.email`
- GitHub OAuth via `authClient.signIn.social({ provider: "github" })`
- Redirects to `/admin` on success
