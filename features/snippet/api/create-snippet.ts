import { useRequest } from "ahooks";

import { showErrorToast, showSuccessToast } from "@/components/ui/toast";

import { createSnippet } from "../actions";

export const useCreateSnippet = () => {
  return useRequest(createSnippet, {
    manual: true,
    loadingDelay: 300,
    onSuccess() {
      showSuccessToast("片段已创建");
    },
    onError(error) {
      showErrorToast(`片段创建失败: ${error.message}`);
    },
  });
};
