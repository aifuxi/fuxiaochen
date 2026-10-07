import { adminRoutes, validate } from "@/lib/admin/routes";
import { idSchema } from "@/lib/admin/schema";

import {
  releaseSchema,
  releaseQuerySchema,
  releaseUpdateSchema,
  releaseVisibilitySchema,
} from "./schema";
import { listReleases, createRelease, getRelease, updateRelease } from "./service";
export const changelogRoutes = adminRoutes();
changelogRoutes.get("/", validate("query", releaseQuerySchema), async (c) =>
  c.json({ data: await listReleases(c.req.valid("query"), c.get("admin")) }),
);
changelogRoutes.get("/:id", validate("param", idSchema), async (c) =>
  c.json({ data: await getRelease(c.req.valid("param").id, c.get("admin")) }),
);
changelogRoutes.put(
  "/:id",
  validate("param", idSchema),
  validate("json", releaseUpdateSchema),
  async (c) =>
    c.json({
      data: await updateRelease(c.req.valid("param").id, c.req.valid("json"), c.get("admin")),
    }),
);
changelogRoutes.put(
  "/:id/status",
  validate("param", idSchema),
  validate("json", releaseVisibilitySchema),
  async (c) =>
    c.json({
      data: await updateRelease(c.req.valid("param").id, c.req.valid("json"), c.get("admin")),
    }),
);
changelogRoutes.post("/", validate("json", releaseSchema), async (c) =>
  c.json({ data: await createRelease(c.req.valid("json"), c.get("admin")) }, 201),
);
