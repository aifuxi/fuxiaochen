"use client";

import { useAdminWorkspace } from "./admin-context";
import { AdminDashboard } from "./admin-dashboard";

export function AdminOverview() {
  const { postSummary, postSummaryLoading, postSummaryError, reloadPostSummary, onOpen } =
    useAdminWorkspace();
  return (
    <AdminDashboard
      postSummary={postSummary}
      postSummaryLoading={postSummaryLoading}
      postSummaryError={postSummaryError}
      reloadPostSummary={reloadPostSummary}
      onOpen={onOpen}
    />
  );
}
