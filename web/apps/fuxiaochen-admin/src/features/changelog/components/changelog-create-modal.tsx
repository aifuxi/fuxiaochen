import { useRef } from "react";

import { Form, Spin } from "@douyinfe/semi-ui-19";
import NiceModal from "@ebay/nice-modal-react";
import { useRequest } from "ahooks";
import type { ChangelogCreateReq } from "fuxiaochen-types";

import type { SemiFormApi } from "@/types/semi";

import NiceSemiModal from "@/components/nice-semi-modal";

import { showSuccessToast } from "@/libs/toast";

import {
  createChangelog,
  getChangelogDetail,
  updateChangelog,
} from "@/api/changelog";

interface Props {
  onSuccess?: () => void;
  changelogID?: string;
}

const ChangelogCreateModal = NiceModal.create(
  ({ onSuccess, changelogID }: Props) => {
    const modal = NiceModal.useModal();

    const formRef = useRef<SemiFormApi<ChangelogCreateReq>>(null);

    const { loading, run } = useRequest(createChangelog, {
      manual: true,
      onSuccess() {
        modal.remove();
        onSuccess?.();
        showSuccessToast("创建成功");
      },
    });

    const { loading: updateLoading, run: updateRun } = useRequest(
      updateChangelog,
      {
        manual: true,
        onSuccess() {
          modal.remove();
          onSuccess?.();
          showSuccessToast("更新成功");
        },
      },
    );

    const { loading: detailLoading } = useRequest(
      () => getChangelogDetail(changelogID!),
      {
        ready: Boolean(changelogID),
        onSuccess(resp) {
          formRef.current?.setValues({
            version: resp?.data?.version,
            content: resp?.data?.content,
          });
        },
      },
    );

    const operationLoading = changelogID ? updateLoading : loading;

    return (
      <NiceSemiModal
        modal={modal}
        title={changelogID ? "更新更新日志" : "创建更新日志"}
        centered
        okButtonProps={{
          loading: operationLoading,
        }}
        onOk={() => {
          formRef.current?.submitForm();
        }}
      >
        <Spin spinning={detailLoading} block>
          <Form<ChangelogCreateReq>
            getFormApi={(formApi) => (formRef.current = formApi)}
            disabled={operationLoading}
            layout="vertical"
            className="w-full"
            onSubmit={(values) => {
              if (changelogID) {
                updateRun(changelogID, {
                  version: values.version,
                  content: values.content,
                });
                return;
              }

              run({
                version: values.version,
                content: values.content,
              });
            }}
          >
            <Form.Input
              field="version"
              label="版本号"
              size="large"
              showClear
              placeholder="请输入版本号，如 v1.0.0"
              rules={[{ required: true, message: "请输入版本号" }]}
            ></Form.Input>
            <Form.TextArea
              field="content"
              label="更新内容"
              showClear
              placeholder="请输入更新内容"
              rules={[{ required: true, message: "请输入更新内容" }]}
              autosize={{ minRows: 4, maxRows: 10 }}
            ></Form.TextArea>
          </Form>
        </Spin>
      </NiceSemiModal>
    );
  },
);

export default ChangelogCreateModal;
