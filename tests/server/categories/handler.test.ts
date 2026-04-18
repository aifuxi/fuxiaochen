import assert from "node:assert/strict";
import test from "node:test";

import {
  handleCreateCategory,
  handleUpdateCategory,
} from "../../../lib/server/categories/handler";
import { ERROR_CODES } from "../../../lib/server/http/error-codes";

test("handleCreateCategory returns a 400-level response for malformed JSON bodies", async () => {
  const request = new Request("http://localhost/api/categories", {
    method: "POST",
    body: "{",
    headers: {
      "content-type": "application/json",
    },
  });

  const response = await handleCreateCategory(request);

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    success: false,
    error: {
      code: ERROR_CODES.COMMON_INVALID_REQUEST,
      message: "Invalid JSON body",
    },
  });
});

test("handleUpdateCategory returns a 400-level response for malformed JSON bodies", async () => {
  const request = new Request("http://localhost/api/categories/cat_1", {
    method: "PATCH",
    body: "{",
    headers: {
      "content-type": "application/json",
    },
  });

  const response = await handleUpdateCategory(
    request,
    Promise.resolve({ id: "cat_1" }),
  );

  assert.equal(response.status, 400);
});
