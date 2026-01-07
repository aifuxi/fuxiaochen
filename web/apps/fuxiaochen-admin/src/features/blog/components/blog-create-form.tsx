import { useRef } from "react";
import { useNavigate } from "react-router-dom";

import { Banner, Button, Form, Spin, Typography } from "@douyinfe/semi-ui-19";
import NiceModal from "@ebay/nice-modal-react";
import { useRequest } from "ahooks";
import { isEmpty } from "es-toolkit/compat";
import type { BlogCreateReq } from "fuxiaochen-types";

import type { SemiFormApi } from "@/types/semi";

import BytemdField from "@/components/bytemd-field";

import { toSlug } from "@/libs/slug";
import { showSuccessToast } from "@/libs/toast";

import { slugValidatorRule } from "@/utils/validator";

import { createBlog, getBlogDetail, updateBlog } from "@/api/blog";
import { ROUTES } from "@/constants/route";
import useBlogDraftStore from "@/stores/use-blog-draft-store";

import BlogCreatedModal from "./blog-created-modal";
import { CategoryField } from "./category-field";
import { TagField } from "./tag-field";

interface Props {
  id?: string;
}

export default function BlogCreateForm({ id }: Props) {
  const formRef = useRef<SemiFormApi<BlogCreateReq>>(null);
  const navigate = useNavigate();
  const draft = useBlogDraftStore((s) => s.draft);
  const setDraft = useBlogDraftStore((s) => s.setDraft);
  const clearDraft = useBlogDraftStore((s) => s.clearDraft);

  const { loading, run } = useRequest(createBlog, {
    manual: true,
    onSuccess() {
      showSuccessToast("创建成功");
      clearDraft();
      NiceModal.show(BlogCreatedModal, {
        onOK: () => {
          formRef.current?.reset();
        },
      });
    },
  });

  const { loading: updateLoading, run: updateRun } = useRequest(updateBlog, {
    manual: true,
    onSuccess() {
      showSuccessToast("更新成功");
      clearDraft();
      navigate(ROUTES.BlogList.href);
    },
  });

  const { loading: detailLoading } = useRequest(() => getBlogDetail(id!), {
    ready: Boolean(id),
    onSuccess(resp) {
      formRef.current?.setValues({
        title: resp?.data?.title,
        slug: resp?.data?.slug,
        description: resp?.data?.description,
        content: resp?.data?.content,
        published: resp?.data?.published,
        featured: resp?.data?.featured,
        categoryID: resp?.data?.categoryID,
        tagIDs: resp?.data?.tags?.map((tag) => tag?.id) ?? [],
        cover: resp?.data?.cover,
      });
    },
  });

  const handleSlugify = () => {
    formRef?.current?.setValue(
      "slug",
      toSlug(formRef.current?.getValue("slug") || ""),
    );
    formRef.current?.setError("slug", "");
  };

  return (
    <Spin spinning={detailLoading} block>
      <div>
        {!isEmpty(draft) && (
          <div className="my-4">
            <Banner
              bordered
              fullMode={false}
              type="info"
              title={null}
              closeIcon={null}
              description={
                <div>
                  存在一个草稿，是否加载？
                  <Typography.Text
                    link
                    onClick={() => {
                      formRef.current?.setValues(draft);
                    }}
                  >
                    加载
                  </Typography.Text>
                </div>
              }
            />
          </div>
        )}
        <Form<BlogCreateReq>
          getFormApi={(formApi) => (formRef.current = formApi)}
          layout="vertical"
          disabled={loading || detailLoading || updateLoading}
          className="w-full"
          onSubmit={(values) => {
            if (id) {
              updateRun(id, values);
              return;
            }
            run(values);
          }}
          initValues={{
            title: "",
            slug: "",
            description: "",
            content: "",
            published: true,
            featured: false,
          }}
          onChange={({ values }) => {
            setDraft(values ?? null);
          }}
        >
          <Form.Input
            field="title"
            label="标题"
            size="large"
            showClear
            placeholder="请输入标题"
            rules={[{ required: true, message: "请输入标题" }]}
            extraText="这将是它在站点上显示的标题"
          ></Form.Input>
          <Form.Input
            field="slug"
            label="别名"
            size="large"
            showClear
            prefix="https://fuxiaochen.com/blog/"
            placeholder="请输入别名"
            rules={[
              { required: true, message: "请输入别名" },
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
            label="描述"
            showClear
            placeholder="请输入描述"
            rules={[{ required: true, message: "请输入描述" }]}
          ></Form.TextArea>
          <CategoryField
            field="categoryID"
            label="分类"
            placeholder="请选择博客分类"
            showClear
          />
          <TagField
            field="tagIDs"
            multiple
            label="标签"
            placeholder="请选择博客标签"
            showClear
          />
          <Form.Switch
            field="published"
            label="是否发布"
            size="large"
            rules={[{ required: true, message: "请选择是否发布" }]}
          ></Form.Switch>

          <Form.Switch
            field="featured"
            label="是否设为精选"
            size="large"
            rules={[{ required: true, message: "请选择是否精选" }]}
          ></Form.Switch>

          <BytemdField
            field="content"
            label="内容"
            showClear
            placeholder="请输入内容"
            rules={[{ required: true, message: "请输入内容" }]}
          ></BytemdField>

          <Form.Slot noLabel>
            <Button
              block
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading || updateLoading}
            >
              {id ? "更新" : "创建"}
            </Button>
          </Form.Slot>
        </Form>
      </div>
    </Spin>
  );
}
