import toast from 'react-hot-toast';

import { useMutation } from '@tanstack/react-query';

import { invalidateGetArticlesQuery } from './get-articles';

import { deleteArticleByID } from '../actions';

export const useDeleteArticle = () => {
  return useMutation({
    mutationKey: ['delete_article'],
    mutationFn: (id: string) => deleteArticleByID(id),
    async onSuccess() {
      toast.success('操作成功');
      await invalidateGetArticlesQuery();
    },
    onError(error) {
      toast.error(`操作失败: ${error.message}`);
    },
  });
};
