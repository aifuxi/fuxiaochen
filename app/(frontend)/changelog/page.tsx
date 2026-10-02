import { Pagination } from "@/components/frontend/pagination";
import { postTime } from "@/lib/posts/schema";
import { pageSchema, singleParams, type SearchParams } from "@/lib/public/schema";
import { listPublicChangelog } from "@/lib/public/service";
export const metadata = { title: "更新日志" };
const labels: Record<string, string> = {
  feature: "新功能",
  fix: "修复",
  performance: "性能",
  security: "安全",
};
export default async function ChangelogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const parsed = pageSchema.safeParse(singleParams(await searchParams).page);
  if (!parsed.success)
    return (
      <main id="main-content" className="site-main">
        <h1>更新日志</h1>
        <p role="alert">页码无效，请从导航重新进入。</p>
      </main>
    );
  const result = await listPublicChangelog(parsed.data);
  return (
    <main id="main-content" className="site-main site-reading">
      <header className="site-page-heading">
        <h1>更新日志</h1>
        <p>记录每一次改进。</p>
      </header>
      {result.items.length ? (
        <ol className="site-changelog">
          {result.items.map((r) => (
            <li key={r.id}>
              <div className="site-post-meta">
                <time dateTime={r.createdAt}>{postTime(r.createdAt, true)}</time>
                <span>{r.version}</span>
                <span>{labels[r.type] ?? r.type}</span>
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
