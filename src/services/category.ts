import {
  type CreateCategoryRequestType,
  type UpdateCategoryRequestType,
} from "@/app/(admin)/admin/categories/schema";

import { db } from "@/lib/prisma";

export async function getCategoryById(id: number) {
  if (!id) {
    return null;
  }

  const category = await db.category.findUnique({
    where: { id },
  });

  return category;
}

export async function getCategoryBySlug(slug: string) {
  if (!slug) {
    return null;
  }

  const category = await db.category.findUnique({
    where: { slug },
  });

  return category;
}

export async function deleteCategoryById(id: number) {
  const category = await db.category.delete({ where: { id } });

  return category;
}

export async function createCategoryByValues(
  values: CreateCategoryRequestType,
) {
  const category = await db.category.create({
    data: {
      name: values.name,
      slug: values.slug,
      description: values.description,
      icon: values.icon,
      iconDark: values.iconDark,
    },
  });

  return category;
}

export async function updateCategoryByValues(
  values: UpdateCategoryRequestType,
) {
  const category = await db.category.update({
    where: {
      id: values.id,
    },
    data: {
      name: values.name,
      slug: values.slug,
      description: values.description,
      icon: values.icon,
      iconDark: values.iconDark,
    },
  });

  return category;
}
