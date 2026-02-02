"use server";

import { dashboardStore } from "@/stores/dashboard";

export async function getDashboardStatsAction() {
  try {
    const result = await dashboardStore.getDashboardStats();
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return {
      success: false,
      error: "Failed to fetch dashboard stats",
    };
  }
}
