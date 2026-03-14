"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { type BlogCreateReq, type BlogListReq } from "@/types/blog";
import { checkAdmin } from "@/lib/auth-guard";
import { blogStore } from "@/stores/blog";

const PAGE_SIZE_MAX = 1000;

const blogListReqSchema = z
  .object({
    page: z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce.number().int().positive().max(PAGE_SIZE_MAX).optional().default(10),
    sortBy: z.enum(["createdAt", "updatedAt"]).optional(),
    order: z.enum(["asc", "desc"]).optional(),
    title: z.string().trim().optional(),
    slug: z.string().trim().optional(),
    categoryId: z.string().trim().optional(),
    tagId: z.string().trim().optional(),
    tagIds: z.array(z.string().trim()).max(50).optional(),
    blogIDs: z.array(z.string().trim()).max(200).optional(),
    published: z.boolean().optional(),
  });

const blogIdSchema = z.string().trim().min(1).max(128);
const blogSlugSchema = z.string().trim().min(1).max(200);

const blogCreateReqSchema = z.object({
  title: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(500),
  cover: z.string().trim().min(1).max(2048).optional(),
  content: z.string().min(1),
  published: z.boolean(),
  categoryId: z.string().trim().min(1).max(128),
  tags: z.array(z.string().trim().min(1).max(128)).max(50).optional(),
});

export async function getBlogsAction(params?: BlogListReq) {
  try {
    const parsed = blogListReqSchema.safeParse(params ?? {});
    if (!parsed.success) {
    console.log(parsed.error);

      return { success: false, error: "参数错误" };
    }

    const result = await blogStore.findAll(parsed.data as BlogListReq);
    return { success: true, data: result };
  } catch (error: any) {
    console.log(error);
    
    return { success: false, error: error.message };
  }
}

export async function getBlogByIdAction(id: string) {
  try {
    const parsedId = blogIdSchema.safeParse(id);
    if (!parsedId.success) {
      return { success: false, error: "参数错误" };
    }

    const result = await blogStore.findById(id);
    if (!result) {
      return { success: false, error: "Blog not found" };
    }
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getBlogBySlugAction(slug: string) {
  try {
    const parsedSlug = blogSlugSchema.safeParse(slug);
    if (!parsedSlug.success) {
      return { success: false, error: "参数错误" };
    }

    const result = await blogStore.findBySlug(slug);
    if (!result) {
      return { success: false, error: "Blog not found" };
    }
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createBlogAction(data: BlogCreateReq) {
  try {
    const parsedData = blogCreateReqSchema.safeParse(data);
    if (!parsedData.success) {
      return { success: false, error: "参数错误" };
    }

    await checkAdmin();
    const result = await blogStore.create(parsedData.data);
    revalidatePath("/blog");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateBlogAction(
  id: string,
  data: Partial<BlogCreateReq>,
) {
  try {
    const parsedId = blogIdSchema.safeParse(id);
    if (!parsedId.success) {
      return { success: false, error: "参数错误" };
    }
    const parsedData = blogCreateReqSchema.partial().safeParse(data);
    if (!parsedData.success) {
      return { success: false, error: "参数错误" };
    }

    await checkAdmin();
    const result = await blogStore.update(id, parsedData.data);
    revalidatePath("/blog");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteBlogAction(id: string) {
  try {
    const parsedId = blogIdSchema.safeParse(id);
    if (!parsedId.success) {
      return { success: false, error: "参数错误" };
    }

    await checkAdmin();
    await blogStore.delete(id);
    revalidatePath("/blog");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleBlogPublishAction(id: string) {
  try {
    const parsedId = blogIdSchema.safeParse(id);
    if (!parsedId.success) {
      return { success: false, error: "参数错误" };
    }

    await checkAdmin();
    const result = await blogStore.togglePublish(id);
    revalidatePath("/blog");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
