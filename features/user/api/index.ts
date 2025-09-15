"use client";

import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { request } from "@/lib/request";

import {
  type CreateUserData,
  type CreateUserRequest,
  type GetUserData,
  type GetUsersData,
  type GetUsersRequest,
  type UpdateUserData,
  type UpdateUserRequest,
} from "../types";

export function getUsers(params: GetUsersRequest) {
  return request.get<unknown, GetUsersData>("/users", { params });
}

export function createUser(params: CreateUserRequest) {
  return request.post<unknown, CreateUserData>("/users", params);
}

export function getUser(id: string) {
  return request.get<unknown, GetUserData>(`/user/${id}`);
}

export function deleteUser(id: string) {
  return request.delete<unknown, void>(`/user/${id}`);
}

export function updateUser(params: UpdateUserRequest) {
  return request.put<unknown, UpdateUserData>(`/user/${params.id}`, params);
}

export function useGetUsers(params: GetUsersRequest) {
  return useSWR(["/users", params], () => getUsers(params));
}

export function useCreateUser() {
  return useSWRMutation<CreateUserData, Error, string, CreateUserRequest>(
    "/users",
    (_, { arg }) => createUser(arg),
  );
}

export function useGetUser(id: string, opts?: { enable?: boolean }) {
  const { enable = true } = opts ?? {};
  return useSWR(enable ? ["/user", id] : null, () => getUser(id));
}

export function useDeleteUser(id: string) {
  return useSWRMutation(`/user/${id}`, () => deleteUser(id));
}

export function useUpdateUser() {
  return useSWRMutation<UpdateUserData, Error, string, UpdateUserRequest>(
    "/user",
    (_, { arg }) => updateUser(arg),
  );
}
