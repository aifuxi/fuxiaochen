import { type GetTagsDTO } from '..';
import { type TagTypeEnum } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';

import { getAllTags, getTags } from '../actions';

export const useGetTags = (params: GetTagsDTO) => {
  return useQuery({
    queryKey: ['tags', params],
    queryFn: () => getTags(params),
  });
};

export const useGetAllTags = (type?: TagTypeEnum) => {
  return useQuery({
    queryKey: ['get_all_tags', type],
    queryFn: () => getAllTags(type),
  });
};
