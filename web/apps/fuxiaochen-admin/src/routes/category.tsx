import { ROUTES } from "@/constants/route";
import ContentLayout from "@/components/content-layout";
import { Button, Form, Table } from "@douyinfe/semi-ui-19";
import {
  IconDelete,
  IconEdit,
  IconEyeOpened,
  IconPlusCircle,
  IconRefresh2,
  IconSearch,
} from "@douyinfe/semi-icons";
import { useRequest, useSetState } from "ahooks";
import {
  getCategoryList,
  type Category,
  type CategoryListReq,
} from "@/api/category";
import NiceModal from "@ebay/nice-modal-react";
import CategoryCreateModal from "@/features/category/components/category-create-modal";
import { useRef } from "react";
import { toModifiedISO8601 } from "@/libs/date";
import CategoryDeleteModal from "@/features/category/components/category-delete-modal";
import { isNumber } from "es-toolkit/compat";
import type {
  SemiFormApi,
  SemiTableColumnProps,
  SemiTableOnChange,
} from "@/types/semi";

type FormValues = Pick<CategoryListReq, "name" | "slug">;

export default function Category() {
  const [req, setReq] = useSetState<CategoryListReq>({
    page: 1,
    pageSize: 10,
  });

  const formRef = useRef<SemiFormApi<FormValues>>(null);

  const { data, loading, refresh } = useRequest(() => getCategoryList(req), {
    refreshDeps: [
      req.page,
      req.pageSize,
      req.name,
      req.slug,
      req.sortBy,
      req.order,
    ],
  });

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
      sortOrder:
        req.sortBy === "createdAt"
          ? req.order === "asc"
            ? "ascend"
            : "descend"
          : false,
      render: (_, record) => toModifiedISO8601(record.createdAt),
    },
    {
      title: "更新时间",
      width: 200,
      ellipsis: true,
      dataIndex: "updatedAt",
      sorter: true,
      sortOrder:
        req.sortBy === "updatedAt"
          ? req.order === "asc"
            ? "ascend"
            : "descend"
          : false,
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
            <Button type="secondary" icon={<IconEyeOpened />}>
              查看
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

  const handleSubmit = () => {
    formRef.current?.submitForm();
  };

  const handleReset = () => {
    formRef.current?.reset();
  };

  const handleTableChange: SemiTableOnChange = ({ pagination, sorter }) => {
    setReq((prev) => {
      const next = { ...prev };

      if (pagination) {
        const { currentPage, pageSize } = pagination;
        if (pageSize && pageSize !== prev.pageSize) {
          next.pageSize = pageSize;
          next.page = 1;
        } else if (isNumber(currentPage) && currentPage !== prev.page) {
          next.page = currentPage;
        }
      }

      if (sorter && !Array.isArray(sorter)) {
        const singleSorter = sorter;

        if (!singleSorter.sortOrder) {
          next.sortBy = undefined;
          next.order = undefined;
        } else {
          const field = (singleSorter.sortField ??
            singleSorter.dataIndex) as string;

          if (field === "createdAt" || field === "updatedAt") {
            next.sortBy = field;
            next.order = singleSorter.sortOrder === "ascend" ? "asc" : "desc";
            next.page = 1;
          }
        }
      }

      return next;
    });
  };

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
            disabled={loading}
            layout="horizontal"
            labelPosition="inset"
            className="w-full"
            onSubmit={(values) => {
              setReq((pre) => ({
                ...pre,
                name: values.name?.trim(),
                slug: values.slug?.trim(),
                page: 1,
              }));
            }}
            onReset={() => {
              setReq((pre) => ({
                ...pre,
                page: 1,
                name: undefined,
                slug: undefined,
              }));
            }}
          >
            <Form.Input
              field="name"
              label="分类名称"
              size="large"
              showClear
              placeholder="请输入分类名称"
              onEnterPress={handleSubmit}
            ></Form.Input>
            <Form.Input
              field="slug"
              label="分类别名"
              size="large"
              showClear
              placeholder="请输入分类别名"
              onEnterPress={handleSubmit}
            ></Form.Input>
            <Form.Slot noLabel>
              <div className="flex gap-4 items-center h-10">
                <Button
                  type="primary"
                  theme="solid"
                  icon={<IconSearch />}
                  onClick={handleSubmit}
                >
                  搜索
                </Button>
                <Button
                  type="primary"
                  icon={<IconRefresh2 />}
                  onClick={handleReset}
                >
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
            loading={loading}
            dataSource={data?.data?.lists ?? []}
            pagination={{
              total: data?.data?.total ?? 0,
              pageSize: req.pageSize,
              currentPage: req.page,
              showSizeChanger: true,
            }}
            onChange={handleTableChange}
          />
        </div>
      </div>
    </ContentLayout>
  );
}
