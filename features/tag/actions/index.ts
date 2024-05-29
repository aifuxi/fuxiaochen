"use server";

import { type Prisma, TagTypeEnum } from "@prisma/client";

import { ERROR_NO_PERMISSION } from "@/constants";
import { noPermission } from "@/features/user";
import { prisma } from "@/lib/prisma";
import { getSkip } from "@/utils";

import {
  type CreateTagDTO,
  type GetTagsDTO,
  type UpdateTagDTO,
  createTagSchema,
  getTagsSchema,
  updateTagSchema,
} from "../types";

export const isTagExistByID = async (id: string): Promise<boolean> => {
  const isExist = await prisma.tag.findUnique({ where: { id } });

  return Boolean(isExist);
};

export const getTags = async (params: GetTagsDTO) => {
  const result = await getTagsSchema.safeParseAsync(params);

  if (!result.success) {
    const error = result.error.format()._errors?.join(";");
    throw new Error(error);
  }

  const where: Prisma.TagWhereInput = {};

  if (result.data.type) {
    where.type = result.data.type;
  }

  if (result.data.name) {
    where.OR = [
      {
        name: {
          contains: result.data.name.trim(),
        },
      },
    ];
  }

  const orderBy: Prisma.TagOrderByWithRelationInput = {};
  if (result.data.orderBy && result.data.order) {
    orderBy[result.data.orderBy] = result.data.order;
  }

  const [tags, total] = await Promise.all([
    prisma.tag.findMany({
      orderBy,
      where,
      include: {
        blogs: true,
        notes: true,
        snippets: true,
        _count: true,
      },
      take: result.data.pageSize,
      skip: getSkip(result.data.pageIndex, result.data.pageSize),
    }),
    prisma.tag.count({ where }),
  ]);

  return { tags, total };
};

export const getAllTags = async (type?: TagTypeEnum) => {
  const cond: Prisma.TagWhereInput = {
    type: {
      in: type ? [TagTypeEnum.ALL, type] : [TagTypeEnum.ALL],
    },
  };

  const tags = await prisma.tag.findMany({
    where: cond,
    orderBy: {
      createdAt: "desc",
    },
  });

  const total = tags.length;

  return { tags, total };
};

export const createTag = async (params: CreateTagDTO) => {
  if (await noPermission()) {
    throw ERROR_NO_PERMISSION;
  }

  const { name, slug, type, icon, iconDark } =
    await createTagSchema.parseAsync(params);

  const existingTag = await prisma.tag.findFirst({
    where: {
      OR: [{ name }, { slug }],
    },
  });

  if (existingTag) {
    throw new Error("标签名称或者slug重复");
  }

  await prisma.tag.create({
    data: { name, slug, type, icon, iconDark },
  });
};

export const deleteTagByID = async (id: string) => {
  if (await noPermission()) {
    throw ERROR_NO_PERMISSION;
  }

  const tag = await prisma.tag.findUnique({ where: { id } });
  if (!tag) {
    throw new Error("标签不存在");
  }

  await prisma.tag.delete({
    where: {
      id,
    },
  });
};

export const updateTag = async (params: UpdateTagDTO) => {
  if (await noPermission()) {
    throw ERROR_NO_PERMISSION;
  }

  const { id, ...data } = await updateTagSchema.parseAsync(params);

  const tag = await prisma.tag.update({
    data,
    where: {
      id,
    },
  });

  if (!tag) {
    throw new Error("标签不存在");
  }
};

export const getTagByID = async (id: string) => {
  const tag = await prisma.tag.findUnique({ where: { id } });
  return { tag };
};
