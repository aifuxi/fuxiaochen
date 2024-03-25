import { useRequest } from 'ahooks';

import { getSnippets } from '../actions';
import { type GetSnippetsDTO } from '../types';

export const useGetSnippets = (params: GetSnippetsDTO) => {
  return useRequest(() => getSnippets(params), {
    refreshDeps: [params],
    loadingDelay: 300,
  });
};
