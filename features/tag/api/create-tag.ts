import { useMutation } from '@tanstack/react-query';

import { showErrorToast, showSuccessToast } from '@/components/ui/toast';

import { invalidateGetTagsQuery } from './get-tags';

import { createTag } from '../actions';
import { type CreateTagDTO } from '../types';

export const useCreateTag = () => {
  return useMutation({
    mutationKey: ['create_tag'],
    mutationFn: (params: CreateTagDTO) => createTag(params),
    async onSuccess() {
      showSuccessToast('操作成功');
      await invalidateGetTagsQuery();
    },
    onError(error) {
      showErrorToast(`操作失败: ${error.message}`);
    },
  });
};
