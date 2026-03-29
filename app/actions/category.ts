"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { type CategoryCreateReq, type CategoryListReq } from "@/types/category";
import { checkAdmin } from "@/lib/auth-guard";
import { categoryStore } from "@/stores/category";

const PAGE_SIZE_MAX = 1000;

const categoryListReqSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce
    .number()
    .int()
    .positive()
    .max(PAGE_SIZE_MAX)
    .optional()
    .default(10),
  sortBy: z.enum(["createdAt", "updatedAt"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
  name: z.string().trim().optional(),
  slug: z.string().trim().optional(),
});

const categoryIdSchema = z.string().trim();
const categoryCreateReqSchema = z.object({
  name: z.string().trim(),
  slug: z.string().trim(),
});

export async function getCategoriesAction(params?: CategoryListReq) {
  try {
    const parsed = categoryListReqSchema.safeParse(params ?? {});
    if (!parsed.success) {
      return { success: false, error: "参数错误" };
    }
    const result = await categoryStore.findAll(parsed.data as CategoryListReq);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getCategoryByIdAction(id: string) {
  try {
    const parsedId = categoryIdSchema.safeParse(id);
    if (!parsedId.success) {
      return { success: false, error: "参数错误" };
    }

    const result = await categoryStore.findById(id);
    if (!result) {
      return { success: false, error: "Category not found" };
    }
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createCategoryAction(data: CategoryCreateReq) {
  try {
    const parsedData = categoryCreateReqSchema.safeParse(data);
    if (!parsedData.success) {
      return { success: false, error: "参数错误" };
    }

    await checkAdmin();
    const result = await categoryStore.create(parsedData.data);
    revalidatePath("/admin/categories");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateCategoryAction(
  id: string,
  data: Partial<CategoryCreateReq>,
) {
  try {
    const parsedId = categoryIdSchema.safeParse(id);
    if (!parsedId.success) {
      return { success: false, error: "参数错误" };
    }
    const parsedData = categoryCreateReqSchema.partial().safeParse(data);
    if (!parsedData.success) {
      return { success: false, error: "参数错误" };
    }

    await checkAdmin();
    const result = await categoryStore.update(id, parsedData.data);
    revalidatePath("/admin/categories");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    const parsedId = categoryIdSchema.safeParse(id);
    if (!parsedId.success) {
      return { success: false, error: "参数错误" };
    }

    await checkAdmin();
    await categoryStore.delete(id);
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
