import { drizzle } from "drizzle-orm/postgres-js";
import "dotenv/config";
import { reset } from "drizzle-seed";
import postgres from "postgres";

import { schema } from "../lib/db/schema";

const encoder = new TextEncoder();

function writeLine(message: string) {
  process.stdout.write(encoder.encode(`${message}\n`));
}

function writeError(message: string) {
  process.stderr.write(encoder.encode(`${message}\n`));
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to reset the database.");
  }

  const client = postgres(databaseUrl, {
    max: 1,
    onnotice: () => {},
    prepare: false,
  });
  const db = drizzle(client, { schema });

  try {
    writeLine("Resetting database tables...");
    await reset(db, schema);

    writeLine("Database reset complete.");
  } finally {
    await client.end();
  }
}

void main().catch((error: unknown) => {
  writeError(
    error instanceof Error ? error.message : "Failed to reset database.",
  );
  process.exitCode = 1;
});
