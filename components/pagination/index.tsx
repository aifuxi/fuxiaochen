import React from 'react';

import Link from 'next/link';

import { DEFAULT_PAGE_SIZE } from '@/constants';

type Props = {
  currentPage: number;
  total: number;
};

const Pagination = ({ currentPage, total }: Props) => {
  const pageNumber = Math.ceil(total / DEFAULT_PAGE_SIZE);

  return (
    <div className="flex justify-between">
      {renderPrevButton()}
      <span>
        {currentPage} of {pageNumber}
      </span>
      {renderNextButton()}
    </div>
  );

  function renderPrevButton() {
    if (currentPage === 1) {
      return (
        <button className="cursor-not-allowed text-gray-400">上一页</button>
      );
    }

    let link = `/articles/page/${currentPage - 1}`;
    if (currentPage === 2) {
      link = '/articles';
    }

    return (
      <button>
        <Link href={link}>上一页</Link>
      </button>
    );
  }

  function renderNextButton() {
    if (currentPage >= pageNumber) {
      return (
        <button className="cursor-not-allowed text-gray-400">下一页</button>
      );
    }

    return (
      <button>
        <Link href={`/articles/page/${currentPage + 1}`}>下一页</Link>
      </button>
    );
  }
};

export default Pagination;
