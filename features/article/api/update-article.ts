import toast from 'react-hot-toast';

import { useMutation } from '@tanstack/react-query';

import { invalidateGetArticlesQuery } from './get-articles';

import { toggleArticlePublished, updateArticle } from '../actions';
import { type UpdateArticleDTO } from '../types';

export const useUpdateArticle = () => {
  return useMutation({
    mutationKey: ['update_article'],
    mutationFn: (params: UpdateArticleDTO) => updateArticle(params),
    async onSuccess() {
      toast.success('操作成功');
      await invalidateGetArticlesQuery();
    },
    onError(error) {
      toast.error(`操作失败: ${error.message}`);
    },
  });
};

export const useToggleArticlePublish = () => {
  return useMutation({
    mutationKey: ['toggle_article_publish'],
    mutationFn: (id: string) => toggleArticlePublished(id),
    async onSuccess() {
      toast.success('操作成功');
      await invalidateGetArticlesQuery();
    },
    onError(error) {
      toast.error(`操作失败: ${error.message}`);
    },
  });
};
