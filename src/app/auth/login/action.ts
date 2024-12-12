"user server";

import { db } from "@/lib/prisma";

export async function getUserByEmail(email: string) {
  if (!email) {
    return null;
  }

  const user = await db.user.findUnique({ where: { email } });

  return user;
}
