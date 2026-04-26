import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { schema } from "./schema";

const DEFAULT_DATABASE_MAX_CONNECTIONS = 3;

function getDatabaseMaxConnections() {
  const value = process.env.DATABASE_MAX_CONNECTIONS;

  if (!value) {
    return DEFAULT_DATABASE_MAX_CONNECTIONS;
  }

  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isSafeInteger(parsedValue) || parsedValue < 1) {
    throw new Error("DATABASE_MAX_CONNECTIONS must be a positive integer.");
  }

  return parsedValue;
}

export const createDb = (connectionString: string) => {
  const client = postgres(connectionString, {
    max: getDatabaseMaxConnections(),
    prepare: false,
  });

  return drizzle(client, { schema });
};

type Db = ReturnType<typeof createDb>;

const globalForDb = globalThis as typeof globalThis & {
  __fuxiaochenDb?: {
    connectionString: string;
    db: Db;
  };
};

export const getDb = () => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required to create the Drizzle client.");
  }

  if (globalForDb.__fuxiaochenDb?.connectionString !== connectionString) {
    globalForDb.__fuxiaochenDb = {
      connectionString,
      db: createDb(connectionString),
    };
  }

  return globalForDb.__fuxiaochenDb.db;
};

export const db = new Proxy({} as Db, {
  get(_target, property) {
    return getDb()[property as keyof Db];
  },
});
