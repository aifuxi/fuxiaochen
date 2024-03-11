import toast from 'react-hot-toast';

import { useMutation } from '@tanstack/react-query';

import { invalidateGetSnippetsQuery } from './get-snippets';

import { updateSnippet } from '../actions';
import { type UpdateSnippetDTO } from '../types';

export const useUpdateSnippet = () => {
  return useMutation({
    mutationKey: ['update_Snippet'],
    mutationFn: (params: UpdateSnippetDTO) => updateSnippet(params),
    async onSuccess() {
      toast.success('操作成功');
      await invalidateGetSnippetsQuery();
    },
    onError(error) {
      toast.error(`操作失败: ${error.message}`);
    },
  });
};
