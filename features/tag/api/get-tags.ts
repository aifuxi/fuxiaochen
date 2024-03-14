import { type GetTagsDTO } from '..';
import { useQuery } from '@tanstack/react-query';

import { queryClient } from '@/lib/react-query';

import { getTags } from '../actions';

const queryKey = ['tags'];

export const useGetTags = (params: GetTagsDTO) => {
  return useQuery({
    queryKey: [...queryKey, params],
    queryFn: () => getTags(params),
  });
};

export const invalidateGetTagsQuery = () => {
  return queryClient.invalidateQueries({
    queryKey,
  });
};
