import { SideSheet } from "@douyinfe/semi-ui-19";
import type { NiceModalHandler } from "@ebay/nice-modal-react";

interface Props extends React.ComponentProps<typeof SideSheet> {
  modal: NiceModalHandler;
}

export default function NiceSemiSideSheet(props: Props) {
  const { modal, onCancel, children, keepDOM = false, ...rest } = props;

  const handleClose = () => {
    if (!keepDOM) {
      modal.remove();
    } else {
      modal.hide();
    }
  };

  return (
    <SideSheet
      {...rest}
      keepDOM={keepDOM}
      visible={modal.visible}
      onCancel={(e) => {
        onCancel?.(e);
        handleClose();
      }}
    >
      {children}
    </SideSheet>
  );
}
