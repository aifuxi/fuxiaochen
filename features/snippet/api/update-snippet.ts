import { useRequest } from 'ahooks';

import { showErrorToast, showSuccessToast } from '@/components/ui/toast';

import { toggleSnippetPublished, updateSnippet } from '../actions';

export const useUpdateSnippet = () => {
  return useRequest(updateSnippet, {
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

export const useToggleSnippetPublish = () => {
  return useRequest(toggleSnippetPublished, {
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
