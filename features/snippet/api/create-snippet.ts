import { useMutation } from '@tanstack/react-query';

import { showErrorToast, showSuccessToast } from '@/components/ui/toast';

import { invalidateGetSnippetsQuery } from './get-snippets';

import { createSnippet } from '../actions';
import { type CreateSnippetDTO } from '../types';

export const useCreateSnippet = () => {
  return useMutation({
    mutationKey: ['create_Snippet'],
    mutationFn: (params: CreateSnippetDTO) => createSnippet(params),
    async onSuccess() {
      showSuccessToast('操作成功');
      await invalidateGetSnippetsQuery();
    },
    onError(error) {
      showErrorToast(`操作失败: ${error.message}`);
    },
  });
};
