/* eslint-disable */
import blogsJson from "@/data/blogs.json";
import categoriesJson from "@/data/categories.json";
import tagsJson from "@/data/tags.json";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function main() {
  try {
    if (prisma) {
      await prisma.tag.createMany({
        data: tagsJson.data.tags.map((item) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          icon: item.icon,
          iconDark: item.iconDark,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        })),
      });
      console.log("标签数据迁移成功");
      await prisma.category.createMany({
        data: categoriesJson.data.categories.map((item) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        })),
      });
      console.log("分类数据迁移成功");
      const blogs = await prisma.blog.createManyAndReturn({
        data: blogsJson.data.blogs.map((item) => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          description: item.description,
          body: item.body,
          cover: item.cover,
          published: item.published,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        })),
      });
      for (const blog of blogs) {
        const backupBlog = blogsJson.data.blogs.find(
          (item) => item.id === blog.id,
        );
        const tagParams =
          backupBlog?.tags?.map((tag) => ({ id: tag.id })) ?? [];
        const categoryParams = backupBlog?.category
          ? { connect: { id: backupBlog.category.id } }
          : undefined;

        await prisma.blog.update({
          where: {
            id: blog.id,
          },
          data: {
            tags: tagParams.length
              ? {
                  set: tagParams,
                }
              : undefined,
            category: categoryParams,
          },
        });
      }
      console.log("博客数据迁移成功");
    } else {
      console.error("数据迁移失败，请检查");
    }
  } catch (e) {
    console.error("数据迁移失败，请检查", e);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
