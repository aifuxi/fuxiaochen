"use client";

import * as React from "react";
import { Sidebar } from "./sidebar";

interface CmsLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function CmsLayout({ children, className }: CmsLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main
        className={`
          ml-[260px] p-8
          ${className ?? ""}
        `}
      >
        {children}
      </main>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className={`
            fixed inset-0 z-[99] bg-black/50 backdrop-blur-sm
            lg:hidden
          `}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
