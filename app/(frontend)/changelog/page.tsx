import type { Metadata } from "next";

import Link from "next/link";
import { permanentRedirect } from "next/navigation";

import { Pagination } from "@/components/frontend/pagination";
import { Button } from "@/components/ui/button";
import { postTime } from "@/lib/posts/schema";
import {
  normalizedQueryPath,
  pageSchema,
  queryNeedsRedirect,
  queryPath,
  singleParams,
  type SearchParams,
} from "@/lib/public/schema";
import { listPublicChangelog } from "@/lib/public/service";
import { pageMetadata } from "@/lib/seo";
import { getPublicSettings } from "@/lib/settings/service";

type Props = { searchParams: Promise<SearchParams> };
async function changelogContext(params: SearchParams) {
  const rawPage = singleParams(params).page;
  const parsed = pageSchema.safeParse(rawPage);
  const result = parsed.success ? await listPublicChangelog(parsed.data) : null;
  const normalized = {
    page: result ? (result.page > 1 ? String(result.page) : undefined) : rawPage,
  };
  if (queryNeedsRedirect(params, normalized))
    permanentRedirect(normalizedQueryPath("/changelog", params, normalized));
  return { result, path: queryPath("/changelog", normalized) };
}
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const [settings, context] = await Promise.all([
    getPublicSettings(),
    changelogContext(await searchParams),
  ]);
  const page = context.result?.page ?? 1;
  return pageMetadata(settings, {
    title: `更新日志${page > 1 ? ` · 第 ${page} 页` : ""}`,
    description: `查看 ${settings.title} 的更新记录，了解功能、修复与每一次改进。`,
    path: context.path,
    robots: context.result ? undefined : { index: false, follow: true },
  });
}
const labels: Record<string, string> = {
  feature: "新功能",
  fix: "修复",
  performance: "性能",
  security: "安全",
};
export default async function ChangelogPage({ searchParams }: Props) {
  const { result } = await changelogContext(await searchParams);
  if (!result)
    return (
      <main id="main-content" className="site-main site-reading site-changelog-page">
        <header className="site-page-heading">
          <h1>更新日志</h1>
          <p role="alert">页码无效，请返回更新日志。</p>
        </header>
        <Button
          className="site-changelog-return"
          nativeButton={false}
          // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- render 输出真实链接，覆盖 Base UI 默认的 button 角色。
          role="link"
          render={<Link href="/changelog" />}
        >
          返回更新日志
        </Button>
      </main>
    );
  return (
    <main id="main-content" className="site-main site-reading site-changelog-page">
      <header className="site-page-heading">
        <h1>更新日志</h1>
        <p>记录每一次改进。</p>
      </header>
      {result.items.length ? (
        // oxlint-disable-next-line jsx-a11y/no-redundant-roles -- Safari 在 list-style: none 时会移除列表语义，显式角色保留时间线结构。
        <ol className="site-changelog" role="list" aria-label="版本迭代时间线">
          {result.items.map((r, index) => (
            <li key={r.id}>
              <div className="site-changelog-meta">
                <div className="site-changelog-release">
                  <span className="site-changelog-version">{r.version}</span>
                  <span className="site-changelog-type">{labels[r.type] ?? r.type}</span>
                  {result.page === 1 && index === 0 && (
                    <span className="site-changelog-latest">最新</span>
                  )}
                </div>
                <time dateTime={r.createdAt}>{postTime(r.createdAt, true)}</time>
              </div>
              <h2>{r.title}</h2>
              {r.changes.length ? (
                <ul>
                  {r.changes.map((change, i) => (
                    <li key={i}>{change}</li>
                  ))}
                </ul>
              ) : (
                <p>未填写更新详情。</p>
              )}
            </li>
          ))}
        </ol>
      ) : (
        <p className="site-empty">还没有发布更新日志。</p>
      )}
      <Pagination path="/changelog" page={result.page} pageCount={result.pageCount} />
    </main>
  );
}
