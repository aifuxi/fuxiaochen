import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

import type { FormBlogCreateReq } from "@/types/semi";

interface BlogDraftStore {
  draft: FormBlogCreateReq | null;
  setDraft: (draft: FormBlogCreateReq | null) => void;
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
