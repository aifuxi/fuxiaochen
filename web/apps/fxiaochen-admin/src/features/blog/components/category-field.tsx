import { Form, useFieldApi } from "@douyinfe/semi-ui-19";
import { useMount, useRequest } from "ahooks";
import { getCategoryDetail, getCategoryList } from "@/api/category";
import { useState } from "react";

interface OptionItemType {
  value: string;
  label: string;
}

type CategoryFieldProps = Omit<
  React.ComponentProps<typeof Form.Select>,
  "optionList" | "loading"
>;

export function CategoryField(props: CategoryFieldProps) {
  const fieldApi = useFieldApi(props.field);
  const [options, setOptions] = useState<OptionItemType[]>([]);
  const [categoryIDs, setCategoryIDs] = useState<string[]>([]);

  const { loading: detailLoading } = useRequest(
    () => Promise.all(categoryIDs.map((id) => getCategoryDetail(id))),
    {
      ready: Boolean(categoryIDs?.length),
      debounceWait: 500,
      onSuccess(resp) {
        setOptions(
          resp.map(
            (el): OptionItemType => ({
              label: el?.data?.name,
              value: el?.data?.id,
            })
          )
        );
      },
    }
  );

  const { loading, run } = useRequest(
    (v: string) =>
      getCategoryList({
        page: 1,
        pageSize: 100,
        name: v,
      }),
    {
      manual: true,
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
      const categoryIDs = props.multiple
        ? (fieldApi.getValue() as string[])
        : [fieldApi.getValue() as string].filter(Boolean);
      if (categoryIDs?.length) {
        setCategoryIDs(categoryIDs);
      }
    }, 1000);
  });

  const handleSearch = (inputValue: string) => {
    run(inputValue);
  };

  return (
    <Form.Select
      size="large"
      placeholder="请选择博客分类"
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
