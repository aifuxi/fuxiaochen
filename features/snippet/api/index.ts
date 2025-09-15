"use client";

import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { request } from "@/lib/request";

import {
  type CreateSnippetData,
  type CreateSnippetRequest,
  type GetSnippetData,
  type GetSnippetsData,
  type GetSnippetsRequest,
  type UpdateSnippetData,
  type UpdateSnippetRequest,
} from "../types";

export function getSnippets(params: GetSnippetsRequest) {
  return request.get<unknown, GetSnippetsData>("/snippets", { params });
}

export function createSnippet(params: CreateSnippetRequest) {
  return request.post<unknown, CreateSnippetData>("/snippets", params);
}

export function getSnippet(id: string) {
  return request.get<unknown, GetSnippetData>(`/snippet/${id}`);
}

export function deleteSnippet(id: string) {
  return request.delete<unknown, void>(`/snippet/${id}`);
}

export function updateSnippet(params: UpdateSnippetRequest) {
  return request.put<unknown, UpdateSnippetData>(
    `/snippet/${params.id}`,
    params,
  );
}

export function toggleSnippetPublish(id: string) {
  return request.patch<unknown, UpdateSnippetData>(`/snippet/${id}/published`);
}

export function useGetSnippets(params: GetSnippetsRequest) {
  return useSWR(["/snippets", params], () => getSnippets(params));
}

export function useCreateSnippet() {
  return useSWRMutation<CreateSnippetData, Error, string, CreateSnippetRequest>(
    "/snippets",
    (_, { arg }) => createSnippet(arg),
  );
}

export function useGetSnippet(id: string, opts?: { enable?: boolean }) {
  const { enable = true } = opts ?? {};
  return useSWR(enable ? ["/snippet", id] : null, () => getSnippet(id));
}

export function useDeleteSnippet(id: string) {
  return useSWRMutation(`/snippet/${id}`, () => deleteSnippet(id));
}

export function useUpdateSnippet() {
  return useSWRMutation<UpdateSnippetData, Error, string, UpdateSnippetRequest>(
    "/snippet",
    (_, { arg }) => updateSnippet(arg),
  );
}

export function useToggleSnippetPublish(id: string) {
  return useSWRMutation<UpdateSnippetData, Error, string>(
    `/snippet/${id}/published`,
    () => toggleSnippetPublish(id),
  );
}
