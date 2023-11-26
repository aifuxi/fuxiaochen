import Link from 'next/link';

import { DEFAULT_PAGE_SIZE } from '@/constants';

type Props = {
  currentPage: number;
  total: number;
};

export function Pagination({ currentPage, total }: Props) {
  const pageNumber = Math.ceil(total / DEFAULT_PAGE_SIZE);

  return (
    <div className="flex justify-between">
      {renderPrevButton()}
      <div>
        第<span className="px-1 font-semibold">{currentPage}</span>页 / 共
        <span className="px-1 font-semibold">{pageNumber}</span>页
      </div>
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
}
