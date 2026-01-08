import Link from "next/link";

import { ImageAssets, SOURCE_CODE_GITHUB_PAGE, WEBSITE } from "@/constants";
import { cn } from "@/lib/utils";

import { navItems } from "./config";

import { IconBrandGithub } from "../icons";
import { ModeToggle } from "../mode-toggle";
import { buttonVariants } from "../ui/button";

export const Navbar = () => {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src={ImageAssets.logo} className="size-9" alt={WEBSITE} />
            <span className="text-xl font-bold">{WEBSITE}</span>
          </Link>

          <nav
            className={`
              hidden items-center gap-8
              md:flex
            `}
          >
            {navItems.map((item) => (
              <Link
                key={item.link}
                href={item.link}
                className={`
                  text-sm text-muted-foreground transition-colors
                  hover:text-foreground
                `}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <ModeToggle variant="ghost" aria-label="切换主题" />

            <Link
              href={SOURCE_CODE_GITHUB_PAGE}
              target="_blank"
              className={cn(buttonVariants({ size: "icon", variant: "ghost" }))}
            >
              <IconBrandGithub className="size-5" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
