import { useQuery } from '@tanstack/react-query';

import { queryClient } from '@/lib/react-query';

import { getBlogs } from '../actions';
import { type GetBlogsDTO } from '../types';

const queryKey = ['blogs'];

export const useGetBlogs = (params: GetBlogsDTO) => {
  return useQuery({
    queryKey: [...queryKey, params],
    queryFn: () => getBlogs(params),
  });
};

export const invalidateGetBlogsQuery = () => {
  return queryClient.invalidateQueries({
    queryKey,
  });
};
