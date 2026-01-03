import gfm from "@bytemd/plugin-gfm";
import breaks from "@bytemd/plugin-breaks";
import highlight from "@bytemd/plugin-highlight";
import { Editor } from "@bytemd/react";
import { withField } from "@douyinfe/semi-ui-19";
import { uploadFile } from "@/api/upload";
import { showErrorToast, showSuccessToast } from "@/libs/toast";

const plugins = [gfm(), breaks(), highlight()];

interface BytemdFieldProps {
  field: string;
  value?: string;
  onChange?: (value: string) => void;
  [key: string]: unknown;
}

function BytemdFieldInner(props: BytemdFieldProps) {
  const { value, onChange, field, ...rest } = props;

  return (
    <Editor
      value={value ?? ""}
      plugins={plugins}
      onChange={onChange}
      {...rest}
      uploadImages={async (files) => {
        try {
          const promises = files.map(async (file) => {
            const res = await uploadFile(file);
            if (res.url && res.name) {
              showSuccessToast(`「${res.name}」上传成功`);
              return [{ url: res.url, name: res.name }];
            } else {
              showErrorToast(`「${file.name}」上传失败`);
            }
            return [];
          });
          const results = await Promise.all(promises);
          return results.flat();
        } catch (_) {
          return [];
        }
      }}
    />
  );
}

const BytemdFieldComponent = withField(BytemdFieldInner);

export default function BytemdField(props: BytemdFieldProps) {
  return <BytemdFieldComponent {...props} />;
}
