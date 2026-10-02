import { adminRoutes, validate } from "@/lib/admin/routes";

import { settingsSchema } from "./schema";
import { getSettings, saveSettings } from "./service";
export const settingsRoutes = adminRoutes();
settingsRoutes.get("/", async (c) => c.json({ data: await getSettings(c.get("admin")) }));
settingsRoutes.put("/", validate("json", settingsSchema), async (c) =>
  c.json({ data: await saveSettings(c.req.valid("json"), c.get("admin")) }),
);
