import { useMutation, useQuery } from "@tanstack/react-query";

import {
  createBlog,
  deleteBlog,
  getBlog,
  getBlogs,
  updateBlog,
} from "./action";
import {
  type CreateBlogRequestType,
  type GetBlogsRequestType,
  type UpdateBlogRequestType,
} from "./schema";

type GetBlogsResponseType = Awaited<ReturnType<typeof getBlogs>>;

export const GET_BLOGS_KEY = "getBlogs";

export function useGetBlogs(data: GetBlogsRequestType) {
  const query = useQuery<GetBlogsResponseType, Error>({
    queryKey: [GET_BLOGS_KEY, data],
    queryFn: async () => {
      const resp = await getBlogs(data);

      if (resp.code) {
        throw Error(resp.msg as string);
      }
      return resp;
    },
  });

  return query;
}

type DeleteBlogResponseType = Awaited<ReturnType<typeof deleteBlog>>;

export function useDeleteBlog() {
  const mutation = useMutation<DeleteBlogResponseType, Error, number>({
    mutationFn: async (id) => {
      const resp = await deleteBlog(id);

      if (resp.code) {
        throw Error(resp.msg as string);
      }
      return resp;
    },
  });

  return mutation;
}

type CreateBlogResponseType = Awaited<ReturnType<typeof createBlog>>;

export function useCreateBlog() {
  const mutation = useMutation<
    CreateBlogResponseType,
    Error,
    CreateBlogRequestType
  >({
    mutationFn: async (json) => {
      const resp = await createBlog(json);

      if (resp.code) {
        throw Error(resp.msg as string);
      }
      return resp;
    },
  });

  return mutation;
}

type UpdateBlogResponseType = Awaited<ReturnType<typeof updateBlog>>;

export function useUpdateBlog() {
  const mutation = useMutation<
    UpdateBlogResponseType,
    Error,
    UpdateBlogRequestType
  >({
    mutationFn: async (json) => {
      const resp = await updateBlog(json);

      if (resp.code) {
        throw Error(resp.msg as string);
      }
      return resp;
    },
  });

  return mutation;
}

type GetBlogResponseType = Awaited<ReturnType<typeof getBlog>>;

export function useGetBlog(id: number | null) {
  const query = useQuery<GetBlogResponseType, Error>({
    queryKey: ["getBlog", id],
    enabled: Boolean(id),
    staleTime: 0,
    queryFn: async () => {
      const resp = await getBlog(id!);

      if (resp.code) {
        throw Error(resp.msg as string);
      }
      return resp;
    },
  });

  return query;
}
