"use client";

import { createContext, useContext } from "react";

import type { PostItem, PostDetail, PostInput } from "@/lib/posts/schema";

import type { AdminPanel } from "./admin-shell";
import type { TaxonomyState } from "./use-taxonomy";

type AdminState = TaxonomyState & {
  onMessage: (message: string) => void;
  postRevision: number;
  postPending: boolean;
  operationRevision: number;
  runOperation: <T>(work: () => Promise<T>) => Promise<T>;
  onNavigate: (href: string) => void;
  writingFocused: boolean;
  setWritingFocused: (focused: boolean) => void;
  savePost: (input: PostInput, initial: PostDetail | null) => Promise<PostDetail>;
  setPostFeatured: (post: PostItem) => Promise<PostItem>;
  onOpen: (panel: AdminPanel, returnFocus?: HTMLElement | null) => void;
  onEdit: (id: string) => void;
  onDeletePost: (
    post: PostItem,
    fallbackFocus?: HTMLElement | null,
    triggerFocus?: HTMLElement | null,
  ) => void;
};

export const AdminContext = createContext<AdminState | null>(null);

export function useAdminWorkspace() {
  const state = useContext(AdminContext);
  if (!state) throw new Error("管理页面必须位于 AdminWorkspace 中");
  return state;
}
