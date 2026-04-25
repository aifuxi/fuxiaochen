import Link from "next/link";

import { routes } from "@/constants/routes";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-linear-to-br from-background via-muted/30 to-background">
      <div className="absolute top-0 left-0 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-chart-2/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        <section className="mb-12 max-w-xl lg:mb-0">
          <Link
            href={routes.site.home}
            className="inline-flex items-center gap-2 text-foreground"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            <span className="text-sm font-medium">Fuxiaochen Admin</span>
          </Link>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance lg:text-5xl">
            登录后进入内容后台
          </h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-muted-foreground">
            你可以使用邮箱密码或 GitHub 账号登录。登录成功后会跳转到后台首页，
            用于管理文章、分类、标签、更新日志和其他站点内容。
          </p>
        </section>

        <section className="w-full max-w-md">{children}</section>
      </div>
    </main>
  );
}
