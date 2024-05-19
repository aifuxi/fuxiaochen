'use server';

import { type Prisma, TagTypeEnum } from '@prisma/client';

import { ERROR_NO_PERMISSION } from '@/constants';
import { noPermission } from '@/features/user';
import { prisma } from '@/lib/prisma';
import { getSkip } from '@/utils';

import {
  type CreateTagDTO,
  type GetTagsDTO,
  type UpdateTagDTO,
  createTagSchema,
  getTagsSchema,
  updateTagSchema,
} from '../types';

export const isTagExistByID = async (id: string): Promise<boolean> => {
  const isExist = await prisma.tag.findUnique({ where: { id } });

  return Boolean(isExist);
};

export const getTags = async (params: GetTagsDTO) => {
  const result = await getTagsSchema.safeParseAsync(params);

  if (!result.success) {
    const error = result.error.format()._errors?.join(';');
    // TODO: 记录日志
    throw new Error(error);
  }

  const cond: Prisma.TagWhereInput = {};
  // TODO: 想个办法优化一下，这个写法太啰嗦了，好多 if
  if (result.data.type) {
    cond.type = result.data.type;
  }
  if (result.data.name?.trim()) {
    cond.OR = [
      ...(cond.OR ?? []),
      ...[
        {
          name: {
            contains: result.data.name?.trim(),
          },
        },
      ],
    ];
  }
  if (result.data.slug?.trim()) {
    cond.OR = [
      ...(cond.OR ?? []),
      ...[
        {
          slug: {
            contains: result.data.slug?.trim(),
          },
        },
      ],
    ];
  }

  const sort: Prisma.TagOrderByWithRelationInput = {};
  if (result.data.orderBy && result.data.order) {
    sort[result.data.orderBy] = result.data.order;
  }

  const total = await prisma.tag.count({ where: cond });
  const tags = await prisma.tag.findMany({
    orderBy: sort,
    where: cond,
    include: {
      blogs: true,
      notes: true,
      snippets: true,
      _count: true,
    },
    take: result.data.pageSize,
    skip: getSkip(result.data.pageIndex, result.data.pageSize),
  });

  return { tags, total };
};

export const getAllTags = async (type?: TagTypeEnum) => {
  const cond: Prisma.TagWhereInput = {
    type: {
      in: type ? [TagTypeEnum.ALL, type] : [TagTypeEnum.ALL],
    },
  };

  const total = await prisma.tag.count({ where: cond });
  const tags = await prisma.tag.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    where: cond,
  });

  return { tags, total };
};

export const createTag = async (params: CreateTagDTO) => {
  if (await noPermission()) {
    throw ERROR_NO_PERMISSION;
  }
  const result = await createTagSchema.safeParseAsync(params);

  if (!result.success) {
    const error = result.error.format()._errors?.join(';');
    // TODO: 记录日志
    throw new Error(error);
  }

  const tags = await prisma.tag.findMany({
    where: {
      OR: [{ name: result.data.name }, { slug: result.data.slug }],
    },
  });

  if (tags.length) {
    // TODO: 记录日志
    throw new Error('标签名称或者slug重复');
  }

  await prisma.tag.create({
    data: {
      name: result.data.name,
      slug: result.data.slug,
      type: result.data.type,
      icon: result.data.icon,
      iconDark: result.data.iconDark,
    },
  });
};

export const deleteTagByID = async (id: string) => {
  if (await noPermission()) {
    throw ERROR_NO_PERMISSION;
  }
  const isExist = await isTagExistByID(id);

  if (!isExist) {
    throw new Error('标签不存在');
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
  const result = await updateTagSchema.safeParseAsync(params);

  if (!result.success) {
    const error = result.error.format()._errors?.join(';');
    // TODO: 记录日志
    throw new Error(error);
  }

  const isExist = await isTagExistByID(result.data.id);
  if (!isExist) {
    throw new Error('标签不存在');
  }

  await prisma.tag.update({
    data: {
      name: result.data.name,
      slug: result.data.slug,
      type: result.data.type,
      icon: result.data.icon,
      iconDark: result.data.iconDark,
    },
    where: {
      id: result.data.id,
    },
  });
};

export const getTagByID = async (id: string) => {
  const tag = await prisma.tag.findUnique({ where: { id } });
  return { tag };
};
