---
name: drizzle-best-practices
description: >
  Drizzle ORM best practices for TypeScript projects using PostgreSQL. Use this skill when
  writing, reviewing, or optimizing Drizzle ORM schemas, queries, relations, migrations, or
  database configurations targeting Postgres. Apply these guidelines whenever you see
  drizzle-orm imports, pgTable definitions, drizzle-kit config files, or relational query
  patterns. Also use when setting up a new project with Drizzle + Postgres, migrating from
  another ORM, or troubleshooting type errors in Drizzle schemas.
license: MIT
compatibility: TypeScript projects using Node.js or edge runtimes with drizzle-orm and a PostgreSQL database.
metadata:
  author: Marc A. Maceira Zayas
  abstract: >
    Comprehensive Drizzle ORM best practices guide for TypeScript developers building on
    PostgreSQL. Contains guidance across 8 categories from critical (schema design, query
    patterns) to incremental (advanced features). Each reference includes explanations,
    correct vs incorrect code examples, and rationale for why the pattern matters.
    Engine-specific Postgres patterns (identity columns, JSONB, arrays, enums, etc.) are
    documented in a dedicated reference file to keep the skill modular.
---

# Drizzle ORM Best Practices (PostgreSQL)

Comprehensive best practices guide for Drizzle ORM with PostgreSQL. Contains guidance across
8 categories, prioritized by impact to help you write correct, performant, and maintainable
database code.

## When to Apply

Reference these guidelines when:

- Defining table schemas with `pgTable`
- Writing select, insert, update, or delete queries
- Setting up relations between tables using `defineRelations` or the legacy `relations` API
- Configuring `drizzle-kit` for migrations (`generate`, `push`, `pull`)
- Inferring TypeScript types from your schema
- Choosing between the SQL-like API and the relational query API
- Optimizing query performance with prepared statements or batch operations
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
references/engine-postgres.md          # Postgres-specific types, features, and patterns
references/schema-table-definitions.md
references/query-select-patterns.md
references/relations-defining.md
references/_sections.md                # Full index of all references
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
