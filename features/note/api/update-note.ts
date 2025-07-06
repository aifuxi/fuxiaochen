import { useRequest } from "ahooks";

import { showErrorToast, showSuccessToast } from "@/components/toast";

import { toggleNotePublished, updateNote } from "../actions";

export const useUpdateNote = () => {
  return useRequest(updateNote, {
    manual: true,
    loadingDelay: 300,
    onSuccess() {
      showSuccessToast("笔记已更新");
    },
    onError(error) {
      showErrorToast(`笔记更新失败: ${error.message}`);
    },
  });
};

export const useToggleNotePublish = () => {
  return useRequest(toggleNotePublished, {
    manual: true,
    loadingDelay: 300,
    onSuccess() {
      showSuccessToast("笔记发布状态已更新");
    },
    onError(error) {
      showErrorToast(`笔记更新失败: ${error.message}`);
    },
  });
};
