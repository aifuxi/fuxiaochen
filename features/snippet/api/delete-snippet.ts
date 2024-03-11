import toast from 'react-hot-toast';

import { useMutation } from '@tanstack/react-query';

import { invalidateGetSnippetsQuery } from './get-snippets';

import { deleteSnippetByID } from '../actions';

export const useDeleteSnippet = () => {
  return useMutation({
    mutationKey: ['delete_Snippet'],
    mutationFn: (id: string) => deleteSnippetByID(id),
    async onSuccess() {
      toast.success('操作成功');
      await invalidateGetSnippetsQuery();
    },
    onError(error) {
      toast.error(`操作失败: ${error.message}`);
    },
  });
};
