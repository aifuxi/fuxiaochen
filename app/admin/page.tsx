import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { SESSION_COOKIE, validSession } from "@/lib/auth";

export default async function AdminPage() {
  const session = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!validSession(session)) redirect("/login");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1200px] flex-col px-5 py-8 text-[var(--color-foreground)] md:px-8">
      <header className="flex items-center justify-between">
        <Link
          href="/"
          className="font-display text-sm font-medium hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-focus)]"
        >
          fuxiaochen <span className="text-[var(--color-subtle)]">/ admin</span>
        </Link>
        <form action="/api/logout" method="post">
          <Button type="submit" variant="ghost" size="sm">
            退出登录
          </Button>
        </form>
      </header>
      <section className="flex flex-1 flex-col justify-center pb-20">
        <p className="mb-5 font-mono text-xs tracking-[.2em] text-[var(--color-subtle)] uppercase">
          Private space / 001
        </p>
        <h1 className="font-display text-5xl font-medium tracking-[-.05em] md:text-7xl">
          欢迎回来。
        </h1>
        <p className="mt-6 text-sm text-[var(--color-muted)]">这里是你的管理空间，内容即将到来。</p>
      </section>
    </main>
  );
}
