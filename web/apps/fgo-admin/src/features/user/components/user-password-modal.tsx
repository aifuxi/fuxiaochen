import NiceModal from "@ebay/nice-modal-react";
import NiceSemiModal from "@/components/nice-semi-modal";
import { Form } from "@douyinfe/semi-ui-19";
import { updateUserPassword } from "@/api/user";
import { useRequest } from "ahooks";
import { showSuccessToast } from "@/libs/toast";
import { useRef } from "react";
import type { SemiFormApi } from "@/types/semi";

interface Props {
  onSuccess?: () => void;
  userID: string;
}

interface FormValues {
  password: string;
}

const UserPasswordModal = NiceModal.create(({ onSuccess, userID }: Props) => {
  const modal = NiceModal.useModal();

  const formRef = useRef<SemiFormApi<FormValues>>(null);

  const { loading, run: updateRun } = useRequest(updateUserPassword, {
    manual: true,
    onSuccess() {
      onSuccess?.();
      showSuccessToast("更新成功");
      modal.remove();
    },
  });

  return (
    <NiceSemiModal
      modal={modal}
      title="更新密码"
      centered
      okButtonProps={{
        loading: loading,
      }}
      onOk={() => {
        formRef.current?.submitForm();
      }}
    >
      <Form<FormValues>
        getFormApi={(formApi) => (formRef.current = formApi)}
        disabled={loading}
        layout="vertical"
        className="w-full"
        onSubmit={(values) => {
          updateRun(userID, {
            password: values.password,
          });
        }}
      >
        <Form.Input
          field="password"
          label="密码"
          type="password"
          size="large"
          showClear
          placeholder="请输入密码"
          rules={[
            { required: true, message: "请输入密码" },
            { min: 6, message: "密码长度不能小于6位" },
            { max: 20, message: "密码长度不能大于20位" },
          ]}
        ></Form.Input>
      </Form>
    </NiceSemiModal>
  );
});

export default UserPasswordModal;
