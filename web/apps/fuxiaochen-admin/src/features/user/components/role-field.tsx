import { Form, useFieldApi } from "@douyinfe/semi-ui-19";
import { useMount, useRequest } from "ahooks";
import { getRoleDetail, getRoleList } from "@/api/role";
import { useState } from "react";

interface OptionItemType {
  value: string;
  label: string;
}

type RoleFieldProps = Omit<
  React.ComponentProps<typeof Form.Select>,
  "optionList" | "loading"
>;

export function RoleField(props: RoleFieldProps) {
  const fieldApi = useFieldApi(props.field);
  const [options, setOptions] = useState<OptionItemType[]>([]);
  const [roleIDs, setRoleIDs] = useState<string[]>([]);

  const { loading: detailLoading } = useRequest(
    () => Promise.all(roleIDs.map((id) => getRoleDetail(id))),
    {
      ready: Boolean(roleIDs?.length),
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

  const { loading, run } = useRequest(
    (v: string) =>
      getRoleList({
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
              (el): OptionItemType => ({ label: el.name, value: el.id })
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
        setRoleIDs(tagIDs);
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
      {...props}
    ></Form.Select>
  );
}
