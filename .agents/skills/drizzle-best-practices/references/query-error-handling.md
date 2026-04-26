# Query: Error Handling

## Why It Matters

Database operations fail — unique constraint violations, foreign key violations, connection
timeouts, serialization failures. Without structured error handling, agents generate mutation
code that silently swallows errors or crashes with unhelpful messages. Catching specific
Postgres error codes lets you return meaningful responses instead of generic 500s.

## Postgres Error Codes

Postgres errors include a `code` field that identifies the exact failure. The most common
ones you'll encounter with Drizzle:

| Code | Name | When It Happens |
|------|------|-----------------|
| `23505` | `unique_violation` | Insert/update violates a UNIQUE constraint |
| `23503` | `foreign_key_violation` | Referenced row doesn't exist or row is still referenced |
| `23502` | `not_null_violation` | A NOT NULL column received null |
| `23514` | `check_violation` | A CHECK constraint failed |
| `40001` | `serialization_failure` | Transaction conflict under serializable isolation |
| `57014` | `query_canceled` | Query exceeded `statement_timeout` |
| `08006` | `connection_failure` | Database connection lost |
| `42P01` | `undefined_table` | Table doesn't exist (migration not run?) |

## Catching Specific Errors

### Unique Constraint Violations

The most common case — user tries to insert a duplicate email, username, etc:

```typescript
import { DatabaseError } from 'pg'; // node-postgres

try {
  const [user] = await db
    .insert(usersTable)
    .values({ email: 'alice@example.com', name: 'Alice' })
    .returning();
  return user;
} catch (error) {
  if (error instanceof DatabaseError && error.code === '23505') {
    // error.constraint contains the constraint name, e.g. "users_email_unique"
    // error.detail contains specifics, e.g. 'Key (email)=(alice@example.com) already exists.'
    throw new ConflictError(`Email already in use`);
  }
  throw error; // re-throw unexpected errors
}
```

### Foreign Key Violations

Happens when inserting a reference to a non-existent row or deleting a row that's still
referenced:

```typescript
try {
  await db.insert(postsTable).values({
    title: 'Hello',
    authorId: 999, // author doesn't exist
  });
} catch (error) {
  if (error instanceof DatabaseError && error.code === '23503') {
    // error.constraint — e.g. "posts_author_id_users_id_fk"
    // error.detail — e.g. 'Key (author_id)=(999) is not present in table "users".'
    throw new NotFoundError('Referenced author does not exist');
  }
  throw error;
}
```

### Upsert with Graceful Conflict Handling

Instead of catching errors, prefer Drizzle's built-in conflict handling for expected
duplicates:

```typescript
// Preferred: handle conflicts declaratively
const [user] = await db
  .insert(usersTable)
  .values({ email: 'alice@example.com', name: 'Alice' })
  .onConflictDoUpdate({
    target: usersTable.email,
    set: { name: 'Alice Updated' },
  })
  .returning();

// Or silently skip duplicates
await db
  .insert(usersTable)
  .values({ email: 'alice@example.com', name: 'Alice' })
  .onConflictDoNothing({ target: usersTable.email });
```

## Transaction Error Handling

Drizzle automatically rolls back transactions on error. You can also manually control
rollback behavior:

```typescript
try {
  await db.transaction(async (tx) => {
    const [user] = await tx
      .insert(usersTable)
      .values({ name: 'Alice' })
      .returning();

    await tx.insert(profilesTable).values({
      userId: user.id,
      bio: 'Hello world',
    });

    // If either fails, the entire transaction is rolled back
  });
} catch (error) {
  if (error instanceof DatabaseError && error.code === '40001') {
    // Serialization failure — safe to retry
    // Implement retry logic for serializable transactions
  }
  throw error;
}
```

### Explicit Rollback

```typescript
await db.transaction(async (tx) => {
  const [order] = await tx
    .insert(ordersTable)
    .values({ userId: 1, total: 100 })
    .returning();

  const inventory = await tx.query.inventory.findFirst({
    where: eq(inventoryTable.productId, productId),
  });

  if (!inventory || inventory.quantity < 1) {
    tx.rollback(); // explicitly abort — throws an error that Drizzle catches
    return; // unreachable, but satisfies TypeScript
  }

  await tx
    .update(inventoryTable)
    .set({ quantity: sql`${inventoryTable.quantity} - 1` })
    .where(eq(inventoryTable.productId, productId));
});
```

## Driver-Specific Error Types

Different drivers surface errors differently. Ensure you're importing the right class:

```typescript
// node-postgres
import { DatabaseError } from 'pg';

// postgres.js — errors have the same code property but different class
import postgres from 'postgres';
// postgres.js throws PostgresError instances
// Access error.code the same way

// Neon — wraps errors similarly to node-postgres
import { neon } from '@neondatabase/serverless';
```

A portable pattern that works across drivers:

```typescript
function isDbError(error: unknown, code: string): boolean {
  return (
    error instanceof Error &&
    'code' in error &&
    (error as { code: string }).code === code
  );
}

// Usage
try {
  await db.insert(usersTable).values({ email: 'duplicate@test.com' });
} catch (error) {
  if (isDbError(error, '23505')) {
    // unique violation — works with any driver
  }
  throw error;
}
```

## Incorrect Patterns

```typescript
// Wrong: catching all errors and ignoring them
try {
  await db.insert(usersTable).values(data);
} catch {
  // Silently swallowing errors — you won't know what went wrong
}

// Wrong: not re-throwing unexpected errors
try {
  await db.insert(usersTable).values(data);
} catch (error) {
  if (error instanceof DatabaseError && error.code === '23505') {
    return { error: 'Duplicate' };
  }
  return { error: 'Something went wrong' }; // connection errors, bugs, etc. are hidden
}

// Wrong: using string matching on error messages
try {
  await db.insert(usersTable).values(data);
} catch (error) {
  if (error.message.includes('duplicate')) { // fragile, locale-dependent
    // Use error.code instead — it's stable across locales
  }
}
```

## References

- https://orm.drizzle.team/docs/insert
- https://orm.drizzle.team/docs/transactions
- https://www.postgresql.org/docs/current/errcodes-appendix.html
