# Query: Select Patterns

## Why It Matters

Drizzle provides two query APIs: the SQL-like `select()` builder and the relational `db.query`
API. Knowing when to use each and how to use them correctly prevents common pitfalls like
fetching too much data, getting wrong types from joins, or writing unnecessarily complex code.

## The Two APIs

### SQL-like API (`db.select()`)
Best for: precise control over the SQL being generated, complex joins, aggregations, subqueries.

### Relational Query API (`db.query`)
Best for: fetching related data in nested structures, avoiding manual join logic.

## Incorrect

```typescript
// Selecting all columns when you only need a few
const users = await db.select().from(usersTable);

// Wrong: using sql-like API for simple relational fetches
const postsWithAuthors = await db
  .select()
  .from(postsTable)
  .leftJoin(usersTable, eq(postsTable.authorId, usersTable.id));
// Returns flat { posts: {...}, users: {...} | null } — not nested
```

**Problems:**
- `select()` with no partial select fetches every column
- Left joins return flat objects, not nested structures — you have to manually reshape
- Type of joined table is `T | null` which requires null checks everywhere

## Correct

### Partial Select — only fetch what you need

```typescript
const userEmails = await db
  .select({
    id: usersTable.id,
    email: usersTable.email,
  })
  .from(usersTable);
// Type: { id: number; email: string }[]
```

### Relational Query — for nested data

```typescript
const postsWithAuthors = await db.query.posts.findMany({
  with: {
    author: true,
  },
});
// Type: { id: number; title: string; author: { id: number; name: string } }[]
```

### Joins — when you need SQL-level control

```typescript
// Inner join with partial select
const result = await db
  .select({
    postTitle: postsTable.title,
    authorName: usersTable.name,
  })
  .from(postsTable)
  .innerJoin(usersTable, eq(postsTable.authorId, usersTable.id));
// Type: { postTitle: string; authorName: string }[]
```

### findFirst — single record with a condition

```typescript
const user = await db.query.users.findFirst({
  where: eq(usersTable.id, 1),
  with: {
    posts: {
      limit: 5,
      orderBy: postsTable.createdAt,
    },
  },
});
```

### Partial Select in Relational Queries

```typescript
const result = await db.query.users.findMany({
  columns: {
    id: true,
    name: true,
  },
  with: {
    posts: {
      columns: {
        title: true,
      },
    },
  },
});
// Only fetches id, name from users and title from posts
```

## Count Queries

Count returns a string in Postgres. Use `.mapWith(Number)` to get an actual number:

```typescript
import { sql } from 'drizzle-orm';

// Correct: map to number
const [{ count }] = await db
  .select({ count: sql<number>`count(*)`.mapWith(Number) })
  .from(usersTable);
// count is number 42

// Wrong: forgetting mapWith
const [{ count: rawCount }] = await db
  .select({ count: sql<number>`count(*)` })
  .from(usersTable);
// rawCount is actually string "42" at runtime despite the <number> generic
// The generic only affects compile-time types, not runtime values
```

### Count with Conditions

```typescript
const [{ activeCount }] = await db
  .select({
    activeCount: sql<number>`count(*) filter (where ${usersTable.isActive})`.mapWith(Number),
  })
  .from(usersTable);
```

## When to Use Which API

| Scenario | Use |
|----------|-----|
| Fetch a record with its related data | `db.query.table.findMany({ with })` |
| Aggregate queries (COUNT, SUM, AVG) | `db.select()` with `sql` operator |
| Complex multi-table joins | `db.select()` with explicit joins |
| Subqueries | `db.select()` |
| Simple CRUD | Either works — relational API is often cleaner |

## References

- https://orm.drizzle.team/docs/select
- https://orm.drizzle.team/docs/joins
- https://orm.drizzle.team/docs/rqb-v2
