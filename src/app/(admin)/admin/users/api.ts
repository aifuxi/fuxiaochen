import { useMutation, useQuery } from "@tanstack/react-query";

import {
  createUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser,
  updateUserBanned,
} from "./action";
import {
  type CreateUserRequestType,
  type GetUsersRequestType,
  type UpdateUserBannedRequestType,
  type UpdateUserRequestType,
} from "./schema";

type GetUsersResponseType = Awaited<ReturnType<typeof getUsers>>;

export const GET_USERS_KEY = "getUsers";

export function useGetUsers(data: GetUsersRequestType) {
  const query = useQuery<GetUsersResponseType, Error>({
    queryKey: [GET_USERS_KEY, data],
    queryFn: async () => {
      const resp = await getUsers(data);

      if (resp.code) {
        throw Error(resp.msg as string);
      }
      return resp;
    },
  });

  return query;
}

type DeleteUserResponseType = Awaited<ReturnType<typeof deleteUser>>;

export function useDeleteUser() {
  const mutation = useMutation<DeleteUserResponseType, Error, number>({
    mutationFn: async (id) => {
      const resp = await deleteUser(id);

      if (resp.code) {
        throw Error(resp.msg as string);
      }
      return resp;
    },
  });

  return mutation;
}

type CreateUserResponseType = Awaited<ReturnType<typeof createUser>>;

export function useCreateUser() {
  const mutation = useMutation<
    CreateUserResponseType,
    Error,
    CreateUserRequestType
  >({
    mutationFn: async (json) => {
      const resp = await createUser(json);

      if (resp.code) {
        throw Error(resp.msg as string);
      }
      return resp;
    },
  });

  return mutation;
}

type UpdateUserResponseType = Awaited<ReturnType<typeof updateUser>>;

export function useUpdateUser() {
  const mutation = useMutation<
    UpdateUserResponseType,
    Error,
    UpdateUserRequestType
  >({
    mutationFn: async (json) => {
      const resp = await updateUser(json);

      if (resp.code) {
        throw Error(resp.msg as string);
      }
      return resp;
    },
  });

  return mutation;
}

type UpdateUserBannedResponseType = Awaited<
  ReturnType<typeof updateUserBanned>
>;

export function useUpdateUserBanned() {
  const mutation = useMutation<
    UpdateUserBannedResponseType,
    Error,
    UpdateUserBannedRequestType
  >({
    mutationFn: async (json) => {
      const resp = await updateUserBanned(json);

      if (resp.code) {
        throw Error(resp.msg as string);
      }
      return resp;
    },
  });

  return mutation;
}

type GetUserResponseType = Awaited<ReturnType<typeof getUser>>;

export function useGetUser(email?: string) {
  const query = useQuery<GetUserResponseType, Error>({
    queryKey: ["getUser", email],
    enabled: Boolean(email),
    staleTime: 0,
    queryFn: async () => {
      const resp = await getUser(email!);

      if (resp.code) {
        throw Error(resp.msg as string);
      }
      return resp;
    },
  });

  return query;
}
