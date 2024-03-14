import { useMutation } from '@tanstack/react-query';

import { showErrorToast, showSuccessToast } from '@/components/ui/toast';

import { invalidateGetTagsQuery } from './get-tags';

import { deleteTagByID } from '../actions';

export const useDeleteTag = () => {
  return useMutation({
    mutationKey: ['delete_tag'],
    mutationFn: (id: string) => deleteTagByID(id),
    async onSuccess() {
      showSuccessToast('操作成功');
      await invalidateGetTagsQuery();
    },
    onError(error) {
      showErrorToast(`操作失败: ${error.message}`);
    },
  });
};
