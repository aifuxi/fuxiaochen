import { useRequest } from 'ahooks';

import { showErrorToast, showSuccessToast } from '@/components/ui/toast';

import { deleteBlogByID } from '../actions';

export const useDeleteBlog = () => {
  return useRequest(deleteBlogByID, {
    manual: true,
    loadingDelay: 300,
    onSuccess() {
      showSuccessToast('博客已删除');
    },
    onError(error) {
      showErrorToast(`博客删除失败: ${error.message}`);
    },
  });
};
