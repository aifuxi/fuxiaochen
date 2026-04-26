# Drizzle ORM Best Practices

AI-agent-ready best practices for [Drizzle ORM](https://orm.drizzle.team/) with PostgreSQL. Designed to be consumed by LLM-based coding agents (Claude, Cursor, Codex, etc.) as a skill or context file so they write correct, idiomatic Drizzle code out of the box.

Inspired by [Supabase Agent Skills](https://github.com/supabase/agent-skills).

## Installation

Install the skill using the [skills](https://skills.sh) CLI:

```bash
npx skills add honra-io/drizzle-best-practices
```

This makes the Drizzle best practices available to your AI agent (Claude Code, Cursor, Gemini, Kiro, OpenCode, GitHub Copilot, and others).

## What's Inside

The skill is organized into 8 priority-ranked categories, each with detailed reference files containing explanations, correct vs incorrect code examples, and links to official docs.

### Current Coverage (PostgreSQL)

| Category | References | What's Covered |
|----------|-----------|----------------|
| **Schema Design** | `schema-table-definitions.md`, `schema-column-types.md`, `schema-indexes-constraints.md` | Table organization, column type selection, indexes, unique constraints, foreign keys, composite keys |
| **Query Patterns** | `query-select-patterns.md`, `query-mutations.md`, `query-filters-operators.md`, `query-error-handling.md` | Select/partial select, joins, count queries, insert/update/delete, upsert, returning, where clauses, operator composition, error handling (constraint violations, transactions, driver-portable patterns) |
| **Relations** | `relations-defining.md`, `relations-querying.md` | Relations v2 (`defineRelations`), legacy `relations()` API, one-to-one/one-to-many/many-to-many, relational queries with filtering/ordering/limiting |
| **Migrations** | `migrations-config.md`, `migrations-workflow.md` | `drizzle.config.ts` setup, generate/push/pull/migrate workflow, programmatic migration execution |
| **Type Safety** | `types-inference.md`, `types-custom-types.md` | `$inferSelect`/`$inferInsert`, `InferSelectModel`/`InferInsertModel`, `$type<T>()`, `$defaultFn`, `customType`, branded types |
| **Performance** | `perf-prepared-statements.md`, `perf-batch-operations.md` | Prepared statements with placeholders, batch API (Neon HTTP), bulk inserts, batch vs transactions |
| **Drivers** | `driver-postgres.md`, `driver-serverless.md` | node-postgres, postgres.js, Neon HTTP/WebSocket, Supabase, driver selection guide, logging/debugging, `.toSQL()`, serverless/edge patterns (Vercel, Lambda, Workers) |
| **Advanced** | `advanced-dynamic-queries.md`, `advanced-sql-operator.md` | Dynamic WHERE/ORDER BY/SELECT, pagination, `$dynamic()`, `sql` template literal, `sql<T>`, `.mapWith()`, aggregations, GROUP BY, CASE, EXISTS |
| **Postgres Engine** | `engine-postgres.md` | Identity columns, UUIDs, JSONB, arrays, enums (`pgEnum`), timestamps with timezone, numeric/decimal, full-text search, GIN/GiST/BRIN indexes, partial indexes, views, materialized views, schemas |

### Planned / Missing (PRs Welcome)

The following topics are not yet covered and are on the roadmap for future additions:

**Security**
- Row-Level Security (RLS) patterns with Drizzle
- RLS performance considerations
- Role-based access patterns

**Additional Engines**
- MySQL (`engine-mysql.md`)
- SQLite (`engine-sqlite.md`)
- SingleStore (`engine-singlestore.md`)
- MSSQL (`engine-mssql.md`)

**Schema Design**
- Partitioning strategies
- Naming conventions and linting
- Schema versioning patterns

**Query Patterns**
- Subqueries and CTEs
- Window functions
- Full-text search queries
- Aggregations and GROUP BY patterns (dedicated reference)

**Performance**
- Connection pooling deep dive (PgBouncer, Supabase pooler, Neon pooler)
- Query plan analysis with EXPLAIN
- N+1 detection and prevention
- Caching strategies

**Common Patterns**
- Soft delete implementation (global filters, `deletedAt` columns)
- Multi-tenancy (schema-based vs row-based isolation)
- Auth provider integration (Better Auth, NextAuth, Lucia, Clerk) schema mapping

**Integrations**
- Drizzle + Zod/Valibot/ArkType schema validation
- Drizzle + tRPC patterns
- Drizzle + Next.js App Router / Server Components
- Drizzle + Hono / ElysiaJS

**Testing**
- Database testing strategies (test containers, in-memory, fixtures)
- Seeding patterns

**Migrations (Advanced)**
- Custom migration scripts
- Data migrations alongside schema migrations
- Zero-downtime migration strategies

## How It Works

This repository follows the agent-skills pattern. AI agents read `SKILL.md` for top-level instructions and then load individual `references/*.md` files on-demand based on what the user is working on.

```
drizzle-best-practices/
├── README.md               # This file (for humans)
├── SKILL.md                # Main skill file (for AI agents)
├── AGENTS.md               # Navigation guide (for AI agents)
├── CLAUDE.md               # Symlink to AGENTS.md
└── references/
    ├── _sections.md        # Full index of all reference files
    ├── engine-postgres.md  # Postgres-specific types and features
    ├── schema-*.md         # Schema design
    ├── query-*.md          # Query patterns
    ├── relations-*.md      # Relations
    ├── migrations-*.md     # Migrations
    ├── types-*.md          # Type safety
    ├── perf-*.md           # Performance
    ├── driver-*.md         # Drivers
    └── advanced-*.md       # Advanced patterns
```

## Contributing

### Adding a New Reference

1. Create a new `.md` file in `references/` with the appropriate category prefix
2. Follow the existing format: "Why It Matters" → "Incorrect" → "Correct" → "References"
3. Add the file to `references/_sections.md`
4. Update the file listing in `AGENTS.md`

### Adding a New Engine

1. Create `references/engine-{name}.md` following the structure of `engine-postgres.md`
2. Add the file to the "Engine-Specific References" table in `_sections.md`
3. Update engine-specific notes in other reference files where applicable

### Style Guide

- Every reference file should explain **why** a pattern matters, not just what to do
- Include both incorrect and correct code examples with explanations
- Keep code examples minimal and focused — don't add boilerplate that distracts from the point
- Link to official Drizzle documentation at the bottom of each reference
- Use `drizzle-orm/pg-core` imports (not generic) since we're Postgres-focused

## License

MIT

## Author

Marc A. Maceira Zayas
