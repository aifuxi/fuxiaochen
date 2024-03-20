import { useRequest } from 'ahooks';

import { showErrorToast, showSuccessToast } from '@/components/ui/toast';

import { deleteNoteByID } from '../actions';

export const useDeleteNote = () => {
  return useRequest(deleteNoteByID, {
    manual: true,
    loadingDelay: 300,
    onSuccess() {
      showSuccessToast('笔记已删除');
    },
    onError(error) {
      showErrorToast(`笔记删除失败: ${error.message}`);
    },
  });
};
