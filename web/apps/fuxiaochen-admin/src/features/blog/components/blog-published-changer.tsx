import { Switch } from "@douyinfe/semi-ui-19";
import { useRequest } from "ahooks";

import { updateBlogPublished } from "@/api/blog";

interface Props {
  currentPublished: boolean;
  blogID: string;
  onSuccess?: () => void;
}

export default function BlogPublishedChanger({
  currentPublished,
  blogID,
  onSuccess,
}: Props) {
  const { loading, run } = useRequest(
    (published: boolean) => updateBlogPublished(blogID, { published }),
    {
      manual: true,
      onSuccess: () => {
        onSuccess?.();
      },
    },
  );

  return (
    <Switch
      defaultChecked={currentPublished}
      onChange={(v) => {
        run(v);
      }}
      loading={loading}
    />
  );
}
