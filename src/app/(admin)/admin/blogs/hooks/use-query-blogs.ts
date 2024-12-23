import { useState } from "react";

import { useDebounceFn } from "ahooks";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";

export const useQueryBlogs = () => {
  const [queryStates, setQueryStates] = useQueryStates({
    page: parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true }),
    pageSize: parseAsInteger
      .withDefault(10)
      .withOptions({ clearOnDefault: true }),
    title: parseAsString.withDefault("").withOptions({
      shallow: false,
      clearOnDefault: true,
    }),
  });
  const [title, setTitle] = useState(queryStates.title);

  const { run: handleTitleSearch } = useDebounceFn(
    (value?: string) => {
      void setQueryStates({ ...queryStates, title: value });
    },
    {
      wait: 500,
    },
  );

  const handlePageChange = (page: number) => {
    void setQueryStates({ ...queryStates, page });
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    handleTitleSearch(value);
  };

  return {
    title,
    queryStates,

    handleTitleChange,
    handlePageChange,
  };
};
