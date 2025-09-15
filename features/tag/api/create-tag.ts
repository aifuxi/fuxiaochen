import { useRequest } from "ahooks";

import { showErrorToast, showSuccessToast } from "@/components/toast";

import { createTag } from "../actions";

export const useCreateTag = () => {
  return useRequest(createTag, {
    manual: true,
    loadingDelay: 300,
    onSuccess(resp) {
      if (resp?.error) {
        showErrorToast(`标签创建失败: ${resp.error}`);
        return;
      }
      showSuccessToast("标签创建成功");
    },
  });
};
