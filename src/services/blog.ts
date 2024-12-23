import {
  type CreateBlogRequestType,
  type UpdateBlogRequestType,
} from "@/app/(admin)/admin/blogs/schema";

import { db } from "@/lib/prisma";

export async function getBlogById(id: number) {
  if (!id) {
    return null;
  }

  const blog = await db.blog.findUnique({
    where: { id },
  });

  return blog;
}

export async function getBlogBySlug(slug: string) {
  if (!slug) {
    return null;
  }

  const blog = await db.blog.findUnique({
    where: { slug },
  });

  return blog;
}

export async function getBlogByTitle(title: string) {
  if (!title) {
    return null;
  }

  const blog = await db.blog.findUnique({
    where: { title },
  });

  return blog;
}

export async function deleteBlogById(id: number) {
  const blog = await db.blog.delete({ where: { id } });

  return blog;
}

export async function createBlogByValues(values: CreateBlogRequestType) {
  const { tagIds, categoryId } = values;

  const blog = await db.blog.create({
    data: {
      title: values.title,
      slug: values.slug,
      description: values.description,
      body: values.body,
      cover: values.cover,
      published: values.published,
      tags: tagIds?.length
        ? {
            connect: tagIds.map((tagId) => ({ id: tagId })),
          }
        : undefined,
      category: categoryId
        ? {
            connect: {
              id: categoryId,
            },
          }
        : undefined,
    },
  });

  return blog;
}

export async function updateBlogByValues(values: UpdateBlogRequestType) {
  const blog = await db.blog.update({
    where: {
      id: values.id,
    },
    data: {
      title: values.title,
      slug: values.slug,
      description: values.description,
      body: values.body,
      cover: values.cover,
      published: values.published,
    },
  });

  return blog;
}
