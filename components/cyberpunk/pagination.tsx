"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  pageSize,
  total,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);

  if (totalPages <= 1) return null;

  // Calculate visible page range (e.g., show 5 pages max)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className={`
          border-white/10 bg-black/40 text-neon-cyan
          hover:border-neon-cyan/50 hover:bg-neon-cyan/10 hover:text-neon-cyan
          disabled:cursor-not-allowed disabled:opacity-50
        `}
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`
          border-white/10 bg-black/40 text-neon-cyan
          hover:border-neon-cyan/50 hover:bg-neon-cyan/10 hover:text-neon-cyan
          disabled:cursor-not-allowed disabled:opacity-50
        `}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {getPageNumbers().map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? "default" : "outline"}
          onClick={() => onPageChange(page)}
          className={`
            min-w-[40px] font-mono transition-all duration-300
            ${
              currentPage === page
                ? `
                  border-neon-cyan bg-neon-cyan text-black shadow-[0_0_10px_var(--color-neon-cyan)]
                  hover:bg-cyan-300
                `
                : `
                  border-white/10 bg-black/40 text-gray-400
                  hover:border-neon-cyan/50 hover:bg-neon-cyan/5 hover:text-neon-cyan
                `
            }
          `}
        >
          {page}
        </Button>
      ))}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`
          border-white/10 bg-black/40 text-neon-cyan
          hover:border-neon-cyan/50 hover:bg-neon-cyan/10 hover:text-neon-cyan
          disabled:cursor-not-allowed disabled:opacity-50
        `}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className={`
          border-white/10 bg-black/40 text-neon-cyan
          hover:border-neon-cyan/50 hover:bg-neon-cyan/10 hover:text-neon-cyan
          disabled:cursor-not-allowed disabled:opacity-50
        `}
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>

      <div className="ml-4 flex items-center gap-2 font-mono text-sm text-gray-500">
        <span>
          <span className="text-neon-purple">{currentPage}</span> / {totalPages}
        </span>
        <span className="text-gray-600">|</span>
        <span>
          Total <span className="text-neon-cyan">{total}</span>
        </span>
      </div>
    </div>
  );
}
