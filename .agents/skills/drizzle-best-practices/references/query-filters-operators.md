# Query: Filters and Operators

## Why It Matters

Drizzle's filter functions (`eq`, `ne`, `gt`, `lt`, `like`, etc.) are the building blocks
of `WHERE` clauses. Using them correctly produces efficient queries. Using them wrong can
cause full table scans, incorrect results, or type errors.

## Core Operators

```typescript
import { eq, ne, gt, gte, lt, lte, like, ilike, between, inArray, isNull, isNotNull } from 'drizzle-orm';

// Equality
db.select().from(users).where(eq(users.id, 1));

// Not equal
db.select().from(users).where(ne(users.role, 'admin'));

// Comparison
db.select().from(products).where(gt(products.price, 100));
db.select().from(products).where(gte(products.price, 100));
db.select().from(products).where(lt(products.stock, 10));
db.select().from(products).where(lte(products.stock, 10));

// Pattern matching
db.select().from(users).where(like(users.name, '%alice%'));
db.select().from(users).where(ilike(users.name, '%alice%')); // case-insensitive (Postgres)

// Range
db.select().from(events).where(between(events.date, startDate, endDate));

// IN array
db.select().from(users).where(inArray(users.id, [1, 2, 3]));

// NULL checks
db.select().from(users).where(isNull(users.deletedAt));
db.select().from(users).where(isNotNull(users.email));
```

## Combining Conditions

### AND (all conditions must match)

```typescript
import { and } from 'drizzle-orm';

db.select().from(users).where(
  and(
    eq(users.role, 'admin'),
    eq(users.isActive, true),
  )
);
```

### OR (any condition can match)

```typescript
import { or } from 'drizzle-orm';

db.select().from(users).where(
  or(
    eq(users.role, 'admin'),
    eq(users.role, 'superadmin'),
  )
);
```

### Complex combinations

```typescript
db.select().from(users).where(
  and(
    eq(users.isActive, true),
    or(
      eq(users.role, 'admin'),
      gt(users.loginCount, 100),
    ),
  )
);
// WHERE is_active = true AND (role = 'admin' OR login_count > 100)
```

## Incorrect Patterns

```typescript
// Wrong: passing undefined silently drops the condition
const role = undefined;
db.select().from(users).where(eq(users.role, role));
// This might not behave as expected — always validate inputs

// Wrong: using JavaScript equality instead of Drizzle operators
db.select().from(users).where(users.id === 1); // TypeScript boolean, not a SQL condition
```

## Conditional Filters (Dynamic Queries)

When filters depend on user input, build conditions dynamically:

```typescript
const conditions = [];

if (filters.role) {
  conditions.push(eq(users.role, filters.role));
}
if (filters.isActive !== undefined) {
  conditions.push(eq(users.isActive, filters.isActive));
}

const result = await db
  .select()
  .from(users)
  .where(conditions.length > 0 ? and(...conditions) : undefined);
```

## The NOT Operator

```typescript
import { not } from 'drizzle-orm';

db.select().from(users).where(not(eq(users.role, 'admin')));
// WHERE NOT (role = 'admin')
```

## References

- https://orm.drizzle.team/docs/operators
- https://orm.drizzle.team/docs/select#filtering
