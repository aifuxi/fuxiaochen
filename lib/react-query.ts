import { type DefaultOptions, QueryClient } from '@tanstack/react-query';

const queryConfig: DefaultOptions<Error> = {
  queries: {
    // refetchOnWindowFocus: false,
    // retry: false,
  },
};

export const queryClient = new QueryClient({ defaultOptions: queryConfig });

// 对所有的查询进行失效处理
export const invalidateQueries = () => queryClient.invalidateQueries();
