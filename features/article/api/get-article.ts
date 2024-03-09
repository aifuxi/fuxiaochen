import { useQuery } from '@tanstack/react-query';

import { getArticleByID } from '../actions';

export const useGetArticle = (id: string) => {
  return useQuery({
    queryKey: ['get_aritcle', id],
    queryFn: () => getArticleByID(id),
  });
};
