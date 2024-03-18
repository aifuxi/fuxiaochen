import { useRequest } from 'ahooks';

import { showErrorToast, showSuccessToast } from '@/components/ui/toast';

import { deleteBlogByID } from '../actions';

export const useDeleteBlog = () => {
  return useRequest(deleteBlogByID, {
    manual: true,
    loadingDelay: 300,
    onSuccess() {
      showSuccessToast('操作成功');
    },
    onError(error) {
      showErrorToast(`操作失败: ${error.message}`);
    },
  });
};
