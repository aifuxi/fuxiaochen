import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { schema } from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to create the Drizzle client.");
}

const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });
