"use client";

import React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "首页",
    link: "/admin",
  },
  {
    label: "文章",
    link: "/admin/blogs",
  },
  {
    label: "标签",
    link: "/admin/tags",
  },
  {
    label: "片段",
    link: "/admin/snippets",
  },
  {
    label: "笔记",
    link: "/admin/notes",
  },
  {
    label: "用户",
    link: "/admin/users",
  },
] as const;

export const Navbar = () => {
  const pathname = usePathname();
  return (
    <nav className="flex h-full flex-1 gap-8 px-10">
      {navItems.map((el) => (
        <Link
          key={el.link}
          href={el.link}
          className={cn(
            "flex items-center font-medium border-b-2 border-b-solid border-b-transparent hover:border-b-primary transition",
            {
              "border-b-primary": pathname === el.link,
            },
          )}
        >
          {el.label}
        </Link>
      ))}
    </nav>
  );
};
