import Link from "next/link";

import { SOURCE_CODE_GITHUB_PAGE, WEBSITE } from "@/constants/info";

export function NeonHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-4 py-6">
      <nav className="glass-panel mx-auto max-w-7xl rounded-full px-8 py-4 flex items-center justify-between shadow-[0_0_20px_rgba(0,0,0,0.5)]">
        <div className="text-xl md:text-2xl font-bold text-neon-cyan tracking-widest uppercase flex items-center gap-2">
          <span className="w-2 h-2 bg-neon-magenta rounded-full animate-pulse" />
          {WEBSITE}
          <span className="text-neon-magenta">.OS</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium tracking-wide">
          <Link
            href="/"
            className="text-gray-300 hover:text-neon-cyan transition-colors duration-300"
          >
            首页 / Home
          </Link>
          <Link
            href="/blog"
            className="text-gray-300 hover:text-neon-cyan transition-colors duration-300"
          >
            博客 / Blog
          </Link>
          <Link
            href="/changelog"
            className="text-gray-300 hover:text-neon-cyan transition-colors duration-300"
          >
            日志 / Changelog
          </Link>
          <Link
            href="/about"
            className="text-gray-300 hover:text-neon-cyan transition-colors duration-300"
          >
            关于 / About
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <Link
            href={SOURCE_CODE_GITHUB_PAGE}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-gray-400 hover:text-white transition-colors duration-300 hover:bg-white/10 rounded-full"
            aria-label="GitHub Source Code"
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
          </Link>
          <button className="px-6 py-2 border border-neon-purple text-neon-purple rounded-full hover:bg-neon-purple/20 transition-all duration-300 text-xs font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(123,97,255,0.2)] hover:shadow-[0_0_20px_rgba(123,97,255,0.4)]">
            建立连接 / Connect
          </button>
        </div>
      </nav>
    </header>
  );
}
