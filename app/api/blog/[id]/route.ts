import { z } from "zod";

import { ERROR_MESSAGE_MAP } from "@/constants";
import { updateBlogSchema } from "@/features/blog";
import { noAdminPermission } from "@/features/user";
import { createResponse } from "@/lib/common";
import { prisma } from "@/lib/prisma";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (await noAdminPermission()) {
    return createResponse({ error: ERROR_MESSAGE_MAP.noPermission });
  }

  const { id } = await params;

  const blog = await prisma.blog.findUnique({
    where: {
      id,
    },
    include: {
      tags: true,
    },
  });

  if (!blog) {
    return createResponse({ error: ERROR_MESSAGE_MAP.blogNotExist });
  }

  return createResponse({ data: blog });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (await noAdminPermission()) {
    return createResponse({ error: ERROR_MESSAGE_MAP.noPermission });
  }

  const { id } = await params;

  const blog = await prisma.blog.findUnique({
    where: {
      id,
    },
  });

  if (!blog) {
    return createResponse({ error: ERROR_MESSAGE_MAP.blogNotExist });
  }

  const body = await request.json();

  const result = await updateBlogSchema.safeParseAsync(body);

  if (!result.success) {
    const error = z.prettifyError(result.error);
    return createResponse({ error });
  }

  const newBlog = await prisma.blog.update({
    where: { id: result.data.id },
    data: {
      title: result.data.title,
      description: result.data.description,
      slug: result.data.slug,
      body: result.data.body,
      published: result.data.published,
      tags: {
        set: result.data.tags?.map((el) => {
          return { id: el };
        }),
      },
    },
    include: { tags: true },
  });

  return createResponse({ data: newBlog });
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (await noAdminPermission()) {
    return createResponse({ error: ERROR_MESSAGE_MAP.noPermission });
  }

  const { id } = await params;

  const blog = await prisma.blog.findUnique({
    where: {
      id,
    },
  });

  if (!blog) {
    return createResponse({ error: ERROR_MESSAGE_MAP.blogNotExist });
  }

  await prisma.blog.delete({
    where: {
      id,
    },
  });

  return createResponse({ data: null });
}
