"use client";

import { toast } from "sonner";

import { Switch } from "@/components/ui/switch";

import { getQueryClient } from "@/lib/get-query-client";

import { GET_USERS_KEY, useUpdateUserBanned } from "../api";

type Props = {
  banned: boolean;
  id: number;
};

export const BannedSwitch = ({ banned, id }: Props) => {
  const queryClient = getQueryClient();
  const { mutate } = useUpdateUserBanned();

  const handleSwitchChange = (value: boolean) => {
    mutate(
      { id, banned: !value },
      {
        onSuccess: () => {
          toast.success("修改成功");

          void queryClient.invalidateQueries({
            queryKey: [GET_USERS_KEY],
          });
        },
        onError: (error) => {
          toast.error(`修改失败，${error}`);
        },
      },
    );
  };

  return <Switch checked={!banned} onCheckedChange={handleSwitchChange} />;
};
