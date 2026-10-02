"use client";

import { createContext, useContext, type Dispatch, type SetStateAction } from "react";

import type { CommentItem } from "@/lib/comments/schema";
import type { PostItem, PostDetail, PostInput, PostSummary } from "@/lib/posts/schema";

import type { AdminPanel } from "./admin-shell";
import type { ReleaseLog } from "./changelog-mock-data";
import type { useComments } from "./use-comments";
import type { UploadJob } from "./use-media";
import type { TaxonomyState } from "./use-taxonomy";

type AdminState = TaxonomyState &
  Omit<ReturnType<typeof useComments>, "deleteComment"> & {
    releaseLogs: ReleaseLog[];
    setReleaseLogs: Dispatch<SetStateAction<ReleaseLog[]>>;
    mediaRevision: number;
    mediaUploads: UploadJob[];
    retryMediaUpload: (id: string) => Promise<void>;
    clearMediaUploads: () => void;
    onUploadMedia: (files: File[]) => Promise<void>;
    onDeleteMedia: (id: string) => Promise<void>;
    onMessage: (message: string) => void;
    uploadingMedia: boolean;
    postRevision: number;
    postPending: boolean;
    postSummary: PostSummary | null;
    postSummaryLoading: boolean;
    postSummaryError: string;
    reloadPostSummary: () => void;
    savePost: (input: PostInput, initial: PostDetail | null) => Promise<PostDetail>;
    cancelPostSchedule: (post: PostItem) => Promise<PostDetail>;
    onOpen: (panel: AdminPanel) => void;
    onEdit: (id: string) => void;
    onDeletePost: (post: PostItem) => void;
    onDeleteComment: (comment: CommentItem, fallbackFocus?: HTMLElement | null) => void;
    onBackup: () => void;
  };

export const AdminContext = createContext<AdminState | null>(null);

export function useAdminWorkspace() {
  const state = useContext(AdminContext);
  if (!state) throw new Error("管理页面必须位于 AdminWorkspace 中");
  return state;
}
