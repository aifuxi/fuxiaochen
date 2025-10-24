import { z } from "zod";

import { noAdminPermission } from "@/app/actions";

import { updateCategorySchema } from "@/types/category";

import { ERROR_MESSAGE_MAP } from "@/constants";
import { createResponse } from "@/lib/common";
import { prisma } from "@/lib/prisma";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const category = await prisma.category.findUnique({
    where: {
      id,
    },
  });

  if (!category) {
    return createResponse({ error: ERROR_MESSAGE_MAP.categoryNotExist });
  }

  return createResponse({ data: category });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (await noAdminPermission()) {
    return createResponse({ error: ERROR_MESSAGE_MAP.noPermission });
  }

  const { id } = await params;

  const category = await prisma.category.findUnique({
    where: {
      id,
    },
  });

  if (!category) {
    return createResponse({ error: ERROR_MESSAGE_MAP.categoryNotExist });
  }

  const body = await request.json();

  const result = await updateCategorySchema.safeParseAsync(body);

  if (!result.success) {
    const error = z.prettifyError(result.error);
    return createResponse({ error });
  }

  const { id: _, ...data } = result.data;

  const newCategory = await prisma.category.update({
    where: {
      id,
    },
    data,
  });

  return createResponse({ data: newCategory });
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (await noAdminPermission()) {
    return createResponse({ error: ERROR_MESSAGE_MAP.noPermission });
  }

  const { id } = await params;

  const category = await prisma.category.findUnique({
    where: {
      id,
    },
  });

  if (!category) {
    return createResponse({ error: ERROR_MESSAGE_MAP.categoryNotExist });
  }

  await prisma.category.delete({
    where: {
      id,
    },
  });

  return createResponse({ data: null });
}
