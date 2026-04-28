"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { cn } from "@/lib/utils";

import { siteNavLinks } from "@/constants/site-copy";

export function MobileSiteNav() {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="打开站点导航"
        >
          <Menu />
          <span className="sr-only">打开站点导航</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-80 max-w-[calc(100vw-2rem)] gap-0 p-0 sm:max-w-sm"
      >
        <SheetHeader className="border-b px-6 py-5 text-left">
          <SheetTitle>站点导航</SheetTitle>
          <SheetDescription>访问站点的主要页面。</SheetDescription>
        </SheetHeader>
        <nav className="flex flex-col gap-2 px-4 py-5" aria-label="移动端导航">
          {siteNavLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));

            return (
              <SheetClose asChild key={link.href}>
                <Link
                  href={link.href}
                  prefetch={false}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              </SheetClose>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
