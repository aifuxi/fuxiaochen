# Performance: Prepared Statements

## Why It Matters

Prepared statements compile SQL once and reuse the compiled plan for subsequent executions.
This eliminates repeated parsing and planning overhead, which matters for queries that run
frequently with different parameters (e.g., per-request lookups).

## How It Works

When you call `.prepare()` on a query builder, Drizzle creates a reusable statement.
Each `.execute()` call reuses the compiled binary format instead of sending raw SQL text.

## Basic Usage

```typescript
const db = drizzle(...);

// Prepare once (at module scope or during initialization)
const getUserById = db
  .select()
  .from(users)
  .where(eq(users.id, sql.placeholder('id')))
  .prepare('get_user_by_id'); // name is required for PostgreSQL

// Execute many times with different parameters
const user1 = await getUserById.execute({ id: 1 });
const user2 = await getUserById.execute({ id: 2 });
const user3 = await getUserById.execute({ id: 3 });
```

## Placeholders

Use `sql.placeholder()` for parameterized values:

```typescript
import { sql } from 'drizzle-orm';

const getPostsByAuthor = db
  .select()
  .from(posts)
  .where(
    and(
      eq(posts.authorId, sql.placeholder('authorId')),
      eq(posts.published, sql.placeholder('published')),
    )
  )
  .limit(sql.placeholder('limit'))
  .prepare('get_posts_by_author');

const result = await getPostsByAuthor.execute({
  authorId: 1,
  published: true,
  limit: 10,
});
```

## PostgreSQL Statement Names

A statement name is required when preparing queries for Postgres:

```typescript
.prepare('statement_name');
```

The name must be unique within the connection. Use descriptive names that reflect the query.

## With Relational Queries

```typescript
const getUserWithPosts = db.query.users.findFirst({
  where: eq(users.id, sql.placeholder('id')),
  with: {
    posts: true,
  },
}).prepare('get_user_with_posts');

const result = await getUserWithPosts.execute({ id: 1 });
```

## When to Use Prepared Statements

Prepared statements help most when:
- The same query runs many times with different parameters (e.g., REST API endpoints)
- You're in a serverless environment and want to minimize per-request overhead
- Query planning is expensive (complex joins, many indexes to choose from)

They help less when:
- Each query is unique (ad-hoc analytics, one-off scripts)
- You're using connection pooling that doesn't support prepared statements on the pool level

## References

- https://orm.drizzle.team/docs/perf-queries
