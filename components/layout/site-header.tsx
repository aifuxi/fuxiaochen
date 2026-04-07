"use client";

import { ChevronDown, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { buttonVariants } from "@/components/ui/button-variants";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLinkItem, DropdownMenuTrigger } from "@/components/ui/menu";
import { cn } from "@/lib/utils";
import { primaryNavItems, secondaryNavItems } from "@/lib/mocks/site-content";

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40 px-3 pt-3">
      <div
        className={cn(
          `
            shell-container flex items-center justify-between rounded-[1.75rem] border border-white/8 px-4 py-3
            transition-all duration-300
          `,
          scrolled ? "bg-black/72 shadow-[0_18px_60px_rgba(0,0,0,0.4)] backdrop-blur-xl" : `
            bg-black/30 backdrop-blur-sm
          `,
        )}
      >
        <Link className="flex items-center gap-3" href="/">
          <div className={`
            flex size-11 items-center justify-center rounded-2xl bg-white text-sm font-bold text-black
            transition-transform duration-500
            hover:rotate-180
          `}>
            AC
          </div>
          <div className={`
            hidden
            sm:block
          `}>
            <div className="font-serif text-2xl leading-none tracking-[-0.05em]">Chen Serif</div>
            <div className="font-mono text-[10px] tracking-[0.3em] text-muted uppercase">Editorial System</div>
          </div>
        </Link>

        <nav className={`
          hidden items-center gap-6
          md:flex
        `}>
          {primaryNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "font-mono text-[11px] tracking-[0.28em] uppercase transition-colors",
                pathname === item.href ? "text-foreground" : `
                  text-muted
                  hover:text-foreground
                `,
              )}
            >
              {item.label}
            </Link>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger className={`
              flex items-center gap-1.5 font-mono text-[11px] tracking-[0.28em] text-muted uppercase transition-colors
              outline-none
              hover:text-foreground
            `}>
              More
              <ChevronDown className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {secondaryNavItems.map((item) => (
                <DropdownMenuLinkItem key={item.href} closeOnClick href={item.href}>
                  {item.label}
                </DropdownMenuLinkItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <Link className={cn(buttonVariants({ size: "sm" }), `
          hidden
          md:inline-flex
        `)} href="/cms/dashboard">
          <Sparkles className="size-4" />
          Open CMS
        </Link>
      </div>
    </header>
  );
}
