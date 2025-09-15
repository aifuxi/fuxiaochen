import { useRequest } from "ahooks";

import { showErrorToast, showSuccessToast } from "@/components/toast";

import { deleteTagByID } from "../actions";

export const useDeleteTag = () => {
  return useRequest(deleteTagByID, {
    manual: true,
    onSuccess(resp) {
      if (resp?.error) {
        showErrorToast(`标签删除失败: ${resp.error}`);
        return;
      }
      showSuccessToast("标签删除成功");
    },
  });
};
