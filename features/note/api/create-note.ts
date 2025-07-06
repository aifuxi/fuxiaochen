import { useRequest } from "ahooks";

import { showErrorToast, showSuccessToast } from "@/components/toast";

import { createNote } from "../actions";

export const useCreateNote = () => {
  return useRequest(createNote, {
    manual: true,
    loadingDelay: 300,
    onSuccess() {
      showSuccessToast("笔记创建成功");
    },
    onError(error) {
      showErrorToast(`笔记创建失败: ${error.message}`);
    },
  });
};
