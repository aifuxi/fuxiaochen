import { asc, desc, eq, ilike, sql, type SQL } from "drizzle-orm";

import { db } from "@/lib/db";
import type { Changelog, NewChangelog } from "@/lib/db/schema";
import { changelogs } from "@/lib/db/schema";
import type { ChangelogListQuery } from "@/lib/server/changelogs/dto";

export interface ChangelogRepository {
  list(query: ChangelogListQuery): Promise<{
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

const buildChangelogWhere = (query?: string) =>
  query ? ilike(changelogs.version, `%${query}%`) : undefined;

const countChangelogs = async (where?: SQL<unknown>) => {
  const rows = await db
    .select({
      total: sql<number>`count(*)`.mapWith(Number),
    })
    .from(changelogs)
    .where(where);

  return rows[0]?.total ?? 0;
};

const buildChangelogOrderBy = ({
  sortBy,
  sortDirection,
}: Pick<ChangelogListQuery, "sortBy" | "sortDirection">) => {
  const releaseDateNullOrder = sql`${changelogs.releaseDate} is null`;

  if (sortBy === "releaseDate") {
    return [
      releaseDateNullOrder,
      sortDirection === "asc"
        ? asc(changelogs.releaseDate)
        : desc(changelogs.releaseDate),
      desc(changelogs.createdAt),
      desc(changelogs.id),
    ] as const;
  }

  if (sortBy === "version") {
    return [
      sortDirection === "asc"
        ? asc(changelogs.version)
        : desc(changelogs.version),
      desc(changelogs.updatedAt),
      desc(changelogs.id),
    ] as const;
  }

  return [
    sortDirection === "asc"
      ? asc(changelogs.updatedAt)
      : desc(changelogs.updatedAt),
    desc(changelogs.id),
  ] as const;
};

export const changelogRepository: ChangelogRepository = {
  async list({ page, pageSize, query, sortBy, sortDirection }) {
    const offset = (page - 1) * pageSize;
    const where = buildChangelogWhere(query);
    const [items, total] = await Promise.all([
      db
        .select()
        .from(changelogs)
        .where(where)
        .orderBy(...buildChangelogOrderBy({ sortBy, sortDirection }))
        .limit(pageSize)
        .offset(offset),
      countChangelogs(where),
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
