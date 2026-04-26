# Relations: Querying Related Data

## Why It Matters

The relational query API is one of Drizzle's most powerful features. It lets you fetch
nested data (users with their posts, posts with comments and authors) in a single query
without writing manual joins. But using it effectively requires understanding the options
for filtering, limiting, ordering, and selecting columns.

## Basic Relational Queries

### Fetch all with related data

```typescript
const usersWithPosts = await db.query.users.findMany({
  with: {
    posts: true,
  },
});
// [{ id: 1, name: "Alice", posts: [{ id: 1, title: "Hello", ... }] }]
```

### Find a single record

```typescript
const user = await db.query.users.findFirst({
  where: eq(users.id, 1),
  with: {
    posts: true,
  },
});
// { id: 1, name: "Alice", posts: [...] } | undefined
```

## Nested Relations

Nest `with` to fetch deeply related data:

```typescript
const result = await db.query.posts.findMany({
  with: {
    author: true,
    comments: {
      with: {
        author: true,
      },
    },
  },
});
// [{ id: 1, title: "Hello", author: { ... }, comments: [{ content: "...", author: { ... } }] }]
```

## Partial Column Selection

Only fetch the columns you need to reduce data transfer:

```typescript
const result = await db.query.users.findMany({
  columns: {
    id: true,
    name: true,
    // email is NOT fetched
  },
  with: {
    posts: {
      columns: {
        title: true,
        // content, authorId, etc. are NOT fetched
      },
    },
  },
});
```

You can also exclude specific columns:

```typescript
const result = await db.query.users.findMany({
  columns: {
    password: false, // fetch everything except password
  },
});
```

## Filtering, Ordering, Limiting Related Data

```typescript
const user = await db.query.users.findFirst({
  where: eq(users.id, 1),
  with: {
    posts: {
      where: eq(posts.published, true),
      orderBy: [desc(posts.createdAt)],
      limit: 10,
      with: {
        comments: {
          limit: 3,
          orderBy: [desc(comments.createdAt)],
        },
      },
    },
  },
});
```

## Filtering with Callback Syntax

The relational API supports a callback syntax for `where` with access to operators:

```typescript
const result = await db.query.posts.findMany({
  where: (posts, { eq, and, gt }) =>
    and(eq(posts.published, true), gt(posts.views, 100)),
});
```

## Incorrect Patterns

```typescript
// Wrong: using relational API for aggregations — it doesn't support COUNT, SUM, etc.
// Use db.select() with sql operator instead
const count = await db.query.users.findMany(); // fetches ALL rows just to count them
// Better:
const [{ count }] = await db
  .select({ count: sql<number>`count(*)`.mapWith(Number) })
  .from(users);

// Wrong: deeply nesting without limits
// This fetches ALL related data at every level — can be extremely expensive
const result = await db.query.users.findMany({
  with: {
    posts: {
      with: {
        comments: {
          with: {
            author: true,
            likes: true, // could be thousands per comment
          },
        },
      },
    },
  },
});
// Always add limits when nesting deeply
```

## Extras (Computed Fields)

Add computed SQL expressions to relational queries:

```typescript
const result = await db.query.users.findMany({
  extras: {
    fullName: sql<string>`concat(${users.firstName}, ' ', ${users.lastName})`.as('full_name'),
  },
});
// [{ id: 1, firstName: "Alice", lastName: "Smith", fullName: "Alice Smith" }]
```

## References

- https://orm.drizzle.team/docs/rqb-v2
- https://orm.drizzle.team/docs/rqb
