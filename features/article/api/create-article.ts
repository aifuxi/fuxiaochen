import toast from 'react-hot-toast';

import { useMutation } from '@tanstack/react-query';

import { invalidateGetArticlesQuery } from './get-articles';

import { createArticle } from '../actions';
import { type CreateArticleDTO } from '../types';

export const useCreateArticle = () => {
  return useMutation({
    mutationKey: ['create_article'],
    mutationFn: (params: CreateArticleDTO) => createArticle(params),
    async onSuccess() {
      toast.success('操作成功');
      await invalidateGetArticlesQuery();
    },
    onError(error) {
      toast.error(`操作失败: ${error.message}`);
    },
  });
};
