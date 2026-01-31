"use server";

import { revalidatePath } from "next/cache";
import { BlogCreateReq, BlogListReq } from "@/types/blog";
import { checkAdmin } from "@/lib/auth-guard";
import { blogStore } from "@/stores/blog";

export async function getBlogsAction(params?: BlogListReq) {
  try {
    const result = await blogStore.findAll(params);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getBlogByIdAction(id: string) {
  try {
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
    await checkAdmin();
    const result = await blogStore.create(data);
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
    await checkAdmin();
    const result = await blogStore.update(id, data);
    revalidatePath("/blog");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteBlogAction(id: string) {
  try {
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
    await checkAdmin();
    const result = await blogStore.togglePublish(id);
    revalidatePath("/blog");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleBlogFeatureAction(id: string) {
  try {
    await checkAdmin();
    const result = await blogStore.toggleFeature(id);
    revalidatePath("/blog");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
