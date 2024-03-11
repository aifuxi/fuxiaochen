import { useQuery } from '@tanstack/react-query';

import { queryClient } from '@/lib/react-query';

import { getSnippets } from '../actions';

const queryKey = ['snippets'];

export const useGetSnippets = () => {
  return useQuery({
    queryKey,
    queryFn: () => getSnippets(),
  });
};

export const invalidateGetSnippetsQuery = () => {
  return queryClient.invalidateQueries({
    queryKey,
  });
};
