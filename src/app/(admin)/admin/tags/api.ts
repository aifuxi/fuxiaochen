import { useMutation, useQuery } from "@tanstack/react-query";

import {
  createTag,
  deleteTag,
  getAllTags,
  getTag,
  getTags,
  updateTag,
} from "./action";
import {
  type CreateTagRequestType,
  type GetTagsRequestType,
  type UpdateTagRequestType,
} from "./schema";

type GetTagsResponseType = Awaited<ReturnType<typeof getTags>>;

export const GET_TAGS_KEY = "getTags";

export function useGetTags(data: GetTagsRequestType) {
  const query = useQuery<GetTagsResponseType, Error>({
    queryKey: [GET_TAGS_KEY, data],
    queryFn: async () => {
      const resp = await getTags(data);

      if (resp.code) {
        throw Error(resp.msg as string);
      }
      return resp;
    },
  });

  return query;
}

type GetAllTagsResponseType = Awaited<ReturnType<typeof getAllTags>>;

export function useGetAllTags() {
  const query = useQuery<GetAllTagsResponseType, Error>({
    queryKey: [GET_TAGS_KEY, "all"],
    queryFn: async () => {
      const resp = await getAllTags();

      if (resp.code) {
        throw Error(resp.msg as string);
      }
      return resp;
    },
  });

  return query;
}

type DeleteTagResponseType = Awaited<ReturnType<typeof deleteTag>>;

export function useDeleteTag() {
  const mutation = useMutation<DeleteTagResponseType, Error, number>({
    mutationFn: async (id) => {
      const resp = await deleteTag(id);

      if (resp.code) {
        throw Error(resp.msg as string);
      }
      return resp;
    },
  });

  return mutation;
}

type CreateTagResponseType = Awaited<ReturnType<typeof createTag>>;

export function useCreateTag() {
  const mutation = useMutation<
    CreateTagResponseType,
    Error,
    CreateTagRequestType
  >({
    mutationFn: async (json) => {
      const resp = await createTag(json);

      if (resp.code) {
        throw Error(resp.msg as string);
      }
      return resp;
    },
  });

  return mutation;
}

type UpdateTagResponseType = Awaited<ReturnType<typeof updateTag>>;

export function useUpdateTag() {
  const mutation = useMutation<
    UpdateTagResponseType,
    Error,
    UpdateTagRequestType
  >({
    mutationFn: async (json) => {
      const resp = await updateTag(json);

      if (resp.code) {
        throw Error(resp.msg as string);
      }
      return resp;
    },
  });

  return mutation;
}

type GetTagResponseType = Awaited<ReturnType<typeof getTag>>;

export function useGetTag(id: number | null) {
  const query = useQuery<GetTagResponseType, Error>({
    queryKey: ["getTag", id],
    enabled: Boolean(id),
    staleTime: 0,
    queryFn: async () => {
      const resp = await getTag(id!);

      if (resp.code) {
        throw Error(resp.msg as string);
      }
      return resp;
    },
  });

  return query;
}
