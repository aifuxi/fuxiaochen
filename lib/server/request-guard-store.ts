import { and, inArray, lte, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { requestGuardStates } from "@/lib/db/schema";

type GuardStateType = "counter" | "marker" | "lock";

type TimedKeyInput = {
  key: string;
  now: Date;
  ttlSeconds: number;
};

type SetInput = TimedKeyInput & {
  type: GuardStateType;
};

export interface RequestGuardStore {
  incrementFixedWindow(input: TimedKeyInput): Promise<number>;
  setIfNotExists(input: SetInput): Promise<boolean>;
  set(input: SetInput): Promise<void>;
  exists(keys: string[], now: Date): Promise<boolean>;
  deleteKeys(keys: string[]): Promise<void>;
}

const addSeconds = (date: Date, seconds: number) =>
  new Date(date.getTime() + seconds * 1000);

const cleanupExpiredKeys = async (keys: string[], now: Date) => {
  if (keys.length === 0) {
    return;
  }

  await db
    .delete(requestGuardStates)
    .where(
      and(
        inArray(requestGuardStates.key, keys),
        lte(requestGuardStates.expiresAt, now),
      ),
    );
};

const cleanupExpiredStates = async (now: Date) => {
  await db
    .delete(requestGuardStates)
    .where(lte(requestGuardStates.expiresAt, now));
};

export const postgresRequestGuardStore: RequestGuardStore = {
  async incrementFixedWindow({ key, now, ttlSeconds }) {
    await cleanupExpiredStates(now);

    const rows = await db
      .insert(requestGuardStates)
      .values({
        key,
        type: "counter",
        count: 1,
        createdAt: now,
        updatedAt: now,
        expiresAt: addSeconds(now, ttlSeconds),
      })
      .onConflictDoUpdate({
        target: requestGuardStates.key,
        set: {
          count: sql`${requestGuardStates.count} + 1`,
          updatedAt: now,
        },
      })
      .returning({ count: requestGuardStates.count });

    return rows[0]?.count ?? 0;
  },
  async setIfNotExists({ key, now, ttlSeconds, type }) {
    await cleanupExpiredStates(now);

    const rows = await db
      .insert(requestGuardStates)
      .values({
        key,
        type,
        count: 1,
        createdAt: now,
        updatedAt: now,
        expiresAt: addSeconds(now, ttlSeconds),
      })
      .onConflictDoNothing()
      .returning({ key: requestGuardStates.key });

    return rows.length > 0;
  },
  async set({ key, now, ttlSeconds, type }) {
    await cleanupExpiredStates(now);

    await db
      .insert(requestGuardStates)
      .values({
        key,
        type,
        count: 1,
        createdAt: now,
        updatedAt: now,
        expiresAt: addSeconds(now, ttlSeconds),
      })
      .onConflictDoUpdate({
        target: requestGuardStates.key,
        set: {
          type,
          count: 1,
          updatedAt: now,
          expiresAt: addSeconds(now, ttlSeconds),
        },
      });
  },
  async exists(keys, now) {
    if (keys.length === 0) {
      return false;
    }

    await cleanupExpiredKeys(keys, now);

    const rows = await db
      .select({ key: requestGuardStates.key })
      .from(requestGuardStates)
      .where(inArray(requestGuardStates.key, keys))
      .limit(1);

    return rows.length > 0;
  },
  async deleteKeys(keys) {
    if (keys.length === 0) {
      return;
    }

    await db
      .delete(requestGuardStates)
      .where(inArray(requestGuardStates.key, keys));
  },
};

export const cleanupExpiredRequestGuardStates = cleanupExpiredStates;
