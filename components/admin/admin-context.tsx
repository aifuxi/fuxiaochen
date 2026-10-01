"use client";

import { createContext, useContext, type Dispatch, type SetStateAction } from "react";

import type { AdminPanel } from "./admin-shell";
import type { ReleaseLog } from "./changelog-mock-data";
import type { FriendLink } from "./friends-links-mock-data";
import type { Comment, MediaItem, Post, Schedule } from "./mock-data";
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
  posts: Post[];
  comments: Comment[];
  schedules: Schedule[];
  categories: string[];
  onOpen: (panel: AdminPanel) => void;
  onEdit: (post: Post) => void;
  onDeletePost: (id: string) => void;
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
