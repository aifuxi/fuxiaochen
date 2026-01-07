import {
  IllustrationNoAccess,
  IllustrationNoAccessDark,
} from "@douyinfe/semi-illustrations";
import { Empty } from "@douyinfe/semi-ui-19";

import {
  PERMISSION_CODES,
  type PermissionCode,
} from "@/constants/permission-codes";
import useUserStore from "@/stores/use-user-store";

interface Props extends React.PropsWithChildren {
  /**
   * 有一个权限码满足即可访问
   */
  requireSomePermissionCodes?: PermissionCode[];
  /**
   * 所有权限码都需要满足才能访问
   */
  requireAllPermissionCodes?: PermissionCode[];
}

export default function ProtectRoute({
  children,
  requireSomePermissionCodes,
  requireAllPermissionCodes,
}: Props) {
  const userInfo = useUserStore((state) => state.userInfo);

  const permissionCodes =
    userInfo?.roles?.reduce((prev, cur) => {
      const s = cur.permissions?.map((item) => item.code) ?? [];
      return [...prev, ...s];
    }, [] as string[]) ?? [];

  const requireSomePermissionCodesTemp = [
    ...(requireSomePermissionCodes ?? []),
    PERMISSION_CODES.PermissionAdminAll,
  ];

  const hasSomePermission =
    requireSomePermissionCodesTemp?.some((item) =>
      permissionCodes.includes(item),
    ) ?? false;

  const hasEveryPermission =
    requireAllPermissionCodes?.every((item) =>
      permissionCodes.includes(item),
    ) ?? false;

  if (!userInfo || (!hasSomePermission && !hasEveryPermission)) {
    return (
      <Empty
        image={<IllustrationNoAccess className="size-60" />}
        darkModeImage={<IllustrationNoAccessDark className="size-60" />}
        description={"没有权限"}
        className="w-full h-full justify-center"
      />
    );
  }

  return children;
}
