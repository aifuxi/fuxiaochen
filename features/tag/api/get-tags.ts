import { type TagTypeEnum } from '@prisma/client';
import { useRequest } from 'ahooks';

import { getAllTags, getTags } from '../actions';
import { type GetTagsDTO } from '../types';

export const useGetTags = (params: GetTagsDTO) => {
  return useRequest(() => getTags(params), {
    refreshDeps: [params],
    loadingDelay: 300,
    refreshOnWindowFocus: true,
  });
};

export const useGetAllTags = (type?: TagTypeEnum) => {
  return useRequest(() => getAllTags(type));
};
