import { useRequest } from "ahooks";

import { showErrorToast, showSuccessToast } from "@/components/toast";

import { toggleBlogPublished, updateBlog } from "../actions";

export const useUpdateBlog = () => {
  return useRequest(updateBlog, {
    manual: true,
    loadingDelay: 300,
    onSuccess() {
      showSuccessToast("博客已更新");
    },
    onError(error) {
      showErrorToast(`博客更新失败: ${error.message}`);
    },
  });
};

export const useToggleBlogPublish = () => {
  return useRequest(toggleBlogPublished, {
    manual: true,
    loadingDelay: 300,
    onSuccess() {
      showSuccessToast("博客发布状态已更新");
    },
    onError(error) {
      showErrorToast(`博客发布状态更新失败: ${error.message}`);
    },
  });
};
