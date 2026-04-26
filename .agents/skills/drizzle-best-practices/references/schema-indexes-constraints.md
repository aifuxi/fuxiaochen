# Schema: Indexes and Constraints

## Why It Matters

Indexes speed up queries. Constraints protect your data. Without them, your application
will slow down as data grows and allow invalid data to enter the database. Drizzle lets
you declare both inline (on columns) and as separate declarations in the table's third
argument.

## Incorrect

```typescript
import { pgTable, integer, varchar, text } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  email: varchar('email', { length: 256 }).notNull(), // frequently queried but no index
  username: varchar('username', { length: 64 }).notNull(), // should be unique
});

export const posts = pgTable('posts', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar('title', { length: 256 }),
  authorId: integer('author_id').notNull(), // FK without index = slow joins
  categoryId: integer('category_id').notNull(),
});
```

**Problems:**
- No index on `email` despite being used in lookups
- No unique constraint on `username`
- Foreign key columns without indexes cause slow joins on large tables
- No references — the database won't enforce that `authorId` points to a real user

## Correct

```typescript
import { pgTable, integer, varchar, text, index, uniqueIndex } from 'drizzle-orm/pg-core';
import * as t from 'drizzle-orm/pg-core';
import { users } from './users';

export const users = pgTable(
  'users',
  {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    email: t.varchar('email', { length: 256 }).notNull(),
    username: t.varchar('username', { length: 64 }).notNull(),
  },
  (table) => [
    t.uniqueIndex('users_email_idx').on(table.email),
    t.uniqueIndex('users_username_idx').on(table.username),
  ]
);

export const posts = pgTable(
  'posts',
  {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    title: t.varchar('title', { length: 256 }).notNull(),
    authorId: t.integer('author_id').notNull().references(() => users.id),
    categoryId: t.integer('category_id').notNull(),
  },
  (table) => [
    t.index('posts_author_id_idx').on(table.authorId),
    t.index('posts_category_id_idx').on(table.categoryId),
  ]
);
```

## Composite Indexes and Primary Keys

For lookup tables and junction tables, use composite primary keys:

```typescript
import { pgTable, integer, primaryKey, timestamp } from 'drizzle-orm/pg-core';
import * as t from 'drizzle-orm/pg-core';

export const usersToGroups = pgTable(
  'users_to_groups',
  {
    userId: t.integer('user_id').notNull().references(() => users.id),
    groupId: t.integer('group_id').notNull().references(() => groups.id),
    joinedAt: t.timestamp('joined_at').notNull().defaultNow(),
  },
  (table) => [
    t.primaryKey({ columns: [table.userId, table.groupId] }),
  ]
);
```

## Composite Indexes for Multi-Column Queries

If you frequently query by multiple columns together, a composite index helps:

```typescript
export const events = pgTable(
  'events',
  {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: t.integer('user_id').notNull(),
    type: t.varchar('type', { length: 64 }).notNull(),
    createdAt: t.timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    // Composite index for queries filtering by userId + type
    t.index('events_user_type_idx').on(table.userId, table.type),
  ]
);
```

## Inline vs Table-Level Constraints

Drizzle supports both. Use inline for simple cases, table-level for composite:

```typescript
// Inline: simple unique constraint
email: varchar('email').unique(),

// Inline: simple foreign key
authorId: integer('author_id').references(() => users.id),

// Table-level: composite unique constraint
(table) => [
  t.unique('unique_org_name').on(table.orgId, table.name),
]

// Table-level: foreign key with onDelete
(table) => [
  t.foreignKey({
    columns: [table.authorId],
    foreignColumns: [users.id],
  }).onDelete('cascade'),
]
```

## References

- https://orm.drizzle.team/docs/indexes-constraints
