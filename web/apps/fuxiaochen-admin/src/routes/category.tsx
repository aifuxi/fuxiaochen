import { useRef } from "react";

import {
  IconDelete,
  IconEdit,
  IconPlusCircle,
  IconRefresh2,
  IconSearch,
} from "@douyinfe/semi-icons";
import { Button, Form, Table } from "@douyinfe/semi-ui-19";
import NiceModal from "@ebay/nice-modal-react";
import type { Category, CategoryListReq } from "fuxiaochen-types";

import type { SemiFormApi, SemiTableColumnProps } from "@/types/semi";

import ContentLayout from "@/components/content-layout";

import { toModifiedISO8601 } from "@/libs/date";

import { getCategoryList } from "@/api/category";
import { ROUTES } from "@/constants/route";
import CategoryCreateModal from "@/features/category/components/category-create-modal";
import CategoryDeleteModal from "@/features/category/components/category-delete-modal";
import { useSemiTable } from "@/hooks/use-semi-table";

type FormValues = Pick<CategoryListReq, "name" | "slug">;

export default function CategoryListPage() {
  const formRef = useRef<SemiFormApi<FormValues>>(null);

  const { tableProps, search, refresh } = useSemiTable(getCategoryList, {
    formApi: formRef,
  });

  const { submit, reset } = search;

  const columns: SemiTableColumnProps<Category>[] = [
    {
      title: "分类名称",
      width: 200,
      ellipsis: true,
      render: (_, record) => record.name,
    },
    {
      title: "分类别名",
      width: 200,
      ellipsis: true,
      render: (_, record) => record.slug,
    },
    {
      title: "分类描述",
      width: 200,
      ellipsis: true,
      render: (_, record) => record.description,
    },
    {
      title: "博客数量",
      width: 100,
      ellipsis: true,
      render: (_, record) => record.blogCount,
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
                NiceModal.show(CategoryCreateModal, {
                  categoryID: record.id,
                  onSuccess: refresh,
                });
              }}
            >
              编辑
            </Button>
            <Button
              icon={<IconDelete />}
              type="danger"
              onClick={() => {
                NiceModal.show(CategoryDeleteModal, {
                  categoryID: record.id,
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
      title="分类"
      routes={[
        {
          href: ROUTES.Home.href,
          name: ROUTES.Home.name,
        },
        {
          href: ROUTES.Category.href,
          name: ROUTES.Category.name,
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
              field="name"
              label="分类名称"
              size="large"
              showClear
              placeholder="请输入分类名称"
              onEnterPress={submit}
            ></Form.Input>
            <Form.Input
              field="slug"
              label="分类别名"
              size="large"
              showClear
              placeholder="请输入分类别名"
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
              NiceModal.show(CategoryCreateModal, {
                onSuccess: refresh,
              });
            }}
          >
            创建新分类
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
