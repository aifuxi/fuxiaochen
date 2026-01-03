import { updateBlogFeatured } from "@/api/blog";

import { Switch } from "@douyinfe/semi-ui-19";
import { useRequest } from "ahooks";

interface Props {
	currentFeatured: boolean;
	blogID: string;
	onSuccess?: () => void;
}

export default function BlogFeaturedChanger({
	currentFeatured,
	blogID,
	onSuccess,
}: Props) {
	const { loading, run } = useRequest(
		(featured: boolean) => updateBlogFeatured(blogID, { featured }),
		{
			manual: true,
			onSuccess: () => {
				onSuccess?.();
			},
		}
	);

	return (
		<Switch
			defaultChecked={currentFeatured}
			onChange={(v) => {
				run(v);
			}}
			loading={loading}
		/>
	);
}
