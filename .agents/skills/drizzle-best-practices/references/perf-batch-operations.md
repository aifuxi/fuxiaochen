# Performance: Batch Operations

## Why It Matters

Sending multiple queries to the database individually adds network round-trip overhead.
Batch APIs let you send multiple operations in a single request and get results back
together. This is especially valuable in serverless environments where each round-trip
costs latency.

## Batch API

The `db.batch()` method executes multiple statements in one call. For Postgres, this is
available with the Neon HTTP driver.

```typescript
const batchResponse = await db.batch([
  db.insert(users).values({ id: 1, name: 'Alice' }).returning({ id: users.id }),
  db.update(users).set({ name: 'Alice Updated' }).where(eq(users.id, 1)),
  db.query.users.findMany({}),
  db.select().from(users).where(eq(users.id, 1)),
]);
```

The response is a typed tuple matching the order of your statements:

```typescript
type BatchResponse = [
  { id: number }[],              // insert returning
  ResultSet,                      // update result
  { id: number; name: string }[], // relational query
  { id: number; name: string }[], // select
];
```

If any statement fails, the entire batch is rolled back (transactional).

## Driver Support

| Driver | Batch Support |
|--------|---------------|
| Neon HTTP | Yes |
| node-postgres | No (use transactions) |
| postgres.js | No (use transactions) |

For Postgres, the batch API is primarily available with Neon HTTP. With node-postgres or
postgres.js, use transactions instead to group multiple operations.

## Bulk Inserts

For inserting many rows at once, pass an array to `.values()`:

```typescript
await db.insert(users).values([
  { name: 'Alice', email: 'alice@example.com' },
  { name: 'Bob', email: 'bob@example.com' },
  { name: 'Charlie', email: 'charlie@example.com' },
  // ... hundreds of rows
]);
```

Drizzle generates a single `INSERT INTO ... VALUES (...), (...), (...)` statement.

For very large inserts (thousands of rows), consider chunking:

```typescript
const CHUNK_SIZE = 1000;
const allUsers = [...]; // thousands of rows

for (let i = 0; i < allUsers.length; i += CHUNK_SIZE) {
  const chunk = allUsers.slice(i, i + CHUNK_SIZE);
  await db.insert(users).values(chunk);
}
```

## Batch vs Transactions

Both group multiple operations, but they serve different purposes:

**Batch** (`db.batch()`):
- Sends all statements in one network request
- Reduces latency from round trips
- Available only on specific drivers
- Automatically transactional

**Transaction** (`db.transaction()`):
- Ensures atomicity (all-or-nothing)
- Works on all drivers
- Each statement is still a separate round trip
- Allows conditional logic between statements

```typescript
// Transaction — use when statements depend on each other
await db.transaction(async (tx) => {
  const [user] = await tx.insert(users).values({ name: 'Alice' }).returning();
  // user.id is available for the next statement
  await tx.insert(posts).values({ authorId: user.id, title: 'First post' });
});

// Batch — use when statements are independent
const results = await db.batch([
  db.insert(users).values({ name: 'Alice' }),
  db.insert(users).values({ name: 'Bob' }),
  db.select().from(posts).where(eq(posts.published, true)),
]);
```

## References

- https://orm.drizzle.team/docs/batch-api
- https://orm.drizzle.team/docs/transactions
