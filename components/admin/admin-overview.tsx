"use client";

import { useAdminWorkspace } from "./admin-context";
import { AdminDashboard } from "./admin-dashboard";

export function AdminOverview() {
  const {
    postSummary,
    postSummaryLoading,
    postSummaryError,
    reloadPostSummary,
    comments,
    onOpen,
    onApprove,
    onDeleteComment,
    onBackup,
  } = useAdminWorkspace();
  return (
    <AdminDashboard
      postSummary={postSummary}
      postSummaryLoading={postSummaryLoading}
      postSummaryError={postSummaryError}
      reloadPostSummary={reloadPostSummary}
      comments={comments}
      onOpen={onOpen}
      onApprove={onApprove}
      onDelete={onDeleteComment}
      onBackup={onBackup}
    />
  );
}
