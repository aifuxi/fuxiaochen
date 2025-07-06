import { useRequest } from "ahooks";

import { showErrorToast, showSuccessToast } from "@/components/toast";

import { updateTag } from "../actions";

export const useUpdateTag = () => {
  return useRequest(updateTag, {
    manual: true,
    loadingDelay: 300,
    onSuccess() {
      showSuccessToast("标签已更新");
    },
    onError(error) {
      showErrorToast(`标签更新失败: ${error.message}`);
    },
  });
};
