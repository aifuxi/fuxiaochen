'use server';

import { revalidatePath } from 'next/cache';

import { DEFAULT_PAGE_SIZE } from '@/constants/unknown';

import { prisma } from '@/lib/prisma';
import { type CreateTagReq, type UpdateTagReq } from '@/types/tag';

export async function getTagArticles(params: { slug: string; page: number }) {
  const take = DEFAULT_PAGE_SIZE;
  const skip = (params.page - 1) * DEFAULT_PAGE_SIZE;

  const tag = await prisma.tag.findUnique({
    where: {
      slug: params.slug,
    },
    include: {
      articles: {
        where: {
          published: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  const articles = tag?.articles.slice(skip, skip + take);
  const total = tag?.articles.length ?? 0;

  return { articles, total };
}

export async function getTagBySlug(slug: string) {
  const tag = await prisma.tag.findUnique({
    where: {
      slug: slug,
    },
  });

  return tag;
}

export async function createTag(parsed: CreateTagReq) {
  await prisma.tag.create({
    data: {
      name: parsed.name,
      slug: parsed.slug,
    },
  });

  revalidatePath('/admin/tag');
}

export async function updateTag(parsed: UpdateTagReq) {
  await prisma.tag.update({
    data: {
      name: parsed.name,
      slug: parsed.slug,
    },
    where: {
      id: parsed.id,
    },
  });

  revalidatePath('/admin/tag');
}

export async function deleteTag(id: string) {
  await prisma.tag.delete({
    where: {
      id,
    },
  });

  revalidatePath('/admin/tag');
}

export async function getTags(params: { page: number }) {
  const take = DEFAULT_PAGE_SIZE;
  const skip = (params.page - 1) * DEFAULT_PAGE_SIZE;

  const tags = await prisma.tag.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      articles: true,
    },
    skip,
    take,
  });

  const count = await prisma.tag.count({});

  const total = count ?? 0;

  return { tags, total };
}

export async function getAllTags() {
  return await prisma.tag.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
}
