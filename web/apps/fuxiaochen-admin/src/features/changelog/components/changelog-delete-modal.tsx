import NiceModal from "@ebay/nice-modal-react";
import { useRequest } from "ahooks";

import NiceSemiModal from "@/components/nice-semi-modal";

import { showSuccessToast } from "@/libs/toast";

import { deleteChangelog } from "@/api/changelog";

interface Props {
  onSuccess?: () => void;
  changelogID: string;
}

const ChangelogDeleteModal = NiceModal.create(
  ({ onSuccess, changelogID }: Props) => {
    const modal = NiceModal.useModal();

    const { loading, run } = useRequest(deleteChangelog, {
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
        title="删除更新日志"
        centered
        okButtonProps={{
          loading: loading,
          type: "danger",
        }}
        onOk={() => {
          run(changelogID);
        }}
      >
        你确定要删除该更新日志吗？
      </NiceSemiModal>
    );
  },
);

export default ChangelogDeleteModal;
