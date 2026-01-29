import { type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { businessError, success } from "@/lib/response";

export async function GET(request: NextRequest) {
  try {
    const list = await prisma.category.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return success(list);
  } catch (e: any) {
    return businessError(e.message);
  }
}
