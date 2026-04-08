import { normalizeApiError } from "@/lib/api/api-error";
import { errorResponse } from "@/lib/api/response";

export function handleRoute<TArgs extends unknown[]>(
  handler: (...args: TArgs) => Promise<Response>,
) {
  return async (...args: TArgs) => {
    try {
      return await handler(...args);
    } catch (error) {
      return errorResponse(normalizeApiError(error));
    }
  };
}
