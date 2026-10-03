"use client";

import { useAdminWorkspace } from "./admin-context";
import { AdminDashboard } from "./admin-dashboard";

export function AdminOverview() {
  const {
    postSummary,
    postSummaryLoading,
    postSummaryError,
    reloadPostSummary,
    commentSummary,
    commentSummaryLoading,
    commentSummaryError,
    reloadCommentSummary,
    commentPending,
    moderateComment,
    onMessage,
    onOpen,
    onDeleteComment,
  } = useAdminWorkspace();
  return (
    <AdminDashboard
      postSummary={postSummary}
      postSummaryLoading={postSummaryLoading}
      postSummaryError={postSummaryError}
      reloadPostSummary={reloadPostSummary}
      commentSummary={commentSummary}
      commentSummaryLoading={commentSummaryLoading}
      commentSummaryError={commentSummaryError}
      reloadCommentSummary={reloadCommentSummary}
      commentPending={commentPending}
      onOpen={onOpen}
      onApprove={async (comment) => {
        try {
          await moderateComment(comment, "approved");
        } catch (error) {
          onMessage(error instanceof Error ? error.message : "审核失败，请重试。");
          reloadCommentSummary();
        }
      }}
      onDelete={onDeleteComment}
    />
  );
}
