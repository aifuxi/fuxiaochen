# Reference Sections

This file lists all reference files organized by category and priority.

## Engine-Specific References

| File | Engine | Topic |
|------|--------|-------|
| `engine-postgres.md` | PostgreSQL | Identity columns, JSONB, arrays, enums, intervals, full-text search, and other Postgres-specific patterns |

## 1. Schema Design (CRITICAL)

These references cover how to define tables, columns, indexes, and constraints correctly.
Getting schema design right is foundational — everything else builds on it.

| File | Topic |
|------|-------|
| `schema-table-definitions.md` | Table definition patterns and file organization |
| `schema-column-types.md` | Choosing correct column types for Postgres |
| `schema-indexes-constraints.md` | Indexes, unique constraints, foreign keys, composite keys |

## 2. Query Patterns (CRITICAL)

How to write correct, efficient queries using Drizzle's SQL-like API.

| File | Topic |
|------|-------|
| `query-select-patterns.md` | Select, partial select, joins, subqueries |
| `query-mutations.md` | Insert, update, delete, upsert, returning |
| `query-filters-operators.md` | Where clauses, operators, combining conditions |
| `query-error-handling.md` | Constraint violations, transaction errors, driver-portable error handling |

## 3. Relations (HIGH)

Defining and querying relational data without manual joins.

| File | Topic |
|------|-------|
| `relations-defining.md` | Defining one-to-one, one-to-many, many-to-many relations |
| `relations-querying.md` | Using findMany, findFirst, with, columns, limits |

## 4. Migrations (HIGH)

Managing schema changes safely with Drizzle Kit.

| File | Topic |
|------|-------|
| `migrations-config.md` | drizzle.config.ts setup and options |
| `migrations-workflow.md` | generate, push, pull, migrate workflow |

## 5. Type Safety (MEDIUM-HIGH)

Leveraging TypeScript for compile-time safety.

| File | Topic |
|------|-------|
| `types-inference.md` | InferSelectModel, InferInsertModel, $inferSelect |
| `types-custom-types.md` | Custom types, $type, branded types |

## 6. Performance (MEDIUM)

Optimizing query execution and reducing overhead.

| File | Topic |
|------|-------|
| `perf-prepared-statements.md` | Prepared statements for repeated queries |
| `perf-batch-operations.md` | Batch API for multiple operations |

## 7. Database Drivers (MEDIUM)

Connecting to PostgreSQL correctly across environments.

| File | Topic |
|------|-------|
| `driver-postgres.md` | Postgres driver initialization (node-postgres, postgres.js, Neon) |
| `driver-serverless.md` | Serverless and edge runtime configuration for Postgres |

## 8. Advanced Patterns (LOW)

Power-user patterns for complex use cases.

| File | Topic |
|------|-------|
| `advanced-dynamic-queries.md` | Dynamic query building, conditional clauses |
| `advanced-sql-operator.md` | Raw SQL, sql operator, custom expressions |
