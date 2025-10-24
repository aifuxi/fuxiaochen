"use client";

import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import {
  type CreateCategoryData,
  type CreateCategoryRequest,
  type GetCategoriesData,
  type GetCategoriesRequest,
  type GetCategoryData,
  type UpdateCategoryData,
  type UpdateCategoryRequest,
} from "@/types/category";

import { request } from "@/lib/request";

export function getCategories(params: GetCategoriesRequest) {
  return request.get<unknown, GetCategoriesData>("/categories", { params });
}

export function createCategory(params: CreateCategoryRequest) {
  return request.post<unknown, CreateCategoryData>("/categories", params);
}

export function getCategory(id: string) {
  return request.get<unknown, GetCategoryData>(`/category/${id}`);
}

export function deleteCategory(id: string) {
  return request.delete<unknown, void>(`/category/${id}`);
}

export function updateCategory(params: UpdateCategoryRequest) {
  return request.put<unknown, UpdateCategoryData>(
    `/category/${params.id}`,
    params,
  );
}

export function useGetCategories(params: GetCategoriesRequest) {
  return useSWR(["/categories", params], () => getCategories(params));
}

export function useCreateCategory() {
  return useSWRMutation<
    CreateCategoryData,
    Error,
    string,
    CreateCategoryRequest
  >("/Categories", (_, { arg }) => createCategory(arg));
}

export function useGetCategory(id: string, opts?: { enable?: boolean }) {
  const { enable = true } = opts ?? {};
  return useSWR(enable ? ["/category", id] : null, () => getCategory(id));
}

export function useDeleteCategory(id: string) {
  return useSWRMutation(`/category/${id}`, () => deleteCategory(id));
}

export function useUpdateCategory() {
  return useSWRMutation<
    UpdateCategoryData,
    Error,
    string,
    UpdateCategoryRequest
  >("/category", (_, { arg }) => updateCategory(arg));
}
