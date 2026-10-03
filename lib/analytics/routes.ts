import "server-only";
import { adminRoutes, validate } from "@/lib/admin/routes";

import { rangeSchema, visitorQuerySchema } from "./schema";
import { getAnalytics, listVisitors } from "./service";

export const analyticsRoutes = adminRoutes();
analyticsRoutes.get("/visitors", validate("query", visitorQuerySchema), async (c) =>
  c.json({ data: await listVisitors(c.req.valid("query"), c.get("admin")) }),
);
analyticsRoutes.get("/analytics", validate("query", rangeSchema), async (c) =>
  c.json({ data: await getAnalytics(c.req.valid("query").range, c.get("admin")) }),
);
