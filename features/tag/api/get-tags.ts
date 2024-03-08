import { type QueryClientConfig, useQuery } from '@tanstack/react-query';

import { queryClient } from '@/lib/react-query';

import { getTags } from '../actions';

const queryKey = ['tags'];

export const useGetTags = (config?: QueryClientConfig) => {
  return useQuery({
    ...config,
    queryKey,
    queryFn: () => getTags(),
  });
};

export const invalidateGetTagsQuery = () => {
  return queryClient.invalidateQueries({
    queryKey,
  });
};
