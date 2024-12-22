import {
  type CreateTagRequestType,
  type UpdateTagRequestType,
} from "@/app/(admin)/admin/tags/schema";

import { db } from "@/lib/prisma";

export async function getTagById(id: number) {
  if (!id) {
    return null;
  }

  const tag = await db.tag.findUnique({
    where: { id },
  });

  return tag;
}

export async function getTagBySlug(slug: string) {
  if (!slug) {
    return null;
  }

  const tag = await db.tag.findUnique({
    where: { slug },
  });

  return tag;
}

export async function deleteTagById(id: number) {
  const tag = await db.tag.delete({ where: { id } });

  return tag;
}

export async function createTagByValues(values: CreateTagRequestType) {
  const tag = await db.tag.create({
    data: {
      name: values.name,
      slug: values.slug,
      description: values.description,
      icon: values.icon,
      iconDark: values.iconDark,
    },
  });

  return tag;
}

export async function updateTagByValues(values: UpdateTagRequestType) {
  const tag = await db.tag.update({
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

  return tag;
}
