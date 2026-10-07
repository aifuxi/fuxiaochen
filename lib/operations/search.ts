import "server-only";
import type { TaxonomyActor } from "@/lib/taxonomy/service";

import { authorizeAdmin } from "@/lib/admin/service";
import { getDatabase, writeTransaction } from "@/prisma/db";

import { searchSchema, type SearchPage, type SearchQuery } from "./schema";

const text = "pg/text@1" as const;
export async function searchContent(query: SearchQuery, actor: TaxonomyActor): Promise<SearchPage> {
  return writeTransaction(async (tx) => {
    await authorizeAdmin(actor);
    if (!query.q) return { items: [], total: 0, page: 1, pageSize: query.pageSize, pageCount: 1 };
    const raw = getDatabase().raw;
    // UNION 的每个关键词都是绑定参数；正文只检索经过校验的可见 text，不匹配 JSON 属性。
    const rows = raw.sql`
      SELECT id, 'post' AS kind, title, slug AS description, '/admin/posts/' || id || '/edit' AS href, "updatedAt" AS time FROM post
      WHERE strpos(lower(title || ' ' || (content::jsonb ->> 'text') || ' ' || slug), lower(${query.q})) > 0
        OR "categoryId" IN (SELECT id FROM category WHERE strpos(lower(name), lower(${query.q})) > 0)
        OR id IN (SELECT "postId" FROM post_tag JOIN tag ON tag.id = post_tag."tagId" WHERE strpos(lower(tag.name), lower(${query.q})) > 0)
      UNION ALL SELECT id, 'category', name, '分类', '/admin/categories?kind=category&record=' || id, "createdAt" FROM category WHERE strpos(lower(name), lower(${query.q})) > 0
      UNION ALL SELECT id, 'tag', name, '标签', '/admin/categories?kind=tag&record=' || id, "createdAt" FROM tag WHERE strpos(lower(name), lower(${query.q})) > 0
      UNION ALL SELECT c.id, 'comment', c.author, substr(c.content, 1, 160), '/admin/comments?record=' || c.id, c."updatedAt" FROM comment c JOIN post p ON c."postId" = p.id WHERE strpos(lower(c.author || ' ' || c.content || ' ' || p.title), lower(${query.q})) > 0
      UNION ALL SELECT id, 'media', name, kind, '/admin/media?record=' || id, "createdAt" FROM media WHERE status = 'ready' AND strpos(lower(name), lower(${query.q})) > 0
      UNION ALL SELECT id, 'friend', name, url, '/admin/friends-links?record=' || id, "updatedAt" FROM friend_link WHERE strpos(lower(name || ' ' || url || ' ' || description), lower(${query.q})) > 0
      UNION ALL SELECT id, 'release', title, version, '/admin/changelog?record=' || id, "createdAt" FROM release_log WHERE strpos(lower(title || ' ' || version), lower(${query.q})) > 0 OR EXISTS (SELECT 1 FROM jsonb_array_elements_text(changes::jsonb) AS changes_item(value) WHERE strpos(lower(changes_item.value), lower(${query.q})) > 0)
    `.returnsRow({
      id: text,
      kind: text,
      title: text,
      description: text,
      href: text,
      time: "pg/timestamptz-date@1",
    });
    const kind = query.kind ?? "";
    const [count] = await tx.query(
      raw.sql`SELECT count(*) AS total FROM (${rows}) AS results WHERE (${kind} = '' OR kind = ${kind})`
        .returnsRow({ total: "pg/int8number@1" })
        .build(),
    );
    const pageCount = Math.max(1, Math.ceil(count.total / query.pageSize));
    const page = Math.min(query.page, pageCount);
    const items = await tx.query(
      raw.sql`SELECT id, kind, title, description, href FROM (${rows}) AS results WHERE (${kind} = '' OR kind = ${kind}) ORDER BY time DESC, kind, id DESC LIMIT ${query.pageSize} OFFSET ${(page - 1) * query.pageSize}`
        .returnsRow({ id: text, kind: text, title: text, description: text, href: text })
        .build(),
    );
    return {
      items: items.map((item) => ({
        ...item,
        kind: searchSchema.shape.kind.unwrap().parse(item.kind),
      })),
      total: count.total,
      page,
      pageSize: query.pageSize,
      pageCount,
    };
  });
}
