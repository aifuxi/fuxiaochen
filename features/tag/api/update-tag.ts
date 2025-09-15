import { useRequest } from "ahooks";

import { showErrorToast, showSuccessToast } from "@/components/toast";

import { updateTag } from "../actions";

export const useUpdateTag = () => {
  return useRequest(updateTag, {
    manual: true,
    loadingDelay: 300,
    onSuccess(resp) {
      if (resp?.error) {
        showErrorToast(`标签更新失败: ${resp.error}`);
        return;
      }
      showSuccessToast("标签更新成功");
    },
  });
};
