# Relations: Defining Relations

## Why It Matters

Relations let you describe how tables connect to each other. Once defined, you can use
the relational query API (`db.query`) to fetch nested data without writing manual joins.
Drizzle supports two relation APIs — the modern `defineRelations` (v2) and the legacy
`relations()` helper. New projects should use `defineRelations`.

## Relations v2 (`defineRelations`) — Recommended

```typescript
import { defineRelations } from 'drizzle-orm';
import * as schema from './schema';

export const relations = defineRelations(schema, (r) => ({
  users: {
    posts: r.many.posts(),
    profile: r.one.profiles({
      from: r.users.id,
      to: r.profiles.userId,
    }),
  },
  posts: {
    author: r.one.users({
      from: r.posts.authorId,
      to: r.users.id,
    }),
    comments: r.many.comments(),
  },
  comments: {
    post: r.one.posts({
      from: r.comments.postId,
      to: r.posts.id,
    }),
    author: r.one.users({
      from: r.comments.authorId,
      to: r.users.id,
    }),
  },
  profiles: {
    user: r.one.users({
      from: r.profiles.userId,
      to: r.users.id,
    }),
  },
}));

// Pass relations to drizzle()
const db = drizzle({ client: pool, relations });
```

**Key points:**
- `r.one` requires explicit `from`/`to` column mapping
- `r.many` infers the connection from the other side's `r.one` definition
- Both sides of a relationship should be defined for full query support

## Legacy Relations API (`relations()`)

Still works and widely used in existing projects:

```typescript
import { relations } from 'drizzle-orm';

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));
```

**Note:** The legacy API requires passing the entire schema to `drizzle()`:

```typescript
import * as schema from './schema';
const db = drizzle({ schema });
```

## Many-to-Many Relations

Many-to-many requires an explicit junction table:

```typescript
// Schema
export const usersToGroups = pgTable(
  'users_to_groups',
  {
    userId: integer('user_id').notNull().references(() => users.id),
    groupId: integer('group_id').notNull().references(() => groups.id),
  },
  (t) => [primaryKey({ columns: [t.userId, t.groupId] })]
);

// Relations v2
export const relations = defineRelations(schema, (r) => ({
  users: {
    usersToGroups: r.many.usersToGroups(),
  },
  groups: {
    usersToGroups: r.many.usersToGroups(),
  },
  usersToGroups: {
    user: r.one.users({
      from: r.usersToGroups.userId,
      to: r.users.id,
    }),
    group: r.one.groups({
      from: r.usersToGroups.groupId,
      to: r.groups.id,
    }),
  },
}));
```

### Querying through the junction table

```typescript
const usersWithGroups = await db.query.users.findMany({
  with: {
    usersToGroups: {
      with: {
        group: true,
      },
    },
  },
});
```

## Incorrect

```typescript
// Forgetting to define the reverse side of a relation
export const relations = defineRelations(schema, (r) => ({
  posts: {
    author: r.one.users({
      from: r.posts.authorId,
      to: r.users.id,
    }),
  },
  // Missing: users.posts relation
  // Without it, you can't query db.query.users.findMany({ with: { posts: true } })
}));
```

## Self-Referencing Relations

For hierarchical data like comment threads or org charts:

```typescript
import { AnyPgColumn } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text('name').notNull(),
  invitedBy: integer('invited_by').references((): AnyPgColumn => users.id),
});
```

Note the `(): AnyPgColumn =>` return type annotation — this is needed for circular references.

## References

- https://orm.drizzle.team/docs/relations-v2
- https://orm.drizzle.team/docs/rqb
