import {
  IllustrationNoAccess,
  IllustrationNoAccessDark,
} from "@douyinfe/semi-illustrations";
import { Empty } from "@douyinfe/semi-ui-19";

import { ROLE_CODES } from "@/constants/role-codes";
import useUserStore from "@/stores/use-user-store";

interface Props extends React.PropsWithChildren {
  requireAdmin?: boolean;
}

export default function ProtectRoute({ children, requireAdmin }: Props) {
  const userInfo = useUserStore((state) => state.userInfo);

  if (userInfo?.role === ROLE_CODES.Admin || !requireAdmin) {
    return children;
  }

  return (
    <Empty
      image={<IllustrationNoAccess className="size-60" />}
      darkModeImage={<IllustrationNoAccessDark className="size-60" />}
      description={"没有权限"}
      className="w-full h-full justify-center"
    />
  );
}
