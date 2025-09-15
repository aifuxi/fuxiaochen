"use client";

import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { request } from "@/lib/request";

import {
  type CreateTagData,
  type CreateTagRequest,
  type GetTagData,
  type GetTagsData,
  type GetTagsRequest,
  type UpdateTagData,
  type UpdateTagRequest,
} from "../types";

export function getTags(params: GetTagsRequest) {
  return request.get<unknown, GetTagsData>("/tags", { params });
}

export function createTag(params: CreateTagRequest) {
  return request.post<unknown, CreateTagData>("/tags", params);
}

export function getTag(id: string) {
  return request.get<unknown, GetTagData>(`/tag/${id}`);
}

export function deleteTag(id: string) {
  return request.delete<unknown, void>(`/tag/${id}`);
}

export function updateTag(params: UpdateTagRequest) {
  return request.put<unknown, UpdateTagData>(`/tag/${params.id}`, params);
}

export function useGetTags(params: GetTagsRequest) {
  return useSWR(["/tags", params], () => getTags(params));
}

export function useCreateTag() {
  return useSWRMutation<CreateTagData, Error, string, CreateTagRequest>(
    "/tags",
    (_, { arg }) => createTag(arg),
  );
}

export function useGetTag(id: string, opts?: { enable?: boolean }) {
  const { enable = true } = opts ?? {};
  return useSWR(enable ? ["/tag", id] : null, () => getTag(id));
}

export function useDeleteTag(id: string) {
  return useSWRMutation(`/tag/${id}`, () => deleteTag(id));
}

export function useUpdateTag() {
  return useSWRMutation<UpdateTagData, Error, string, UpdateTagRequest>(
    "/tag",
    (_, { arg }) => updateTag(arg),
  );
}
