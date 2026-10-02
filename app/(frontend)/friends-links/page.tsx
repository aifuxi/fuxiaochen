import Link from "next/link";

import { ConfiguredImage } from "@/components/frontend/configured-image";
import { singleParams, type SearchParams } from "@/lib/public/schema";
import { listPublicFriends } from "@/lib/public/service";
export const metadata = { title: "友情链接" };
export default async function FriendsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { category } = singleParams(await searchParams);
  const result = await listPublicFriends(category);
  return (
    <main id="main-content" className="site-main">
      <header className="site-page-heading">
        <h1>友情链接</h1>
        <p>值得走走看看的地方。</p>
      </header>
      {result.categories.length > 0 && (
        <nav className="site-tag-cloud" aria-label="友链分类">
          <Link href="/friends-links" aria-current={!category ? "page" : undefined}>
            全部
          </Link>
          {result.categories.map((c) => (
            <Link
              key={c}
              href={`/friends-links?${new URLSearchParams({ category: c })}`}
              aria-current={category === c ? "page" : undefined}
            >
              {c || "未分类"}
            </Link>
          ))}
        </nav>
      )}
      {result.items.length ? (
        <div className="site-friends">
          {result.items.map((f) => (
            <a key={f.id} href={f.url} target="_blank" rel="noopener noreferrer">
              <ConfiguredImage src={f.avatar} size={40} />
              <div>
                <h2>{f.name}</h2>
                <p>{f.description || f.url}</p>
                <span>{f.category}</span>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <p className="site-empty">
          {category ? "该分类暂时没有友情链接。" : "暂时没有公开的友情链接。"}
        </p>
      )}
    </main>
  );
}
