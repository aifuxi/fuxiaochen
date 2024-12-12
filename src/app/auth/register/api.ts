import { useMutation } from "@tanstack/react-query";

import { register } from "./action";
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
