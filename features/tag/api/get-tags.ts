import { type TagTypeEnum } from "@prisma/client";
import { useRequest } from "ahooks";

import { getAllTags, getTags } from "../actions";
import { type GetTagsRequest } from "../types";

export const useGetTags = (params: GetTagsRequest) => {
  return useRequest(
    async () => {
      const res = await getTags(params);
      return res.data;
    },
    {
      loadingDelay: 300,
      refreshDeps: [params.name, params.pageIndex, params.pageSize],
    },
  );
};

export const useGetAllTags = (type?: TagTypeEnum) => {
  return useRequest(() => getAllTags(type));
};
