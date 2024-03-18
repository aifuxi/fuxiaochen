import { useRequest } from 'ahooks';

import { showErrorToast, showSuccessToast } from '@/components/ui/toast';

import { createNote } from '../actions';

export const useCreateNote = () => {
  return useRequest(createNote, {
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
