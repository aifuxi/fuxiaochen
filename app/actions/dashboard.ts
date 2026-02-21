"use server";

import { checkAdmin } from "@/lib/auth-guard";
import { dashboardStore } from "@/stores/dashboard";

export async function getDashboardStatsAction() {
  try {
    await checkAdmin();
    const result = await dashboardStore.getDashboardStats();
    return {
      success: true,
      data: result,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "获取统计数据失败";
    return {
      success: false,
      error: message,
    };
  }
}
