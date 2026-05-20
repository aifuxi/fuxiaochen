import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@/lib/env";

import { schema } from "./schema";

const client = postgres(env.DATABASE_URL, { prepare: false });

export const db = drizzle(client, { schema });
