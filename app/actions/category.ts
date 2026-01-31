"use server";

import { revalidatePath } from "next/cache";
import { type CategoryCreateReq, type CategoryListReq } from "@/types/category";
import { checkAdmin } from "@/lib/auth-guard";
import { categoryStore } from "@/stores/category";

export async function getCategoriesAction(params?: CategoryListReq) {
  try {
    const result = await categoryStore.findAll(params);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getCategoryByIdAction(id: string) {
  try {
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
    await checkAdmin();
    const result = await categoryStore.create(data);
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
    await checkAdmin();
    const result = await categoryStore.update(id, data);
    revalidatePath("/admin/categories");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    await checkAdmin();
    await categoryStore.delete(id);
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
