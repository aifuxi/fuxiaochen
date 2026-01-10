import { IconPlus } from "@douyinfe/semi-icons";
import { Form, Image } from "@douyinfe/semi-ui-19";

import { getBearerToken } from "@/utils/token";

import { API_UPLOAD_PATH, uploadFile } from "@/api/upload";

export default function BlogCoverUpload() {
  return (
    <Form.Upload
      field="cover"
      label="封面"
      action={API_UPLOAD_PATH}
      accept="image/*"
      limit={1}
      listType="picture"
      renderThumbnail={(file) => <Image src={file.url} />}
      headers={{
        Authorization: getBearerToken(),
      }}
      defaultFileList={[]}
      customRequest={async ({ file, fileInstance, onSuccess, onError }) => {
        const res = await uploadFile(fileInstance);

        if (res.url && res.name) {
          file.name = res.name;
          file.url = res.url;
          onSuccess(res);
        } else {
          onError({ status: 500 });
        }
      }}
    >
      <IconPlus size="extra-large" />
    </Form.Upload>
  );
}
