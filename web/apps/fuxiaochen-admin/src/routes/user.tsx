import { ROUTES } from "@/constants/route";
import ContentLayout from "@/components/content-layout";
import { Button, Form, Table, Tag } from "@douyinfe/semi-ui-19";
import {
	IconDelete,
	IconEdit,
	IconLock,
	IconPlusCircle,
	IconRefresh2,
	IconSearch,
} from "@douyinfe/semi-icons";
import { useRequest, useSetState } from "ahooks";
import { getUserList } from "@/api/user";
import NiceModal from "@ebay/nice-modal-react";
import UserCreateModal from "@/features/user/components/user-create-modal";
import UserDeleteModal from "@/features/user/components/user-delete-modal";
import { useRef } from "react";
import { toModifiedISO8601 } from "@/libs/date";
import { isNumber } from "es-toolkit/compat";
import type {
	SemiFormApi,
	SemiTableColumnProps,
	SemiTableOnChange,
} from "@/types/semi";
import UserBanChanger from "@/features/user/components/user-ban-changer";
import UserPasswordModal from "@/features/user/components/user-password-modal";
import type { UserListReq, UserResp } from "fuxiaochen-types";

type FormValues = Pick<UserListReq, "nickname" | "email">;

export default function UserPage() {
	const [req, setReq] = useSetState<UserListReq>({
		page: 1,
		pageSize: 10,
	});

	const formRef = useRef<SemiFormApi<FormValues>>(null);

	const { data, loading, refresh } = useRequest(() => getUserList(req), {
		refreshDeps: [
			req.page,
			req.pageSize,
			req.nickname,
			req.email,
			req.sortBy,
			req.order,
		],
	});

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
					<div className="flex gap-2 flex-wrap">
						{record.roles?.map((role) => (
							<Tag key={role.id} color="blue">
								{role.name}
							</Tag>
						))}
					</div>
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
						next.order =
							singleSorter.sortOrder === "ascend"
								? "asc"
								: "desc";
						next.page = 1;
					}
				}
			}

			return next;
		});
	};

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
						disabled={loading}
						layout="horizontal"
						labelPosition="inset"
						className="w-full"
						onSubmit={(values) => {
							setReq((pre) => ({
								...pre,
								nickname: values.nickname?.trim(),
								email: values.email?.trim(),
								page: 1,
							}));
						}}
						onReset={() => {
							setReq((pre) => ({
								...pre,
								page: 1,
								nickname: undefined,
								email: undefined,
							}));
						}}
					>
						<Form.Input
							field="nickname"
							label="昵称"
							size="large"
							showClear
							placeholder="请输入昵称"
							onEnterPress={handleSubmit}
						></Form.Input>
						<Form.Input
							field="email"
							label="邮箱"
							size="large"
							showClear
							placeholder="请输入邮箱"
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
						loading={loading}
						dataSource={data?.data?.lists ?? []}
						pagination={{
							total: isNumber(data?.data?.total)
								? data?.data?.total
								: Number(data?.data?.total ?? 0),
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
