import { useQuery } from '@tanstack/react-query';

import { queryClient } from '@/lib/react-query';

import { getBlogs } from '../actions';

const queryKey = ['blogs'];

export const useGetBlogs = () => {
  return useQuery({
    queryKey,
    queryFn: () => getBlogs(),
  });
};

export const invalidateGetBlogsQuery = () => {
  return queryClient.invalidateQueries({
    queryKey,
  });
};
