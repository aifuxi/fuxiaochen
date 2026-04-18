import { toErrorResponse } from "@/lib/server/http/error-handler";
import { createSuccessResponse } from "@/lib/server/http/response";

import {
  categoryCreateSchema,
  categoryIdParamsSchema,
  categoryListQuerySchema,
  categoryUpdateSchema,
} from "./dto";
import { categoryService } from "./service";

import { ERROR_CODES } from "../http/error-codes";
import { AppError } from "../http/errors";

const toJsonBody = async (request: Request) => {
  try {
    return (await request.json()) as unknown;
  } catch {
    throw new AppError(
      ERROR_CODES.COMMON_INVALID_REQUEST,
      "Invalid JSON body",
      400,
    );
  }
};

export async function handleListCategories(request: Request) {
  try {
    const url = new URL(request.url);
    const query = categoryListQuerySchema.parse({
      page: url.searchParams.get("page") ?? undefined,
      pageSize: url.searchParams.get("pageSize") ?? undefined,
    });
    const result = await categoryService.listCategories(query);

    return createSuccessResponse(
      {
        items: result.items,
      },
      {
        page: query.page,
        pageSize: query.pageSize,
        total: result.total,
      },
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function handleCreateCategory(request: Request) {
  try {
    const body = categoryCreateSchema.parse(await toJsonBody(request));
    const category = await categoryService.createCategory(body);

    return createSuccessResponse(category, undefined, 201);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function handleGetCategory(
  _request: Request,
  params: Promise<{ id: string }>,
) {
  try {
    const { id } = categoryIdParamsSchema.parse(await params);
    const category = await categoryService.getCategory(id);

    return createSuccessResponse(category);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function handleUpdateCategory(
  request: Request,
  params: Promise<{ id: string }>,
) {
  try {
    const { id } = categoryIdParamsSchema.parse(await params);
    const body = categoryUpdateSchema.parse(await toJsonBody(request));
    const category = await categoryService.updateCategory(id, body);

    return createSuccessResponse(category);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function handleDeleteCategory(
  _request: Request,
  params: Promise<{ id: string }>,
) {
  try {
    const { id } = categoryIdParamsSchema.parse(await params);
    await categoryService.deleteCategory(id);

    return createSuccessResponse(null);
  } catch (error) {
    return toErrorResponse(error);
  }
}
