"use server";

import { dashboardStore } from "@/stores/dashboard";

export async function getDashboardStatsAction() {
  try {
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
