import { useRequest } from "ahooks";

import { getTagByID } from "../actions";

export const useGetTag = (id: string, ready: boolean) => {
  return useRequest(() => getTagByID(id), {
    ready,
    loadingDelay: 300,
  });
};
