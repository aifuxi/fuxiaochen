import Link from "next/link";
import { Github, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { WEBSITE, SOURCE_CODE_GITHUB_PAGE } from "@/constants/info";

export function Header() {
  return (
    <header
      className={`
        fixed top-0 right-0 left-0 z-50 px-4 py-4
        md:px-8
      `}
    >
      <nav className="glass-panel mx-auto flex max-w-7xl items-center justify-between rounded-full px-6 py-3 shadow-md">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight"
        >
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[var(--accent-color)] to-purple-600 shadow-lg" />
          <span>{WEBSITE}</span>
        </Link>

        {/* Desktop Navigation */}
        <div
          className={`
            hidden items-center gap-8 text-sm font-medium text-[var(--text-color-secondary)]
            md:flex
          `}
        >
          <Link
            href="/"
            className={`
              transition-colors
              hover:text-[var(--accent-color)]
            `}
          >
            首页
          </Link>
          <Link
            href="/blog"
            className={`
              transition-colors
              hover:text-[var(--accent-color)]
            `}
          >
            博客
          </Link>
          <Link
            href="/about"
            className={`
              transition-colors
              hover:text-[var(--accent-color)]
            `}
          >
            关于我
          </Link>
          <Link
            href="/changelog"
            className={`
              transition-colors
              hover:text-[var(--accent-color)]
            `}
          >
            更新日志
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link href="/admin" aria-label="Admin">
            <Button
              variant="glass"
              size="sm"
              className="h-9 w-9 rounded-full p-0"
            >
              <LayoutDashboard className="h-5 w-5" />
            </Button>
          </Link>

          <ThemeToggle
            className={`
              hidden
              sm:flex
            `}
          />

          <Link
            href={SOURCE_CODE_GITHUB_PAGE}
            target="_blank"
            aria-label="GitHub"
          >
            <Button
              variant="glass"
              size="sm"
              className="h-9 w-9 rounded-full p-0"
            >
              <Github className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}
