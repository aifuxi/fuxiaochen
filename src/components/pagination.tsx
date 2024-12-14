"use client";

import { useMemo } from "react";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "./ui/button";

export type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
};

export const Pagination = ({
  page,
  pageSize,
  total,
  onPageChange,
}: PaginationProps) => {
  const totalPage = useMemo(() => {
    return Math.ceil(total / pageSize);
  }, [pageSize, total]);

  const handleGoToFirstPage = () => {
    onPageChange(1);
  };

  const handleGoToLastPage = () => {
    onPageChange(totalPage);
  };

  const handleGoToPreviousPage = () => {
    onPageChange(page - 1);
  };

  const handleGoToNextPage = () => {
    onPageChange(page + 1);
  };

  return (
    <div className="flex justify-between">
      <div className="text-sm">
        显示第 {page} 条-第 {page * pageSize} 条，共 {total} 条
      </div>
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="icon"
          disabled={page === 1}
          onClick={handleGoToFirstPage}
        >
          <ChevronsLeft />
        </Button>
        <Button
          variant="outline"
          size="icon"
          disabled={page === 1}
          onClick={handleGoToPreviousPage}
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="outline"
          size="icon"
          disabled={page === totalPage}
          onClick={handleGoToNextPage}
        >
          <ChevronRight />
        </Button>
        <Button
          variant="outline"
          size="icon"
          disabled={page === totalPage}
          onClick={handleGoToLastPage}
        >
          <ChevronsRight />
        </Button>
      </div>
    </div>
  );
};
