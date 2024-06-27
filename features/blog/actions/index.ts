"use server";

import { type Prisma } from "@prisma/client";
import { isUndefined } from "lodash-es";

import { ERROR_NO_PERMISSION, PUBLISHED_MAP } from "@/constants";
import { batchGetBlogUV } from "@/features/statistics";
import { noPermission } from "@/features/user";
import { prisma } from "@/lib/prisma";
import { getSkip } from "@/utils";

import {
  type CreateBlogDTO,
  type GetBlogsDTO,
  type UpdateBlogDTO,
  createBlogSchema,
  getBlogsSchema,
  updateBlogSchema,
} from "../types";

export const isBlogExistByID = async (id: string): Promise<boolean> => {
  const isExist = await prisma.blog.findUnique({ where: { id } });

  return Boolean(isExist);
};

export const getBlogs = async (params: GetBlogsDTO) => {
  const result = await getBlogsSchema.safeParseAsync(params);

  if (!result.success) {
    throw new Error(result.error.format()._errors?.join(";") || "");
  }

  const cond: Prisma.BlogWhereInput = {
    OR: [
      ...(result.data.title?.trim()
        ? [{ title: { contains: result.data.title.trim() } }]
        : []),
      ...(result.data.slug?.trim()
        ? [{ slug: { contains: result.data.slug.trim() } }]
        : []),
      ...(result.data.tags?.length
        ? [{ tags: { some: { id: { in: result.data.tags } } } }]
        : []),
    ],
  };

  const published = await noPermission();
  if (published || !isUndefined(result.data.published)) {
    cond.published = PUBLISHED_MAP[result.data.published!] || published;
  }

  const sort: Prisma.BlogOrderByWithRelationInput | undefined =
    result.data.orderBy && result.data.order
      ? { [result.data.orderBy]: result.data.order }
      : undefined;

  if (!cond.OR?.length) {
    delete cond.OR;
  }

  const total = await prisma.blog.count({ where: cond });
  const blogs = await prisma.blog.findMany({
    include: {
      tags: true,
    },
    orderBy: sort,
    where: cond,
    take: result.data.pageSize,
    skip: getSkip(result.data.pageIndex, result.data.pageSize),
  });

  return { blogs, total };
};

export const getPublishedBlogs = async () => {
  const blogs = await prisma.blog.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      tags: true,
    },
    where: {
      published: true,
    },
  });

  const count = await prisma.blog.count({
    where: {
      published: true,
    },
  });

  const total = count ?? 0;

  const m = await batchGetBlogUV(blogs?.map((el) => el.id));

  return {
    blogs,
    total,
    uvMap: isUndefined(m) ? undefined : Object.fromEntries(m),
  };
};

export const getBlogByID = async (id: string) => {
  const blog = await prisma.blog.findUnique({
    where: { id },
    include: {
      tags: true,
    },
  });

  return { blog };
};

export const getPublishedBlogBySlug = async (slug: string) => {
  const blog = await prisma.blog.findUnique({
    where: { slug, published: true },
    include: {
      tags: true,
    },
  });

  return { blog };
};

export const deleteBlogByID = async (id: string) => {
  if (await noPermission()) {
    throw ERROR_NO_PERMISSION;
  }

  const isExist = await isBlogExistByID(id);

  if (!isExist) {
    throw new Error("Blog不存在");
  }

  await prisma.blog.delete({
    where: {
      id,
    },
  });
};

export const createBlog = async (params: CreateBlogDTO) => {
  if (await noPermission()) {
    throw ERROR_NO_PERMISSION;
  }
  const result = await createBlogSchema.safeParseAsync(params);

  if (!result.success) {
    const error = result.error.format()._errors?.join(";");
    throw new Error(error);
  }

  const { title, slug, description, body, published, cover, author, tags } =
    result.data;

  const blogs = await prisma.blog.findMany({
    where: {
      OR: [{ title }, { slug }],
    },
  });

  if (blogs.length) {
    throw new Error("标题或者slug重复");
  }

  await prisma.blog.create({
    data: {
      title,
      slug,
      description,
      body,
      published,
      cover,
      author,
      tags: tags
        ? {
            connect: tags.map((tagID) => ({ id: tagID })),
          }
        : undefined,
    },
  });
};

export const toggleBlogPublished = async (id: string) => {
  if (await noPermission()) {
    throw ERROR_NO_PERMISSION;
  }
  const blog = await prisma.blog.findUnique({
    where: {
      id,
    },
  });

  if (!blog) {
    throw new Error("Blog不存在");
  }

  await prisma.blog.update({
    data: {
      published: !blog.published,
    },
    where: {
      id,
    },
  });
};

export const updateBlog = async (params: UpdateBlogDTO) => {
  if (await noPermission()) {
    throw ERROR_NO_PERMISSION;
  }
  const result = await updateBlogSchema.safeParseAsync(params);

  if (!result.success) {
    const error = result.error.format()._errors?.join(";");
    throw new Error(error);
  }

  const { id, title, description, slug, cover, author, body, published, tags } =
    result.data;

  const blog = await prisma.blog.findUnique({
    where: { id },
    include: { tags: true },
  });

  if (!blog) {
    throw new Error("Blog不存在");
  }

  const blogTags = new Set(blog.tags.map((el) => el.id));
  const tagsToConnect = tags
    ?.filter((tagID) => !blogTags.has(tagID))
    .map((tagID) => ({ id: tagID }));
  const tagsToDisconnect = Array.from(blogTags)
    .filter((tagID) => !tags?.includes(tagID))
    .map((tagID) => ({ id: tagID }));

  await prisma.blog.update({
    where: { id },
    data: {
      title: title ?? blog.title,
      description: description ?? blog.description,
      slug: slug ?? blog.slug,
      cover: cover ?? blog.cover,
      author: author ?? blog.author,
      body: body ?? blog.body,
      published: published ?? blog.published,
      tags: {
        connect: tagsToConnect?.length ? tagsToConnect : undefined,
        disconnect: tagsToDisconnect?.length ? tagsToDisconnect : undefined,
      },
    },
  });
};
