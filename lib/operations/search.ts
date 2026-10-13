import "server-only";
import { sql } from "drizzle-orm";

import type { TaxonomyActor } from "@/lib/taxonomy/service";

import { authorizeAdmin } from "@/lib/admin/service";
import { writeTransaction } from "@/lib/database";

import { searchSchema, type SearchPage, type SearchQuery } from "./schema";

export async function searchContent(query: SearchQuery, actor: TaxonomyActor): Promise<SearchPage> {
  return writeTransaction((tx) => {
    authorizeAdmin(actor, tx);
    if (!query.q) return { items: [], total: 0, page: 1, pageSize: query.pageSize, pageCount: 1 };
    // UNION 的每个关键词都是绑定参数；正文只检索经过校验的可见 text，不匹配 JSON 属性。
    const rows = sql`
      SELECT id, 'post' AS kind, coalesce(nullif(title, ''), '未命名草稿') AS title, coalesce(slug, '未设置链接') AS description, '/admin/posts/' || id || '/edit' AS href, "updatedAt" AS time FROM post
      WHERE instr(lower(title || ' ' || coalesce(json_extract(content, '$.text'), '') || ' ' || coalesce(slug, '')), lower(${query.q})) > 0
        OR "categoryId" IN (SELECT id FROM category WHERE instr(lower(name), lower(${query.q})) > 0)
        OR id IN (SELECT "postId" FROM post_tag JOIN tag ON tag.id = post_tag."tagId" WHERE instr(lower(tag.name), lower(${query.q})) > 0)
      UNION ALL SELECT id, 'category', name, '分类', '/admin/categories?kind=category&record=' || id, "createdAt" FROM category WHERE instr(lower(name), lower(${query.q})) > 0
      UNION ALL SELECT id, 'tag', name, '标签', '/admin/categories?kind=tag&record=' || id, "createdAt" FROM tag WHERE instr(lower(name), lower(${query.q})) > 0
      UNION ALL SELECT c.id, 'comment', c.author, substr(c.content, 1, 160), '/admin/comments?record=' || c.id, c."updatedAt" FROM comment c JOIN post p ON c."postId" = p.id WHERE instr(lower(c.author || ' ' || c.content || ' ' || p.title), lower(${query.q})) > 0
      UNION ALL SELECT id, 'media', name, kind, '/admin/media?record=' || id, "createdAt" FROM media WHERE status = 'ready' AND instr(lower(name), lower(${query.q})) > 0
      UNION ALL SELECT id, 'friend', name, url, '/admin/friends-links?record=' || id, "updatedAt" FROM friend_link WHERE instr(lower(name || ' ' || url || ' ' || description), lower(${query.q})) > 0
      UNION ALL SELECT id, 'release', title, version, '/admin/changelog?record=' || id, "createdAt" FROM release_log WHERE instr(lower(title || ' ' || version), lower(${query.q})) > 0 OR EXISTS (SELECT 1 FROM json_each(changes) AS changes_item WHERE instr(lower(changes_item.value), lower(${query.q})) > 0)
    `;
    const kind = query.kind ?? "";
    const count = tx.get<{ total: number }>(
      sql`SELECT count(*) AS total FROM (${rows}) AS results WHERE (${kind} = '' OR kind = ${kind})`,
    );
    const pageCount = Math.max(1, Math.ceil(count.total / query.pageSize));
    const page = Math.min(query.page, pageCount);
    const items = tx.all<{
      id: string;
      kind: string;
      title: string;
      description: string;
      href: string;
    }>(
      sql`SELECT id, kind, title, description, href FROM (${rows}) AS results WHERE (${kind} = '' OR kind = ${kind}) ORDER BY time DESC, kind, id DESC LIMIT ${query.pageSize} OFFSET ${(page - 1) * query.pageSize}`,
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
