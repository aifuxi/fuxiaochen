import * as React from 'react';

import { type AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons';
import { Button, IconButton } from '@radix-ui/themes';

import { cn } from '@/utils';

interface PaginationButtonProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  pageCount: number;
  page: string;
  createQueryString: (params: Record<string, string | number | null>) => string;
  router: AppRouterInstance;
  pathname: string;
  isPending: boolean;
  startTransition: React.TransitionStartFunction;
  siblingCount?: number;
}

export function PaginationButton({
  pageCount,
  page,
  createQueryString,
  router,
  pathname,
  isPending,
  startTransition,
  siblingCount = 1,
  className,
  ...props
}: PaginationButtonProps) {
  // Memoize pagination range to avoid unnecessary re-renders
  const paginationRange = React.useMemo(() => {
    const delta = siblingCount + 2;

    const range = [];
    for (
      let i = Math.max(2, Number(page) - delta);
      i <= Math.min(pageCount - 1, Number(page) + delta);
      i++
    ) {
      range.push(i);
    }

    if (Number(page) - delta > 2) {
      range.unshift('...');
    }
    if (Number(page) + delta < pageCount - 1) {
      range.push('...');
    }

    range.unshift(1);
    if (pageCount !== 1) {
      range.push(pageCount);
    }

    return range;
  }, [pageCount, page, siblingCount]);

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-center gap-2',
        className,
      )}
      {...props}
    >
      <IconButton
        aria-label="Go to first page"
        color="gray"
        className="hidden lg:flex"
        onClick={() => {
          startTransition(() => {
            router.push(
              `${pathname}?${createQueryString({
                page: 1,
              })}`,
            );
          });
        }}
        disabled={Number(page) === 1 ?? isPending}
      >
        <DoubleArrowLeftIcon />
      </IconButton>
      <Button
        aria-label="Go to previous page"
        color="gray"
        onClick={() => {
          startTransition(() => {
            router.push(
              `${pathname}?${createQueryString({
                page: Number(page) - 1,
              })}`,
            );
          });
        }}
        disabled={Number(page) === 1 ?? isPending}
      >
        <ChevronLeftIcon />
      </Button>
      {paginationRange.map((pageNumber, i) =>
        pageNumber === '...' ? (
          <Button aria-label="Page separator" key={i} color="gray" disabled>
            ...
          </Button>
        ) : (
          <Button
            key={i}
            color="gray"
            highContrast={pageNumber === Number(page)}
            onClick={() => {
              startTransition(() => {
                router.push(
                  `${pathname}?${createQueryString({
                    page: pageNumber,
                  })}`,
                );
              });
            }}
            disabled={isPending}
          >
            {pageNumber}
          </Button>
        ),
      )}
      <Button
        aria-label="Go to next page"
        color="gray"
        onClick={() => {
          startTransition(() => {
            router.push(
              `${pathname}?${createQueryString({
                page: Number(page) + 1,
              })}`,
            );
          });
        }}
        disabled={Number(page) === (pageCount ?? 10) ?? isPending}
      >
        <ChevronRightIcon />
      </Button>
      <Button
        aria-label="Go to last page"
        color="gray"
        onClick={() => {
          router.push(
            `${pathname}?${createQueryString({
              page: pageCount ?? 10,
            })}`,
          );
        }}
        disabled={Number(page) === (pageCount ?? 10) ?? isPending}
      >
        <DoubleArrowRightIcon />
      </Button>
    </div>
  );
}
