import { useMutation } from "@tanstack/react-query";

import { login } from "./action";
import { type LoginRequestType } from "./schema";

type LoginResponseType = Awaited<ReturnType<typeof login>>;

export function useLogin() {
  const mutation = useMutation<LoginResponseType, Error, LoginRequestType>({
    mutationFn: async (json) => {
      const resp = await login(json);

      if (resp.code) {
        throw Error(resp.msg as string);
      }
      return resp;
    },
  });

  return mutation;
}
