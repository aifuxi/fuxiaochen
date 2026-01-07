import { useRef } from "react";
import { useNavigate } from "react-router-dom";

import {
  IconDelete,
  IconEdit,
  IconEyeOpened,
  IconPlusCircle,
  IconRefresh2,
  IconSearch,
} from "@douyinfe/semi-icons";
import { Button, Form, Table } from "@douyinfe/semi-ui-19";
import NiceModal from "@ebay/nice-modal-react";
import { useRequest, useSetState } from "ahooks";
import { isNumber } from "es-toolkit/compat";
import type { Blog, BlogListReq } from "fuxiaochen-types";

import type {
  SemiFormApi,
  SemiTableColumnProps,
  SemiTableOnChange,
} from "@/types/semi";

import ContentLayout from "@/components/content-layout";

import { toModifiedISO8601 } from "@/libs/date";

import { getBlogList } from "@/api/blog";
import { ROUTES } from "@/constants/route";
import BlogDeleteModal from "@/features/blog/components/blog-delete-modal";
import BlogFeaturedChanger from "@/features/blog/components/blog-featured-changer";
import BlogPublishedChanger from "@/features/blog/components/blog-published-changer";

type FormValues = Pick<BlogListReq, "title" | "slug">;

export default function BlogListPage() {
  const navigate = useNavigate();

  const [req, setReq] = useSetState<BlogListReq>({
    page: 1,
    pageSize: 10,
  });

  const formRef = useRef<SemiFormApi<FormValues>>(null);

  const { data, loading, refresh } = useRequest(() => getBlogList(req), {
    refreshDeps: [
      req.page,
      req.pageSize,
      req.title,
      req.slug,
      req.sortBy,
      req.order,
    ],
  });

  const columns: SemiTableColumnProps<Blog>[] = [
    {
      title: "标题",
      width: 260,
      ellipsis: true,
      render: (_, record) => record.title,
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
                navigate(`${ROUTES.BlogCreate.href}?id=${record.id}`);
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
                NiceModal.show(BlogDeleteModal, {
                  blogID: record.id,
                  onSuccess: () => {
                    // 删除成功后重新拉取列表
                    setReq((prev) => ({ ...prev }));
                  },
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
            disabled={loading}
            layout="horizontal"
            labelPosition="inset"
            className="w-full"
            onSubmit={(values) => {
              setReq((pre) => ({
                ...pre,
                title: values.title?.trim(),
                slug: values.slug?.trim(),
                page: 1,
              }));
            }}
            onReset={() => {
              setReq((pre) => ({
                ...pre,
                page: 1,
                title: undefined,
                slug: undefined,
              }));
            }}
          >
            <Form.Input
              field="title"
              label="标题"
              size="large"
              showClear
              placeholder="请输入标题"
              onEnterPress={handleSubmit}
            ></Form.Input>
            <Form.Input
              field="slug"
              label="别名"
              size="large"
              showClear
              placeholder="请输入别名"
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
