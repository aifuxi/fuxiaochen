import NiceModal from "@ebay/nice-modal-react";
import NiceSemiModal from "@/components/nice-semi-modal";
import { deleteBlog } from "@/api/blog";
import { useRequest } from "ahooks";
import { showSuccessToast } from "@/libs/toast";

interface Props {
  onSuccess?: () => void;
  blogID: string;
}

const BlogDeleteModal = NiceModal.create(({ onSuccess, blogID }: Props) => {
  const modal = NiceModal.useModal();

  const { loading, run } = useRequest(deleteBlog, {
    manual: true,
    onSuccess() {
      onSuccess?.();
      showSuccessToast("删除成功");
    },
  });

  return (
    <NiceSemiModal
      modal={modal}
      title="删除博客"
      centered
      okButtonProps={{
        loading: loading,
        type: "danger",
      }}
      onOk={() => {
        run(blogID);
      }}
    >
      你确定要删除该博客吗？
    </NiceSemiModal>
  );
});

export default BlogDeleteModal;

