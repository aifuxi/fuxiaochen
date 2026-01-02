import Link from "next/link";

import { ImageAssets, WEBSITE } from "@/constants";

import { navItems } from "./config";

import { IconBrandGithub } from "../icons";
import { ModeToggle } from "../mode-toggle";
import { Button } from "../ui/button";

export const Navbar = () => {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary">
              <img
                src={ImageAssets.logo}
                className="size-8 rounded-md"
                alt={WEBSITE}
              />
            </div>
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

            <Button variant="ghost" size="icon" className="text-base">
              <IconBrandGithub />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
