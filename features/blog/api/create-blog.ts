import { useRequest } from "ahooks";

import { showErrorToast, showSuccessToast } from "@/components/ui/toast";

import { createBlog } from "../actions";

export const useCreateBlog = () => {
  return useRequest(createBlog, {
    manual: true,
    loadingDelay: 300,
    onSuccess() {
      showSuccessToast("博客创建成功");
    },
    onError(error) {
      showErrorToast(`博客创建失败: ${error.message}`);
    },
  });
};
