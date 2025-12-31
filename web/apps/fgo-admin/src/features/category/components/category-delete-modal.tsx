import NiceModal from "@ebay/nice-modal-react";
import NiceSemiModal from "@/components/nice-semi-modal";
import { deleteCategory } from "@/api/category";
import { useRequest } from "ahooks";
import { showSuccessToast } from "@/libs/toast";

interface Props {
  onSuccess?: () => void;
  categoryID: string;
}

const CategoryDeleteModal = NiceModal.create(
  ({ onSuccess, categoryID }: Props) => {
    const modal = NiceModal.useModal();

    const { loading, run } = useRequest(deleteCategory, {
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
        title="删除分类"
        centered
        okButtonProps={{
          loading: loading,
          type: "danger",
        }}
        onOk={() => {
          run(categoryID);
        }}
      >
        你确定要删除该分类吗？
      </NiceSemiModal>
    );
  }
);

export default CategoryDeleteModal;
