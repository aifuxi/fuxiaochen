import NiceModal from "@ebay/nice-modal-react";
import NiceSemiModal from "@/components/nice-semi-modal";
import { deleteUser } from "@/api/user";
import { useRequest } from "ahooks";
import { showSuccessToast } from "@/libs/toast";

interface Props {
  onSuccess?: () => void;
  userID: string;
}

const UserDeleteModal = NiceModal.create(
  ({ onSuccess, userID }: Props) => {
    const modal = NiceModal.useModal();

    const { loading, run } = useRequest(deleteUser, {
      manual: true,
      onSuccess() {
        modal.remove();
        onSuccess?.();
        showSuccessToast("删除成功");
      },
    });

    return (
      <NiceSemiModal
        modal={modal}
        title="删除用户"
        centered
        okButtonProps={{
          loading: loading,
          type: "danger",
        }}
        onOk={() => {
          run(userID);
        }}
      >
        你确定要删除该用户吗？
      </NiceSemiModal>
    );
  }
);

export default UserDeleteModal;
