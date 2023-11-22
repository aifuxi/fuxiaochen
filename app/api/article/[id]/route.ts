import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import type { Prisma } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';

import { FALSE, TRUE, authOptions } from '@/constants';
import { db } from '@/libs/prisma';
import type { Article, DynamicRouteHandleParams } from '@/types';
import {
  checkPermission,
  createFailResponse,
  createSuccessResponse,
} from '@/utils';

export async function GET(req: Request, { params }: DynamicRouteHandleParams) {
  const { searchParams } = new URL(req.url);
  const articleID = params.id;
  const published = searchParams.get('published');
  const condition: db.ArticleWhereInput = {};
  let needPublished: boolean | undefined = undefined;

  if (typeof published === 'string') {
    if (published === TRUE) {
      needPublished = true;
    }
    if (published === FALSE) {
      needPublished = false;
    }
  }
  if (typeof articleID === 'string') {
    Object.assign(condition, { id: articleID });
  }

  const article = await db.article.findFirst({
    where: condition,
    include: {
      tags: true,
    },
  });

  if (!article ?? (needPublished && !article.published)) {
    return NextResponse.json(createSuccessResponse<null>(null));
  }

  return NextResponse.json(createSuccessResponse<Article>(article));
}

export async function PUT(req: Request, { params }: DynamicRouteHandleParams) {
  const session = await getServerSession(authOptions);
  const hasPermission = checkPermission(session);
  if (!hasPermission) {
    return NextResponse.json(createFailResponse(`禁止操作`), {
      status: StatusCodes.FORBIDDEN,
    });
  }
  const articleID = params.id;
  const body = await req.json();

  let tags: Array<{ id: string }> | undefined = [];
  if (body?.tags?.length) {
    body?.tags?.forEach((id: string) => {
      tags?.push({ id });
    });
  } else {
    tags = undefined;
  }
  // TODO: 处理不存在的情况
  const article = await db.article.update({
    where: { id: articleID },
    data: {
      ...body,
      tags: {
        set: tags,
      },
    },
    include: {
      tags: true,
    },
  });

  return NextResponse.json(createSuccessResponse<Article>(article));
}

export async function DELETE(
  req: Request,
  { params }: DynamicRouteHandleParams,
) {
  const session = await getServerSession(authOptions);
  const hasPermission = checkPermission(session);
  if (!hasPermission) {
    return NextResponse.json(createFailResponse(`禁止操作`), {
      status: StatusCodes.FORBIDDEN,
    });
  }

  const articleID = params.id;
  const article = await db.article.delete({
    where: { id: articleID },
    include: {
      tags: true,
    },
  });

  return NextResponse.json(createSuccessResponse<Article>(article));
}
