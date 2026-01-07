import { Switch } from "@douyinfe/semi-ui-19";
import { useRequest } from "ahooks";

import { updateBlogFeatured } from "@/api/blog";

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
    },
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
