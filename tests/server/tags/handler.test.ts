import assert from "node:assert/strict";
import test from "node:test";

import { ERROR_CODES } from "../../../lib/server/http/error-codes";
import {
  handleCreateTag,
  handleUpdateTag,
} from "../../../lib/server/tags/handler";

test("handleCreateTag returns a 400-level response for malformed JSON bodies", async () => {
  const request = new Request("http://localhost/api/tags", {
    method: "POST",
    body: "{",
    headers: {
      "content-type": "application/json",
    },
  });

  const response = await handleCreateTag(request);

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    success: false,
    error: {
      code: ERROR_CODES.COMMON_INVALID_REQUEST,
      message: "Invalid JSON body",
    },
  });
});

test("handleUpdateTag returns a 400-level response for malformed JSON bodies", async () => {
  const request = new Request("http://localhost/api/tags/tag_1", {
    method: "PATCH",
    body: "{",
    headers: {
      "content-type": "application/json",
    },
  });

  const response = await handleUpdateTag(
    request,
    Promise.resolve({ id: "tag_1" }),
  );

  assert.equal(response.status, 400);
});
