import { updateUserBan } from "@/api/user";
import { Switch } from "@douyinfe/semi-ui-19";
import { useRequest } from "ahooks";

interface Props {
  currentBanned: boolean;
  userID: string;
  onSuccess?: () => void;
}

export default function UserBanChanger({ currentBanned, userID, onSuccess }: Props) {
  const { loading, run } = useRequest(
    (ban: boolean) => updateUserBan(userID, { ban }),
    {
      manual: true,
      onSuccess: () => {
        onSuccess?.();
      },
    }
  );

  return (
    <Switch
      defaultChecked={currentBanned}
      onChange={(v) => {
        run(v);
      }}
      loading={loading}
    />
  );
}
