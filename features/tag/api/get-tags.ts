import { type GetTagsDTO } from '..';
import { type TagTypeEnum } from '@prisma/client';
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

export const useGetAllTags = (type?: TagTypeEnum) => {
  return useQuery({
    queryKey: ['get_all_tags', type],
    queryFn: () => getAllTags(type),
  });
};

export const invalidateGetTagsQuery = () => {
  return queryClient.invalidateQueries({
    queryKey: [queryKey, allTagsQueryKey],
  });
};
