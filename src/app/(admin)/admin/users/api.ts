import { useQuery } from "@tanstack/react-query";

import { getUsers } from "./action";
import { type GetUsersRequestType } from "./schema";

type GetUsersResponseType = Awaited<ReturnType<typeof getUsers>>;

export function useGetUsers(data: GetUsersRequestType) {
  const query = useQuery<GetUsersResponseType, Error>({
    queryKey: ["getUsers", data],
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
