# Drivers: Serverless and Edge Runtimes (PostgreSQL)

## Why It Matters

Serverless functions (AWS Lambda, Vercel Functions, Cloudflare Workers) have constraints
that traditional servers don't: cold starts, no persistent connections, short execution
limits, and restricted runtimes. Choosing the right Drizzle driver for your Postgres
environment prevents connection exhaustion and compatibility errors.

## The Problem with Persistent Connections

Traditional Postgres drivers (pg, postgres.js) maintain persistent TCP connections. In
serverless environments, this is problematic because each function invocation may create
a new connection, connections aren't shared across invocations, and the database quickly
runs out of connections under load.

## Solutions

### 1. HTTP-Based Drivers (No Connections)

The cleanest solution — each query is an independent HTTP request:

```typescript
// Neon HTTP — zero connection overhead
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });
```

Trade-off: HTTP drivers don't support multi-statement transactions (each query is
independent). Use the WebSocket driver if you need transactions.

### 2. Connection Poolers

Put a pooler between your serverless functions and Postgres:

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Use the POOLER URL — not the direct connection URL
const client = postgres(process.env.DATABASE_POOLER_URL!);
const db = drizzle({ client });
```

Common poolers: PgBouncer, Supabase connection pooler, Neon connection pooler, AWS RDS Proxy.

### 3. WebSocket Drivers (Transactions in Serverless)

When you need transactions but can't use persistent TCP connections:

```typescript
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool });
```

## Platform-Specific Patterns

### Vercel Serverless Functions

```typescript
// Option 1: Neon HTTP (simplest, no transactions)
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });

// Option 2: postgres.js with pooler (full features)
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const client = postgres(process.env.DATABASE_POOLER_URL!);
const db = drizzle({ client });
```

### Vercel Edge Functions

Edge runtimes don't support Node.js TCP connections. You must use HTTP-based drivers:

```typescript
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });
```

### AWS Lambda

```typescript
// Use RDS Proxy to pool connections
import { drizzle } from 'drizzle-orm/node-postgres';

const db = drizzle(process.env.RDS_PROXY_URL!);
```

### Cloudflare Workers (Hyperdrive)

```typescript
// Use Cloudflare Hyperdrive for connection pooling
import { drizzle } from 'drizzle-orm/node-postgres';

export default {
  async fetch(request: Request, env: Env) {
    const db = drizzle(env.HYPERDRIVE.connectionString);
    const users = await db.select().from(usersTable);
    return Response.json(users);
  },
};
```

## Module-Level Initialization

Initialize outside the handler to reuse across warm invocations:

```typescript
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Created once, reused across warm invocations
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });

export async function handler(event: any) {
  const users = await db.select().from(usersTable);
  return { statusCode: 200, body: JSON.stringify(users) };
}
```

## Incorrect Patterns

```typescript
// Wrong: using node-postgres in edge runtimes
// Edge runtimes don't have Node.js net/tls modules
import { drizzle } from 'drizzle-orm/node-postgres'; // Will fail at runtime in edge

// Wrong: not using a connection pooler in Lambda
const db = drizzle(process.env.DIRECT_DATABASE_URL!);
// Each invocation creates a new connection, exhausting the limit

// Wrong: creating the client inside the handler
export async function handler(event) {
  const sql = neon(process.env.DATABASE_URL!); // Re-created on every invocation
  const db = drizzle({ client: sql });
  // Move this outside the handler
}
```

## References

- https://orm.drizzle.team/docs/connect-overview
- https://orm.drizzle.team/docs/get-started/neon-new
- https://orm.drizzle.team/docs/get-started/supabase-new
