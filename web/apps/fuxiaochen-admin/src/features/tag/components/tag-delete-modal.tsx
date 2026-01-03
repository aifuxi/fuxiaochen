import NiceModal from "@ebay/nice-modal-react";
import NiceSemiModal from "@/components/nice-semi-modal";
import { deleteTag } from "@/api/tag";
import { useRequest } from "ahooks";
import { showSuccessToast } from "@/libs/toast";

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
