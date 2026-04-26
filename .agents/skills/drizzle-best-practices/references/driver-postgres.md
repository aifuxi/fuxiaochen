# Drivers: PostgreSQL Setup

## Why It Matters

Drizzle is driver-agnostic — it doesn't ship its own database driver. You pick the Postgres
driver that fits your environment, and Drizzle wraps it with its query builder and type system.
Using the wrong driver or initializing it incorrectly causes connection failures, memory leaks,
or poor performance.

## node-postgres (pg) — Most Common for Node.js Servers

The standard choice for long-running Node.js servers (Express, Fastify, NestJS, etc.):

```typescript
import { drizzle } from 'drizzle-orm/node-postgres';

// Simplest: connection string
const db = drizzle(process.env.DATABASE_URL!);

// With pool configuration
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
});
const db = drizzle({ client: pool });
```

When using a pool, close it on shutdown:

```typescript
process.on('SIGTERM', async () => {
  await pool.end();
});
```

## postgres.js — Lightweight Alternative

A modern, fast Postgres client. Good for both servers and serverless:

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle({ client });
```

## Neon HTTP — For Serverless (No Persistent Connections)

Uses HTTP to query Neon databases. Each query is a standalone request — no connection pool
needed. Ideal for serverless and edge:

```typescript
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });
```

## Neon WebSocket — Serverless with Transaction Support

Neon HTTP doesn't support multi-statement transactions. If you need transactions in
serverless, use the WebSocket driver:

```typescript
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool });
```

## Supabase

Use postgres.js or node-postgres with the Supabase pooler URL:

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Use the pooler connection string, not the direct one
const client = postgres(process.env.SUPABASE_DB_URL!);
const db = drizzle({ client });
```

## Passing Schema for Relational Queries

If you use `db.query` (the relational API), you must pass your schema or relations:

```typescript
import * as schema from './schema';

// Legacy relations API — pass entire schema
const db = drizzle({ client: pool, schema });

// Relations v2 — pass relations object
import { relations } from './relations';
const db = drizzle({ client: pool, relations });
```

Without this, `db.query` won't be available or will have no type information.

## Logging and Debugging

Enable query logging to see the SQL Drizzle generates:

```typescript
// Simple: log all queries to console
const db = drizzle({ client: pool, logger: true });

// Custom logger
const db = drizzle({
  client: pool,
  logger: {
    logQuery(query: string, params: unknown[]) {
      console.log('SQL:', query);
      console.log('Params:', params);
    },
  },
});
```

To inspect a query without executing it, use `.toSQL()`:

```typescript
const query = db
  .select()
  .from(usersTable)
  .where(eq(usersTable.id, 1))
  .toSQL();

console.log(query.sql);    // SELECT ... FROM "users" WHERE "users"."id" = $1
console.log(query.params); // [1]
```

## Driver Selection Guide

| Environment | Recommended Driver |
|-------------|-------------------|
| Traditional server (Express, Fastify) | `drizzle-orm/node-postgres` |
| Traditional server (lightweight) | `drizzle-orm/postgres-js` |
| Serverless + Neon | `drizzle-orm/neon-http` |
| Serverless + Neon + transactions | `drizzle-orm/neon-serverless` |
| Serverless + Supabase | `drizzle-orm/postgres-js` + pooler |
| Serverless + AWS RDS | `drizzle-orm/node-postgres` + RDS Proxy |
| Edge runtime (Vercel Edge, Workers) | `drizzle-orm/neon-http` |

## Incorrect Patterns

```typescript
// Wrong: creating a new drizzle instance per request
app.get('/users', async (req, res) => {
  const db = drizzle(process.env.DATABASE_URL!); // new instance every time
  // Create db once at module scope and reuse it
});

// Wrong: using direct DB URL in serverless without a pooler
// Each invocation opens a new connection, quickly exhausting the limit
const db = drizzle(process.env.DIRECT_DATABASE_URL!);
// Use a connection pooler (PgBouncer, Supabase pooler, Neon pooler) instead
```

## References

- https://orm.drizzle.team/docs/get-started
- https://orm.drizzle.team/docs/connect-overview
