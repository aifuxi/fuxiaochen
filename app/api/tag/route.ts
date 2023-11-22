import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { type Prisma } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';

import { DEFAULT_PAGE_SIZE, FALSE, TRUE, ZERO, authOptions } from '@/constants';
import { db } from '@/libs/prisma';
import { type Tag } from '@/types';
import {
  checkPermission,
  createFailResponse,
  createSuccessResponse,
  createSuccessTotalResponse,
} from '@/utils';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page');
  const pageSize = searchParams.get('pageSize');
  const friendlyUrl = searchParams.get('friendlyUrl');
  const published = searchParams.get('published');
  let needPublished: boolean | undefined = undefined;

  if (typeof published === 'string') {
    if (published === TRUE) {
      needPublished = true;
    }
    if (published === FALSE) {
      needPublished = false;
    }
  }

  let take = DEFAULT_PAGE_SIZE;
  let skip = ZERO;
  const condition: db.TagWhereInput = {};

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

  if (typeof friendlyUrl === 'string' && friendlyUrl?.length > 0) {
    Object.assign(condition, { friendlyUrl });
  }

  const tags = await db.tag.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    where: condition,
    take,
    skip,
    include: {
      articles: needPublished
        ? {
            where: {
              published: true,
            },
          }
        : true,
    },
  });

  const total = (await db.tag.count({ where: condition })) ?? 0;

  const newTags = tags.map((tag) => {
    const { articles } = tag;
    const tmpTag: Tag = {
      ...tag,
      articles,
      articleCount: articles?.length ?? 0,
    };
    return tmpTag;
  });

  return NextResponse.json(createSuccessTotalResponse<Tag[]>(newTags, total));
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const hasPermission = checkPermission(session);
  if (!hasPermission) {
    return NextResponse.json(createFailResponse(`禁止操作`), {
      status: StatusCodes.FORBIDDEN,
    });
  }

  const body = await req.json();

  const tag = await db.tag.create({
    data: { ...body },
    include: { articles: true },
  });

  const { articles, ...rest } = tag;
  const tagWithArticleCount: Tag = {
    ...rest,
    articleCount: articles?.length ?? 0,
  };
  return NextResponse.json(createSuccessResponse<Tag>(tagWithArticleCount));
}
