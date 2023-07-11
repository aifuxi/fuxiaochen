import type { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { parse } from 'qs';

import { DEFAULT_PAGE_SIZE, FALSE, TRUE, ZERO } from '@/constants';
import prisma from '@/libs/prisma';
import type { Article, GetArticlesRequest } from '@/types';
import { createSuccessResponse, createSuccessTotalResponse } from '@/utils';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const title = searchParams.get('title');
  const page = searchParams.get('page');
  const pageSize = searchParams.get('pageSize');
  const published = searchParams.get('published');
  const friendlyUrl = searchParams.get('friendlyUrl');

  const { tags = [] } = parse(
    req.url?.split('?')[1] || '',
  ) as unknown as GetArticlesRequest;

  let take = DEFAULT_PAGE_SIZE;
  let skip = ZERO;
  const condition: Prisma.ArticleWhereInput = {};

  if (typeof title === 'string' && title?.length > 0) {
    const titleFilter: Prisma.StringFilter = {
      contains: title.trim(),
    };

    Object.assign(condition, { title: titleFilter });
  }

  if (typeof published === 'string') {
    if (published === TRUE) {
      Object.assign(condition, { published: true });
    }
    if (published === FALSE) {
      Object.assign(condition, { published: false });
    }
  }

  if (typeof friendlyUrl === 'string' && friendlyUrl?.length > 0) {
    Object.assign(condition, { friendlyUrl });
  }

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

  if (Array.isArray(tags) && tags.length) {
    const tagFilter: Prisma.ArticleWhereInput = {
      tags: {
        some: {
          id: {
            in: tags,
          },
        },
      },
    };
    Object.assign(condition, tagFilter);
  }

  const articles = await prisma.article.findMany({
    where: condition,
    orderBy: {
      createdAt: 'desc',
    },
    take,
    skip,
    include: {
      tags: true,
    },
  });
  const total = (await prisma.article.count({ where: condition })) || 0;

  return NextResponse.json(
    createSuccessTotalResponse<Article[]>(articles, total),
  );
}

export async function POST(req: Request) {
  const body = await req.json();

  let tags: Array<{ id: number }> | undefined = [];
  if (body?.tags?.length) {
    body?.tags?.forEach((id: number) => {
      tags?.push({ id });
    });
  } else {
    tags = undefined;
  }
  const article = await prisma.article.create({
    data: {
      ...body,
      tags: {
        connect: tags,
      },
    },
    include: {
      tags: true,
    },
  });

  return NextResponse.json(createSuccessResponse<Article>(article));
}
