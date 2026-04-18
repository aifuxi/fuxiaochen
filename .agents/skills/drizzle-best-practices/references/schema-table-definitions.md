# Schema: Table Definitions

## Why It Matters

Table definitions are the foundation of every Drizzle project. How you structure your schema
files affects type inference, migration generation, and query ergonomics. A well-organized
schema makes your codebase navigable and your queries type-safe.

## Incorrect

Defining tables without proper organization or using inconsistent patterns:

```typescript
// schema.ts - everything in one massive file with inconsistent patterns
import { pgTable, serial, varchar, integer } from 'drizzle-orm/pg-core';

// Using string column names inconsistently
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  firstName: varchar('firstName', { length: 256 }), // camelCase in DB
  last_name: varchar('last_name', { length: 256 }), // snake_case in DB
  email: varchar('email'),
});

// Forgetting to export - breaks migration generation
const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: varchar('title'),
  userId: integer('userId'), // no foreign key reference
});
```

**Problems:**
- Mixed naming conventions in the database (camelCase vs snake_case)
- Table not exported, so `drizzle-kit` won't detect it
- No foreign key reference means no referential integrity
- Single massive schema file becomes unmaintainable

## Correct

```typescript
// db/schema/users.ts
import { pgTable, varchar, integer } from 'drizzle-orm/pg-core';
import * as t from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  firstName: t.varchar('first_name', { length: 256 }),
  lastName: t.varchar('last_name', { length: 256 }),
  email: t.varchar('email', { length: 256 }).notNull(),
});
```

```typescript
// db/schema/posts.ts
import { pgTable, varchar, integer, text, timestamp } from 'drizzle-orm/pg-core';
import * as t from 'drizzle-orm/pg-core';
import { users } from './users';

export const posts = pgTable('posts', {
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  title: t.varchar('title', { length: 256 }).notNull(),
  content: t.text('content'),
  authorId: t.integer('author_id').notNull().references(() => users.id),
  createdAt: t.timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
```

```typescript
// db/schema/index.ts - barrel export
export * from './users';
export * from './posts';
```

**Why this is better:**
- Consistent snake_case in the database, camelCase in TypeScript
- Every table is exported for migration detection
- Foreign keys enforce referential integrity
- Split files keep schema manageable as it grows
- Barrel export gives a single import point

## Notes

Use `generatedAlwaysAsIdentity()` for primary keys instead of the deprecated `serial()`.
The `serial` type is a Postgres legacy — identity columns are the modern standard. See
`engine-postgres.md` for more on identity columns, UUIDs, and other Postgres-specific types.

## References

- https://orm.drizzle.team/docs/sql-schema-declaration
- https://orm.drizzle.team/docs/column-types/pg
