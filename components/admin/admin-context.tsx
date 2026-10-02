"use client";

import { createContext, useContext, type Dispatch, type SetStateAction } from "react";

import type { PostItem, PostDetail, PostInput, PostSummary } from "@/lib/posts/schema";

import type { AdminPanel } from "./admin-shell";
import type { ReleaseLog } from "./changelog-mock-data";
import type { FriendLink } from "./friends-links-mock-data";
import type { Comment, MediaItem } from "./mock-data";
import type { BlogSettings } from "./settings-mock-data";
import type { TaxonomyState } from "./use-taxonomy";

type AdminState = TaxonomyState & {
  settings: BlogSettings;
  setSettings: Dispatch<SetStateAction<BlogSettings>>;
  releaseLogs: ReleaseLog[];
  setReleaseLogs: Dispatch<SetStateAction<ReleaseLog[]>>;
  friendsLinks: FriendLink[];
  setFriendsLinks: Dispatch<SetStateAction<FriendLink[]>>;
  media: MediaItem[];
  onUploadMedia: (files: File[]) => Promise<void>;
  onDeleteMedia: (id: string) => void;
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
  comments: Comment[];
  onOpen: (panel: AdminPanel) => void;
  onEdit: (id: string) => void;
  onDeletePost: (post: PostItem) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onReply: (id: string, content: string) => boolean;
  onDeleteComment: (id: string, fallbackFocus?: HTMLElement | null) => void;
  onBackup: () => void;
};

export const AdminContext = createContext<AdminState | null>(null);

export function useAdminWorkspace() {
  const state = useContext(AdminContext);
  if (!state) throw new Error("管理页面必须位于 AdminWorkspace 中");
  return state;
}
