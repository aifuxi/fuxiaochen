/**
 * Seed script for migrating data from JSON files to database.
 * Run with: bun run db:seed
 */
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import "dotenv/config";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Resolve paths relative to this file's location
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, "..");

// Dynamic imports with absolute paths
const [categories, tags, blogs, changelogs] = await Promise.all([
  import(join(ROOT_DIR, "data/category_response.json")),
  import(join(ROOT_DIR, "data/tag_response.json")),
  import(join(ROOT_DIR, "data/blog_response.json")),
  import(join(ROOT_DIR, "data/changelog_response.json")),
]);

// Initialize Prisma Client with adapter (same as lib/db.ts)
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not configured.");
}

const adapter = new PrismaMariaDb(databaseUrl);
const { PrismaClient } = await import(
  join(ROOT_DIR, "generated/prisma/client.js")
);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seed...");

  // 1. Seed Categories
  console.log("📂 Seeding categories...");
  for (const category of categories.default.data.lists) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: {},
      create: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        sortOrder: categories.default.data.lists.indexOf(category),
      },
    });
  }
  console.log(
    `   ✅ ${categories.default.data.lists.length} categories seeded`,
  );

  // 2. Seed Tags
  console.log("🏷️  Seeding tags...");
  for (const tag of tags.default.data.lists) {
    await prisma.tag.upsert({
      where: { id: tag.id },
      update: {},
      create: {
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        description: tag.description,
        sortOrder: tags.default.data.lists.indexOf(tag),
      },
    });
  }
  console.log(`   ✅ ${tags.default.data.lists.length} tags seeded`);

  // 3. Seed Articles
  console.log("📝 Seeding articles...");
  for (const blog of blogs.default.data.lists) {
    await prisma.article.upsert({
      where: { id: blog.id },
      update: {},
      create: {
        id: blog.id,
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.description,
        contentMarkdown: blog.content,
        status: blog.published ? "Published" : "Draft",
        isFeatured: blog.featured ?? false,
        publishedAt: blog.publishedAt ? new Date(blog.publishedAt) : null,
        categoryId: blog.category?.id ?? null,
      },
    });

    // Create ArticleTag relations
    if (blog.tags && blog.tags.length > 0) {
      for (const tag of blog.tags) {
        await prisma.articleTag.upsert({
          where: {
            articleId_tagId: { articleId: blog.id, tagId: tag.id },
          },
          update: {},
          create: {
            articleId: blog.id,
            tagId: tag.id,
          },
        });
      }
    }
  }
  console.log(`   ✅ ${blogs.default.data.lists.length} articles seeded`);

  // 4. Seed Changelogs
  console.log("📋 Seeding changelogs...");
  for (const release of changelogs.default.data.lists) {
    const releasedOn = release.date
      ? new Date(release.date)
      : new Date(release.createdAt);

    // Parse markdown content to extract items
    const { title, items } = parseChangelogContent(release.content);

    await prisma.changelogRelease.upsert({
      where: { version: release.version },
      update: {},
      create: {
        id: release.id,
        version: release.version,
        title: title,
        summary: release.content,
        releasedOn: releasedOn,
        isMajor: release.version.includes("."),
        sortOrder: changelogs.default.data.lists.indexOf(release),
      },
    });

    // Create ChangelogItems
    for (const item of items) {
      await prisma.changelogItem.create({
        data: {
          releaseId: release.id,
          itemType: item.type,
          title: item.title,
          description: item.description,
          sortOrder: items.indexOf(item),
        },
      });
    }
  }
  console.log(
    `   ✅ ${changelogs.default.data.lists.length} changelog releases seeded`,
  );

  console.log("✅ Seed completed!");
}

function parseChangelogContent(content) {
  if (!content) return { title: "", items: [] };

  const lines = content.split("\n");
  const items = [];
  let title = "";

  for (const line of lines) {
    const trimmed = line.trim();

    // Extract title from ### heading
    if (trimmed.startsWith("### ")) {
      title = trimmed.slice(4).trim();
      continue;
    }

    // Parse changelog item lines: - feat(module): description
    if (trimmed.startsWith("- ")) {
      const itemText = trimmed.slice(2);
      const match = itemText.match(
        /^(feat|fix|chore|docs|perf|refactor|test|style)(\([^)]+\))?:\s*(.+)/,
      );

      if (match) {
        const [, type, , description] = match;
        const typeMap = {
          feat: "Added",
          fix: "Fixed",
          chore: "Changed",
          docs: "Changed",
          perf: "Improved",
          refactor: "Changed",
          test: "Changed",
          style: "Changed",
        };
        items.push({
          type: typeMap[type] ?? "Changed",
          title: description,
        });
      } else if (itemText) {
        // Plain text item without type prefix
        items.push({
          type: "Changed",
          title: itemText,
        });
      }
    }
  }

  return { title, items };
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
