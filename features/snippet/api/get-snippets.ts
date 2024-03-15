import { useQuery } from '@tanstack/react-query';

import { queryClient } from '@/lib/react-query';

import { getSnippets } from '../actions';
import { type GetSnippetsDTO } from '../types';

const queryKey = ['snippets'];

export const useGetSnippets = (params: GetSnippetsDTO) => {
  return useQuery({
    queryKey: [...queryKey, params],
    queryFn: () => getSnippets(params),
  });
};

export const invalidateGetSnippetsQuery = () => {
  return queryClient.invalidateQueries({
    queryKey,
  });
};
