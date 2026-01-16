import { useRef } from "react";

import {
  IconDelete,
  IconEdit,
  IconLock,
  IconPlusCircle,
  IconRefresh2,
  IconSearch,
} from "@douyinfe/semi-icons";
import { Button, Form, Table, Tag } from "@douyinfe/semi-ui-19";
import NiceModal from "@ebay/nice-modal-react";
import type { UserListReq, UserResp } from "fuxiaochen-types";

import type { SemiFormApi, SemiTableColumnProps } from "@/types/semi";

import ContentLayout from "@/components/content-layout";

import { toModifiedISO8601 } from "@/libs/date";

import { getUserList } from "@/api/user";
import { ROLE_CODES, roleCodeMap } from "@/constants/role-codes";
import { ROUTES } from "@/constants/route";
import UserBanChanger from "@/features/user/components/user-ban-changer";
import UserCreateModal from "@/features/user/components/user-create-modal";
import UserDeleteModal from "@/features/user/components/user-delete-modal";
import UserPasswordModal from "@/features/user/components/user-password-modal";
import { useSemiTable } from "@/hooks/use-semi-table";

type FormValues = Pick<UserListReq, "nickname" | "email">;

export default function UserPage() {
  const formRef = useRef<SemiFormApi<FormValues>>(null);

  const { tableProps, search, refresh } = useSemiTable(getUserList, {
    formApi: formRef,
  });

  const { submit, reset } = search;

  const columns: SemiTableColumnProps<UserResp>[] = [
    {
      title: "昵称",
      width: 150,
      ellipsis: true,
      render: (_, record) => record.nickname,
    },
    {
      title: "邮箱",
      width: 200,
      ellipsis: true,
      render: (_, record) => record.email,
    },
    {
      title: "角色",
      width: 200,
      render: (_, record) => {
        return (
          <Tag color={record.role === ROLE_CODES.Admin ? "red" : "blue"}>
            {roleCodeMap[record.role]}
          </Tag>
        );
      },
    },
    {
      title: "禁用状态",
      width: 200,
      ellipsis: true,
      render: (_, record) => (
        <UserBanChanger
          currentBanned={record.banned}
          userID={record.id}
          onSuccess={refresh}
        />
      ),
    },
    {
      title: "禁用时间",
      width: 200,
      ellipsis: true,
      render: (_, record) =>
        record.bannedAt ? toModifiedISO8601(record.bannedAt) : "-",
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
      width: 360,
      fixed: "right",
      render: (_, record) => {
        return (
          <div className="flex gap-4">
            <Button
              icon={<IconEdit />}
              onClick={() => {
                NiceModal.show(UserCreateModal, {
                  userID: record.id,
                  onSuccess: refresh,
                });
              }}
            >
              编辑
            </Button>
            <Button
              icon={<IconLock />}
              type="secondary"
              onClick={() => {
                NiceModal.show(UserPasswordModal, {
                  userID: record.id,
                  onSuccess: refresh,
                });
              }}
            >
              更新密码
            </Button>
            <Button
              icon={<IconDelete />}
              type="danger"
              onClick={() => {
                NiceModal.show(UserDeleteModal, {
                  userID: record.id,
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
      title="用户管理"
      routes={[
        {
          href: ROUTES.Home.href,
          name: ROUTES.Home.name,
        },
        {
          href: ROUTES.User?.href ?? "/user",
          name: ROUTES.User?.name ?? "用户",
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
              field="nickname"
              label="昵称"
              size="large"
              showClear
              placeholder="请输入昵称"
              onEnterPress={submit}
            ></Form.Input>
            <Form.Input
              field="email"
              label="邮箱"
              size="large"
              showClear
              placeholder="请输入邮箱"
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
              NiceModal.show(UserCreateModal, {
                onSuccess: refresh,
              });
            }}
          >
            创建新用户
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
