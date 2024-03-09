import * as React from 'react';

import { type AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from 'lucide-react';

import { cn } from '@/lib/utils';

import { Button } from '../ui/button';

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
      <Button
        aria-label="Go to first page"
        size={'icon'}
        variant={'secondary'}
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
        <ChevronsLeftIcon />
      </Button>
      <Button
        aria-label="Go to previous page"
        size={'icon'}
        variant={'secondary'}
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
          <Button
            aria-label="Page separator"
            key={i}
            variant={'secondary'}
            disabled
          >
            ...
          </Button>
        ) : (
          <Button
            key={i}
            variant={pageNumber === Number(page) ? 'default' : 'secondary'}
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
        size={'icon'}
        variant={'secondary'}
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
        size={'icon'}
        variant={'secondary'}
        onClick={() => {
          router.push(
            `${pathname}?${createQueryString({
              page: pageCount ?? 10,
            })}`,
          );
        }}
        disabled={Number(page) === (pageCount ?? 10) ?? isPending}
      >
        <ChevronsRightIcon />
      </Button>
    </div>
  );
}
