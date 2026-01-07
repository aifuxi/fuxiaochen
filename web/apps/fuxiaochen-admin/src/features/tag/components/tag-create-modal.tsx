import { useRef } from "react";

import { Button, Form, Spin } from "@douyinfe/semi-ui-19";
import NiceModal from "@ebay/nice-modal-react";
import { useRequest } from "ahooks";
import type { TagCreateReq } from "fuxiaochen-types";

import type { SemiFormApi } from "@/types/semi";

import NiceSemiModal from "@/components/nice-semi-modal";

import { toSlug } from "@/libs/slug";
import { showSuccessToast } from "@/libs/toast";

import { slugValidatorRule } from "@/utils/validator";

import { createTag, getTagDetail, updateTag } from "@/api/tag";

interface Props {
  onSuccess?: () => void;
  tagID?: string;
}

const TagCreateModal = NiceModal.create(({ onSuccess, tagID }: Props) => {
  const modal = NiceModal.useModal();

  const formRef = useRef<SemiFormApi<TagCreateReq>>(null);

  const { loading, run } = useRequest(createTag, {
    manual: true,
    onSuccess() {
      modal.remove();
      onSuccess?.();
      showSuccessToast("创建成功");
    },
  });

  const { loading: updateLoading, run: updateRun } = useRequest(updateTag, {
    manual: true,
    onSuccess() {
      modal.remove();
      onSuccess?.();
      showSuccessToast("更新成功");
    },
  });

  const { loading: detailLoading } = useRequest(() => getTagDetail(tagID!), {
    ready: Boolean(tagID),
    onSuccess(resp) {
      formRef.current?.setValues({
        name: resp?.data?.name,
        slug: resp?.data?.slug,
        description: resp?.data?.description,
      });
    },
  });

  const operationLoading = tagID ? updateLoading : loading;

  const handleSlugify = () => {
    formRef?.current?.setValue(
      "slug",
      toSlug(formRef.current?.getValue("slug") || ""),
    );
    formRef.current?.setError("slug", "");
  };

  return (
    <NiceSemiModal
      modal={modal}
      title={tagID ? "更新标签" : "创建新标签"}
      centered
      okButtonProps={{
        loading: operationLoading,
      }}
      onOk={() => {
        formRef.current?.submitForm();
      }}
    >
      <Spin spinning={detailLoading} block>
        <Form<TagCreateReq>
          getFormApi={(formApi) => (formRef.current = formApi)}
          disabled={operationLoading}
          layout="vertical"
          className="w-full"
          onSubmit={(values) => {
            if (tagID) {
              updateRun(tagID, {
                name: values.name,
                slug: values.slug,
                description: values.description,
              });
              return;
            }

            run({
              name: values.name,
              slug: values.slug,
              description: values.description,
            });
          }}
        >
          <Form.Input
            field="name"
            label="标签名称"
            size="large"
            showClear
            placeholder="请输入标签名称"
            rules={[{ required: true, message: "请输入标签名称" }]}
            extraText="这将是它在站点上显示的名字"
          ></Form.Input>
          <Form.Input
            field="slug"
            label="标签别名"
            size="large"
            showClear
            placeholder="请输入标签别名"
            rules={[
              { required: true, message: "请输入标签别名" },
              slugValidatorRule,
            ]}
            extraText="「别名」是在 URL 中使用的别称，仅支持小写字母、数字和短横线(-)"
            onBlur={handleSlugify}
            suffix={
              <Button type="primary" theme="solid" onClick={handleSlugify}>
                格式化
              </Button>
            }
          ></Form.Input>
          <Form.TextArea
            field="description"
            label="标签描述"
            showClear
            placeholder="请输入标签描述"
            rules={[{ required: true, message: "请输入标签描述" }]}
          ></Form.TextArea>
        </Form>
      </Spin>
    </NiceSemiModal>
  );
});

export default TagCreateModal;
