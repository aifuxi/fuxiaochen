# Drizzle ORM Best Practices (PostgreSQL)

## Structure

```
drizzle-best-practices/
  SKILL.md                # Main skill file - read this first
  AGENTS.md               # This navigation guide
  CLAUDE.md               # Symlink to AGENTS.md
  references/
    engine-postgres.md    # Postgres-specific types, features, and idioms
    schema-*.md           # Schema design patterns
    query-*.md            # Query patterns
    relations-*.md        # Relation definitions and relational queries
    migrations-*.md       # Drizzle Kit configuration and workflow
    types-*.md            # TypeScript type inference and custom types
    perf-*.md             # Performance optimization
    driver-*.md           # Driver setup and serverless configuration
    advanced-*.md         # Dynamic queries, raw SQL, power-user patterns
    _sections.md          # Full index of all reference files
```

## Usage

1. Read `SKILL.md` for the main skill instructions
2. Browse `references/` for detailed documentation on specific topics
3. Reference files are loaded on-demand — read only what you need

Comprehensive best practices guide for Drizzle ORM with PostgreSQL. Contains guidance across
8 categories, prioritized by impact to help AI agents generate correct, performant, and
idiomatic Drizzle code.

## When to Apply

Reference these guidelines when:

- Defining table schemas with `pgTable`
- Writing select, insert, update, or delete queries
- Setting up relations between tables
- Configuring `drizzle-kit` for migrations
- Inferring TypeScript types from your schema
- Choosing between the SQL-like API and the relational query API
- Optimizing query performance
- Integrating Drizzle with serverless Postgres providers (Neon, Supabase, etc.)

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Schema Design | CRITICAL | `schema-` |
| 2 | Query Patterns | CRITICAL | `query-` |
| 3 | Relations | HIGH | `relations-` |
| 4 | Migrations | HIGH | `migrations-` |
| 5 | Type Safety | MEDIUM-HIGH | `types-` |
| 6 | Performance | MEDIUM | `perf-` |
| 7 | Database Drivers | MEDIUM | `driver-` |
| 8 | Advanced Patterns | LOW | `advanced-` |

## How to Use

Read individual reference files for detailed explanations and code examples:

```
references/engine-postgres.md
references/schema-table-definitions.md
references/schema-column-types.md
references/schema-indexes-constraints.md
references/query-select-patterns.md
references/query-mutations.md
references/query-filters-operators.md
references/query-error-handling.md
references/relations-defining.md
references/relations-querying.md
references/migrations-config.md
references/migrations-workflow.md
references/types-inference.md
references/types-custom-types.md
references/perf-prepared-statements.md
references/perf-batch-operations.md
references/driver-postgres.md
references/driver-serverless.md
references/advanced-dynamic-queries.md
references/advanced-sql-operator.md
references/_sections.md
```

Each reference file contains:

- Brief explanation of why it matters
- Incorrect code example with explanation
- Correct code example with explanation
- Links to official Drizzle documentation

## References

- https://orm.drizzle.team/docs/overview
- https://orm.drizzle.team/docs/sql-schema-declaration
- https://orm.drizzle.team/docs/relations-v2
- https://orm.drizzle.team/docs/perf-queries
- https://orm.drizzle.team/docs/kit-overview
- https://orm.drizzle.team/llms.txt
