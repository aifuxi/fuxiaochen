import { useState } from "react";

import { useDebounceFn } from "ahooks";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";

export const useQueryTags = () => {
  const [queryStates, setQueryStates] = useQueryStates({
    page: parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true }),
    pageSize: parseAsInteger
      .withDefault(10)
      .withOptions({ clearOnDefault: true }),
    name: parseAsString.withDefault("").withOptions({
      shallow: false,
      clearOnDefault: true,
    }),
  });
  const [name, setName] = useState(queryStates.name);

  const { run: handleNameSearch } = useDebounceFn(
    (value?: string) => {
      void setQueryStates({ ...queryStates, name: value });
    },
    {
      wait: 500,
    },
  );

  const handlePageChange = (page: number) => {
    void setQueryStates({ ...queryStates, page });
  };

  const handleNameChange = (value: string) => {
    setName(value);
    handleNameSearch(value);
  };

  return {
    name,
    queryStates,

    handleNameChange,
    handlePageChange,
  };
};
