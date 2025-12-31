import NiceModal from "@ebay/nice-modal-react";
import NiceSemiModal from "@/components/nice-semi-modal";

import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/route";

interface Props {
  onOK?: () => void;
}

const BlogCreatedModal = NiceModal.create(({ onOK }: Props) => {
  const modal = NiceModal.useModal();
  const navigate = useNavigate();

  return (
    <NiceSemiModal
      modal={modal}
      title="博客创建成功"
      centered
      okButtonProps={{
        type: "primary",
      }}
      okText="继续创建"
      onOk={() => {
        onOK?.();
        modal.remove();
      }}
      onCancel={(_) => {
        navigate(ROUTES.BlogList.href);
      }}
    >
      博客创建成功，是否继续创建新博客？
    </NiceSemiModal>
  );
});

export default BlogCreatedModal;
