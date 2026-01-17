import { useRef } from "react";
import { useNavigate } from "react-router-dom";

import {
  IconDelete,
  IconEdit,
  IconPlusCircle,
  IconRefresh2,
  IconSearch,
} from "@douyinfe/semi-icons";
import { Button, Form, Image, Table } from "@douyinfe/semi-ui-19";
import NiceModal from "@ebay/nice-modal-react";
import type { Blog, BlogListReq } from "fuxiaochen-types";

import type { SemiFormApi, SemiTableColumnProps } from "@/types/semi";

import ContentLayout from "@/components/content-layout";

import { toModifiedISO8601 } from "@/libs/date";

import { getBlogList } from "@/api/blog";
import { ASSETS } from "@/constants/assets";
import { ROUTES } from "@/constants/route";
import BlogDeleteModal from "@/features/blog/components/blog-delete-modal";
import BlogFeaturedChanger from "@/features/blog/components/blog-featured-changer";
import BlogPublishedChanger from "@/features/blog/components/blog-published-changer";
import { useSemiTable } from "@/hooks/use-semi-table";

type FormValues = Pick<BlogListReq, "title" | "slug">;

export default function BlogListPage() {
  const navigate = useNavigate();
  const formRef = useRef<SemiFormApi<FormValues>>(null);

  const { tableProps, search, refresh } = useSemiTable(getBlogList, {
    formApi: formRef,
  });

  const { submit, reset } = search;

  const columns: SemiTableColumnProps<Blog>[] = [
    {
      title: "标题",
      width: 260,
      ellipsis: true,
      render: (_, record) => record.title,
    },
    {
      title: "封面",
      width: 260,
      render: (_, record) => (
        <Image
          width={240}
          height={135}
          src={record.cover || ASSETS.CoverPlaceholder}
        />
      ),
    },
    {
      title: "别名",
      width: 220,
      ellipsis: true,
      render: (_, record) => record.slug,
    },
    {
      title: "分类",
      width: 200,
      ellipsis: true,
      render: (_, record) => record.category?.name ?? "-",
    },
    {
      title: "发布状态",
      width: 200,
      render: (_, record) => (
        <BlogPublishedChanger
          currentPublished={record.published}
          blogID={record.id}
          onSuccess={refresh}
        />
      ),
    },
    {
      title: "是否精选",
      width: 200,
      render: (_, record) => (
        <BlogFeaturedChanger
          currentFeatured={record.featured}
          blogID={record.id}
          onSuccess={refresh}
        />
      ),
    },
    {
      title: "创建时间",
      width: 200,
      ellipsis: true,
      dataIndex: "createdAt",
      sorter: true,
      render: (_, record) => toModifiedISO8601(record.createdAt),
    },
    {
      title: "更新时间",
      width: 200,
      ellipsis: true,
      dataIndex: "updatedAt",
      sorter: true,
      render: (_, record) => toModifiedISO8601(record.updatedAt),
    },
    {
      title: "操作",
      width: 300,
      fixed: "right",
      render: (_, record) => {
        return (
          <div className="flex gap-4">
            <Button
              icon={<IconEdit />}
              onClick={() => {
                navigate(`${ROUTES.BlogCreate.href}?id=${record.id}`);
              }}
            >
              编辑
            </Button>
            <Button
              icon={<IconDelete />}
              type="danger"
              onClick={() => {
                NiceModal.show(BlogDeleteModal, {
                  blogID: record.id,
                  onSuccess: refresh,
                });
              }}
            >
              删除
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <ContentLayout
      title="博客列表"
      routes={[
        {
          href: ROUTES.Home.href,
          name: ROUTES.Home.name,
        },
        {
          href: ROUTES.BlogList.href,
          name: ROUTES.BlogList.name,
        },
      ]}
    >
      <div className="flex flex-col gap-6 pt-4">
        <div className="flex gap-4 ">
          <Form<FormValues>
            getFormApi={(formApi) => (formRef.current = formApi)}
            disabled={tableProps.loading}
            layout="horizontal"
            labelPosition="inset"
            className="w-full"
            onSubmit={submit}
            onReset={reset}
          >
            <Form.Input
              field="title"
              label="标题"
              size="large"
              showClear
              placeholder="请输入标题"
              onEnterPress={submit}
            ></Form.Input>
            <Form.Input
              field="slug"
              label="别名"
              size="large"
              showClear
              placeholder="请输入别名"
              onEnterPress={submit}
            ></Form.Input>
            <Form.Slot noLabel>
              <div className="flex gap-4 items-center h-10">
                <Button
                  type="primary"
                  theme="solid"
                  icon={<IconSearch />}
                  onClick={submit}
                >
                  搜索
                </Button>
                <Button type="primary" icon={<IconRefresh2 />} onClick={reset}>
                  重置
                </Button>
              </div>
            </Form.Slot>
          </Form>

          <Button
            type="primary"
            theme="solid"
            icon={<IconPlusCircle />}
            onClick={() => {
              navigate(ROUTES.BlogCreate.href);
            }}
          >
            新建博客
          </Button>
        </div>

        <div className="flex flex-col">
          <Table
            rowKey={(r) => r?.id ?? ""}
            columns={columns}
            {...tableProps}
          />
        </div>
      </div>
    </ContentLayout>
  );
}
