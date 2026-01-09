/* eslint-disable */
import { useRef } from "react";

import type { TablePagination } from "@douyinfe/semi-ui-19/lib/es/table";
import { useMemoizedFn, useMount, useRequest, useSetState } from "ahooks";
import type { Options, Result } from "ahooks/lib/useRequest/src/types";

import type { SemiFormApi, SemiTableOnChange } from "@/types/semi";

export interface SemiTableResult<TData, TParams extends any[]> extends Result<
  TData,
  TParams
> {
  tableProps: {
    dataSource: any[];
    loading: boolean;
    onChange: SemiTableOnChange;
    pagination: TablePagination;
  };
  search: {
    submit: () => void;
    reset: () => void;
  };
}

export interface UseSemiTableOptions<
  TData,
  TParams extends any[],
> extends Options<TData, TParams> {
  formApi?: React.RefObject<SemiFormApi<any> | undefined | null>;
  defaultParams?: TParams;
  defaultPageSize?: number;
}

export function useSemiTable<TData, TParams extends any[]>(
  service: (...args: TParams) => Promise<TData>,
  options: UseSemiTableOptions<TData, TParams> = {},
): SemiTableResult<TData, TParams> {
  const {
    formApi,
    defaultParams,
    defaultPageSize = 10,
    manual = false,
    ...restOptions
  } = options;

  // Pagination state
  const [pagination, setPagination] = useSetState({
    current: 1,
    pageSize: defaultPageSize,
  });

  // Sorting state
  const [sorter, setSorter] = useSetState<{
    sortBy?: string;
    order?: "asc" | "desc";
  }>({});

  // Initial params
  const { run, params, ...rest } = useRequest(service, {
    defaultParams,
    manual: true, // We handle initial run manually to combine pagination/form
    ...restOptions,
  });

  const isMounted = useRef(false);

  // Helper to merge params
  const runWithParams = useMemoizedFn(
    (
      currentPagination = pagination,
      currentSorter = sorter,
      formValues = {},
    ) => {
      const mergedParams = {
        page: currentPagination.current,
        pageSize: currentPagination.pageSize,
        sortBy: currentSorter.sortBy,
        order: currentSorter.order,
        ...formValues,
      };
      // @ts-expect-error - params are dynamic
      run(mergedParams);
    },
  );

  // Initialize
  useMount(() => {
    if (!manual && !isMounted.current) {
      const formValues = formApi?.current?.getValues() || {};
      // Check if defaultParams is provided to override
      if (defaultParams && defaultParams[0]) {
        run(...defaultParams);
      } else {
        runWithParams(pagination, sorter, formValues);
      }
      isMounted.current = true;
    }
  });

  // Table onChange handler
  const onTableChange: SemiTableOnChange = ({
    pagination: newPagination,
    sorter: newSorter,
  }) => {
    let nextPagination = { ...pagination };
    let nextSorter = { ...sorter };

    // Handle pagination
    if (newPagination) {
      const { currentPage, pageSize } = newPagination;
      if (pageSize && pageSize !== pagination.pageSize) {
        nextPagination = { current: 1, pageSize };
      } else if (currentPage && currentPage !== pagination.current) {
        nextPagination = { ...nextPagination, current: currentPage };
      }
    }

    // Handle sorter
    if (newSorter && !Array.isArray(newSorter)) {
      if (newSorter.sortOrder) {
        const field = (newSorter.sortField ?? newSorter.dataIndex) as string;
        nextSorter = {
          sortBy: field,
          order: newSorter.sortOrder === "ascend" ? "asc" : "desc",
        };
        // Reset to first page on sort change if needed
        nextPagination.current = 1;
      } else {
        nextSorter = { sortBy: undefined, order: undefined };
      }
    }

    setPagination(nextPagination);
    setSorter(nextSorter);

    const formValues = formApi?.current?.getValues() || {};
    runWithParams(nextPagination, nextSorter, formValues);
  };

  // 添加一个 ref 来跟踪是否正在执行 reset
  const isResetting = useRef(false);

  // Search actions
  const submit = useMemoizedFn(() => {
    // Reset to page 1 on search
    const nextPagination = { ...pagination, current: 1 };
    setPagination(nextPagination);
    const formValues = formApi?.current?.getValues() || {};
    runWithParams(nextPagination, sorter, formValues);
  });

  const reset = useMemoizedFn(() => {
    // 防止重复执行
    if (isResetting.current) return;
    isResetting.current = true;

    try {
      formApi?.current?.reset();
      // Reset pagination and sorter
      const nextPagination = { current: 1, pageSize: defaultPageSize };
      const nextSorter = { sortBy: undefined, order: undefined };
      setPagination(nextPagination);
      setSorter(nextSorter);

      // 使用微任务而不是 setTimeout，以确保在当前事件循环结束后执行
      Promise.resolve().then(() => {
        const formValues = formApi?.current?.getValues() || {};
        runWithParams(nextPagination, nextSorter, formValues);
        // 重置标志
        isResetting.current = false;
      });
    } catch (error) {
      // 确保在出错时也重置标志
      isResetting.current = false;
      throw error;
    }
  });

  // Calculate total from data
  const data = rest.data as any;
  const total = data?.total || data?.data?.total || 0;
  const dataSource = data?.list || data?.lists || data?.data?.lists || [];

  return {
    run,
    params,
    ...rest,
    tableProps: {
      dataSource,
      loading: rest.loading,
      onChange: onTableChange as any,
      pagination: {
        total,
        currentPage: pagination.current,
        pageSize: pagination.pageSize,
        showSizeChanger: true,
      },
    },
    search: {
      submit,
      reset,
    },
  };
}
