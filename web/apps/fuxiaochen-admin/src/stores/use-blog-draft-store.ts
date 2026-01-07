import type { BlogCreateReq } from "fuxiaochen-types";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface BlogDraftStore {
  draft: BlogCreateReq | null;
  setDraft: (draft: BlogCreateReq | null) => void;
  clearDraft: () => void;
}

const useBlogDraftStore = create<BlogDraftStore>()(
  devtools(
    persist(
      (set) => ({
        draft: null,
        setDraft: (draft) => set({ draft }),
        clearDraft: () => set({ draft: null }),
      }),
      { name: "fgo:blogDraftStore" },
    ),
  ),
);

export default useBlogDraftStore;
