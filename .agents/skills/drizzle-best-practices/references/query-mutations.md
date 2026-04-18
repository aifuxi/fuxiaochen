# Query: Mutations (Insert, Update, Delete)

## Why It Matters

Mutations change your data. Getting them wrong means silent data loss, integrity violations,
or missed return values. Drizzle's mutation API is straightforward, but there are patterns
that prevent common mistakes.

## Insert

### Single Insert

```typescript
await db.insert(usersTable).values({
  name: 'Alice',
  email: 'alice@example.com',
});
```

### Insert with Returning

```typescript
const [newUser] = await db
  .insert(usersTable)
  .values({ name: 'Alice', email: 'alice@example.com' })
  .returning();
// newUser has the full row including generated id
```

### Insert Multiple Rows

```typescript
await db.insert(usersTable).values([
  { name: 'Alice', email: 'alice@example.com' },
  { name: 'Bob', email: 'bob@example.com' },
]);
```

### Incorrect Insert Pattern

```typescript
// Forgetting .returning() then trying to use the result
const result = await db.insert(usersTable).values({ name: 'Alice' });
// result is NOT the inserted row — it's a driver-specific result object
// You need .returning() to get the actual data back
```

## Update

### Update with Where Clause

```typescript
await db
  .update(usersTable)
  .set({ name: 'Bob Updated' })
  .where(eq(usersTable.id, 1));
```

### Update with Returning

```typescript
const [updated] = await db
  .update(usersTable)
  .set({ name: 'Bob Updated' })
  .where(eq(usersTable.id, 1))
  .returning();
```

### Incorrect Update — Forgetting Where

```typescript
// This updates EVERY row in the table
await db.update(usersTable).set({ isActive: false });
// Always add .where() unless you genuinely want to update all rows
```

## Delete

### Delete with Where

```typescript
await db.delete(usersTable).where(eq(usersTable.id, 1));
```

### Delete with Returning

```typescript
const [deleted] = await db
  .delete(usersTable)
  .where(eq(usersTable.id, 1))
  .returning();
```

### Incorrect Delete — Forgetting Where

```typescript
// This deletes EVERY row in the table
await db.delete(usersTable);
// Always add .where() for targeted deletes
```

## Upsert (On Conflict)

### Update on Conflict

```typescript
await db
  .insert(usersTable)
  .values({ id: 1, name: 'Alice', email: 'alice@example.com' })
  .onConflictDoUpdate({
    target: usersTable.email,
    set: { name: 'Alice Updated' },
  });
```

### Do Nothing on Conflict

```typescript
await db
  .insert(usersTable)
  .values({ email: 'alice@example.com', name: 'Alice' })
  .onConflictDoNothing({ target: usersTable.email });
```

### Upsert with Where Clause

You can add a `where` condition to the `onConflictDoUpdate` to only update if the
existing row matches a condition:

```typescript
await db
  .insert(usersTable)
  .values({ email: 'alice@example.com', name: 'Alice', updatedAt: new Date() })
  .onConflictDoUpdate({
    target: usersTable.email,
    set: { name: 'Alice Updated', updatedAt: new Date() },
    where: sql`${usersTable.updatedAt} < now() - interval '1 hour'`,
  });
```

## Transactions

Wrap related mutations in a transaction to ensure atomicity:

```typescript
await db.transaction(async (tx) => {
  const [user] = await tx
    .insert(usersTable)
    .values({ name: 'Alice' })
    .returning();

  await tx.insert(profilesTable).values({
    userId: user.id,
    bio: 'Hello world',
  });
});
// If either insert fails, both are rolled back
```

### Nested Transactions (Savepoints)

```typescript
await db.transaction(async (tx) => {
  await tx.insert(usersTable).values({ name: 'Alice' });

  // Creates a savepoint
  await tx.transaction(async (nestedTx) => {
    await nestedTx.insert(postsTable).values({ title: 'First post' });
  });
});
```

## References

- https://orm.drizzle.team/docs/insert
- https://orm.drizzle.team/docs/update
- https://orm.drizzle.team/docs/delete
- https://orm.drizzle.team/docs/transactions
