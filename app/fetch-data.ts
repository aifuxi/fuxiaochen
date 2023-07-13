import { Prisma } from '@prisma/client';

import { DEFAULT_PAGE_SIZE, ZERO } from '@/constants';
import prisma from '@/libs/prisma';
import {
  Article,
  GeneralResponse,
  GetArticlesRequest,
  GetTagsRequest,
  Tag,
  TotalResponse,
} from '@/types';
import { createSuccessResponse, createSuccessTotalResponse } from '@/utils';

export async function getServerSideArticles({
  page,
  published,
  pageSize,
}: GetArticlesRequest): Promise<TotalResponse<Article[]>> {
  let take = DEFAULT_PAGE_SIZE;
  let skip = ZERO;

  const size = Number(pageSize);
  const currentPage = Number(page);
  if (size) {
    take = size;
  }
  if (currentPage) {
    skip = (currentPage - 1) * size;
  } else {
    skip = ZERO;
  }

  const articles = await prisma.article.findMany({
    where: {
      published,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take,
    skip,
    include: {
      tags: true,
    },
  });
  const total =
    (await prisma.article.count({
      where: {
        published,
      },
    })) || 0;

  return createSuccessTotalResponse<Article[]>(articles, total);
}

export async function getServerSideArticleByFriendlyUrl(
  friendlyUrl: string,
): Promise<GeneralResponse<Article | null>> {
  const article = await prisma.article.findFirst({
    where: {
      friendlyUrl,
    },
    include: {
      tags: true,
    },
  });
  return createSuccessResponse<Article | null>(article);
}

export async function getServerSideTags({
  page,
  pageSize,
}: GetTagsRequest): Promise<TotalResponse<Tag[]>> {
  let take = DEFAULT_PAGE_SIZE;
  let skip = ZERO;
  const condition: Prisma.TagWhereInput = {};

  const size = Number(pageSize);
  const currentPage = Number(page);
  if (size) {
    take = size;
  }
  if (currentPage) {
    skip = (currentPage - 1) * size;
  } else {
    skip = ZERO;
  }

  const tags = await prisma.tag.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    where: condition,
    take,
    skip,
    include: {
      articles: true,
    },
  });

  const total = (await prisma.tag.count({ where: condition })) || 0;

  const newTags = tags.map((tag) => {
    const { articles } = tag;
    const tmpTag: Tag = {
      ...tag,
      articleCount: articles?.length || 0,
    };
    return tmpTag;
  });

  return createSuccessTotalResponse<Tag[]>(newTags, total);
}

export async function getServerSideTagByFriendlyUrl(
  friendlyUrl: string,
): Promise<GeneralResponse<Tag | null>> {
  const tag = await prisma.tag.findFirst({
    where: {
      friendlyUrl,
    },
    include: {
      articles: true,
    },
  });

  return createSuccessResponse<Tag | null>(tag);
}
