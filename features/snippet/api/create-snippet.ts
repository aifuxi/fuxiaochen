import toast from 'react-hot-toast';

import { useMutation } from '@tanstack/react-query';

import { invalidateGetSnippetsQuery } from './get-snippets';

import { createSnippet } from '../actions';
import { type CreateSnippetDTO } from '../types';

export const useCreateSnippet = () => {
  return useMutation({
    mutationKey: ['create_Snippet'],
    mutationFn: (params: CreateSnippetDTO) => createSnippet(params),
    async onSuccess() {
      toast.success('操作成功');
      await invalidateGetSnippetsQuery();
    },
    onError(error) {
      toast.error(`操作失败: ${error.message}`);
    },
  });
};
