import { adminRoutes, validate } from "@/lib/admin/routes";
import { listQuerySchema } from "@/lib/admin/schema";

import { releaseSchema } from "./schema";
import { listReleases, createRelease } from "./service";
export const changelogRoutes = adminRoutes();
changelogRoutes.get("/", validate("query", listQuerySchema), async (c) =>
  c.json({ data: await listReleases(c.req.valid("query"), c.get("admin")) }),
);
changelogRoutes.post("/", validate("json", releaseSchema), async (c) =>
  c.json({ data: await createRelease(c.req.valid("json"), c.get("admin")) }, 201),
);
