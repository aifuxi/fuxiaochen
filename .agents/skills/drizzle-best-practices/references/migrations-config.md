# Migrations: Configuration

## Why It Matters

`drizzle-kit` reads `drizzle.config.ts` to know where your schema lives, which database
dialect you're using, and how to connect. A misconfigured file means migrations won't
generate, push will fail, or you'll accidentally target the wrong database.

## Basic Configuration

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

## Configuration Options

| Option | Required | Description |
|--------|----------|-------------|
| `dialect` | Yes | `'postgresql'` for Postgres |
| `schema` | Yes | Path(s) to your schema file(s). Supports glob patterns. |
| `out` | No | Directory for migration files. Defaults to `./drizzle`. |
| `dbCredentials` | For push/pull/migrate | Connection details for your database. |
| `strict` | No | Prompt for confirmation on potentially destructive changes. |
| `verbose` | No | Log SQL statements during migration. |

## Multiple Schema Files

If your schema is split across files, use a glob pattern or array:

```typescript
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema/*.ts', // glob pattern
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

Or an array:

```typescript
schema: ['./src/db/schema/users.ts', './src/db/schema/posts.ts'],
```

## Loading Environment Variables

If you use `.env` files, load them before accessing `process.env`:

```typescript
import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: '.env' });

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

## Incorrect Patterns

```typescript
// Wrong: using require() syntax — drizzle.config.ts is an ES module
const { defineConfig } = require('drizzle-kit');

// Wrong: hardcoding credentials
dbCredentials: {
  url: 'postgresql://admin:password123@localhost:5432/mydb',
  // Never commit credentials — use environment variables
},

// Wrong: mismatched dialect and schema imports
// Config dialect must match the schema imports you're using
dialect: 'postgresql',
// If your schema uses pgTable from 'drizzle-orm/pg-core' — this is correct
// If dialect doesn't match schema imports, you'll get cryptic errors
```

## Credentials

### Connection String

```typescript
dbCredentials: {
  url: process.env.DATABASE_URL!,
}
```

### Individual Parameters

```typescript
dbCredentials: {
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'password',
  database: 'mydb',
  ssl: true,
}
```

## References

- https://orm.drizzle.team/docs/drizzle-config-file
- https://orm.drizzle.team/docs/kit-overview
