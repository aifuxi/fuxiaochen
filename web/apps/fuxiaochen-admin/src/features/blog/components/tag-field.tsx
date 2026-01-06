import { Button, Form, useFieldApi } from "@douyinfe/semi-ui-19";
import { useMount, useRequest } from "ahooks";
import { getTagDetail, getTagList } from "@/api/tag";
import { useState } from "react";
import { IconRefresh } from "@douyinfe/semi-icons";
import NiceModal from "@ebay/nice-modal-react";
import TagCreateModal from "@/features/tag/components/tag-create-modal";

interface OptionItemType {
	value: string;
	label: string;
}

type TagFieldProps = Omit<
	React.ComponentProps<typeof Form.Select>,
	"optionList" | "loading"
>;

export function TagField(props: TagFieldProps) {
	const fieldApi = useFieldApi(props.field);
	const [options, setOptions] = useState<OptionItemType[]>([]);
	const [tagIDs, setTagIDs] = useState<string[]>([]);

	const { loading: detailLoading } = useRequest(
		() => Promise.all(tagIDs.map((id) => getTagDetail(id))),
		{
			ready: Boolean(tagIDs?.length),
			onSuccess(resp) {
				setOptions(
					resp.map(
						({ data }): OptionItemType => ({
							label: data?.name,
							value: data?.id,
						})
					)
				);
			},
		}
	);

	const { loading, run, refresh } = useRequest(
		(v: string) =>
			getTagList({
				page: 1,
				pageSize: 100,
				name: v,
			}),
		{
			manual: true,
			debounceWait: 500,
			onSuccess(resp) {
				if (resp?.data?.lists) {
					setOptions(
						resp.data.lists.map(
							(el): OptionItemType => ({
								label: el.name,
								value: el.id,
							})
						)
					);
				} else {
					setOptions([]);
				}
			},
		}
	);

	useMount(() => {
		run("");
		setTimeout(() => {
			const tagIDs = props.multiple
				? (fieldApi?.getValue() as string[])
				: [fieldApi?.getValue()].filter(Boolean);
			if (tagIDs?.length) {
				setTagIDs(tagIDs);
			}
		}, 1000);
	});

	const handleSearch = (inputValue: string) => {
		run(inputValue);
	};

	return (
		<Form.Select
			size="large"
			className="w-full"
			filter
			remote
			onSearch={handleSearch}
			optionList={options}
			loading={loading || detailLoading}
			emptyContent={null}
			suffix={
				<Button
					onClick={(e) => {
						e.stopPropagation();
						NiceModal.show(TagCreateModal, {
							onSuccess: refresh,
						});
					}}
				>
					新建标签
				</Button>
			}
			extraText={
				<div className="inline-flex items-center">
					<Button
						link
						theme="borderless"
						icon={<IconRefresh />}
						onClick={() => {
							refresh();
						}}
					>
						刷新数据
					</Button>
				</div>
			}
			{...props}
		></Form.Select>
	);
}
