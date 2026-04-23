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
import {
  accounts,
  sessions,
  users,
  type User,
  type UserRole,
} from "@/lib/db/schema";

import type { AdminUserListQuery } from "./dto";

export type AdminUserRecord = User & {
  linkedProviders: string[];
  sessionCount: number;
  lastSessionAt: Date | string | null;
};

export type AdminUserStats = {
  total: number;
  admins: number;
  users: number;
  verified: number;
};

export interface UserRepository {
  listAdmin(query: AdminUserListQuery): Promise<{
    items: AdminUserRecord[];
    total: number;
    stats: AdminUserStats;
  }>;
  findById(id: string): Promise<AdminUserRecord | null>;
  countByRole(role: UserRole): Promise<number>;
  updateRole(id: string, role: UserRole): Promise<User | null>;
  deleteSessionsByUserId(userId: string): Promise<number>;
}

const accountAggregates = db
  .select({
    userId: accounts.userId,
    linkedProviders: sql<
      string[]
    >`coalesce(array_agg(distinct ${accounts.providerId}) filter (where ${accounts.providerId} is not null), '{}'::text[])`.as(
      "linked_providers",
    ),
  })
  .from(accounts)
  .groupBy(accounts.userId)
  .as("account_aggregates");

const sessionAggregates = db
  .select({
    userId: sessions.userId,
    sessionCount: sql<number>`count(*)`.mapWith(Number).as("session_count"),
    lastSessionAt: sql<Date | string | null>`max(${sessions.updatedAt})`.as(
      "last_session_at",
    ),
  })
  .from(sessions)
  .groupBy(sessions.userId)
  .as("session_aggregates");

const buildWhere = ({
  query,
  role,
}: Pick<AdminUserListQuery, "query" | "role">) => {
  const filters: SQLWrapper[] = [];

  if (query) {
    filters.push(
      or(ilike(users.name, `%${query}%`), ilike(users.email, `%${query}%`))!,
    );
  }

  if (role) {
    filters.push(eq(users.role, role));
  }

  return filters.length > 0 ? and(...filters) : undefined;
};

const adminOrderByMap = {
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
  name: users.name,
  email: users.email,
} as const;

const buildAdminOrderBy = ({
  sortBy,
  sortDirection,
}: Pick<AdminUserListQuery, "sortBy" | "sortDirection">) => [
  sortDirection === "asc"
    ? asc(adminOrderByMap[sortBy])
    : desc(adminOrderByMap[sortBy]),
  asc(users.name),
  asc(users.email),
  desc(users.id),
];

const adminUserSelect = {
  id: users.id,
  name: users.name,
  email: users.email,
  emailVerified: users.emailVerified,
  image: users.image,
  role: users.role,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
  linkedProviders: sql<
    string[]
  >`coalesce(${accountAggregates.linkedProviders}, '{}'::text[])`,
  sessionCount:
    sql<number>`coalesce(${sessionAggregates.sessionCount}, 0)`.mapWith(Number),
  lastSessionAt: sessionAggregates.lastSessionAt,
};

const createAdminUserQuery = (where?: SQL<unknown>) =>
  db
    .select(adminUserSelect)
    .from(users)
    .leftJoin(accountAggregates, eq(users.id, accountAggregates.userId))
    .leftJoin(sessionAggregates, eq(users.id, sessionAggregates.userId))
    .where(where);

const countUsers = async (where?: SQL<unknown>) => {
  const rows = await db
    .select({
      total: sql<number>`count(*)`.mapWith(Number),
    })
    .from(users)
    .where(where);

  return rows[0]?.total ?? 0;
};

const getUserStats = async (): Promise<AdminUserStats> => {
  const rows = await db
    .select({
      total: sql<number>`count(*)`.mapWith(Number),
      admins:
        sql<number>`count(*) filter (where ${users.role} = 'admin')`.mapWith(
          Number,
        ),
      users:
        sql<number>`count(*) filter (where ${users.role} = 'user')`.mapWith(
          Number,
        ),
      verified:
        sql<number>`count(*) filter (where ${users.emailVerified} = true)`.mapWith(
          Number,
        ),
    })
    .from(users);

  return (
    rows[0] ?? {
      total: 0,
      admins: 0,
      users: 0,
      verified: 0,
    }
  );
};

export const userRepository: UserRepository = {
  async listAdmin({ page, pageSize, query, role, sortBy, sortDirection }) {
    const offset = (page - 1) * pageSize;
    const where = buildWhere({ query, role });
    const [items, total, stats] = await Promise.all([
      createAdminUserQuery(where)
        .orderBy(...buildAdminOrderBy({ sortBy, sortDirection }))
        .limit(pageSize)
        .offset(offset),
      countUsers(where),
      getUserStats(),
    ]);

    return {
      items,
      total,
      stats,
    };
  },
  async findById(id) {
    const rows = await createAdminUserQuery(eq(users.id, id)).limit(1);

    return rows[0] ?? null;
  },
  async countByRole(role) {
    const rows = await db
      .select({
        total: sql<number>`count(*)`.mapWith(Number),
      })
      .from(users)
      .where(eq(users.role, role));

    return rows[0]?.total ?? 0;
  },
  async updateRole(id, role) {
    const rows = await db
      .update(users)
      .set({
        role,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return rows[0] ?? null;
  },
  async deleteSessionsByUserId(userId) {
    const rows = await db
      .delete(sessions)
      .where(eq(sessions.userId, userId))
      .returning({
        id: sessions.id,
      });

    return rows.length;
  },
};
