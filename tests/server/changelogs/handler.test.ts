import assert from "node:assert/strict";
import test from "node:test";

import {
  handleCreateChangelog,
  handleUpdateChangelog,
} from "../../../lib/server/changelogs/handler";
import { ERROR_CODES } from "../../../lib/server/http/error-codes";

test("handleCreateChangelog returns a 400-level response for malformed JSON bodies", async () => {
  const request = new Request("http://localhost/api/changelogs", {
    method: "POST",
    body: "{",
    headers: {
      "content-type": "application/json",
    },
  });

  const response = await handleCreateChangelog(request);

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    success: false,
    error: {
      code: ERROR_CODES.COMMON_INVALID_REQUEST,
      message: "Invalid JSON body",
    },
  });
});

test("handleUpdateChangelog returns a 400-level response for malformed JSON bodies", async () => {
  const request = new Request("http://localhost/api/changelogs/chg_1", {
    method: "PATCH",
    body: "{",
    headers: {
      "content-type": "application/json",
    },
  });

  const response = await handleUpdateChangelog(
    request,
    Promise.resolve({ id: "chg_1" }),
  );

  assert.equal(response.status, 400);
});
