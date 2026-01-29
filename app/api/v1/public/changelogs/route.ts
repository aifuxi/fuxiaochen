import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { businessError, success } from "@/lib/response";

export async function GET(request: NextRequest) {
  try {
    const list = await prisma.changelog.findMany({
      orderBy: {
        createdAt: "desc", // Or date? Go model has 'Date int'
      },
    });

    return success(list);
  } catch (e: any) {
    return businessError(e.message);
  }
}
