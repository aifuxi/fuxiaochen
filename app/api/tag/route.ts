import type { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';

import { DEFAULT_PAGE_SIZE, ZERO } from '@/constants';
import prisma from '@/libs/prisma';
import type { Tag } from '@/types';
import { createSuccessResponse, createSuccessTotalResponse } from '@/utils';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page');
  const pageSize = searchParams.get('pageSize');

  let take = DEFAULT_PAGE_SIZE;
  let skip = ZERO;
  const condition: Prisma.TagWhereInput = {};

  if (typeof page === 'string' && typeof pageSize === 'string') {
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
    const { articles, ...rest } = tag;
    const tmpTag: Tag = {
      ...rest,
      articleCount: articles?.filter((item) => item.published)?.length || 0,
    };
    return tmpTag;
  });

  return NextResponse.json(createSuccessTotalResponse<Tag[]>(newTags, total));
}

export async function POST(req: Request) {
  const body = await req.json();

  const tag = await prisma.tag.create({
    data: { ...body },
    include: { articles: true },
  });

  const { articles, ...rest } = tag;
  const tagWithArticleCount: Tag = {
    ...rest,
    articleCount: articles?.length || 0,
  };
  return NextResponse.json(createSuccessResponse<Tag>(tagWithArticleCount));
}
