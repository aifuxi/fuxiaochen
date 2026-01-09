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
import type { Changelog, ChangelogListReq } from "fuxiaochen-types";

import type { SemiFormApi, SemiTableColumnProps } from "@/types/semi";

import ContentLayout from "@/components/content-layout";

import { useSemiTable } from "@/hooks/use-semi-table";
import { toModifiedISO8601 } from "@/libs/date";

import { getChangelogList } from "@/api/changelog";
import { ROUTES } from "@/constants/route";
import ChangelogCreateModal from "@/features/changelog/components/changelog-create-modal";
import ChangelogDeleteModal from "@/features/changelog/components/changelog-delete-modal";

type FormValues = Pick<ChangelogListReq, "version">;

export default function ChangelogListPage() {
  const formRef = useRef<SemiFormApi<FormValues>>(null);

  const { tableProps, search, refresh } = useSemiTable(getChangelogList, {
    formApi: formRef,
  });

  const { submit, reset } = search;

  const columns: SemiTableColumnProps<Changelog>[] = [
    {
      title: "版本号",
      width: 150,
      ellipsis: true,
      render: (_, record) => record.version,
    },
    {
      title: "更新内容",
      width: 400,
      ellipsis: true,
      render: (_, record) => record.content,
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
      width: 200,
      fixed: "right",
      render: (_, record) => {
        return (
          <div className="flex gap-4">
            <Button
              icon={<IconEdit />}
              onClick={() => {
                NiceModal.show(ChangelogCreateModal, {
                  changelogID: record.id,
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
                NiceModal.show(ChangelogDeleteModal, {
                  changelogID: record.id,
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
      title="更新日志"
      routes={[
        {
          href: ROUTES.Home.href,
          name: ROUTES.Home.name,
        },
        {
          href: ROUTES.Changelog.href,
          name: ROUTES.Changelog.name,
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
              field="version"
              label="版本号"
              size="large"
              showClear
              placeholder="请输入版本号"
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
                <Button
                  type="primary"
                  icon={<IconRefresh2 />}
                  onClick={reset}
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
              NiceModal.show(ChangelogCreateModal, {
                onSuccess: refresh,
              });
            }}
          >
            创建更新日志
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
