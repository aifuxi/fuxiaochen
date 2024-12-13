import { z } from "zod";

export const getUsersSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  page: z.number().min(1, { message: "page最小为1" }),
  pageSize: z
    .number()
    .min(10, { message: "pageSize最小为10" })
    .max(50, { message: "pageSize最大为50" }),
});

export type GetUsersRequestType = z.infer<typeof getUsersSchema>;
