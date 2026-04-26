import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { schema } from "./schema";

export const createDb = (connectionString: string) => {
  const client = postgres(connectionString, {
    prepare: false,
  });

  return drizzle(client, { schema });
};

type Db = ReturnType<typeof createDb>;

const globalForDb = globalThis as typeof globalThis & {
  __db?: Db;
};

export const getDb = () => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required to create the Drizzle client.");
  }

  if (process.env.NODE_ENV === "production") {
    return createDb(connectionString);
  }

  if (!globalForDb.__db) {
    globalForDb.__db = createDb(connectionString);
  }

  return globalForDb.__db;
};

export const db = new Proxy({} as Db, {
  get(_target, property) {
    return getDb()[property as keyof Db];
  },
});
