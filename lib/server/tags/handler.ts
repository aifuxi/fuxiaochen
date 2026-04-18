import { toErrorResponse } from "@/lib/server/http/error-handler";
import { createSuccessResponse } from "@/lib/server/http/response";

import {
  tagCreateSchema,
  tagIdParamsSchema,
  tagListQuerySchema,
  tagUpdateSchema,
} from "./dto";
import { tagService } from "./service";

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

export async function handleListTags(request: Request) {
  try {
    const url = new URL(request.url);
    const query = tagListQuerySchema.parse({
      page: url.searchParams.get("page") ?? undefined,
      pageSize: url.searchParams.get("pageSize") ?? undefined,
    });
    const result = await tagService.listTags(query);

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

export async function handleCreateTag(request: Request) {
  try {
    const body = tagCreateSchema.parse(await toJsonBody(request));
    const tag = await tagService.createTag(body);

    return createSuccessResponse(tag, undefined, 201);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function handleGetTag(
  _request: Request,
  params: Promise<{ id: string }>,
) {
  try {
    const { id } = tagIdParamsSchema.parse(await params);
    const tag = await tagService.getTag(id);

    return createSuccessResponse(tag);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function handleUpdateTag(
  request: Request,
  params: Promise<{ id: string }>,
) {
  try {
    const { id } = tagIdParamsSchema.parse(await params);
    const body = tagUpdateSchema.parse(await toJsonBody(request));
    const tag = await tagService.updateTag(id, body);

    return createSuccessResponse(tag);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function handleDeleteTag(
  _request: Request,
  params: Promise<{ id: string }>,
) {
  try {
    const { id } = tagIdParamsSchema.parse(await params);
    await tagService.deleteTag(id);

    return createSuccessResponse(null);
  } catch (error) {
    return toErrorResponse(error);
  }
}
