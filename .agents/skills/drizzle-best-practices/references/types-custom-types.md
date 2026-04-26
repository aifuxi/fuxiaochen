# Types: Custom Types and Branded Types

## Why It Matters

Sometimes the default TypeScript types that Drizzle infers don't match your application's
needs. The `$type<T>()` modifier lets you override the inferred type at compile time,
and `customType` lets you define entirely new column types with custom serialization.

## The `$type<T>()` Modifier

Override the TypeScript type for any column without changing the database type:

```typescript
import { pgTable, text, jsonb, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  // JSONB column typed as a specific shape
  preferences: jsonb('preferences').$type<{
    theme: 'light' | 'dark';
    language: string;
    notifications: boolean;
  }>(),

  // Text column used as a typed union (alternative to pgEnum for simpler cases)
  role: text('role').$type<'admin' | 'user' | 'guest'>().notNull().default('guest'),
});
```

This is compile-time only — no runtime validation is added. If the database contains data
that doesn't match your type, TypeScript won't catch it.

## The `$default()` Modifier

Generate default values in your application code (not in the database):

```typescript
import { v4 as uuidv4 } from 'uuid';

export const posts = pgTable('posts', {
  id: text('id').$defaultFn(() => uuidv4()).primaryKey(),
  slug: text('slug').$defaultFn(() => generateSlug()),
});
```

The `$defaultFn` runs in JavaScript when you call `.insert()` without providing the column.
This is different from `.default()` which sets a database-level default.

## Custom Column Types

For complete control over how values are mapped between TypeScript and the database:

```typescript
import { customType } from 'drizzle-orm/pg-core';

// A custom type that stores monetary values as integers (cents) in the DB
// but exposes them as formatted strings in TypeScript
const money = customType<{
  data: string;        // TypeScript type
  driverData: number;  // What the driver sends/receives
}>({
  dataType() {
    return 'integer';
  },
  fromDriver(value: number): string {
    return (value / 100).toFixed(2);
  },
  toDriver(value: string): number {
    return Math.round(parseFloat(value) * 100);
  },
});

export const products = pgTable('products', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  price: money('price').notNull(),
});
// In TypeScript: product.price is string ("19.99")
// In database: price is integer (1999)
```

## Branded Types for Domain Safety

Use TypeScript branded types to prevent mixing up IDs from different tables:

```typescript
// Define branded types
type UserId = number & { __brand: 'UserId' };
type PostId = number & { __brand: 'PostId' };

export const users = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity().$type<UserId>(),
  name: text('name').notNull(),
});

export const posts = pgTable('posts', {
  id: integer().primaryKey().generatedAlwaysAsIdentity().$type<PostId>(),
  authorId: integer('author_id').notNull().$type<UserId>(), // must be a UserId
});

// Now TypeScript prevents accidental ID mixups:
// db.select().from(posts).where(eq(posts.authorId, somePostId)); // Type error!
```

## Incorrect Patterns

```typescript
// Wrong: using $type<> to "validate" data
// $type<> is compile-time only — it doesn't add runtime checks
preferences: jsonb('preferences').$type<Config>(),
// The DB could contain anything — add runtime validation in your application layer

// Wrong: complex $defaultFn with side effects
id: text('id').$defaultFn(async () => {
  // Don't do async work here — $defaultFn should be synchronous and fast
  const response = await fetch('https://id-service.com/new');
  return response.text();
}),
```

## References

- https://orm.drizzle.team/docs/custom-types
- https://orm.drizzle.team/docs/goodies
