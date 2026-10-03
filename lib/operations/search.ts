import "server-only";
import type { TaxonomyActor } from "@/lib/taxonomy/service";

import { authorizeAdmin } from "@/lib/admin/service";
import { getDatabase, writeTransaction } from "@/prisma/db";

import { searchSchema, type SearchPage, type SearchQuery } from "./schema";

const text = "sqlite/text@1" as const;
export async function searchContent(query: SearchQuery, actor: TaxonomyActor): Promise<SearchPage> {
  return writeTransaction(async (tx) => {
    await authorizeAdmin(actor);
    if (!query.q) return { items: [], total: 0, page: 1, pageSize: query.pageSize, pageCount: 1 };
    const raw = getDatabase().raw;
    // UNION 的每个关键词都是绑定参数；正文只检索经过校验的可见 text，不匹配 JSON 属性。
    const rows = raw.sql`
      SELECT id, 'post' AS kind, title, slug AS description, '/admin/posts/' || id || '/edit' AS href, updatedAt AS time FROM post
      WHERE instr(lower(title || ' ' || json_extract(content, '$.text') || ' ' || slug), lower(${query.q})) > 0
        OR categoryId IN (SELECT id FROM category WHERE instr(lower(name), lower(${query.q})) > 0)
        OR id IN (SELECT postId FROM post_tag JOIN tag ON tag.id = post_tag.tagId WHERE instr(lower(tag.name), lower(${query.q})) > 0)
      UNION ALL SELECT id, 'category', name, '分类', '/admin/categories', createdAt FROM category WHERE instr(lower(name), lower(${query.q})) > 0
      UNION ALL SELECT id, 'tag', name, '标签', '/admin/categories', createdAt FROM tag WHERE instr(lower(name), lower(${query.q})) > 0
      UNION ALL SELECT c.id, 'comment', c.author, substr(c.content, 1, 160), '/admin/comments', c.updatedAt FROM comment c JOIN post p ON c.postId = p.id WHERE instr(lower(c.author || ' ' || c.content || ' ' || p.title), lower(${query.q})) > 0
      UNION ALL SELECT id, 'media', name, kind, '/admin/media', createdAt FROM media WHERE status = 'ready' AND instr(lower(name), lower(${query.q})) > 0
      UNION ALL SELECT id, 'friend', name, url, '/admin/friends-links', updatedAt FROM friend_link WHERE instr(lower(name || ' ' || url || ' ' || description), lower(${query.q})) > 0
      UNION ALL SELECT id, 'release', title, version, '/admin/changelog', createdAt FROM release_log WHERE instr(lower(title || ' ' || version), lower(${query.q})) > 0 OR EXISTS (SELECT 1 FROM json_each(changes) WHERE instr(lower(json_each.value), lower(${query.q})) > 0)
    `.returnsRow({ id: text, kind: text, title: text, description: text, href: text, time: text });
    const kind = query.kind ?? "";
    const [count] = await tx.query(
      raw.sql`SELECT count(*) AS total FROM (${rows}) WHERE (${kind} = '' OR kind = ${kind})`
        .returnsRow({ total: "sqlite/integer@1" })
        .build(),
    );
    const pageCount = Math.max(1, Math.ceil(count.total / query.pageSize));
    const page = Math.min(query.page, pageCount);
    const items = await tx.query(
      raw.sql`SELECT id, kind, title, description, href FROM (${rows}) WHERE (${kind} = '' OR kind = ${kind}) ORDER BY time DESC, kind, id DESC LIMIT ${query.pageSize} OFFSET ${(page - 1) * query.pageSize}`
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
