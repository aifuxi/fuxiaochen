'use client';

import React from 'react';

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DEFAULT_PAGE_SIZE } from '@/constants';
import { cn } from '@/utils';

type Props = {
  className?: string;
  page: number;
  total: number;
  changePage: (currentPage: number) => void;
};

export default function ClientPagination({
  page,
  total,
  changePage,
  className,
}: Props) {
  return (
    <div className={cn('flex justify-end items-center', className)}>
      <div>
        <p className="text-sm">
          第
          <span className="font-medium ml-1">
            {(page - 1) * DEFAULT_PAGE_SIZE || 1}
          </span>
          ~
          <span className="font-medium mr-1">
            {total >= DEFAULT_PAGE_SIZE * page
              ? DEFAULT_PAGE_SIZE * page
              : total}
          </span>
          条数据，共
          <span className="font-medium px-1">{total}</span>条
        </p>
      </div>
      <div className="ml-12">{renderPageItem()}</div>
    </div>
  );

  function renderPageItem() {
    const pageCount = Math.ceil(total / DEFAULT_PAGE_SIZE) || 1;
    const pageNumbers = Array.from({ length: pageCount }).map((_, index) => {
      return index + 1;
    });

    let linkItems = [];
    if (pageCount >= 1 && pageCount <= 7) {
      linkItems = pageNumbers.map((v) => generateLinkItem(v));
    } else {
      let startPageNumbers: number[] = pageNumbers.slice(0, 4);
      let middlePageNumbers: number[] = [];
      let endPageNumbers: number[] = pageNumbers.slice(
        pageNumbers.length - 2,
        pageNumbers.length,
      );
      let startFoldedPageNumbers: number[] = [];
      let startFoldedPage: null | React.ReactNode = null;
      let endFoldedPageNumbers = pageNumbers.slice(4, pageNumbers.length - 2);
      let endFoldedPage: null | React.ReactNode = (
        <FoldedPage pageNumbers={endFoldedPageNumbers} />
      );

      if (page === 4) {
        startPageNumbers = pageNumbers.slice(0, 5);
        endPageNumbers = pageNumbers.slice(
          pageNumbers.length - 1,
          pageNumbers.length,
        );
      }
      if (page >= 5) {
        startPageNumbers = pageNumbers.slice(0, 1);
        endPageNumbers = pageNumbers.slice(
          pageNumbers.length - 1,
          pageNumbers.length,
        );

        startFoldedPageNumbers = pageNumbers.slice(1, page - 2);
        startFoldedPage = <FoldedPage pageNumbers={startFoldedPageNumbers} />;
        endFoldedPageNumbers = pageNumbers.slice(
          page + 1,
          pageNumbers.length - 1,
        );
        endFoldedPage = <FoldedPage pageNumbers={endFoldedPageNumbers} />;
      }

      if (page >= 5) {
        middlePageNumbers = [page - 1, page, page + 1];
      }
      if (pageCount - page <= 3) {
        startPageNumbers = pageNumbers.slice(0, 1);
        endPageNumbers = pageNumbers.slice(pageNumbers.length - 5);

        startFoldedPageNumbers = pageNumbers.slice(1, page - 1);
        startFoldedPage = <FoldedPage pageNumbers={startFoldedPageNumbers} />;
        middlePageNumbers = [];
        endFoldedPageNumbers = [];
        endFoldedPage = null;
      }

      const startLinkItems = startPageNumbers.map((v) => generateLinkItem(v));
      const middlePageLinkItems = middlePageNumbers.map((v) =>
        generateLinkItem(v),
      );
      const endLinkItems = endPageNumbers.map((v) => generateLinkItem(v));
      linkItems = [
        ...startLinkItems,
        startFoldedPage,
        ...middlePageLinkItems,
        endFoldedPage,
        ...endLinkItems,
      ];
    }

    return (
      <nav
        className="isolate inline-flex -space-x-px rounded-md shadow-sm"
        aria-label="Pagination"
      >
        <span
          onClick={() => {
            if (page === 1) {
              return;
            }
            changePage(page - 1);
          }}
          className={cn(
            'relative inline-flex items-center rounded-l-md px-2 py-2 ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0',
            page === 1 ? 'cursor-not-allowed' : 'cursor-pointer ',
          )}
        >
          <span className="sr-only">上一页</span>
          <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
        </span>
        {linkItems}
        <span
          onClick={() => {
            if (page === pageCount) {
              return;
            }
            changePage(page + 1);
          }}
          className={cn(
            'cursor-pointer relative inline-flex items-center rounded-r-md px-2 py-2  ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0',
            page === pageCount ? 'cursor-not-allowed' : 'cursor-pointer ',
          )}
        >
          <span className="sr-only">下一页</span>
          <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
        </span>
      </nav>
    );

    function generateLinkItem(currentPage: number) {
      return (
        <div
          key={currentPage}
          aria-current="page"
          onClick={() => changePage(currentPage)}
          className={cn(
            'cursor-pointer relative z-10 inline-flex items-center  px-6 py-3 text-sm font-semibold focus:z-20 ',
            page === currentPage
              ? 'bg-gray-800 text-white dark:bg-white dark:text-gray-800  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-800 dark:focus-visible:outline-white'
              : 'text-gray-800 dark:text-white ring-1 ring-inset ring-gray-300  focus:outline-offset-0',
          )}
        >
          {currentPage}
        </div>
      );
    }
  }

  function FoldedPage({ pageNumbers }: { pageNumbers: number[] }) {
    return (
      <Popover>
        <PopoverTrigger>
          <span className="relative inline-flex items-center px-6 py-3 text-sm font-semibold  ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
            ...
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-20">
          <ScrollArea className="h-48">
            <ul className="flex flex-col">
              {pageNumbers.map((v) => (
                <li key={v}>
                  <div
                    onClick={() => changePage(v)}
                    className={cn(
                      'cursor-pointer flex justify-center py-1 rounded-sm text-sm',
                      'hover:bg-gray-800 dark:hover:bg-white',
                      'hover:text-white dark:hover:text-gray-800',
                    )}
                  >
                    {v}
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    );
  }
}
