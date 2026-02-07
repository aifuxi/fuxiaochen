import { headers } from "next/headers";
import Link from "next/link";
import { SOURCE_CODE_GITHUB_PAGE, WEBSITE } from "@/constants/info";
import { auth } from "@/lib/auth";
import { ConnectDialog } from "./connect-dialog";
import { MobileMenu } from "./mobile-menu";

export async function NeonHeader() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <header className="fixed top-0 right-0 left-0 z-40 px-4 py-6">
      <nav
        className={`
          glass-panel mx-auto flex max-w-7xl items-center justify-between rounded-full px-8 py-4
          shadow-[0_0_20px_rgba(0,0,0,0.5)]
        `}
      >
        <Link
          href="/"
          className={`
            flex items-center gap-2 text-xl font-bold tracking-widest text-neon-cyan uppercase
            md:text-2xl
          `}
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-neon-magenta" />
          {WEBSITE}
          <span className="text-neon-magenta">.OS</span>
        </Link>
        <div
          className={`
            hidden gap-8 text-sm font-medium tracking-wide
            md:flex
          `}
        >
          <Link
            href="/"
            className={`
              text-gray-300 transition-colors duration-300
              hover:text-neon-cyan
            `}
          >
            首页
          </Link>
          <Link
            href="/blog"
            className={`
              text-gray-300 transition-colors duration-300
              hover:text-neon-cyan
            `}
          >
            博客
          </Link>
          <Link
            href="/changelog"
            className={`
              text-gray-300 transition-colors duration-300
              hover:text-neon-cyan
            `}
          >
            日志
          </Link>
          <Link
            href="/cover-generator"
            className={`
              text-gray-300 transition-colors duration-300
              hover:text-neon-cyan
            `}
          >
            工具
          </Link>
          <Link
            href="/about"
            className={`
              text-gray-300 transition-colors duration-300
              hover:text-neon-cyan
            `}
          >
            关于
          </Link>
        </div>
        <div
          className={`
            hidden items-center gap-4
            md:flex
          `}
        >
          <a
            href={SOURCE_CODE_GITHUB_PAGE}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              rounded-full p-2 text-gray-400 transition-colors duration-300
              hover:bg-white/10 hover:text-white
            `}
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
          </a>
          <ConnectDialog />
          {session ? (
            <Link
              href="/admin"
              className={`
                rounded-full border border-neon-cyan/50 px-6 py-2 text-xs font-bold tracking-widest text-neon-cyan
                uppercase shadow-[0_0_10px_rgba(0,255,255,0.2)] transition-all duration-300
                hover:bg-neon-cyan/20 hover:shadow-[0_0_20px_rgba(0,255,255,0.4)]
              `}
            >
              后台
            </Link>
          ) : (
            <Link
              href="/login"
              className={`
                rounded-full border border-neon-cyan/50 px-6 py-2 text-xs font-bold tracking-widest text-neon-cyan
                uppercase shadow-[0_0_10px_rgba(0,255,255,0.2)] transition-all duration-300
                hover:bg-neon-cyan/20 hover:shadow-[0_0_20px_rgba(0,255,255,0.4)]
              `}
            >
              登录
            </Link>
          )}
        </div>
        <MobileMenu user={session?.user} />
      </nav>
    </header>
  );
}
