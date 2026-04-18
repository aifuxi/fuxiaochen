# Advanced: The SQL Operator

## Why It Matters

Drizzle's `sql` template literal is the escape hatch for anything the query builder doesn't
cover natively. Raw SQL expressions, database functions, window functions, CTEs, and complex
aggregations all use the `sql` operator. Understanding it prevents SQL injection, ensures
correct typing, and unlocks the full power of your database.

## Basic Usage

```typescript
import { sql } from 'drizzle-orm';

// In a partial select
const result = await db.select({
  id: users.id,
  lowerName: sql<string>`lower(${users.name})`,
  count: sql<number>`count(*)`.mapWith(Number),
}).from(users);
```

## The `sql<T>` Generic

The type parameter tells TypeScript what the expression returns:

```typescript
// Without generic — type is `unknown`
sql`lower(${users.name})` // unknown

// With generic — properly typed
sql<string>`lower(${users.name})` // string

// Important: this is compile-time only. No runtime type checking.
```

## `.mapWith()` for Runtime Mapping

Some databases return numbers as strings. Use `.mapWith()` to convert at runtime:

```typescript
const result = await db.select({
  count: sql<number>`count(*)`.mapWith(Number),
  avg: sql<number>`avg(${products.price})`.mapWith(Number),
}).from(products);
// Without mapWith, count might be string "42" instead of number 42
```

## `.as()` for Column Aliases

```typescript
const result = await db.select({
  totalRevenue: sql<number>`sum(${orders.amount})`.mapWith(Number).as('total_revenue'),
}).from(orders);
```

## Interpolation is Safe

Drizzle's `sql` template tag automatically parameterizes interpolated values:

```typescript
// Safe — values are parameterized
const name = "Alice'; DROP TABLE users;--";
sql`select * from users where name = ${name}`;
// Generates: SELECT * FROM users WHERE name = $1
// With parameter: ["Alice'; DROP TABLE users;--"]

// Column references are also safe
sql`lower(${users.name})`
// Generates: lower("users"."name")
```

## When You Need Raw (Unparameterized) SQL

Use `sql.raw()` for identifiers or SQL fragments that shouldn't be parameterized:

```typescript
const tableName = 'users';
const columnName = 'name';

// sql.raw() — no parameterization (be careful with user input!)
sql`select * from ${sql.raw(tableName)} order by ${sql.raw(columnName)}`;

// NEVER use sql.raw() with user-provided values — SQL injection risk
```

## Common Patterns

### Aggregations

```typescript
const stats = await db.select({
  count: sql<number>`count(*)`.mapWith(Number),
  avgPrice: sql<number>`avg(${products.price})`.mapWith(Number),
  maxPrice: sql<number>`max(${products.price})`.mapWith(Number),
  minPrice: sql<number>`min(${products.price})`.mapWith(Number),
}).from(products);
```

### GROUP BY

```typescript
const postCountByAuthor = await db.select({
  authorId: posts.authorId,
  postCount: sql<number>`count(*)`.mapWith(Number),
}).from(posts)
  .groupBy(posts.authorId);
```

### CASE expressions

```typescript
const result = await db.select({
  id: users.id,
  tier: sql<string>`
    case
      when ${users.points} >= 1000 then 'gold'
      when ${users.points} >= 500 then 'silver'
      else 'bronze'
    end
  `,
}).from(users);
```

### EXISTS subquery

```typescript
const usersWithPosts = await db.select()
  .from(users)
  .where(
    sql`exists (select 1 from ${posts} where ${posts.authorId} = ${users.id})`
  );
```

### Using in WHERE

```typescript
// Raw SQL in where clause
await db.select().from(users).where(
  sql`${users.createdAt} > now() - interval '7 days'`
);
```

## Combining `sql` with Drizzle Operators

You can use `sql` expressions anywhere Drizzle expects a column or value:

```typescript
import { eq, gt } from 'drizzle-orm';

// sql expression as a value in eq()
await db.select().from(users).where(
  gt(sql<number>`char_length(${users.name})`, 10)
);
```

## Incorrect Patterns

```typescript
// Wrong: string concatenation instead of template literal
const name = 'Alice';
sql`select * from users where name = '${name}'`; // NOT parameterized correctly
// The value should be interpolated as ${name}, not inside quotes

// Wrong: forgetting the generic type
const result = await db.select({
  count: sql`count(*)`, // type is unknown
}).from(users);
// Add sql<number> to get proper typing

// Wrong: using sql.raw() with user input
const userInput = req.query.sort;
sql`order by ${sql.raw(userInput)}`; // SQL INJECTION
// Validate and map user input to known column references instead
```

## References

- https://orm.drizzle.team/docs/sql
- https://orm.drizzle.team/docs/select
