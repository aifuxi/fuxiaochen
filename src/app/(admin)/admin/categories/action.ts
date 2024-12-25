"use server";

import { type Prisma } from "@prisma/client";

import { getSkip } from "@/utils/pagination";

import { db } from "@/lib/prisma";
import { createErrorResponse, createSuccessResponse } from "@/lib/response";
import {
  createCategoryByValues,
  deleteCategoryById,
  getCategoryById,
  getCategoryBySlug,
  updateCategoryByValues,
} from "@/services/category";

import {
  type CreateCategoryRequestType,
  type GetCategoriesRequestType,
  type UpdateCategoryRequestType,
  createCategorySchema,
  getCategoriesSchema,
  updateCategorySchema,
} from "./schema";

export async function getCategories(data: GetCategoriesRequestType) {
  try {
    const { page, pageSize, name } = await getCategoriesSchema.parseAsync(data);
    const where: Prisma.CategoryWhereInput = {};

    if (name?.trim()) {
      where.name = {
        contains: name?.trim() ?? "",
      };
    }

    const [categories, total] = await Promise.all([
      db.category.findMany({
        where,
        take: pageSize,
        skip: getSkip(page, pageSize),
      }),
      db.category.count({
        where,
      }),
    ]);
    return createSuccessResponse({ categories, total });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function getAllCategories() {
  try {
    const categories = await db.category.findMany();
    return createSuccessResponse({ categories });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function getCategory(id: number) {
  try {
    const category = await getCategoryById(id);

    if (!category) {
      return createErrorResponse("分类不存在");
    }
    return createSuccessResponse(category);
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function createCategory(data: CreateCategoryRequestType) {
  try {
    const { name, slug, description, icon, iconDark } =
      await createCategorySchema.parseAsync(data);

    const userBySlug = await getCategoryBySlug(slug);

    if (userBySlug) {
      throw new Error("别名已存在");
    }

    const user = await createCategoryByValues({
      name,
      description,
      slug,
      icon,
      iconDark,
    });

    return createSuccessResponse(user);
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function deleteCategory(id: number) {
  try {
    const category = await getCategoryById(id);

    if (!category) {
      return createErrorResponse("分类不存在");
    }
    const deleteCategory = await deleteCategoryById(category.id);
    return createSuccessResponse({ category: deleteCategory });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function updateCategory(data: UpdateCategoryRequestType) {
  try {
    const { id, name, slug, description, icon, iconDark } =
      await updateCategorySchema.parseAsync(data);

    const userById = await getCategoryById(id);

    if (!userById) {
      throw new Error("分类不存在");
    }

    const userBySlug = await getCategoryBySlug(slug);

    if (userBySlug && userBySlug.id !== id) {
      throw new Error("别名已存在");
    }

    const user = await updateCategoryByValues({
      id,
      name,
      slug,
      description,
      icon,
      iconDark,
    });

    return createSuccessResponse(user);
  } catch (error) {
    return createErrorResponse(error);
  }
}
