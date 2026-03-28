"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavLink {
  label: string;
  href: string;
  isActive?: boolean;
}

const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Articles", href: "/articles" },
  { label: "About", href: "/about" },
];

const dropdownLinks = [
  { label: "Changelog", href: "/changelog" },
  { label: "Friends", href: "/friends" },
  { label: "Design Spec", href: "/design-system" },
];

function Navbar() {
  const navbarRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const navbar = navbarRef.current;
    if (!navbar) return;

    const handleScroll = () => {
      if (window.scrollY > 50) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav
      ref={navbarRef}
      className={cn(
        "navbar fixed top-0 right-0 left-0 z-50 px-8 py-4 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
      )}
      style={{
        height: "96px",
        background: "rgba(5, 5, 5, 0.6)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className={cn(
            "logo flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-white transition-all",
            "duration-600 ease-[cubic-bezier(0.16,1,0.3,1)]",
            "hover:rotate-360"
          )}
        >
          <span className="font-mono text-sm font-bold text-black">FC</span>
        </Link>

        {/* Navigation Links */}
        <div
          className={`
            hidden items-center gap-8
            md:flex
          `}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "nav-link relative pb-1 font-mono text-xs tracking-widest uppercase transition-colors duration-300",
                isActive(link.href)
                  ? "text-foreground"
                  : `
                    text-muted
                    hover:text-foreground
                  `
              )}
            >
              {link.label}
            </Link>
          ))}

          {/* Dropdown Menu */}
          <div className="group relative">
            <Link
              href="#"
              className={cn(
                `
                  nav-link flex items-center gap-1 font-mono text-xs tracking-widest uppercase transition-colors
                  duration-300
                `,
                pathname.startsWith("/changelog") ||
                  pathname.startsWith("/friends") ||
                  pathname.startsWith("/design-system")
                  ? "text-foreground"
                  : `
                    text-muted
                    hover:text-foreground
                  `
              )}
            >
              More
              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </Link>
            <div
              className={cn(
                "invisible absolute top-full left-0 mt-2 w-48 translate-y-2 transform rounded-xl border border-white/10",
                "bg-black/90 py-2 opacity-0 backdrop-blur-xl transition-all duration-300",
                "group-hover:visible group-hover:translate-y-0 group-hover:opacity-100"
              )}
            >
              {dropdownLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "block px-4 py-2 font-mono text-xs transition-colors",
                    "hover:bg-white/5",
                    isActive(link.href)
                      ? "text-primary"
                      : `
                        text-muted
                        hover:text-foreground
                      `
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <Button variant="primary-glow" size="sm" className="rounded-full">
          Get Started
        </Button>
      </div>
    </nav>
  );
}

export default Navbar;
