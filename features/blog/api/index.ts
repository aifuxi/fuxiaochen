"use client";

import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { request } from "@/lib/request";

import {
  type CreateBlogData,
  type CreateBlogRequest,
  type GetBlogData,
  type GetBlogsData,
  type GetBlogsRequest,
  type UpdateBlogData,
  type UpdateBlogRequest,
} from "../types";

export function getBlogs(params: GetBlogsRequest) {
  return request.get<unknown, GetBlogsData>("/blogs", { params });
}

export function createBlog(params: CreateBlogRequest) {
  return request.post<unknown, CreateBlogData>("/blogs", params);
}

export function getBlog(id: string) {
  return request.get<unknown, GetBlogData>(`/blog/${id}`);
}

export function deleteBlog(id: string) {
  return request.delete<unknown, void>(`/blog/${id}`);
}

export function updateBlog(params: UpdateBlogRequest) {
  return request.put<unknown, UpdateBlogData>(`/blog/${params.id}`, params);
}

export function toggleBlogPublish(id: string) {
  return request.patch<unknown, UpdateBlogData>(`/blog/${id}/published`);
}

export function useGetBlogs(params: GetBlogsRequest) {
  return useSWR(["/blogs", params], () => getBlogs(params));
}

export function useCreateBlog() {
  return useSWRMutation<CreateBlogData, Error, string, CreateBlogRequest>(
    "/blogs",
    (_, { arg }) => createBlog(arg),
  );
}

export function useGetBlog(id: string, opts?: { enable?: boolean }) {
  const { enable = true } = opts ?? {};
  return useSWR(enable ? ["/blog", id] : null, () => getBlog(id));
}

export function useDeleteBlog(id: string) {
  return useSWRMutation(`/blog/${id}`, () => deleteBlog(id));
}

export function useUpdateBlog() {
  return useSWRMutation<UpdateBlogData, Error, string, UpdateBlogRequest>(
    "/blog",
    (_, { arg }) => updateBlog(arg),
  );
}

export function useToggleBlogPublish(id: string) {
  return useSWRMutation<UpdateBlogData, Error, string>(
    `/blog/${id}/published`,
    () => toggleBlogPublish(id),
  );
}
