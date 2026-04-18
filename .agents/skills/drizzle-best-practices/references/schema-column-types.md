# Schema: Column Types

## Why It Matters

Choosing the right column types ensures data integrity, optimal storage, and correct TypeScript
type inference. Drizzle maps database types to TypeScript types, so a wrong column type can
cause runtime surprises even when TypeScript compiles cleanly.

## Incorrect

```typescript
import { pgTable, text, integer, varchar } from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
  id: integer('id').primaryKey(), // no auto-generation strategy
  price: text('price'), // storing numbers as text
  isActive: text('is_active'), // storing booleans as text
  metadata: text('metadata'), // storing JSON as plain text
  createdAt: text('created_at'), // storing timestamps as text
  tags: varchar('tags', { length: 1000 }), // storing arrays as comma-separated strings
});
```

**Problems:**
- No primary key generation strategy means manual ID management
- Numeric data stored as text loses database-level validation and math operations
- Boolean as text means you get `"true"` / `"false"` strings instead of actual booleans
- JSON as text loses database-level JSON validation and querying
- Timestamps as text prevents date comparisons and timezone handling

## Correct

```typescript
import { pgTable, integer, numeric, boolean, jsonb, timestamp, text } from 'drizzle-orm/pg-core';
import * as t from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  price: t.numeric('price', { precision: 10, scale: 2 }).notNull(),
  isActive: t.boolean('is_active').notNull().default(true),
  metadata: t.jsonb('metadata').$type<{ color: string; size: string }>(),
  createdAt: t.timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  tags: t.text('tags').array(),
});
```

**Why this is better:**
- `generatedAlwaysAsIdentity()` handles ID generation at the database level
- `numeric` with precision/scale stores exact decimal values
- `boolean` maps to actual `true`/`false` in TypeScript
- `jsonb` with `$type<>()` gives you typed JSON with database-level validation
- `timestamp` with `withTimezone` handles timezones correctly
- `text().array()` uses native Postgres arrays

## Key Column Type Mappings (PostgreSQL)

| Use Case | Type | TypeScript |
|----------|------|------------|
| Primary key | `integer().generatedAlwaysAsIdentity()` | `number` |
| UUID primary key | `uuid().defaultRandom()` | `string` |
| Short strings | `varchar({ length: N })` | `string` |
| Long text | `text()` | `string` |
| Exact decimals | `numeric({ precision, scale })` | `string` |
| Integers | `integer()` | `number` |
| Booleans | `boolean()` | `boolean` |
| Timestamps | `timestamp({ withTimezone: true })` | `Date` |
| JSON data | `jsonb().$type<T>()` | `T` |
| Enums | `pgEnum('name', [...])` | `union type` |
| Arrays | `text().array()` | `string[]` |

See `engine-postgres.md` for detailed coverage of Postgres-specific types like JSONB,
arrays, enums, intervals, and full-text search vectors.

## The `$type<T>()` Pattern

When the database type doesn't perfectly map to your TypeScript type, use `$type<T>()` to
override the inferred type:

```typescript
// Postgres JSONB that should be typed as a specific shape
metadata: jsonb('metadata').$type<{ theme: string; lang: string }>(),

// Text column used as a typed union
role: text('role').$type<'admin' | 'user' | 'guest'>().default('guest'),
```

This is compile-time only — it doesn't add any runtime validation.

## References

- https://orm.drizzle.team/docs/column-types/pg
