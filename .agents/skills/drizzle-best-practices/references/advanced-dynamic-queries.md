# Advanced: Dynamic Queries

## Why It Matters

Real applications rarely have static queries. Search filters, sort orders, pagination,
and optional includes all require building queries dynamically based on runtime input.
Drizzle's query builder is composable, making dynamic queries natural and type-safe.

## Dynamic WHERE Clauses

Build conditions based on user input:

```typescript
import { and, eq, like, gte, lte, SQL } from 'drizzle-orm';

interface Filters {
  name?: string;
  role?: string;
  minAge?: number;
  maxAge?: number;
}

async function getUsers(filters: Filters) {
  const conditions: SQL[] = [];

  if (filters.name) {
    conditions.push(like(users.name, `%${filters.name}%`));
  }
  if (filters.role) {
    conditions.push(eq(users.role, filters.role));
  }
  if (filters.minAge !== undefined) {
    conditions.push(gte(users.age, filters.minAge));
  }
  if (filters.maxAge !== undefined) {
    conditions.push(lte(users.age, filters.maxAge));
  }

  return db
    .select()
    .from(users)
    .where(conditions.length > 0 ? and(...conditions) : undefined);
}
```

## Dynamic ORDER BY

```typescript
type SortField = 'name' | 'createdAt' | 'email';
type SortDirection = 'asc' | 'desc';

async function getUsers(sortBy: SortField, direction: SortDirection) {
  const column = {
    name: users.name,
    createdAt: users.createdAt,
    email: users.email,
  }[sortBy];

  const orderFn = direction === 'desc' ? desc : asc;

  return db.select().from(users).orderBy(orderFn(column));
}
```

## Dynamic SELECT (Partial Select)

```typescript
async function getUsers(includeEmail: boolean) {
  const columns: Record<string, any> = {
    id: users.id,
    name: users.name,
  };

  if (includeEmail) {
    columns.email = users.email;
  }

  return db.select(columns).from(users);
}
```

## Pagination

### Offset-based (simple, good for small datasets)

```typescript
async function getUsers(page: number, pageSize: number) {
  return db
    .select()
    .from(users)
    .limit(pageSize)
    .offset((page - 1) * pageSize)
    .orderBy(users.id);
}
```

### Cursor-based (performant, good for large datasets)

```typescript
async function getUsers(cursor?: number, pageSize = 20) {
  const query = db
    .select()
    .from(users)
    .orderBy(users.id)
    .limit(pageSize);

  if (cursor) {
    return query.where(gt(users.id, cursor));
  }

  return query;
}
```

## The `.$dynamic()` Method

For building queries across function boundaries:

```typescript
function withPagination<T extends PgSelect>(
  query: T,
  page: number,
  pageSize: number,
) {
  return query.limit(pageSize).offset((page - 1) * pageSize);
}

// Usage
const baseQuery = db.select().from(users).$dynamic();
const paginatedQuery = withPagination(baseQuery, 1, 20);
const results = await paginatedQuery;
```

## Dynamic Relational Queries

```typescript
interface QueryOptions {
  includePosts?: boolean;
  includeProfile?: boolean;
}

async function getUser(id: number, options: QueryOptions) {
  const withClause: Record<string, any> = {};

  if (options.includePosts) {
    withClause.posts = true;
  }
  if (options.includeProfile) {
    withClause.profile = true;
  }

  return db.query.users.findFirst({
    where: eq(users.id, id),
    with: withClause,
  });
}
```

Note: Dynamic `with` clauses lose some type safety — the return type won't know which
relations are included. If you need full type safety, prefer explicit overloads or
separate functions.

## References

- https://orm.drizzle.team/docs/dynamic-query-building
- https://orm.drizzle.team/docs/select
