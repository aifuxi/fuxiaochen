"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { MenuIcon, XIcon } from "lucide-react";

import { SOURCE_CODE_GITHUB_PAGE } from "@/constants/info";
import { cn } from "@/lib/utils";

import { ConnectDialog } from "./connect-dialog";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(false);
  }, [pathname]);

  const links = [
    { href: "/", label: "首页 / Home" },
    { href: "/blog", label: "博客 / Blog" },
    { href: "/changelog", label: "日志 / Changelog" },
    { href: "/cover-generator", label: "工具 / Tools" },
    { href: "/about", label: "关于 / About" },
  ];

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(true)}
        className={`
          rounded-md p-2 text-neon-cyan transition-colors
          hover:bg-neon-cyan/10
        `}
        aria-label="Open Menu"
      >
        <MenuIcon />
        <span className="sr-only">Open Menu</span>
      </button>

      {isOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 flex flex-col bg-cyber-black/95 backdrop-blur-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <span className="text-xl font-bold tracking-widest text-neon-cyan uppercase">
                系统导航 / MENU
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className={`
                  p-2 text-gray-400 transition-colors
                  hover:text-white
                `}
                aria-label="Close Menu"
              >
                <XIcon />
                <span className="sr-only">Close</span>
              </button>
            </div>

            {/* Links */}
            <div className="flex flex-1 flex-col justify-center space-y-8 px-8">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    `
                      border-l-2 border-transparent pl-0 text-2xl font-bold tracking-widest uppercase transition-all
                      duration-300
                      hover:border-neon-cyan hover:pl-4 hover:text-neon-cyan
                    `,
                    pathname === link.href
                      ? "border-neon-cyan pl-4 text-neon-cyan"
                      : "text-gray-400",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Footer Actions */}
            <div className="space-y-6 border-t border-white/10 p-8">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-gray-500">
                  SOURCE_CODE
                </span>
                <a
                  href={SOURCE_CODE_GITHUB_PAGE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`
                    flex items-center gap-2 text-gray-400 transition-colors
                    hover:text-white
                  `}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                  </svg>
                  GitHub
                </a>
              </div>
              <div className="w-full">
                <ConnectDialog />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
