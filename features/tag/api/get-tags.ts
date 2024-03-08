import { useQuery } from '@tanstack/react-query';

import { queryClient } from '@/lib/react-query';

import { getTags } from '../actions';

const queryKey = ['tags'];

export const useGetTags = () => {
  return useQuery({
    queryKey,
    queryFn: () => getTags(),
  });
};

export const invalidateGetTagsQuery = () => {
  return queryClient.invalidateQueries({
    queryKey,
  });
};
