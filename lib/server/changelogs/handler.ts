import { toErrorResponse } from "@/lib/server/http/error-handler";
import { createSuccessResponse } from "@/lib/server/http/response";

import {
  changelogCreateSchema,
  changelogIdParamsSchema,
  changelogListQuerySchema,
  changelogUpdateSchema,
} from "./dto";
import { changelogService } from "./service";

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

export async function handleListChangelogs(request: Request) {
  try {
    const url = new URL(request.url);
    const query = changelogListQuerySchema.parse({
      page: url.searchParams.get("page") ?? undefined,
      pageSize: url.searchParams.get("pageSize") ?? undefined,
    });
    const result = await changelogService.listChangelogs(query);

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

export async function handleCreateChangelog(request: Request) {
  try {
    const body = changelogCreateSchema.parse(await toJsonBody(request));
    const changelog = await changelogService.createChangelog(body);

    return createSuccessResponse(changelog, undefined, 201);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function handleGetChangelog(
  _request: Request,
  params: Promise<{ id: string }>,
) {
  try {
    const { id } = changelogIdParamsSchema.parse(await params);
    const changelog = await changelogService.getChangelog(id);

    return createSuccessResponse(changelog);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function handleUpdateChangelog(
  request: Request,
  params: Promise<{ id: string }>,
) {
  try {
    const { id } = changelogIdParamsSchema.parse(await params);
    const body = changelogUpdateSchema.parse(await toJsonBody(request));
    const changelog = await changelogService.updateChangelog(id, body);

    return createSuccessResponse(changelog);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function handleDeleteChangelog(
  _request: Request,
  params: Promise<{ id: string }>,
) {
  try {
    const { id } = changelogIdParamsSchema.parse(await params);
    await changelogService.deleteChangelog(id);

    return createSuccessResponse(null);
  } catch (error) {
    return toErrorResponse(error);
  }
}
