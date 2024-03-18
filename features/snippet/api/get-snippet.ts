import { useRequest } from 'ahooks';

import { getSnippetByID } from '../actions';

export const useGetSnippet = (id: string, ready: boolean) => {
  return useRequest(() => getSnippetByID(id), {
    ready,
    loadingDelay: 300,
  });
};
