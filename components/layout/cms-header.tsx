"use client";

import { Bell, Mail, Search } from "lucide-react";

export function CmsHeader({ title, description }: { title: string; description: string }) {
  return (
    <>
      <header className="cms-header">
        <div className="relative w-80">
          <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted" />
          <input className="search-input h-11 w-full rounded-xl pr-4 pl-12 text-sm text-white" placeholder="Search articles, users..." />
        </div>
        <div className="flex items-center gap-3">
          <button className={`
            relative rounded-xl p-3 text-muted transition
            hover:bg-white/8 hover:text-foreground
          `}>
            <Bell className="h-5 w-5" />
            <span className={`
              absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1
              text-[10px] font-semibold text-black
            `}>3</span>
          </button>
          <button className={`
            rounded-xl p-3 text-muted transition
            hover:bg-white/8 hover:text-foreground
          `}>
            <Mail className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3 rounded-xl border border-white/8 px-3 py-2">
            <div className={`
              flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#10b981,#059669)] text-sm
              font-semibold text-black
            `}>SC</div>
            <div className="text-sm text-muted">Sarah Chen</div>
          </div>
        </div>
      </header>
      <div className="mb-8 px-8 pt-8">
        <h1 className="font-serif text-5xl tracking-[-0.05em]">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p>
      </div>
    </>
  );
}
