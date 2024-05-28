import { useRequest } from "ahooks";

import { getNoteByID } from "../actions";

export const useGetNote = (id: string, ready: boolean) => {
  return useRequest(() => getNoteByID(id), {
    ready,
    loadingDelay: 300,
  });
};
