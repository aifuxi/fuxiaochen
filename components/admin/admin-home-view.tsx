import Link from "next/link";

import type { AdminDashboardData } from "./admin-types";

const overviewCards = [
  {
    href: "/admin/posts",
    label: "Posts",
    detail: "Drafts, publishing cadence, and featured coverage.",
    key: "blogs",
  },
  {
    href: "/admin/categories",
    label: "Categories",
    detail: "Primary classification used across articles.",
    key: "categories",
  },
  {
    href: "/admin/tags",
    label: "Tags",
    detail: "Cross-topic labels for discovery and bundles.",
    key: "tags",
  },
  {
    href: "/admin/changelog",
    label: "Changelog",
    detail: "Release notes and product history records.",
    key: "changelogs",
  },
] as const;

const quickAccessLinks = [
  {
    href: "/admin/posts",
    label: "Open posts table",
    detail: "Jump into the new list, filter, and drawer flow.",
  },
  {
    href: "/admin/categories",
    label: "Review categories",
    detail: "Keep taxonomy aligned with editorial structure.",
  },
  {
    href: "/admin/tags",
    label: "Curate tags",
    detail: "Adjust reusable topic labels without leaving admin.",
  },
  {
    href: "/admin/changelog",
    label: "Update changelog",
    detail: "Track release notes and ship history.",
  },
] as const;

export function AdminHomeView({ data }: { data: AdminDashboardData }) {
  const publishedCount = data.blogs.filter((blog) => blog.published).length;
  const featuredCount = data.blogs.filter((blog) => blog.featured).length;
  const latestPost = [...data.blogs].sort(sortByUpdatedAtDesc)[0];
  const latestChangelog = [...data.changelogs].sort(sortByUpdatedAtDesc)[0];

  return (
    <main className="shell-page flex flex-col gap-10 pt-32 pb-24">
      <header className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] xl:items-end">
        <div className="space-y-5">
          <p className="ui-eyebrow">Operations overview</p>
          <h1 className="text-display-2 font-light tracking-[-0.06em] text-text-strong md:text-[4.5rem]">
            内容运营状态、资源规模和快捷入口都集中在这里。
          </h1>
          <p className="max-w-3xl text-body-lg text-text-base">
            后台首页现在承担真正的 dashboard
            角色：先看库存、发布状态和最近更新，再决定进入哪个资源页处理细节。
          </p>
        </div>

        <section className="grid gap-3 rounded-panel border border-white/8 bg-surface-1/80 p-5">
          <div className="rounded-control border border-brand/15 bg-brand/8 px-4 py-3">
            <p className="ui-meta text-brand-soft">Publishing</p>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-text-strong">
              {publishedCount}
            </p>
            <p className="mt-2 text-sm text-text-soft">
              {publishedCount === 1
                ? "1 published post"
                : `${publishedCount} published posts`}
            </p>
          </div>

          <div className="rounded-control border border-white/8 bg-surface-2/80 px-4 py-3">
            <p className="ui-meta">Featured coverage</p>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-text-strong">
              {featuredCount}
            </p>
            <p className="mt-2 text-sm text-text-soft">
              {featuredCount === 1
                ? "1 featured post"
                : `${featuredCount} featured posts`}
            </p>
          </div>
        </section>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map((item) => {
          const count = data[item.key].length;

          return (
            <Link
              key={item.href}
              className="flex min-h-56 flex-col justify-between ui-panel ui-panel-hover p-6"
              href={item.href}
            >
              <div className="space-y-4">
                <div>
                  <p className="ui-meta">{item.label}</p>
                  <p className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-text-strong">
                    {count}
                  </p>
                </div>
                <p className="text-sm leading-6 text-text-soft">
                  {item.detail}
                </p>
              </div>
              <span className="ui-meta ui-link text-brand">Open resource</span>
            </Link>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.75fr)]">
        <div className="ui-panel p-6">
          <div className="space-y-2">
            <p className="ui-eyebrow">Quick access</p>
            <h2 className="text-title font-medium tracking-[-0.03em] text-text-strong">
              用新的资源页流程处理具体内容。
            </h2>
            <p className="text-sm leading-7 text-text-soft">
              Posts 已经迁移到表格和 drawer，taxonomy 与 changelog
              暂时保留原有编辑布局。
            </p>
          </div>

          <div className="mt-6 grid gap-3">
            {quickAccessLinks.map((item) => (
              <Link
                key={item.href}
                className="rounded-control border border-white/8 bg-surface-2/70 px-4 py-4 transition-colors duration-300 hover:border-brand/20 hover:bg-brand/8"
                href={item.href}
              >
                <p className="text-base font-medium tracking-[-0.02em] text-text-strong">
                  {item.label}
                </p>
                <p className="mt-2 text-sm leading-6 text-text-soft">
                  {item.detail}
                </p>
              </Link>
            ))}
          </div>
        </div>

        <aside className="ui-panel p-6">
          <div className="space-y-2">
            <p className="ui-eyebrow">Latest updates</p>
            <h2 className="text-title font-medium tracking-[-0.03em] text-text-strong">
              最近更新
            </h2>
          </div>

          <div className="mt-6 space-y-4">
            <DashboardSnapshot
              detail={
                latestPost
                  ? formatDateLabel(latestPost.updatedAt)
                  : "No post yet"
              }
              label="Latest post"
              value={latestPost?.title ?? "No post yet"}
            />
            <DashboardSnapshot
              detail={
                latestChangelog
                  ? formatDateLabel(latestChangelog.updatedAt)
                  : "No changelog yet"
              }
              label="Latest release note"
              value={latestChangelog?.version ?? "No changelog yet"}
            />
            <DashboardSnapshot
              detail="Taxonomy inventory"
              label="Categories / Tags"
              value={`${data.categories.length} / ${data.tags.length}`}
            />
          </div>
        </aside>
      </section>
    </main>
  );
}

function DashboardSnapshot({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-control border border-white/8 bg-surface-2/70 px-4 py-4">
      <p className="ui-meta">{label}</p>
      <p className="mt-3 text-lg font-medium tracking-[-0.03em] text-text-strong">
        {value}
      </p>
      <p className="mt-2 text-sm text-text-soft">{detail}</p>
    </div>
  );
}

function sortByUpdatedAtDesc(
  current: { updatedAt: string },
  next: { updatedAt: string },
) {
  return (
    new Date(next.updatedAt).getTime() - new Date(current.updatedAt).getTime()
  );
}

function formatDateLabel(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
