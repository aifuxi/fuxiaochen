# Migrations: Workflow

## Why It Matters

Drizzle Kit provides multiple commands for managing schema changes. Choosing the right
workflow prevents data loss, keeps your team in sync, and makes deployments predictable.
The two main approaches are migration files (`generate` + `migrate`) and direct push (`push`).

## The Two Approaches

### Migration Files (recommended for production)

```bash
# 1. Make changes to your schema files
# 2. Generate a migration
npx drizzle-kit generate

# 3. Review the generated SQL in ./drizzle/
# 4. Apply the migration
npx drizzle-kit migrate
```

This creates versioned SQL files in your `out` directory. These files are committed to
version control and applied in order during deployment.

### Direct Push (good for development / prototyping)

```bash
npx drizzle-kit push
```

This applies schema changes directly to the database without generating migration files.
Fast for development but provides no migration history and isn't suitable for production
deployments.

## When to Use Which

| Scenario | Command |
|----------|---------|
| Production deployments | `generate` + `migrate` |
| CI/CD pipelines | `migrate` |
| Local development / prototyping | `push` |
| Syncing schema to a new database | `push` |
| Pulling schema from existing DB | `pull` |

## Command Reference

### `generate` — Create migration files

```bash
npx drizzle-kit generate
```

Compares your schema files against the previous migration state and generates SQL migration
files for the diff. Always review generated SQL before applying.

### `migrate` — Apply pending migrations

```bash
npx drizzle-kit migrate
```

Runs all unapplied migrations in order. Tracks which migrations have been applied using
a `__drizzle_migrations` table in your database.

### `push` — Apply schema directly

```bash
npx drizzle-kit push
```

Syncs your schema to the database without creating migration files. Prompts for confirmation
on destructive changes when `strict: true` is set in config.

### `pull` — Introspect existing database

```bash
npx drizzle-kit pull
```

Reads your database schema and generates Drizzle schema TypeScript files. Useful when
adopting Drizzle in an existing project or migrating from another ORM.

### `studio` — Visual database browser

```bash
npx drizzle-kit studio
```

Opens Drizzle Studio, a web-based database browser for viewing and editing data.

### `check` — Verify migration state

```bash
npx drizzle-kit check
```

Verifies the consistency of your migration folder.

### `up` — Upgrade migration format

```bash
npx drizzle-kit up
```

Upgrades your migration folder to the latest format when Drizzle Kit introduces changes.

## Applying Migrations in Code

For programmatic migration execution (e.g., in a deploy script or serverless function):

```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

const db = drizzle(process.env.DATABASE_URL!);

await migrate(db, { migrationsFolder: './drizzle' });
```

The migrator import path matches your driver:

```typescript
import { migrate } from 'drizzle-orm/node-postgres/migrator';
// or
import { migrate } from 'drizzle-orm/postgres-js/migrator';
// or
import { migrate } from 'drizzle-orm/neon-http/migrator';
// or
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
```

## Incorrect Patterns

```typescript
// Wrong: running push in production
// push doesn't create migration files and can't be rolled back
// Use generate + migrate for any environment where you need reproducible deployments

// Wrong: editing generated migration files
// If you need to modify a migration, delete it and regenerate
// Editing can desync the migration state

// Wrong: not committing migration files to version control
// Migration files should be committed so all team members and CI/CD stay in sync
```

## References

- https://orm.drizzle.team/docs/kit-overview
- https://orm.drizzle.team/docs/drizzle-kit-generate
- https://orm.drizzle.team/docs/drizzle-kit-migrate
- https://orm.drizzle.team/docs/drizzle-kit-push
- https://orm.drizzle.team/docs/drizzle-kit-pull
