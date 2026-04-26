import { asc, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";

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
    changelog: Partial<NewChangelog>,
  ): Promise<Changelog | null>;
  delete(id: string): Promise<boolean>;
}

const buildChangelogWhere = ({
  query,
  type,
}: Pick<ChangelogListQuery, "query" | "type">) => {
  const filters = [];

  if (query) {
    filters.push(
      or(
        ilike(changelogs.version, `%${query}%`),
        ilike(changelogs.title, `%${query}%`),
        ilike(changelogs.description, `%${query}%`),
      )!,
    );
  }

  if (type) {
    filters.push(eq(changelogs.type, type));
  }

  if (filters.length === 0) {
    return undefined;
  }

  if (filters.length === 1) {
    return filters[0];
  }

  return sql`${filters[0]} and ${filters[1]}`;
};

const buildOrderBy = ({
  sortBy,
  sortDirection,
}: Pick<ChangelogListQuery, "sortBy" | "sortDirection">) => {
  if (sortBy === "version") {
    return [
      sortDirection === "asc"
        ? asc(changelogs.version)
        : desc(changelogs.version),
      desc(changelogs.releaseDate),
      desc(changelogs.id),
    ] as const;
  }

  if (sortBy === "updatedAt") {
    return [
      sortDirection === "asc"
        ? asc(changelogs.updatedAt)
        : desc(changelogs.updatedAt),
      desc(changelogs.id),
    ] as const;
  }

  return [
    sortDirection === "asc"
      ? asc(changelogs.releaseDate)
      : desc(changelogs.releaseDate),
    desc(changelogs.id),
  ] as const;
};

const countChangelogs = async (where?: SQL<unknown>) => {
  const rows = await db
    .select({
      total: sql<number>`count(*)`.mapWith(Number),
    })
    .from(changelogs)
    .where(where);

  return rows[0]?.total ?? 0;
};

export const changelogRepository: ChangelogRepository = {
  async list({ page, pageSize, query, type, sortBy, sortDirection }) {
    const offset = (page - 1) * pageSize;
    const where = buildChangelogWhere({ query, type });
    const [items, total] = await Promise.all([
      db
        .select()
        .from(changelogs)
        .where(where)
        .orderBy(...buildOrderBy({ sortBy, sortDirection }))
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
