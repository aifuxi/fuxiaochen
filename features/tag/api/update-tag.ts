import { useMutation } from '@tanstack/react-query';

import { showErrorToast, showSuccessToast } from '@/components/ui/toast';

import { invalidateGetTagsQuery } from './get-tags';

import { updateTag } from '../actions';
import { type UpdateTagDTO } from '../types';

export const useUpdateTag = () => {
  return useMutation({
    mutationKey: ['update_tag'],
    mutationFn: (params: UpdateTagDTO) => updateTag(params),
    async onSuccess() {
      showSuccessToast('操作成功');
      await invalidateGetTagsQuery();
    },
    onError(error) {
      showErrorToast(`操作失败: ${error.message}`);
    },
  });
};
