import { adminRoutes, validate } from "@/lib/admin/routes";
import { idSchema, deleteVersionSchema } from "@/lib/admin/schema";

import { createFriendSchema, updateFriendSchema, friendQuerySchema } from "./schema";
import { listFriends, getFriend, createFriend, updateFriend, deleteFriend } from "./service";
export const friendRoutes = adminRoutes();
friendRoutes.get("/", validate("query", friendQuerySchema), async (c) =>
  c.json({ data: await listFriends(c.req.valid("query"), c.get("admin")) }),
);
friendRoutes.get("/:id", validate("param", idSchema), async (c) =>
  c.json({ data: await getFriend(c.req.valid("param").id, c.get("admin")) }),
);
friendRoutes.post("/", validate("json", createFriendSchema), async (c) =>
  c.json({ data: await createFriend(c.req.valid("json"), c.get("admin")) }, 201),
);
friendRoutes.put(
  "/:id",
  validate("param", idSchema),
  validate("json", updateFriendSchema),
  async (c) =>
    c.json({
      data: await updateFriend(c.req.valid("param").id, c.req.valid("json"), c.get("admin")),
    }),
);
friendRoutes.delete(
  "/:id",
  validate("param", idSchema),
  validate("query", deleteVersionSchema),
  async (c) =>
    c.json({
      data: await deleteFriend(
        c.req.valid("param").id,
        c.req.valid("query").version,
        c.get("admin"),
      ),
    }),
);
