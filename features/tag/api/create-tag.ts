import { useRequest } from "ahooks";

import { showErrorToast, showSuccessToast } from "@/components/toast";

import { createTag } from "../actions";

export const useCreateTag = () => {
  return useRequest(createTag, {
    manual: true,
    loadingDelay: 300,
    onSuccess() {
      showSuccessToast("标签已创建");
    },
    onError(error) {
      showErrorToast(`标签创建失败: ${error.message}`);
    },
  });
};
