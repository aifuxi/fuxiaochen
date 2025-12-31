import NiceModal from "@ebay/nice-modal-react";
import NiceSemiModal from "@/components/nice-semi-modal";

import { showSuccessToast } from "@/libs/toast";
import { setToken } from "@/utils/token";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/route";
import { useRequest } from "ahooks";
import { logout } from "@/api/user";
import useUserStore from "@/stores/use-user-store";

const LogoutConfirmModal = NiceModal.create(() => {
  const modal = NiceModal.useModal();
  const navigate = useNavigate();
  const clearUserInfo = useUserStore((state) => state.clearUserInfo);

  const { loading, run } = useRequest(logout, {
    manual: true,
    onSuccess: () => {
      setToken("");
      showSuccessToast("已退出登录");
      navigate(ROUTES.Login.href, { replace: true });
      clearUserInfo();
      modal.remove();
    },
  });

  return (
    <NiceSemiModal
      modal={modal}
      title="退出登录"
      centered
      okButtonProps={{
        loading,
      }}
      onOk={() => {
        run();
      }}
    >
      你确定要退出登录吗？
    </NiceSemiModal>
  );
});

export default LogoutConfirmModal;
