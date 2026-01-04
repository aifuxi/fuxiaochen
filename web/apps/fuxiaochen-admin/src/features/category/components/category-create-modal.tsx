import NiceModal from "@ebay/nice-modal-react";
import NiceSemiModal from "@/components/nice-semi-modal";
import { Button, Form, Spin } from "@douyinfe/semi-ui-19";
import {
	createCategory,
	getCategoryDetail,
	updateCategory,
} from "@/api/category";
import { useRequest } from "ahooks";
import { showSuccessToast } from "@/libs/toast";
import { useRef } from "react";
import type { SemiFormApi } from "@/types/semi";
import { slugValidatorRule } from "@/utils/validator";
import { toSlug } from "@/libs/slug";
import type { CategoryCreateReq } from "fuxiaochen-types";

interface Props {
	onSuccess?: () => void;
	categoryID?: string;
}

const CategoryCreateModal = NiceModal.create(
	({ onSuccess, categoryID }: Props) => {
		const modal = NiceModal.useModal();

		const formRef = useRef<SemiFormApi<CategoryCreateReq>>(null);

		const { loading, run } = useRequest(createCategory, {
			manual: true,
			onSuccess() {
				modal.remove();
				onSuccess?.();
				showSuccessToast("创建成功");
			},
		});

		const { loading: updateLoading, run: updateRun } = useRequest(
			updateCategory,
			{
				manual: true,
				onSuccess() {
					modal.remove();
					onSuccess?.();
					showSuccessToast("更新成功");
				},
			}
		);

		const { loading: detailLoading } = useRequest(
			() => getCategoryDetail(categoryID!),
			{
				ready: Boolean(categoryID),
				onSuccess(resp) {
					formRef.current?.setValues({
						name: resp?.data?.name,
						slug: resp?.data?.slug,
						description: resp?.data?.description,
					});
				},
			}
		);

		const operationLoading = categoryID ? updateLoading : loading;

		const handleSlugify = () => {
			formRef?.current?.setValue(
				"slug",
				toSlug(formRef.current?.getValue("slug") || "")
			);
			formRef.current?.setError("slug", "");
		};

		return (
			<NiceSemiModal
				modal={modal}
				title={categoryID ? "更新分类" : "创建新分类"}
				centered
				okButtonProps={{
					loading: operationLoading,
				}}
				onOk={() => {
					formRef.current?.submitForm();
				}}
			>
				<Spin spinning={detailLoading} block>
					<Form<CategoryCreateReq>
						getFormApi={(formApi) => (formRef.current = formApi)}
						disabled={operationLoading}
						layout="vertical"
						className="w-full"
						onSubmit={(values) => {
							if (categoryID) {
								updateRun(categoryID, {
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
							label="分类名称"
							size="large"
							showClear
							placeholder="请输入分类名称"
							rules={[
								{ required: true, message: "请输入分类名称" },
							]}
							extraText="这将是它在站点上显示的名字"
						></Form.Input>
						<Form.Input
							field="slug"
							label="分类别名"
							size="large"
							showClear
							placeholder="请输入分类别名"
							rules={[
								{ required: true, message: "请输入分类别名" },
								slugValidatorRule,
							]}
							extraText="「别名」是在 URL 中使用的别称，仅支持小写字母、数字和短横线(-)"
							onBlur={handleSlugify}
							suffix={
								<Button
									type="primary"
									theme="solid"
									onClick={handleSlugify}
								>
									格式化
								</Button>
							}
						></Form.Input>
						<Form.TextArea
							field="description"
							label="分类描述"
							showClear
							placeholder="请输入分类描述"
							rules={[
								{ required: true, message: "请输入分类描述" },
							]}
						></Form.TextArea>
					</Form>
				</Spin>
			</NiceSemiModal>
		);
	}
);

export default CategoryCreateModal;
