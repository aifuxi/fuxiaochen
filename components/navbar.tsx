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
  { label: "Changelog", href: "/changelog" },
  { label: "Friends", href: "/friends" },
  { label: "Design System", href: "/design-system" },
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
