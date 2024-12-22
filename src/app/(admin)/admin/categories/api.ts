import { useMutation, useQuery } from "@tanstack/react-query";

import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategory,
  updateCategory,
} from "./action";
import {
  type CreateCategoryRequestType,
  type GetCategoriesRequestType,
  type UpdateCategoryRequestType,
} from "./schema";

type GetCategoriesResponseType = Awaited<ReturnType<typeof getCategories>>;

export const GET_CATEGORIES_KEY = "getCategories";

export function useGetCategories(data: GetCategoriesRequestType) {
  const query = useQuery<GetCategoriesResponseType, Error>({
    queryKey: [GET_CATEGORIES_KEY, data],
    queryFn: async () => {
      const resp = await getCategories(data);

      if (resp.code) {
        throw Error(resp.msg as string);
      }
      return resp;
    },
  });

  return query;
}

type DeleteCategoryResponseType = Awaited<ReturnType<typeof deleteCategory>>;

export function useDeleteCategory() {
  const mutation = useMutation<DeleteCategoryResponseType, Error, number>({
    mutationFn: async (id) => {
      const resp = await deleteCategory(id);

      if (resp.code) {
        throw Error(resp.msg as string);
      }
      return resp;
    },
  });

  return mutation;
}

type CreateCategoryResponseType = Awaited<ReturnType<typeof createCategory>>;

export function useCreateCategory() {
  const mutation = useMutation<
    CreateCategoryResponseType,
    Error,
    CreateCategoryRequestType
  >({
    mutationFn: async (json) => {
      const resp = await createCategory(json);

      if (resp.code) {
        throw Error(resp.msg as string);
      }
      return resp;
    },
  });

  return mutation;
}

type UpdateCategoryResponseType = Awaited<ReturnType<typeof updateCategory>>;

export function useUpdateCategory() {
  const mutation = useMutation<
    UpdateCategoryResponseType,
    Error,
    UpdateCategoryRequestType
  >({
    mutationFn: async (json) => {
      const resp = await updateCategory(json);

      if (resp.code) {
        throw Error(resp.msg as string);
      }
      return resp;
    },
  });

  return mutation;
}

type GetCategoryResponseType = Awaited<ReturnType<typeof getCategory>>;

export function useGetCategory(id: number | null) {
  const query = useQuery<GetCategoryResponseType, Error>({
    queryKey: ["getCategory", id],
    enabled: Boolean(id),
    staleTime: 0,
    queryFn: async () => {
      const resp = await getCategory(id!);

      if (resp.code) {
        throw Error(resp.msg as string);
      }
      return resp;
    },
  });

  return query;
}
