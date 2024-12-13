import { useMutation, useQuery } from "@tanstack/react-query";

import { checkAdminUserExist, register } from "./action";
import { type RegisterRequestType } from "./schema";

type RegisterResponseType = Awaited<ReturnType<typeof register>>;

export function useRegister() {
  const mutation = useMutation<
    RegisterResponseType,
    Error,
    RegisterRequestType
  >({
    mutationFn: async (json) => {
      const resp = await register(json);

      if (resp.code) {
        throw Error(resp.msg as string);
      }
      return resp;
    },
  });

  return mutation;
}

type CheckAdminUserExistResponseType = Awaited<
  ReturnType<typeof checkAdminUserExist>
>;

export function useCheckAdminUserExist() {
  const query = useQuery<CheckAdminUserExistResponseType, Error>({
    queryKey: ["checkAdminUserExist"],
    queryFn: async () => {
      const resp = await checkAdminUserExist();

      if (resp.code) {
        throw Error(resp.msg as string);
      }
      return resp;
    },
  });

  return query;
}
