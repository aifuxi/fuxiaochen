import { useRef } from "react";

import { Form, Spin } from "@douyinfe/semi-ui-19";
import NiceModal from "@ebay/nice-modal-react";
import { useRequest } from "ahooks";

import type { SemiFormApi } from "@/types/semi";

import NiceSemiModal from "@/components/nice-semi-modal";

import { showSuccessToast } from "@/libs/toast";

import { createUser, getUserDetail, updateUser } from "@/api/user";
import { roleCodeOptions } from "@/constants/role-codes";

interface Props {
  onSuccess?: () => void;
  userID?: string;
}

interface FormValues {
  nickname: string;
  email: string;
  password?: string;
  role: string;
}

const UserCreateModal = NiceModal.create(({ onSuccess, userID }: Props) => {
  const modal = NiceModal.useModal();

  const formRef = useRef<SemiFormApi<FormValues>>(null);

  const { loading, run } = useRequest(createUser, {
    manual: true,
    onSuccess() {
      modal.remove();
      onSuccess?.();
      showSuccessToast("创建成功");
    },
  });

  const { loading: updateLoading, run: updateRun } = useRequest(updateUser, {
    manual: true,
    onSuccess() {
      modal.remove();
      onSuccess?.();
      showSuccessToast("更新成功");
    },
  });

  const { loading: detailLoading } = useRequest(() => getUserDetail(userID!), {
    ready: Boolean(userID),
    onSuccess(resp) {
      formRef.current?.setValues({
        nickname: resp?.data?.nickname,
        email: resp?.data?.email,
        role: resp?.data?.role,
      });
    },
  });

  const operationLoading = userID ? updateLoading : loading;

  return (
    <NiceSemiModal
      modal={modal}
      title={userID ? "更新用户" : "创建新用户"}
      centered
      okButtonProps={{
        loading: operationLoading,
      }}
      onOk={() => {
        formRef.current?.submitForm();
      }}
    >
      <Spin spinning={detailLoading} block>
        <Form<FormValues>
          getFormApi={(formApi) => (formRef.current = formApi)}
          disabled={operationLoading}
          layout="vertical"
          className="w-full"
          onSubmit={(values) => {
            if (userID) {
              updateRun(userID, {
                nickname: values.nickname,
                email: values.email,
                role: values.role,
              });
              return;
            }

            run({
              nickname: values.nickname,
              email: values.email,
              password: values.password!,
              role: values.role,
            });
          }}
        >
          <Form.Input
            field="nickname"
            label="昵称"
            size="large"
            showClear
            placeholder="请输入昵称"
            rules={[{ required: true, message: "请输入昵称" }]}
          ></Form.Input>
          <Form.Input
            field="email"
            label="邮箱"
            size="large"
            showClear
            placeholder="请输入邮箱"
            rules={[
              { required: true, message: "请输入邮箱" },
              { type: "email", message: "请输入有效的邮箱地址" },
            ]}
          ></Form.Input>
          {userID ? null : (
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
          )}
          <Form.Select
            field="role"
            label="角色"
            showClear
            placeholder="请选择角色"
            rules={[{ required: true, message: "请选择角色" }]}
            optionList={roleCodeOptions}
          />
        </Form>
      </Spin>
    </NiceSemiModal>
  );
});

export default UserCreateModal;
