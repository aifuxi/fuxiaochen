# Engine: PostgreSQL

Postgres-specific features, types, and patterns in Drizzle ORM. This file covers things
that only apply to PostgreSQL and don't exist in other engines. For general Drizzle patterns
that work across all databases, see the other reference files.

## Identity Columns (Primary Keys)

Use `generatedAlwaysAsIdentity()` instead of the legacy `serial()` type. Identity columns
are the modern Postgres standard (introduced in Postgres 10) and give you more control over
sequence behavior.

```typescript
import * as t from 'drizzle-orm/pg-core';

// Preferred: identity column
export const users = pgTable('users', {
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
});

// Also valid: identity with custom sequence options
export const orders = pgTable('orders', {
  id: t.integer().primaryKey().generatedAlwaysAsIdentity({
    startWith: 1000,
    increment: 1,
  }),
});

// Legacy (avoid in new projects): serial
export const legacyTable = pgTable('legacy', {
  id: t.serial('id').primaryKey(), // works, but prefer identity columns
});
```

`serial` creates an implicit sequence that's not tied to the column in the catalog, which
makes schema introspection and migrations messier. Identity columns are explicit and cleaner.

## UUID Primary Keys

Postgres has native UUID support. Use `uuid()` with `defaultRandom()` for UUID v4 primary
keys:

```typescript
export const sessions = pgTable('sessions', {
  id: t.uuid('id').defaultRandom().primaryKey(),
  userId: t.integer('user_id').notNull().references(() => users.id),
  createdAt: t.timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
```

For UUID v7 (time-sortable), use `$defaultFn`:

```typescript
import { uuidv7 } from 'uuidv7';

export const events = pgTable('events', {
  id: t.uuid('id').$defaultFn(() => uuidv7()).primaryKey(),
});
```

## JSONB

Postgres JSONB stores structured data with indexing and querying support. Always prefer
`jsonb` over `json` — JSONB is stored in a decomposed binary format that's faster to query.

```typescript
export const users = pgTable('users', {
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  // Typed JSONB — TypeScript knows the shape
  preferences: t.jsonb('preferences').$type<{
    theme: 'light' | 'dark';
    language: string;
    notifications: { email: boolean; push: boolean };
  }>(),
  // Untyped JSONB — TypeScript type is `unknown`
  rawData: t.jsonb('raw_data'),
});
```

Query JSONB fields with the `sql` operator:

```typescript
// Filter on a JSONB field
await db.select().from(users).where(
  sql`${users.preferences}->>'theme' = 'dark'`
);

// Select a JSONB subfield
await db.select({
  id: users.id,
  theme: sql<string>`${users.preferences}->>'theme'`,
}).from(users);
```

## Arrays

Postgres supports native array columns. Use `.array()` on any column type:

```typescript
export const posts = pgTable('posts', {
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  tags: t.text('tags').array().notNull().default([]),
  scores: t.integer('scores').array(),
});
```

Query arrays with Postgres array operators:

```typescript
// Check if array contains a value
await db.select().from(posts).where(
  sql`'typescript' = ANY(${posts.tags})`
);

// Check if arrays overlap
await db.select().from(posts).where(
  sql`${posts.tags} && ARRAY['typescript', 'javascript']`
);
```

## Enums

Postgres has native enum types. Define them with `pgEnum`:

```typescript
import { pgEnum } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['admin', 'user', 'guest']);
export const statusEnum = pgEnum('status', ['active', 'inactive', 'pending']);

export const users = pgTable('users', {
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  role: roleEnum('role').notNull().default('user'),
  status: statusEnum('status').notNull().default('active'),
});
```

The enum is created in the database via migrations. TypeScript infers a union type:
`'admin' | 'user' | 'guest'`.

## Timestamps

Always use `withTimezone: true` for timestamps. Without it, Postgres stores the timestamp
without timezone info, which causes bugs when your server and database are in different
timezones.

```typescript
export const events = pgTable('events', {
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  // Correct: timestamp with timezone
  createdAt: t.timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: t.timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  // Also available: date (no time component)
  birthday: t.date('birthday'),
});
```

## Numeric / Decimal

For exact decimal math (money, accounting), use `numeric` with precision and scale.
Note: Drizzle returns `numeric` as a `string` to preserve precision.

```typescript
export const products = pgTable('products', {
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  price: t.numeric('price', { precision: 10, scale: 2 }).notNull(),
});

// price is typed as string: "19.99"
// Use parseFloat() or a decimal library when you need arithmetic
```

## Text Search

Postgres has built-in full-text search. Use `tsvector` columns with GIN indexes:

```typescript
export const articles = pgTable(
  'articles',
  {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    title: t.text('title').notNull(),
    body: t.text('body').notNull(),
    searchVector: t.text('search_vector'),
  },
  (table) => [
    t.index('articles_search_idx').using('gin', sql`to_tsvector('english', ${table.title} || ' ' || ${table.body})`),
  ]
);

// Full-text search query
await db.select().from(articles).where(
  sql`to_tsvector('english', ${articles.title} || ' ' || ${articles.body}) @@ plainto_tsquery('english', ${searchTerm})`
);
```

## Postgres-Specific Index Types

Beyond standard B-tree indexes, Postgres supports:

```typescript
(table) => [
  // GIN — for JSONB, arrays, full-text search
  t.index('idx_gin').using('gin', table.metadata),

  // GiST — for geometric, range, and full-text data
  t.index('idx_gist').using('gist', table.location),

  // BRIN — for large, naturally ordered tables (timestamps, sequential IDs)
  t.index('idx_brin').using('brin', table.createdAt),

  // Partial index — index only rows matching a condition
  t.index('idx_active').on(table.email).where(sql`${table.isActive} = true`),
]
```

## Views

Drizzle supports Postgres views:

```typescript
import { pgView } from 'drizzle-orm/pg-core';

export const activeUsers = pgView('active_users').as((qb) =>
  qb.select().from(users).where(eq(users.isActive, true))
);

// Query the view like a table
await db.select().from(activeUsers);
```

## Materialized Views

```typescript
import { pgMaterializedView } from 'drizzle-orm/pg-core';

export const userStats = pgMaterializedView('user_stats').as((qb) =>
  qb.select({
    userId: posts.authorId,
    postCount: sql<number>`count(*)`.mapWith(Number),
  }).from(posts).groupBy(posts.authorId)
);

// Query the materialized view
await db.select().from(userStats);

// Refresh it (via raw SQL)
await db.execute(sql`REFRESH MATERIALIZED VIEW user_stats`);
```

## Schemas (Namespaces)

Postgres supports schemas for organizing tables:

```typescript
import { pgSchema } from 'drizzle-orm/pg-core';

const authSchema = pgSchema('auth');

export const authUsers = authSchema.table('users', {
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  email: t.text('email').notNull(),
});
// Creates table in the "auth" schema: auth.users
```

## References

- https://orm.drizzle.team/docs/column-types/pg
- https://orm.drizzle.team/docs/indexes-constraints
- https://orm.drizzle.team/docs/views
