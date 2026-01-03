import { Modal } from "@douyinfe/semi-ui-19";
import type { NiceModalHandler } from "@ebay/nice-modal-react";

interface Props extends React.ComponentProps<typeof Modal> {
  modal: NiceModalHandler;
}

export default function NiceSemiModal(props: Props) {
  const {
    modal,
    onCancel,
    onOk,
    afterClose,
    children,
    keepDOM = false,
    ...rest
  } = props;

  const handleClose = () => {
    if (!keepDOM) {
      modal.remove();
    } else {
      modal.hide();
    }
  };

  return (
    <Modal
      {...rest}
      visible={modal.visible}
      keepDOM={keepDOM}
      onOk={(e) => {
        onOk?.(e);
      }}
      onCancel={(e) => {
        onCancel?.(e);
        handleClose();
      }}
      onAfterClose={() => {
        afterClose?.();
        handleClose();
      }}
    >
      {children}
    </Modal>
  );
}
