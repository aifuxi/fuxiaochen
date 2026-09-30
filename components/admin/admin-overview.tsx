"use client";

import { useAdminWorkspace } from "./admin-context";
import { AdminDashboard } from "./admin-dashboard";

export function AdminOverview() {
  const { posts, comments, schedules, onOpen, onApprove, onDeleteComment, onBackup } =
    useAdminWorkspace();
  return (
    <AdminDashboard
      posts={posts}
      comments={comments}
      schedules={schedules}
      onOpen={onOpen}
      onApprove={onApprove}
      onDelete={onDeleteComment}
      onBackup={onBackup}
    />
  );
}
