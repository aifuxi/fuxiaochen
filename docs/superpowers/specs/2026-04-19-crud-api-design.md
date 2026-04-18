# CRUD API Design

Date: 2026-04-19

## Summary

This spec defines CRUD APIs for the database resources exported by `lib/db/schema.ts`:

- `categories`
- `tags`
- `blogs`
- `changelogs`

The implementation will use a resource-oriented layered architecture with:

- `handler`
- `service`
- `repository`
- `dto`

The first version will be unauthenticated. It will also introduce:

- a unified success/error response shape
- a stable application error-code system
- shared HTTP error mapping utilities

`blog_tags` will not be exposed as an independent CRUD resource. Instead, `blogs` create/update APIs will accept `tagIds`, and the service layer will maintain the relation table.

## Goals

- Provide stable CRUD endpoints for the four resources above.
- Enforce clear layering between HTTP handling, validation, business logic, and persistence.
- Standardize API responses so all routes return the same envelope.
- Standardize business and validation errors with stable error codes.
- Generate primary keys with `generateCuid()` from `lib/cuid.ts`.

## Non-Goals

- Authentication and authorization.
- Search, sorting, and filtering beyond the minimum defined in this spec.
- Independent CRUD APIs for `blog_tags`.
- Automatic business rules around `publishedAt` beyond explicit input handling.

## Architecture

The implementation will be organized by resource, with shared HTTP infrastructure separated into a common server module.

```text
app/api/
  categories/route.ts
  categories/[id]/route.ts
  tags/route.ts
  tags/[id]/route.ts
  blogs/route.ts
  blogs/[id]/route.ts
  changelogs/route.ts
  changelogs/[id]/route.ts

lib/server/http/
  response.ts
  error-codes.ts
  errors.ts
  error-handler.ts

lib/server/categories/
  dto.ts
  repository.ts
  service.ts
  handler.ts

lib/server/tags/
  dto.ts
  repository.ts
  service.ts
  handler.ts

lib/server/blogs/
  dto.ts
  repository.ts
  service.ts
  handler.ts

lib/server/changelogs/
  dto.ts
  repository.ts
  service.ts
  handler.ts
```

### Layer Responsibilities

#### `route.ts`

- Expose Next.js route handlers.
- Forward `Request` and path params to the resource handler.
- Keep route files thin and free of business logic.

#### `handler.ts`

- Parse request inputs.
- Invoke DTO validation.
- Call the service layer.
- Convert service results into the unified response shape.
- Route thrown errors through the shared HTTP error mapper.

#### `service.ts`

- Own business rules and orchestration.
- Generate `id`, `createdAt`, and `updatedAt`.
- Enforce existence checks for related resources.
- Enforce uniqueness checks before persistence when practical.
- Manage `blogs` to `blog_tags` synchronization.

#### `repository.ts`

- Encapsulate Drizzle reads and writes.
- Avoid business branching.
- Return database-level data required by the service layer.

#### `dto.ts`

- Define request/query validation schemas and inferred types.
- Validate path params, list queries, create payloads, and update payloads.

## Routing

Each resource will expose the same route pattern:

- `GET /api/<resource>`: list
- `POST /api/<resource>`: create
- `GET /api/<resource>/:id`: get by id
- `PATCH /api/<resource>/:id`: partial update
- `DELETE /api/<resource>/:id`: delete

## Response Contract

All routes return one consistent envelope.

### Success

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

Rules:

- `success` is always `true`.
- `data` contains the resource payload, `{ "items": [...] }` for list responses, or `null` for delete responses.
- `meta` is optional but available for pagination and future extensions.

### Error

```json
{
  "success": false,
  "error": {
    "code": "BLOG_NOT_FOUND",
    "message": "Blog not found",
    "details": {}
  }
}
```

Rules:

- `success` is always `false`.
- `error.code` is stable and intended for front-end branching and logging.
- `error.message` is human-readable.
- `error.details` is optional structured context.

## Resource Semantics

### Categories

Required create fields:

- `name`
- `slug`
- `description`

Rules:

- `slug` must be unique.
- List returns resources ordered by `createdAt desc`.

### Tags

Required create fields:

- `name`
- `slug`
- `description`

Rules:

- `slug` must be unique.
- List returns resources ordered by `createdAt desc`.

### Changelogs

Required create fields:

- `version`
- `content`

Optional create fields:

- `releaseDate`

Rules:

- `version` must be unique.
- List returns resources ordered by `releaseDate desc`, then `createdAt desc`.

### Blogs

Required create fields:

- `title`
- `slug`
- `description`
- `content`
- `categoryId`

Optional create fields:

- `cover`
- `published`
- `publishedAt`
- `featured`
- `tagIds`

Rules:

- `slug` must be unique.
- `cover` defaults to an empty string when omitted.
- `published` defaults to `false` when omitted.
- `featured` defaults to `false` when omitted.
- `categoryId` must point to an existing category.
- Each `tagId` must point to an existing tag.
- Duplicate `tagIds` in input are deduplicated in the service layer.
- List supports `published`, `featured`, and `categoryId` filters.
- List ordering is `publishedAt desc`, then `createdAt desc`.

## DTO Boundaries

Each resource will define:

- `Create<Resource>Dto`
- `Update<Resource>Dto`
- `List<Resource>QueryDto`
- `ResourceIdParamDto`

Validation rules:

- Create DTOs enforce required fields and value shapes.
- Update DTOs are partial but reject empty payloads.
- Param DTOs validate `id`.
- List DTOs validate pagination and supported filters only.

## ID and Timestamp Rules

Creation:

- `id` is generated with `generateCuid()`.
- `createdAt` is set to the current timestamp.
- `updatedAt` is set to the current timestamp.

Update:

- `updatedAt` is refreshed to the current timestamp.

Published date:

- `publishedAt` is only written from explicit request input.
- The first version will not infer or auto-fill `publishedAt` when `published` changes.

## Blog Tag Relation Handling

`blog_tags` is managed only through the blog service.

### Create blog

The blog service will:

1. Validate `categoryId`.
2. Validate all provided `tagIds`.
3. Deduplicate `tagIds`.
4. Insert the blog row.
5. Insert related `blog_tags` rows in bulk when `tagIds` is non-empty.

### Update blog

Rules:

- If `tagIds` is omitted, existing tag relations remain unchanged.
- If `tagIds` is present, existing relations are replaced by the new deduplicated set.

The service will:

1. Confirm the blog exists.
2. Validate `categoryId` if provided.
3. Validate all provided `tagIds` if present.
4. Update the blog row.
5. Replace `blog_tags` rows when `tagIds` is provided.

### Delete blog

- The blog service deletes the blog.
- Related `blog_tags` rows rely on the schema's cascade delete behavior.

## Read Models

The API should return front-end friendly shapes instead of exposing only raw tables.

### Category, Tag, Changelog

Return the persisted resource fields directly.

### Blog

Blog read responses include:

- scalar blog fields
- a minimal `category` object
- a minimal `tags` array

Example:

```json
{
  "id": "c123",
  "title": "Post",
  "slug": "post",
  "description": "desc",
  "cover": "",
  "content": "markdown",
  "published": false,
  "publishedAt": null,
  "featured": false,
  "createdAt": "2026-04-19T10:00:00.000Z",
  "updatedAt": "2026-04-19T10:00:00.000Z",
  "category": {
    "id": "cat_1",
    "name": "Tech",
    "slug": "tech"
  },
  "tags": [
    {
      "id": "tag_1",
      "name": "Next.js",
      "slug": "nextjs"
    }
  ]
}
```

## Error-Code Architecture

Errors are represented with a shared application error object that includes:

- `code`
- `message`
- `status`
- `details`

### Common errors

- `COMMON_INVALID_REQUEST`
- `COMMON_VALIDATION_ERROR`
- `COMMON_INTERNAL_ERROR`

### Category errors

- `CATEGORY_NOT_FOUND`
- `CATEGORY_SLUG_CONFLICT`

### Tag errors

- `TAG_NOT_FOUND`
- `TAG_SLUG_CONFLICT`

### Blog errors

- `BLOG_NOT_FOUND`
- `BLOG_SLUG_CONFLICT`
- `BLOG_CATEGORY_NOT_FOUND`
- `BLOG_TAGS_NOT_FOUND`

### Changelog errors

- `CHANGELOG_NOT_FOUND`
- `CHANGELOG_VERSION_CONFLICT`

### Error Mapping

HTTP status mapping:

- `200`: successful read, update, and delete
- `201`: successful create
- `400`: invalid query/body/params
- `404`: missing resource or required relation
- `409`: uniqueness conflict
- `500`: unexpected internal failure

Validation failures should return:

- code: `COMMON_VALIDATION_ERROR`
- message: `Request validation failed`
- details: field-level validation output where available

`BLOG_TAGS_NOT_FOUND` should include missing ids:

```json
{
  "missingTagIds": ["tag_a", "tag_b"]
}
```

## Pagination

All list endpoints accept optional pagination:

- `page`
- `pageSize`

Response `meta` includes:

- `page`
- `pageSize`
- `total`

When omitted, handlers use default values defined in shared DTO or HTTP utility code.
The initial defaults are:

- `page = 1`
- `pageSize = 20`

## Testing Strategy

The implementation will follow TDD, with tests added before production code for each behavior.

### DTO tests

Validate:

- valid payloads
- invalid payloads
- list query parsing
- required-field enforcement
- empty update rejection

### Service tests

Validate:

- id generation via `generateCuid()`
- timestamp behavior on create and update
- not-found errors
- conflict errors
- relation validation for `blogs.categoryId`
- relation validation for `blogs.tagIds`
- tag replacement semantics on blog update

### Route-level tests

Add a small set of integration-oriented tests to verify:

- one happy-path CRUD flow
- one validation error
- one not-found case
- one conflict case
- one blog tag write/read roundtrip

The first pass should stay focused on DTO and service coverage, then add a minimal route smoke test layer.

## Implementation Notes

- The codebase currently has database schema definitions and minimal tests, but no existing CRUD route pattern to follow.
- The implementation should introduce shared HTTP primitives only once and reuse them across all four resources.
- Repository code should keep SQL details local and avoid duplicating validation that belongs in services.
- The first version should optimize for clarity of boundaries rather than generic abstraction.

## Open Decisions Already Resolved

The following decisions are fixed for this work:

- Scope includes `categories`, `tags`, `blogs`, and `changelogs`.
- `blog_tags` is not exposed as a standalone CRUD resource.
- Blog create/update accepts `tagIds`.
- APIs are unauthenticated in the first version.
- Primary keys are generated with `generateCuid()`.
- The chosen architecture is resource-oriented layered CRUD with shared HTTP infrastructure.
