# Layout Components

---

## Root Layout — `app/layout.tsx`

```tsx
import type { Metadata } from "next";
import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Toaster } from "sonner";
import { ModalProvider } from "@/components/modal-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { NICKNAME, SLOGAN, WEBSITE } from "@/constants/info";
import { isProduction } from "@/lib/env";
import "@/styles/global.css";

export const metadata: Metadata = {
  title: { template: `%s | ${WEBSITE}`, default: WEBSITE },
  description: SLOGAN,
  keywords: NICKNAME,
};

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 1.0,
  minimumScale: 1.0,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        {isProduction() && process.env.NEXT_PUBLIC_GOOGLE_SEARCH_CONSOLE_CONTENT && (
          <meta name="google-site-verification" content={process.env.NEXT_PUBLIC_GOOGLE_SEARCH_CONSOLE_CONTENT} />
        )}
      </head>
      <body
        className={`
          bg-[var(--bg-color)] text-[var(--text-color)] antialiased
          selection:bg-[var(--accent-color)] selection:text-primary-foreground
          ${isProduction() ? "" : "debug-screens"}
        `}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ModalProvider>{children}</ModalProvider>
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
      {isProduction() && process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID} />
      )}
      {isProduction() && process.env.NEXT_PUBLIC_UMAMI_URL && process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
        <Script id="umami" src={process.env.NEXT_PUBLIC_UMAMI_URL} async data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID} />
      )}
    </html>
  );
}
```

**Notes:**
- Wraps with `ThemeProvider` (next-themes, dark mode via class)
- `ModalProvider` wraps entire app for NiceModal
- `Toaster` (sonner) fixed at top-center
- Google Analytics + umami analytics (production only)

---

## Site Layout — `app/(site)/layout.tsx`

```tsx
import { BackToTop } from "@/components/ui/back-to-top";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export default function PortalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Header />
      {children}
      <Footer />
      <BackToTop />
    </>
  );
}
```

**Structure:** Sticky header → page content → footer → back-to-top button

---

## Admin Layout — `app/(admin)/layout.tsx`

```tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "./admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="bg-bg flex min-h-screen font-sans text-foreground">
      <AdminSidebar
        user={{
          name: session.user.name,
          role: session.user.role ?? 2,
          image: session.user.image,
        }}
      />
      {/* Main Content */}
      <main className="ml-64 flex-1">
        <div className="p-8">
          <div className="min-h-[calc(100vh-8rem)]">{children}</div>
        </div>
      </main>
    </div>
  );
}
```

**Notes:** Server component that checks auth; redirects to `/login` if no session. Sidebar is fixed w-64, main content has ml-64.

---

## Header — `components/layout/header.tsx`

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/blog", label: "博客" },
  { href: "/about", label: "关于" },
  { href: "/changelog", label: "更新日志" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className={`
        sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl
        supports-[backdrop-filter]:bg-background/60
      `}
    >
      {/* Decorative top gradient line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2 text-xl font-bold tracking-tight text-foreground transition-opacity duration-200 hover:opacity-80">
          <img src="/images/logo.svg" alt="Logo" className="h-8 w-8 transition-transform duration-300 group-hover:scale-105" />
          <span className="hidden sm:block">付小晨</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
                {isActive && <span className="absolute inset-x-2 -bottom-1 h-0.5 rounded-full bg-primary" />}
              </Link>
            );
          })}
        </div>

        {/* Right: admin link + theme toggle + mobile menu */}
        <div className="flex items-center gap-2">
          <Link href="/admin" className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground active:scale-95" target="_blank" aria-label="后台管理">
            <LayoutDashboard className="h-5 w-5" />
          </Link>
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground md:hidden"
            aria-label="切换菜单"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu (animated height transition) */}
      <div className={cn(
        "overflow-hidden border-t border-border/50 bg-muted/95 backdrop-blur-xl transition-all duration-300 ease-in-out md:hidden",
        mobileMenuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0",
      )}>
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "rounded-xl px-4 py-3 text-base font-medium transition-colors duration-200",
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
```

**Key features:**
- Sticky, z-50, glassmorphism bg (`bg-background/80 backdrop-blur-xl`)
- Active nav item shows bottom underline indicator (h-0.5 bg-primary)
- Mobile hamburger menu with animated max-height transition
- Max width: `max-w-6xl`
- Height: `h-16`

---

## Footer — `components/layout/footer.tsx`

```tsx
import Link from "next/link";
import { Github, Mail } from "lucide-react";
import { WEBSITE, BEI_AN_NUMBER, BEI_AN_LINK, GONG_AN_NUMBER, GONG_AN_LINK, SLOGAN } from "@/constants/info";

const footerLinks = [
  { href: "/", label: "首页" },
  { href: "/blog", label: "博客" },
  { href: "/about", label: "关于" },
  { href: "/changelog", label: "更新日志" },
];

const socialLinks = [
  { href: "https://github.com/aifuxi/fuxiaochen", icon: Github, label: "GitHub" },
  { href: "mailto:aifuxi.js@gmail.com", icon: Mail, label: "邮箱" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-20 border-t border-border/50 bg-muted/50">
      {/* Decorative gradient */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-primary/5 to-transparent" />

      <div className="relative mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between md:gap-12">
          {/* Left: brand + social */}
          <div className="flex flex-col items-center gap-4 md:items-start">
            <Link href="/" className="group flex items-center gap-2 text-xl font-bold tracking-tight">
              <img src="/images/logo.svg" alt="Logo" className="h-8 w-8 transition-transform duration-300 group-hover:scale-105" />
              <span>{WEBSITE}</span>
            </Link>
            <p className="max-w-xs text-center text-sm text-muted-foreground md:text-left">{SLOGAN}</p>
            <div className="flex items-center gap-3">
              {socialLinks.map((item) => (
                <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground transition-all duration-200 hover:border-primary/30 hover:text-primary"
                  aria-label={item.label}>
                  <item.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Right: nav links + ICP */}
          <div className="flex flex-col items-center gap-6 md:items-end">
            <div className="flex flex-wrap items-center justify-center gap-6">
              {footerLinks.map((item) => (
                <Link key={item.href} href={item.href} className="text-sm text-muted-foreground transition-colors duration-200 hover:text-primary">
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground md:flex-row md:gap-4">
              <span>© {currentYear} {WEBSITE}</span>
              <a href={BEI_AN_LINK} target="_blank" rel="noopener noreferrer" className="transition-colors duration-200 hover:text-primary">{BEI_AN_NUMBER}</a>
              <a href={GONG_AN_LINK} target="_blank" rel="noopener noreferrer" className="transition-colors duration-200 hover:text-primary">{GONG_AN_NUMBER}</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

**Key features:**
- `mt-20 border-t border-border/50 bg-muted/50`
- Two-column layout on md+: brand+social left, nav+ICP right
- Social icons as rounded-full bordered buttons
- ICP/公安备案 links
- Max width: `max-w-6xl`

---

## Admin Sidebar — `app/(admin)/admin-sidebar.tsx`

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock9, FileText, FolderTree, LayoutDashboard, Tag, Users } from "lucide-react";
import { WEBSITE } from "@/constants/info";
import { cn } from "@/lib/utils";
import { UserNav } from "./user-nav";

const navItems = [
  { href: "/admin", label: "仪表盘", icon: LayoutDashboard },
  { href: "/admin/categories", label: "分类管理", icon: FolderTree },
  { href: "/admin/tags", label: "标签管理", icon: Tag },
  { href: "/admin/blogs", label: "博客管理", icon: FileText },
  { href: "/admin/changelogs", label: "更新日志", icon: Clock9 },
  { href: "/admin/users", label: "用户管理", icon: Users },
];

interface AdminSidebarProps {
  user: {
    name: string;
    role: number; // 1: admin, 2: normal
    image?: string | null;
  };
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-muted">
      {/* Logo header */}
      <div className="flex h-16 items-center border-b border-border px-6">
        <Link href="/" target="_blank" className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
          <img src="/images/logo.svg" alt="Logo" className="h-6 w-6" />
          <span className="text-primary">{WEBSITE}</span>
          后台管理
        </Link>
      </div>

      {/* Nav items */}
      <nav className="space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ease-in-out",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <item.icon className={`h-5 w-5 transition-transform ${isActive ? "scale-100" : "group-hover:scale-105"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User nav at bottom */}
      <div className="absolute bottom-0 w-full border-t border-border p-4">
        <UserNav user={user} />
      </div>
    </aside>
  );
}
```

**Key features:**
- Fixed sidebar: `fixed inset-y-0 left-0 z-50 w-64`
- `bg-muted` background, `border-r border-border`
- Active nav: `bg-primary text-primary-foreground`
- Inactive nav: `text-muted-foreground hover:bg-accent hover:text-foreground`
- `UserNav` pinned to bottom with user avatar + logout

---

## Admin User Nav — `app/(admin)/user-nav.tsx`

```tsx
"use client";
// Shows user avatar, name, role badge
// Logout button opens AlertDialog confirmation
// bg-muted border rounded-lg p-3 flex items-center gap-3
interface UserNavProps {
  user: { name: string; role: number; image?: string | null }
}
```
