import { useRequest } from "ahooks";

import { showErrorToast, showSuccessToast } from "@/components/toast";

import { deleteTagByID } from "../actions";

export const useDeleteTag = () => {
  return useRequest(deleteTagByID, {
    manual: true,
    onSuccess() {
      showSuccessToast("标签已删除");
    },
    onError(error) {
      showErrorToast(`标签删除失败: ${error.message}`);
    },
  });
};
