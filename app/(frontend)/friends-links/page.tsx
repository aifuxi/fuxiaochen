import type { Metadata } from "next";

import Link from "next/link";
import { permanentRedirect } from "next/navigation";

import { ConfiguredImage } from "@/components/frontend/configured-image";
import {
  normalizedQueryPath,
  queryNeedsRedirect,
  queryPath,
  singleParams,
  type SearchParams,
} from "@/lib/public/schema";
import { listPublicFriends } from "@/lib/public/service";
import { pageMetadata } from "@/lib/seo";
import { getPublicSettings } from "@/lib/settings/service";

type Props = { searchParams: Promise<SearchParams> };
function friendsContext(params: SearchParams) {
  const category = singleParams(params).category || undefined;
  const normalized = { category };
  if (queryNeedsRedirect(params, normalized))
    permanentRedirect(normalizedQueryPath("/friends-links", params, normalized));
  return { category, path: queryPath("/friends-links", normalized) };
}
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { category, path } = friendsContext(await searchParams);
  const settings = await getPublicSettings();
  return pageMetadata(settings, {
    title: category ? `友情链接 · ${category}` : "友情链接",
    description: `发现 ${settings.title} 收录的友情链接，访问值得阅读的网站。`,
    path,
    robots: category ? { index: false, follow: true } : undefined,
  });
}
export default async function FriendsPage({ searchParams }: Props) {
  const { category } = friendsContext(await searchParams);
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
