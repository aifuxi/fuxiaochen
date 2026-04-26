import {
  and,
  asc,
  desc,
  eq,
  ilike,
  or,
  sql,
  type SQL,
  type SQLWrapper,
} from "drizzle-orm";

import { db } from "@/lib/db";
import { friends, type Friend, type NewFriend } from "@/lib/db/schema";
import type { AdminFriendListQuery } from "@/lib/server/friends/dto";

export interface FriendRepository {
  listAdmin(query: AdminFriendListQuery): Promise<{
    items: Friend[];
    total: number;
  }>;
  listPublic(): Promise<Friend[]>;
  findById(id: string): Promise<Friend | null>;
  findByUrl(url: string): Promise<Friend | null>;
  create(friend: NewFriend): Promise<Friend>;
  update(id: string, friend: Partial<NewFriend>): Promise<Friend | null>;
  delete(id: string): Promise<boolean>;
}

const categoryOrder = sql<number>`case
  when ${friends.category} = 'developer' then 0
  when ${friends.category} = 'designer' then 1
  when ${friends.category} = 'blogger' then 2
  when ${friends.category} = 'creator' then 3
  else 4
end`;

const buildWhere = ({
  query,
  category,
}: Pick<AdminFriendListQuery, "query" | "category">) => {
  const filters: SQLWrapper[] = [];

  if (query) {
    filters.push(
      or(
        ilike(friends.name, `%${query}%`),
        ilike(friends.url, `%${query}%`),
        ilike(friends.description, `%${query}%`),
      )!,
    );
  }

  if (category) {
    filters.push(eq(friends.category, category));
  }

  return filters.length > 0 ? and(...filters) : undefined;
};

const countFriends = async (where?: SQL<unknown>) => {
  const rows = await db
    .select({
      total: sql<number>`count(*)`.mapWith(Number),
    })
    .from(friends)
    .where(where);

  return rows[0]?.total ?? 0;
};

const buildAdminOrderBy = ({
  sortBy,
  sortDirection,
}: Pick<AdminFriendListQuery, "sortBy" | "sortDirection">) => {
  if (sortBy === "category") {
    return [
      sortDirection === "asc"
        ? sql`${categoryOrder} asc`
        : sql`${categoryOrder} desc`,
      asc(friends.name),
      desc(friends.id),
    ] as const;
  }

  if (sortBy === "name") {
    return [
      sortDirection === "asc" ? asc(friends.name) : desc(friends.name),
      asc(categoryOrder),
      desc(friends.id),
    ] as const;
  }

  return [
    sortDirection === "asc" ? asc(friends.updatedAt) : desc(friends.updatedAt),
    asc(categoryOrder),
    asc(friends.name),
    desc(friends.id),
  ] as const;
};

export const friendRepository: FriendRepository = {
  async listAdmin({ page, pageSize, query, category, sortBy, sortDirection }) {
    const offset = (page - 1) * pageSize;
    const where = buildWhere({ query, category });
    const [items, total] = await Promise.all([
      db
        .select()
        .from(friends)
        .where(where)
        .orderBy(...buildAdminOrderBy({ sortBy, sortDirection }))
        .limit(pageSize)
        .offset(offset),
      countFriends(where),
    ]);

    return { items, total };
  },
  async listPublic() {
    return await db
      .select()
      .from(friends)
      .orderBy(asc(categoryOrder), asc(friends.name), desc(friends.id));
  },
  async findById(id) {
    const rows = await db
      .select()
      .from(friends)
      .where(eq(friends.id, id))
      .limit(1);

    return rows[0] ?? null;
  },
  async findByUrl(url) {
    const rows = await db
      .select()
      .from(friends)
      .where(eq(friends.url, url))
      .limit(1);

    return rows[0] ?? null;
  },
  async create(friend) {
    const rows = await db.insert(friends).values(friend).returning();
    return rows[0] as Friend;
  },
  async update(id, friend) {
    const rows = await db
      .update(friends)
      .set(friend)
      .where(eq(friends.id, id))
      .returning();

    return rows[0] ?? null;
  },
  async delete(id) {
    const rows = await db.delete(friends).where(eq(friends.id, id)).returning({
      id: friends.id,
    });

    return rows.length > 0;
  },
};
