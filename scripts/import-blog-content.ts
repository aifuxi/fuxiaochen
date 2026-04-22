import { eq, inArray, sql } from "drizzle-orm";
import { readFile } from "node:fs/promises";
import { z } from "zod";
import "dotenv/config";
import { getDb } from "../lib/db";
import { blogTags, blogs, categories, tags } from "../lib/db/schema";
import { computeReadTimeMinutes } from "../lib/server/content-utils";

const sourceDateSchema = z.coerce.date();

const sourceCategorySchema = z.object({
  id: z.string().trim().min(1),
  createdAt: sourceDateSchema,
  updatedAt: sourceDateSchema,
  name: z.string(),
  slug: z.string().trim().min(1),
  description: z.string(),
});

const sourceTagSchema = z.object({
  id: z.string().trim().min(1),
  createdAt: sourceDateSchema,
  updatedAt: sourceDateSchema,
  name: z.string(),
  slug: z.string().trim().min(1),
  description: z.string(),
});

const sourceBlogSchema = z.object({
  id: z.string().trim().min(1),
  createdAt: sourceDateSchema,
  updatedAt: sourceDateSchema,
  title: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  description: z.string(),
  cover: z.string(),
  content: z.string(),
  published: z.boolean(),
  publishedAt: sourceDateSchema.nullable(),
  featured: z.boolean(),
  categoryID: z.string().trim().min(1),
  category: sourceCategorySchema,
  tags: z.array(sourceTagSchema).default([]),
});

const responseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    code: z.number(),
    message: z.string(),
    data: z.object({
      total: z.number(),
      lists: z.array(itemSchema),
    }),
  });

const sourceCategoriesSchema = responseSchema(sourceCategorySchema);
const sourceTagsSchema = responseSchema(sourceTagSchema);
const sourceBlogsSchema = responseSchema(sourceBlogSchema);

type SourceCategory = z.infer<typeof sourceCategorySchema>;
type SourceTag = z.infer<typeof sourceTagSchema>;
type SourceBlog = z.infer<typeof sourceBlogSchema>;
type TransactionClient = Parameters<Parameters<typeof db.transaction>[0]>[0];

type SyncStats = {
  inserted: number;
  updated: number;
};

type SourcePayload = {
  categories: SourceCategory[];
  tags: SourceTag[];
  blogs: SourceBlog[];
};

type BlogTableCapabilities = {
  coverColumn: "cover" | "cover_image";
  hasReadTimeMinutes: boolean;
};

const encoder = new TextEncoder();
const db = getDb();

function toTimestampValue(value: Date | null) {
  return value ? value.toISOString() : null;
}

function writeLine(message: string) {
  process.stdout.write(encoder.encode(`${message}\n`));
}

function writeError(message: string) {
  process.stderr.write(encoder.encode(`${message}\n`));
}

async function closeDatabaseConnection() {
  await db.$client.end();
}

async function readJsonFile<T extends z.ZodTypeAny>(
  relativePath: string,
  schema: T,
): Promise<z.infer<T>> {
  const fileUrl = new URL(`../${relativePath}`, import.meta.url);
  const content = await readFile(fileUrl, "utf8");
  return schema.parse(JSON.parse(content) as unknown);
}

async function loadSourcePayload(): Promise<SourcePayload> {
  const [categoryResponse, tagResponse, blogResponse] = await Promise.all([
    readJsonFile("data/category_response.json", sourceCategoriesSchema),
    readJsonFile("data/tag_response.json", sourceTagsSchema),
    readJsonFile("data/blog_response.json", sourceBlogsSchema),
  ]);

  return {
    categories: categoryResponse.data.lists,
    tags: tagResponse.data.lists,
    blogs: blogResponse.data.lists,
  };
}

function buildDuplicateEntries(
  values: string[],
): Array<{ value: string; count: number }> {
  const counts = new Map<string, number>();

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([value, count]) => ({ value, count }))
    .sort((left, right) => left.value.localeCompare(right.value));
}

function formatDuplicateSection(
  entityName: string,
  fieldName: "id" | "slug",
  duplicates: Array<{ value: string; count: number }>,
) {
  if (duplicates.length === 0) {
    return null;
  }

  return [
    `${entityName} has duplicate ${fieldName} values:`,
    ...duplicates.map(
      (entry) => `- ${fieldName}="${entry.value}" appears ${entry.count} times`,
    ),
  ].join("\n");
}

function ensureUniqueEntities(
  entityName: string,
  items: Array<{ id: string; slug: string }>,
) {
  const duplicateIdSection = formatDuplicateSection(
    entityName,
    "id",
    buildDuplicateEntries(items.map((item) => item.id)),
  );
  const duplicateSlugSection = formatDuplicateSection(
    entityName,
    "slug",
    buildDuplicateEntries(items.map((item) => item.slug)),
  );
  const messages = [duplicateIdSection, duplicateSlugSection].filter(Boolean);

  if (messages.length > 0) {
    throw new Error(messages.join("\n"));
  }
}

function areCategoriesEqual(left: SourceCategory, right: SourceCategory) {
  return (
    left.id === right.id &&
    left.createdAt.getTime() === right.createdAt.getTime() &&
    left.updatedAt.getTime() === right.updatedAt.getTime() &&
    left.name === right.name &&
    left.slug === right.slug &&
    left.description === right.description
  );
}

function areTagsEqual(left: SourceTag, right: SourceTag) {
  return (
    left.id === right.id &&
    left.createdAt.getTime() === right.createdAt.getTime() &&
    left.updatedAt.getTime() === right.updatedAt.getTime() &&
    left.name === right.name &&
    left.slug === right.slug &&
    left.description === right.description
  );
}

function validateSourcePayload({ categories, tags, blogs }: SourcePayload) {
  ensureUniqueEntities("category source", categories);
  ensureUniqueEntities("tag source", tags);
  ensureUniqueEntities("blog source", blogs);

  const categoryById = new Map(
    categories.map((category) => [category.id, category]),
  );
  const tagById = new Map(tags.map((tag) => [tag.id, tag]));
  const issues: string[] = [];

  for (const blog of blogs) {
    const duplicateTagEntries = buildDuplicateEntries(
      blog.tags.map((tag) => tag.id),
    );

    if (duplicateTagEntries.length > 0) {
      issues.push(
        `Blog "${blog.slug}" contains duplicate tag ids: ${duplicateTagEntries.map((entry) => entry.value).join(", ")}.`,
      );
    }

    const sourceCategory = categoryById.get(blog.categoryID);

    if (!sourceCategory) {
      issues.push(
        `Blog "${blog.slug}" references missing categoryID "${blog.categoryID}".`,
      );
    } else if (!areCategoriesEqual(blog.category, sourceCategory)) {
      issues.push(
        `Blog "${blog.slug}" contains nested category data that does not match category_response.json for category "${blog.categoryID}".`,
      );
    }

    if (blog.category.id !== blog.categoryID) {
      issues.push(
        `Blog "${blog.slug}" has mismatched category IDs: categoryID="${blog.categoryID}" but nested category.id="${blog.category.id}".`,
      );
    }

    for (const tag of blog.tags) {
      const sourceTag = tagById.get(tag.id);

      if (!sourceTag) {
        issues.push(
          `Blog "${blog.slug}" references missing tag "${tag.id}" in nested tags.`,
        );
        continue;
      }

      if (!areTagsEqual(tag, sourceTag)) {
        issues.push(
          `Blog "${blog.slug}" contains nested tag data that does not match tag_response.json for tag "${tag.id}".`,
        );
      }
    }
  }

  if (issues.length > 0) {
    throw new Error(`Source validation failed:\n${issues.join("\n")}`);
  }
}

function collectSlugConflicts(
  entityName: "categories" | "tags" | "blogs",
  rows: Array<{ id: string; slug: string }>,
  sourceIdBySlug: Map<string, string>,
) {
  return rows
    .filter((row) => sourceIdBySlug.get(row.slug) !== row.id)
    .map(
      (row) =>
        `- ${entityName}: slug="${row.slug}" exists in DB with id="${row.id}" but source expects id="${sourceIdBySlug.get(row.slug)}"`,
    );
}

async function validateTargetConflicts({
  categories: sourceCategories,
  tags: sourceTags,
  blogs: sourceBlogs,
}: SourcePayload) {
  const categorySourceIdBySlug = new Map(
    sourceCategories.map((category) => [category.slug, category.id]),
  );
  const tagSourceIdBySlug = new Map(
    sourceTags.map((tag) => [tag.slug, tag.id]),
  );
  const blogSourceIdBySlug = new Map(
    sourceBlogs.map((blog) => [blog.slug, blog.id]),
  );

  const [categoryRows, tagRows, blogRows] = await Promise.all([
    db
      .select({
        id: categories.id,
        slug: categories.slug,
      })
      .from(categories)
      .where(inArray(categories.slug, [...categorySourceIdBySlug.keys()])),
    db
      .select({
        id: tags.id,
        slug: tags.slug,
      })
      .from(tags)
      .where(inArray(tags.slug, [...tagSourceIdBySlug.keys()])),
    db
      .select({
        id: blogs.id,
        slug: blogs.slug,
      })
      .from(blogs)
      .where(inArray(blogs.slug, [...blogSourceIdBySlug.keys()])),
  ]);

  const conflicts = [
    ...collectSlugConflicts("categories", categoryRows, categorySourceIdBySlug),
    ...collectSlugConflicts("tags", tagRows, tagSourceIdBySlug),
    ...collectSlugConflicts("blogs", blogRows, blogSourceIdBySlug),
  ];

  if (conflicts.length > 0) {
    throw new Error(
      `Target database contains slug conflicts with different ids:\n${conflicts.join("\n")}`,
    );
  }
}

async function getBlogTableCapabilities(): Promise<BlogTableCapabilities> {
  const rows = await db.execute(
    sql`
      select column_name
      from information_schema.columns
      where table_schema = current_schema()
        and table_name = ${"blogs"}
      order by ordinal_position
    `,
  );
  const columnNames = new Set(rows.map((row) => String(row.column_name)));
  const coverColumn = columnNames.has("cover_image")
    ? "cover_image"
    : columnNames.has("cover")
      ? "cover"
      : null;

  if (!coverColumn) {
    throw new Error(
      'Target database "blogs" table is missing both "cover" and "cover_image" columns.',
    );
  }

  return {
    coverColumn,
    hasReadTimeMinutes: columnNames.has("read_time_minutes"),
  };
}

async function syncCategories(
  tx: TransactionClient,
  sourceCategories: SourceCategory[],
): Promise<SyncStats> {
  const sourceIds = sourceCategories.map((category) => category.id);
  const existingRows = await tx
    .select({ id: categories.id })
    .from(categories)
    .where(inArray(categories.id, sourceIds));
  const existingIds = new Set(existingRows.map((row) => row.id));

  const insertValues = sourceCategories
    .filter((category) => !existingIds.has(category.id))
    .map((category) => ({
      id: category.id,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      name: category.name,
      slug: category.slug,
      description: category.description,
    }));

  if (insertValues.length > 0) {
    await tx.insert(categories).values(insertValues);
  }

  for (const category of sourceCategories) {
    if (!existingIds.has(category.id)) {
      continue;
    }

    await tx
      .update(categories)
      .set({
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
        name: category.name,
        slug: category.slug,
        description: category.description,
      })
      .where(eq(categories.id, category.id));
  }

  return {
    inserted: insertValues.length,
    updated: sourceCategories.length - insertValues.length,
  };
}

async function syncTags(
  tx: TransactionClient,
  sourceTags: SourceTag[],
): Promise<SyncStats> {
  const sourceIds = sourceTags.map((tag) => tag.id);
  const existingRows = await tx
    .select({ id: tags.id })
    .from(tags)
    .where(inArray(tags.id, sourceIds));
  const existingIds = new Set(existingRows.map((row) => row.id));

  const insertValues = sourceTags
    .filter((tag) => !existingIds.has(tag.id))
    .map((tag) => ({
      id: tag.id,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
      name: tag.name,
      slug: tag.slug,
      description: tag.description,
    }));

  if (insertValues.length > 0) {
    await tx.insert(tags).values(insertValues);
  }

  for (const tag of sourceTags) {
    if (!existingIds.has(tag.id)) {
      continue;
    }

    await tx
      .update(tags)
      .set({
        createdAt: tag.createdAt,
        updatedAt: tag.updatedAt,
        name: tag.name,
        slug: tag.slug,
        description: tag.description,
      })
      .where(eq(tags.id, tag.id));
  }

  return {
    inserted: insertValues.length,
    updated: sourceTags.length - insertValues.length,
  };
}

async function syncBlogs(
  tx: TransactionClient,
  sourceBlogs: SourceBlog[],
  capabilities: BlogTableCapabilities,
): Promise<SyncStats> {
  const blogWriteColumns = [
    "id",
    "created_at",
    "updated_at",
    "title",
    "slug",
    "description",
    capabilities.coverColumn,
    "content",
    "published",
    "published_at",
    "featured",
    ...(capabilities.hasReadTimeMinutes ? ["read_time_minutes"] : []),
    "category_id",
  ] as const;
  const toColumnIdentifier = (column: string) => sql.raw(`"${column}"`);
  const toSqlValue = (value: unknown) => sql`${value}`;
  const getBlogRowByColumn = (blog: SourceBlog) => {
    const valuesByColumn: Record<string, unknown> = {
      id: blog.id,
      created_at: toTimestampValue(blog.createdAt),
      updated_at: toTimestampValue(blog.updatedAt),
      title: blog.title,
      slug: blog.slug,
      description: blog.description,
      cover: blog.cover,
      cover_image: blog.cover,
      content: blog.content,
      published: blog.published,
      published_at: toTimestampValue(blog.publishedAt),
      featured: blog.featured,
      read_time_minutes: computeReadTimeMinutes(blog.content),
      category_id: blog.categoryID,
    };

    return valuesByColumn;
  };

  const sourceIds = sourceBlogs.map((blog) => blog.id);
  const existingRows = await tx
    .select({ id: blogs.id })
    .from(blogs)
    .where(inArray(blogs.id, sourceIds));
  const existingIds = new Set(existingRows.map((row) => row.id));

  const insertValues = sourceBlogs.filter((blog) => !existingIds.has(blog.id));

  if (insertValues.length > 0) {
    for (const blog of insertValues) {
      const valuesByColumn = getBlogRowByColumn(blog);

      await tx.execute(
        sql`
          insert into "blogs" (${sql.join(blogWriteColumns.map(toColumnIdentifier), sql`, `)})
          values (${sql.join(
            blogWriteColumns.map((column) =>
              toSqlValue(valuesByColumn[column]),
            ),
            sql`, `,
          )})
        `,
      );
    }
  }

  for (const blog of sourceBlogs) {
    if (!existingIds.has(blog.id)) {
      continue;
    }

    const valuesByColumn = getBlogRowByColumn(blog);
    const updateColumns = blogWriteColumns.filter((column) => column !== "id");

    await tx.execute(
      sql`
        update "blogs"
        set ${sql.join(
          updateColumns.map(
            (column) =>
              sql`${toColumnIdentifier(column)} = ${valuesByColumn[column]}`,
          ),
          sql`, `,
        )}
        where "id" = ${blog.id}
      `,
    );
  }

  return {
    inserted: insertValues.length,
    updated: sourceBlogs.length - insertValues.length,
  };
}

async function syncBlogTags(
  tx: TransactionClient,
  sourceBlogs: SourceBlog[],
): Promise<number> {
  const sourceBlogIds = sourceBlogs.map((blog) => blog.id);

  await tx.delete(blogTags).where(inArray(blogTags.blogId, sourceBlogIds));

  const values = sourceBlogs.flatMap((blog) =>
    blog.tags.map((tag) => ({
      blogId: blog.id,
      tagId: tag.id,
    })),
  );

  if (values.length > 0) {
    await tx.insert(blogTags).values(values);
  }

  return values.length;
}

async function countRowsByIds<T extends string>(
  entityName: "categories" | "tags" | "blogs",
  ids: T[],
) {
  if (ids.length === 0) {
    return 0;
  }

  if (entityName === "categories") {
    const rows = await db
      .select({
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(categories)
      .where(inArray(categories.id, ids));

    return rows[0]?.count ?? 0;
  }

  if (entityName === "tags") {
    const rows = await db
      .select({
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(tags)
      .where(inArray(tags.id, ids));

    return rows[0]?.count ?? 0;
  }

  const rows = await db
    .select({
      count: sql<number>`count(*)`.mapWith(Number),
    })
    .from(blogs)
    .where(inArray(blogs.id, ids));

  return rows[0]?.count ?? 0;
}

async function countBlogTagRows(blogIds: string[]) {
  if (blogIds.length === 0) {
    return 0;
  }

  const rows = await db
    .select({
      count: sql<number>`count(*)`.mapWith(Number),
    })
    .from(blogTags)
    .where(inArray(blogTags.blogId, blogIds));

  return rows[0]?.count ?? 0;
}

async function verifySampleBlog(sourceBlog: SourceBlog) {
  const rows = await db
    .select({
      blogId: blogs.id,
      blogSlug: blogs.slug,
      categoryId: blogs.categoryId,
      categorySlug: categories.slug,
      tagSlug: tags.slug,
    })
    .from(blogs)
    .innerJoin(categories, eq(blogs.categoryId, categories.id))
    .leftJoin(blogTags, eq(blogTags.blogId, blogs.id))
    .leftJoin(tags, eq(blogTags.tagId, tags.id))
    .where(eq(blogs.id, sourceBlog.id));

  if (rows.length === 0) {
    throw new Error(
      `Sample verification failed: blog "${sourceBlog.slug}" was not found after sync.`,
    );
  }

  const firstRow = rows[0];

  if (!firstRow) {
    throw new Error(
      `Sample verification failed: blog "${sourceBlog.slug}" returned no rows.`,
    );
  }

  if (firstRow.categoryId !== sourceBlog.categoryID) {
    throw new Error(
      `Sample verification failed: blog "${sourceBlog.slug}" has categoryId="${firstRow.categoryId}" but expected "${sourceBlog.categoryID}".`,
    );
  }

  if (firstRow.categorySlug !== sourceBlog.category.slug) {
    throw new Error(
      `Sample verification failed: blog "${sourceBlog.slug}" has category slug "${firstRow.categorySlug}" but expected "${sourceBlog.category.slug}".`,
    );
  }

  const actualTagSlugs = [
    ...new Set(
      rows
        .map((row) => row.tagSlug)
        .filter((tagSlug): tagSlug is string => Boolean(tagSlug)),
    ),
  ].sort((left, right) => left.localeCompare(right));
  const expectedTagSlugs = sourceBlog.tags
    .map((tag) => tag.slug)
    .sort((left, right) => left.localeCompare(right));

  if (actualTagSlugs.length !== expectedTagSlugs.length) {
    throw new Error(
      `Sample verification failed: blog "${sourceBlog.slug}" has ${actualTagSlugs.length} tags after sync but expected ${expectedTagSlugs.length}.`,
    );
  }

  for (let index = 0; index < expectedTagSlugs.length; index += 1) {
    if (actualTagSlugs[index] !== expectedTagSlugs[index]) {
      throw new Error(
        `Sample verification failed: blog "${sourceBlog.slug}" tag slugs do not match source data.`,
      );
    }
  }
}

async function run() {
  writeLine("Loading blog/category/tag source payload...");
  const sourcePayload = await loadSourcePayload();

  writeLine("Validating source payload consistency...");
  validateSourcePayload(sourcePayload);

  writeLine("Checking database for conflicting slugs with different ids...");
  await validateTargetConflicts(sourcePayload);

  writeLine("Inspecting blogs table capabilities...");
  const blogTableCapabilities = await getBlogTableCapabilities();

  writeLine("Synchronizing categories, tags, blogs, and blog_tags...");
  const syncResult = await db.transaction(async (tx) => {
    const categoryStats = await syncCategories(tx, sourcePayload.categories);
    const tagStats = await syncTags(tx, sourcePayload.tags);
    const blogStats = await syncBlogs(
      tx,
      sourcePayload.blogs,
      blogTableCapabilities,
    );
    const blogTagCount = await syncBlogTags(tx, sourcePayload.blogs);

    return {
      categoryStats,
      tagStats,
      blogStats,
      blogTagCount,
    };
  });

  const [categoryCount, tagCount, blogCount, blogTagCount] = await Promise.all([
    countRowsByIds(
      "categories",
      sourcePayload.categories.map((category) => category.id),
    ),
    countRowsByIds(
      "tags",
      sourcePayload.tags.map((tag) => tag.id),
    ),
    countRowsByIds(
      "blogs",
      sourcePayload.blogs.map((blog) => blog.id),
    ),
    countBlogTagRows(sourcePayload.blogs.map((blog) => blog.id)),
  ]);

  await verifySampleBlog(sourcePayload.blogs[0]);

  writeLine("Import complete.");
  writeLine(
    `- categories: inserted=${syncResult.categoryStats.inserted}, updated=${syncResult.categoryStats.updated}, present=${categoryCount}/${sourcePayload.categories.length}`,
  );
  writeLine(
    `- tags: inserted=${syncResult.tagStats.inserted}, updated=${syncResult.tagStats.updated}, present=${tagCount}/${sourcePayload.tags.length}`,
  );
  writeLine(
    `- blogs: inserted=${syncResult.blogStats.inserted}, updated=${syncResult.blogStats.updated}, present=${blogCount}/${sourcePayload.blogs.length}`,
  );
  writeLine(
    `- blog_tags: synced=${syncResult.blogTagCount}, present=${blogTagCount}/${syncResult.blogTagCount}`,
  );
  writeLine(
    `- sample blog verified: slug="${sourcePayload.blogs[0]?.slug ?? ""}" category and tag slugs match source data`,
  );
}

void (async () => {
  try {
    await run();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    writeError(`Import failed: ${message}`);
    process.exitCode = 1;
  } finally {
    await closeDatabaseConnection();
  }
})();
