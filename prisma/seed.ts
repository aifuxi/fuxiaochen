import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { PrismaClient } from "../generated/prisma/client";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Prisma Client with MariaDB adapter, matching lib/prisma.ts
// Note: We need to ensure these ENV variables are present.
const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Start seeding...");

  // Read JSON files
  const dataDir = path.join(__dirname, "../data");

  const categoriesData = JSON.parse(
    fs.readFileSync(path.join(dataDir, "category_response.json"), "utf-8"),
  );
  const tagsData = JSON.parse(
    fs.readFileSync(path.join(dataDir, "tag_response.json"), "utf-8"),
  );
  const blogsData = JSON.parse(
    fs.readFileSync(path.join(dataDir, "blog_response.json"), "utf-8"),
  );
  const changelogsData = JSON.parse(
    fs.readFileSync(path.join(dataDir, "changelog_response.json"), "utf-8"),
  );

  // 1. Seed Categories
  console.log("Seeding Categories...");
  for (const cat of categoriesData.data.lists) {
    await prisma.category.upsert({
      where: { id: BigInt(cat.id) },
      update: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        updatedAt: new Date(cat.updatedAt),
      },
      create: {
        id: BigInt(cat.id),
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        createdAt: new Date(cat.createdAt),
        updatedAt: new Date(cat.updatedAt),
      },
    });
  }
  console.log(`Seeded ${categoriesData.data.lists.length} categories.`);

  // 2. Seed Tags
  console.log("Seeding Tags...");
  for (const tag of tagsData.data.lists) {
    await prisma.tag.upsert({
      where: { id: BigInt(tag.id) },
      update: {
        name: tag.name,
        slug: tag.slug,
        description: tag.description,
        updatedAt: new Date(tag.updatedAt),
      },
      create: {
        id: BigInt(tag.id),
        name: tag.name,
        slug: tag.slug,
        description: tag.description,
        createdAt: new Date(tag.createdAt),
        updatedAt: new Date(tag.updatedAt),
      },
    });
  }
  console.log(`Seeded ${tagsData.data.lists.length} tags.`);

  // 3. Seed Blogs
  console.log("Seeding Blogs...");
  for (const blog of blogsData.data.lists) {
    const publishedAt = blog.publishedAt ? new Date(blog.publishedAt) : null;

    // Construct tag connections
    // blog.tags can be null or array
    // Explicit many-to-many: we need to create BlogTag records
    // But prisma upsert create/update allows nested writes.
    // For explicit m-n, it's slightly different:
    // tags: { create: [{ tag: { connect: { id: ... } } }] }
    // OR simpler: just delete existing relations and create new ones if we want to be safe,
    // but upsert is tricky with explicit m-n.

    // Strategy:
    // 1. Upsert the Blog (without tags first to avoid complex nested upsert logic if possible, OR use the correct nested syntax)
    // 2. Handle tags separately (delete all for this blog, then create)

    // Let's try nested write with deleteMany + create
    const tagIds = blog.tags
      ? blog.tags.map((t: any) => ({ tagId: BigInt(t.id) }))
      : [];

    await prisma.blog.upsert({
      where: { id: BigInt(blog.id) },
      update: {
        title: blog.title,
        slug: blog.slug,
        description: blog.description,
        cover: blog.cover || "",
        content: blog.content,
        published: blog.published,
        publishedAt: publishedAt,
        featured: blog.featured,
        updatedAt: new Date(blog.updatedAt),
        categoryId: BigInt(blog.categoryID),
        tags: {
          deleteMany: {}, // Remove all existing relationships
          create: tagIds.map((t: any) => ({
            tag: { connect: { id: t.tagId } },
          })),
        },
      },
      create: {
        id: BigInt(blog.id),
        title: blog.title,
        slug: blog.slug,
        description: blog.description,
        cover: blog.cover || "",
        content: blog.content,
        published: blog.published,
        publishedAt: publishedAt,
        featured: blog.featured,
        createdAt: new Date(blog.createdAt),
        updatedAt: new Date(blog.updatedAt),
        categoryId: BigInt(blog.categoryID),
        tags: {
          create: tagIds.map((t: any) => ({
            tag: { connect: { id: t.tagId } },
          })),
        },
      },
    });
  }
  console.log(`Seeded ${blogsData.data.lists.length} blogs.`);

  // 4. Seed Changelogs
  console.log("Seeding Changelogs...");
  for (const log of changelogsData.data.lists) {
    await prisma.changelog.upsert({
      where: { id: BigInt(log.id) },
      update: {
        version: log.version,
        content: log.content,
        date: log.date ? BigInt(log.date) : 0,
        updatedAt: new Date(log.updatedAt),
      },
      create: {
        id: BigInt(log.id),
        version: log.version,
        content: log.content,
        date: log.date ? BigInt(log.date) : 0,
        createdAt: new Date(log.createdAt),
        updatedAt: new Date(log.updatedAt),
      },
    });
  }
  console.log(`Seeded ${changelogsData.data.lists.length} changelogs.`);

  console.log("Seeding finished.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
