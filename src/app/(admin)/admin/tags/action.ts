"use server";

import { type Prisma } from "@prisma/client";

import { getSkip } from "@/utils/pagination";

import { db } from "@/lib/prisma";
import { createErrorResponse, createSuccessResponse } from "@/lib/response";
import {
  createTagByValues,
  deleteTagById,
  getTagById,
  getTagBySlug,
  updateTagByValues,
} from "@/services/tag";

import {
  type CreateTagRequestType,
  type GetTagsRequestType,
  type UpdateTagRequestType,
  createTagSchema,
  getTagsSchema,
  updateTagSchema,
} from "./schema";

export async function getTags(data: GetTagsRequestType) {
  try {
    const { page, pageSize, name } = await getTagsSchema.parseAsync(data);
    const where: Prisma.TagWhereInput = {};

    if (name?.trim()) {
      where.name = {
        contains: name?.trim() ?? "",
      };
    }

    const [tags, total] = await Promise.all([
      db.tag.findMany({
        where,
        take: pageSize,
        skip: getSkip(page, pageSize),
      }),
      db.tag.count({
        where,
      }),
    ]);
    return createSuccessResponse({ tags, total });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function getTag(id: number) {
  try {
    const tag = await getTagById(id);

    if (!tag) {
      return createErrorResponse("标签不存在");
    }
    return createSuccessResponse(tag);
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function createTag(data: CreateTagRequestType) {
  try {
    const { name, slug, description, icon, iconDark } =
      await createTagSchema.parseAsync(data);

    const userBySlug = await getTagBySlug(slug);

    if (userBySlug) {
      throw new Error("别名已存在");
    }

    const user = await createTagByValues({
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

export async function deleteTag(id: number) {
  try {
    const tag = await getTagById(id);

    if (!tag) {
      return createErrorResponse("标签不存在");
    }
    const deleteTag = await deleteTagById(tag.id);
    return createSuccessResponse({ tag: deleteTag });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function updateTag(data: UpdateTagRequestType) {
  try {
    const { id, name, slug, description, icon, iconDark } =
      await updateTagSchema.parseAsync(data);

    const userById = await getTagById(id);

    if (!userById) {
      throw new Error("标签不存在");
    }

    const userBySlug = await getTagBySlug(slug);

    if (userBySlug && userBySlug.id !== id) {
      throw new Error("别名已存在");
    }

    const user = await updateTagByValues({
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
