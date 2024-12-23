"use server";

import { type Prisma } from "@prisma/client";

import { getSkip } from "@/utils/pagination";

import { db } from "@/lib/prisma";
import { createErrorResponse, createSuccessResponse } from "@/lib/response";
import {
  createBlogByValues,
  deleteBlogById,
  getBlogById,
  getBlogBySlug,
  getBlogByTitle,
  updateBlogByValues,
} from "@/services/blog";

import {
  type CreateBlogRequestType,
  type GetBlogsRequestType,
  type UpdateBlogRequestType,
  createBlogSchema,
  getBlogsSchema,
  updateBlogSchema,
} from "./schema";

export async function getBlogs(data: GetBlogsRequestType) {
  try {
    const { page, pageSize, title } = await getBlogsSchema.parseAsync(data);
    const where: Prisma.BlogWhereInput = {};

    if (title?.trim()) {
      where.title = {
        contains: title?.trim() ?? "",
      };
    }

    const [blogs, total] = await Promise.all([
      db.blog.findMany({
        where,
        take: pageSize,
        skip: getSkip(page, pageSize),
      }),
      db.blog.count({
        where,
      }),
    ]);
    return createSuccessResponse({ blogs, total });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function getBlog(id: number) {
  try {
    const blog = await getBlogById(id);

    if (!blog) {
      return createErrorResponse("文章不存在");
    }
    return createSuccessResponse(blog);
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function createBlog(data: CreateBlogRequestType) {
  try {
    const { title, slug, description, body, published, tagIds, categoryId } =
      await createBlogSchema.parseAsync(data);

    const blogBySlug = await getBlogBySlug(slug);

    if (blogBySlug) {
      throw new Error("别名已存在");
    }

    const blogByTitle = await getBlogByTitle(title);

    if (blogByTitle) {
      throw new Error("标题已存在");
    }

    const blog = await createBlogByValues({
      title,
      slug,
      description,
      body,
      published,
      tagIds,
      categoryId,
    });

    return createSuccessResponse(blog);
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function deleteBlog(id: number) {
  try {
    const blog = await getBlogById(id);

    if (!blog) {
      return createErrorResponse("文章不存在");
    }
    const deleteBlog = await deleteBlogById(blog.id);
    return createSuccessResponse({ blog: deleteBlog });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function updateBlog(data: UpdateBlogRequestType) {
  try {
    const {
      id,
      title,
      slug,
      description,
      body,
      published,
      tagIds,
      categoryId,
    } = await updateBlogSchema.parseAsync(data);

    const blogById = await getBlogById(id);

    if (!blogById) {
      throw new Error("文章不存在");
    }

    const blogBySlug = await getBlogBySlug(slug);

    if (blogBySlug && blogBySlug.id !== id) {
      throw new Error("别名已存在");
    }

    const blogByTitle = await getBlogByTitle(title);

    if (blogByTitle && blogByTitle.id !== id) {
      throw new Error("标题已存在");
    }

    const blog = await updateBlogByValues({
      id,
      title,
      slug,
      description,
      body,
      published,
      tagIds,
      categoryId,
    });

    return createSuccessResponse(blog);
  } catch (error) {
    return createErrorResponse(error);
  }
}
