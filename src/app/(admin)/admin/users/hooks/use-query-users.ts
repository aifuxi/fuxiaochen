import { useState } from "react";

import { useDebounceFn } from "ahooks";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";

export const useQueryUsers = () => {
  const [queryStates, setQueryStates] = useQueryStates({
    page: parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true }),
    pageSize: parseAsInteger
      .withDefault(10)
      .withOptions({ clearOnDefault: true }),
    name: parseAsString.withDefault("").withOptions({
      shallow: false,
      clearOnDefault: true,
    }),
    email: parseAsString.withDefault("").withOptions({
      shallow: false,
      clearOnDefault: true,
    }),
  });
  const [name, setName] = useState(queryStates.name);
  const [email, setEmail] = useState(queryStates.email);

  const { run: handleNameSearch } = useDebounceFn(
    (value?: string) => {
      void setQueryStates({ ...queryStates, name: value });
    },
    {
      wait: 500,
    },
  );

  const { run: handleEmailSearch } = useDebounceFn(
    (value?: string) => {
      void setQueryStates({ ...queryStates, email: value });
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

  const handleEmailChange = (value: string) => {
    setEmail(value);
    handleEmailSearch(value);
  };

  return {
    name,
    email,
    queryStates,

    handleNameChange,
    handleEmailChange,
    handlePageChange,
  };
};
