import Link from "next/link";

import type { AdminDashboardData } from "./admin-types";

const overviewLinks = [
  {
    href: "/admin/posts",
    label: "Posts",
    detail: "文章列表与编辑",
    key: "blogs",
  },
  {
    href: "/admin/categories",
    label: "Categories",
    detail: "分类维护",
    key: "categories",
  },
  {
    href: "/admin/tags",
    label: "Tags",
    detail: "标签维护",
    key: "tags",
  },
  {
    href: "/admin/changelog",
    label: "Changelog",
    detail: "版本记录维护",
    key: "changelogs",
  },
] as const;

export function AdminHomeView({ data }: { data: AdminDashboardData }) {
  return (
    <main className="shell-page flex flex-col gap-12 pt-32 pb-24">
      <header className="max-w-3xl space-y-5">
        <p className="ui-eyebrow">Admin Archive</p>
        <h1 className="text-display-2 font-light tracking-[-0.06em] text-text-strong md:text-[4.5rem]">
          后台首页只负责导航，不再承载所有编辑器。
        </h1>
        <p className="max-w-2xl text-body-lg text-text-base">
          每类资源进入独立页面维护，保持结构清晰，避免单页承载全部内容操作。
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overviewLinks.map((item) => {
          const count = data[item.key].length;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-52 flex-col justify-between ui-panel ui-panel-hover p-6"
            >
              <div>
                <p className="ui-meta">{item.label}</p>
                <p className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-text-strong">
                  {count}
                </p>
                <p className="mt-2 text-sm text-text-soft">{item.detail}</p>
              </div>
              <span className="ui-meta ui-link text-brand">进入页面</span>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
