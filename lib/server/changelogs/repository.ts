import { desc, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import type { Changelog, NewChangelog } from "@/lib/db/schema";
import { changelogs } from "@/lib/db/schema";

export interface ChangelogRepository {
  list(query: { page: number; pageSize: number }): Promise<{
    items: Changelog[];
    total: number;
  }>;
  findById(id: string): Promise<Changelog | null>;
  findByVersion(version: string): Promise<Changelog | null>;
  create(changelog: NewChangelog): Promise<Changelog>;
  update(
    id: string,
    changelog: Partial<
      Pick<NewChangelog, "version" | "content" | "releaseDate" | "updatedAt">
    >,
  ): Promise<Changelog | null>;
  delete(id: string): Promise<boolean>;
}

const countChangelogs = async () => {
  const rows = await db
    .select({
      total: sql<number>`count(*)`.mapWith(Number),
    })
    .from(changelogs);

  return rows[0]?.total ?? 0;
};

export const changelogListOrderBy = [
  sql`${changelogs.releaseDate} is null`,
  desc(changelogs.releaseDate),
  desc(changelogs.createdAt),
  desc(changelogs.id),
] as const;

export const changelogRepository: ChangelogRepository = {
  async list({ page, pageSize }) {
    const offset = (page - 1) * pageSize;
    const [items, total] = await Promise.all([
      db
        .select()
        .from(changelogs)
        .orderBy(...changelogListOrderBy)
        .limit(pageSize)
        .offset(offset),
      countChangelogs(),
    ]);

    return { items, total };
  },
  async findById(id) {
    const rows = await db
      .select()
      .from(changelogs)
      .where(eq(changelogs.id, id))
      .limit(1);

    return rows[0] ?? null;
  },
  async findByVersion(version) {
    const rows = await db
      .select()
      .from(changelogs)
      .where(eq(changelogs.version, version))
      .limit(1);

    return rows[0] ?? null;
  },
  async create(changelog) {
    const rows = await db.insert(changelogs).values(changelog).returning();

    return rows[0] as Changelog;
  },
  async update(id, changelog) {
    const rows = await db
      .update(changelogs)
      .set(changelog)
      .where(eq(changelogs.id, id))
      .returning();

    return rows[0] ?? null;
  },
  async delete(id) {
    const rows = await db
      .delete(changelogs)
      .where(eq(changelogs.id, id))
      .returning({
        id: changelogs.id,
      });

    return rows.length > 0;
  },
};
