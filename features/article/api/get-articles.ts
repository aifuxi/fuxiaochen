import { useQuery } from '@tanstack/react-query';

import { queryClient } from '@/lib/react-query';

import { getArticles } from '../actions';

const queryKey = ['articles'];

export const useGetArticles = () => {
  return useQuery({
    queryKey,
    queryFn: () => getArticles(),
  });
};

export const invalidateGetArticlesQuery = () => {
  return queryClient.invalidateQueries({
    queryKey,
  });
};
