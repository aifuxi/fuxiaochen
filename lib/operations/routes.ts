import "server-only";
import { adminRoutes, validate } from "@/lib/admin/routes";
import { listQuerySchema } from "@/lib/admin/schema";
import { authorizeAdmin } from "@/lib/admin/service";
import { writeTransaction } from "@/prisma/db";

import { createBackup, listBackups } from "./backups";
import {
  getNotifications,
  notificationCount,
  readNotifications,
  syncNotifications,
} from "./notifications";
import { publishDuePosts } from "./scheduler";
import {
  backupRequestSchema,
  notificationQuerySchema,
  operationSettingsSchema,
  readNotificationsSchema,
  searchSchema,
} from "./schema";
import { searchContent } from "./search";
import { getOperationSettings, saveOperationSettings } from "./settings";

export const operationsRoutes = adminRoutes();
operationsRoutes.get("/search", validate("query", searchSchema), async (c) =>
  c.json({ data: await searchContent(c.req.valid("query"), c.get("admin")) }),
);
operationsRoutes.get("/notifications", validate("query", notificationQuerySchema), async (c) =>
  c.json({ data: await getNotifications(c.req.valid("query"), c.get("admin")) }),
);
operationsRoutes.get("/notifications/summary", async (c) =>
  c.json({
    data: await writeTransaction(async (tx) => {
      const actor = c.get("admin");
      await authorizeAdmin(actor);
      await syncNotifications(tx);
      return { unreadCount: await notificationCount(tx, actor.adminId) };
    }),
  }),
);
operationsRoutes.post("/notifications/read", validate("json", readNotificationsSchema), async (c) =>
  c.json({ data: await readNotifications(c.req.valid("json").ids, c.get("admin")) }),
);
operationsRoutes.get("/operations/settings", async (c) =>
  c.json({ data: await getOperationSettings(c.get("admin")) }),
);
operationsRoutes.put("/operations/settings", validate("json", operationSettingsSchema), async (c) =>
  c.json({ data: await saveOperationSettings(c.req.valid("json"), c.get("admin")) }),
);
operationsRoutes.get("/backups", validate("query", listQuerySchema.omit({ q: true })), async (c) =>
  c.json({ data: await listBackups({ ...c.req.valid("query"), q: "" }, c.get("admin")) }),
);
operationsRoutes.post("/backups", validate("json", backupRequestSchema), async (c) =>
  c.json({ data: await createBackup(c.req.valid("json").id, c.get("admin")) }),
);
operationsRoutes.post(
  "/operations/publish-due",
  validate("json", backupRequestSchema.omit({ id: true })),
  async (c) => c.json({ data: await publishDuePosts(c.get("admin")) }),
);
