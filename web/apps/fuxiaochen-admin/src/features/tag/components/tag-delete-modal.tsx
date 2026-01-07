import NiceModal from "@ebay/nice-modal-react";
import { useRequest } from "ahooks";

import NiceSemiModal from "@/components/nice-semi-modal";

import { showSuccessToast } from "@/libs/toast";

import { deleteTag } from "@/api/tag";

interface Props {
  onSuccess?: () => void;
  tagID: string;
}

const TagDeleteModal = NiceModal.create(({ onSuccess, tagID }: Props) => {
  const modal = NiceModal.useModal();

  const { loading, run } = useRequest(deleteTag, {
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
      title="删除标签"
      centered
      okButtonProps={{
        loading: loading,
        type: "danger",
      }}
      onOk={() => {
        run(tagID);
      }}
    >
      你确定要删除该标签吗？
    </NiceSemiModal>
  );
});

export default TagDeleteModal;
