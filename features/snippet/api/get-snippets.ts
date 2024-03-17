import { useQuery } from '@tanstack/react-query';

import { getSnippets } from '../actions';
import { type GetSnippetsDTO } from '../types';

export const useGetSnippets = (params: GetSnippetsDTO) => {
  return useQuery({
    queryKey: ['snippets', params],
    queryFn: () => getSnippets(params),
  });
};
