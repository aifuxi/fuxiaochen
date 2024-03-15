import { type GetTagsDTO } from '..';
import { useQuery } from '@tanstack/react-query';

import { queryClient } from '@/lib/react-query';

import { getAllTags, getTags } from '../actions';

const queryKey = ['tags'];
const allTagsQueryKey = ['get_all_tags'];

export const useGetTags = (params: GetTagsDTO) => {
  return useQuery({
    queryKey: [...queryKey, params],
    queryFn: () => getTags(params),
  });
};

export const useGetAllTags = () => {
  return useQuery({
    queryKey: ['get_all_tags'],
    queryFn: () => getAllTags(),
  });
};

export const invalidateGetTagsQuery = () => {
  return queryClient.invalidateQueries({
    queryKey: [queryKey, allTagsQueryKey],
  });
};
