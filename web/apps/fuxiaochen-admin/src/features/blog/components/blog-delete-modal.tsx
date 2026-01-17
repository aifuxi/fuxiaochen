import NiceModal from "@ebay/nice-modal-react";
import { useRequest } from "ahooks";

import NiceSemiModal from "@/components/nice-semi-modal";

import { showSuccessToast } from "@/libs/toast";

import { deleteBlog } from "@/api/blog";

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
      modal.remove();
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
