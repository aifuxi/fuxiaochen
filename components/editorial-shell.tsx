import Link from "next/link";

import { editorialSite } from "@/lib/content/editorial";
import { cn } from "@/lib/utils";

type CurrentPage = "home" | "posts" | "changelog" | "about";

const navigation = [
  { key: "home", label: "Home", href: "/" },
  { key: "posts", label: "Posts", href: "/posts" },
  { key: "changelog", label: "Changelog", href: "/changelog" },
  { key: "about", label: "About", href: "/about" },
] as const;

const [primarySocial] = editorialSite.socials;

export function EditorialShell({
  children,
  current,
  footerWidth = "measure",
}: {
  children: React.ReactNode;
  current: CurrentPage;
  footerWidth?: "measure" | "page";
}) {
  return (
    <div className="min-h-[100dvh] bg-canvas text-text-strong">
      <SiteHeader current={current} />
      {children}
      <SiteFooter current={current} footerWidth={footerWidth} />
    </div>
  );
}

export function SectionEyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={cn("ui-eyebrow", className)}>{children}</p>;
}

export function MetaText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={cn("ui-meta", className)}>{children}</span>;
}

export function TagPill({
  children,
  href,
}: {
  children: React.ReactNode;
  href?: string;
}) {
  if (href) {
    return (
      <Link href={href} className="ui-tag">
        {children}
      </Link>
    );
  }

  return <span className="ui-tag">{children}</span>;
}

function SiteHeader({ current }: { current: CurrentPage }) {
  return (
    <header className="ui-nav-shell">
      <div className="shell-measure flex items-center justify-between py-4">
        <Link
          href="/"
          className="text-lg font-semibold tracking-[-0.04em] text-white transition-opacity duration-300 hover:opacity-80"
        >
          {editorialSite.title}
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "ui-nav-link",
                current === item.key && "ui-nav-link-active",
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {primarySocial ? (
            <a
              aria-label="View source on GitHub"
              className="ui-icon-button"
              href={primarySocial.href}
              rel="noreferrer"
              target="_blank"
            >
              <GitHubIcon />
            </a>
          ) : null}
          <a
            aria-label="Send email"
            className="ui-icon-button"
            href={`mailto:${editorialSite.email}`}
          >
            <MailIcon />
          </a>
        </div>
      </div>
    </header>
  );
}

function SiteFooter({
  current,
  footerWidth,
}: {
  current: CurrentPage;
  footerWidth: "measure" | "page";
}) {
  const wrapperClass = footerWidth === "page" ? "shell-page" : "shell-measure";

  return (
    <footer className="mt-24 w-full py-12">
      <div className={cn(wrapperClass, "ui-divider pt-8")}>
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <p className="ui-meta text-text-soft">
            © 2024 {editorialSite.title}. Built with quiet authority.
          </p>
          <div className="flex flex-wrap gap-6">
            {navigation.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "ui-meta ui-link",
                  current === item.key ? "text-brand" : "text-text-muted",
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function GitHubIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 2C6.477 2 2 6.589 2 12.248c0 4.525 2.865 8.366 6.839 9.72.5.096.682-.221.682-.494 0-.244-.009-.889-.014-1.744-2.782.616-3.369-1.37-3.369-1.37-.454-1.175-1.108-1.488-1.108-1.488-.907-.637.069-.624.069-.624 1.003.072 1.531 1.053 1.531 1.053.892 1.559 2.341 1.109 2.91.848.091-.664.349-1.109.636-1.364-2.221-.259-4.555-1.136-4.555-5.056 0-1.117.389-2.032 1.029-2.749-.103-.259-.446-1.301.098-2.713 0 0 .84-.276 2.75 1.05A9.31 9.31 0 0 1 12 6.854a9.26 9.26 0 0 1 2.505.349c1.909-1.326 2.748-1.05 2.748-1.05.545 1.412.202 2.454.099 2.713.641.717 1.028 1.632 1.028 2.749 0 3.93-2.338 4.794-4.566 5.048.359.316.678.938.678 1.891 0 1.366-.012 2.469-.012 2.804 0 .275.18.595.688.493C19.138 20.61 22 16.771 22 12.248 22 6.589 17.523 2 12 2Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      <path d="M3 6.75h18v10.5H3z" />
      <path d="m4.5 8.25 7.5 6 7.5-6" />
    </svg>
  );
}
