"use client";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { PreviewCard } from "../preview-card";

export function LayoutPreview() {
  return (
    <>
      <PreviewCard title="ScrollArea">
        <ScrollArea className="h-48 w-64 rounded-lg border">
          <div className="p-4">
            <h4 className="mb-4 text-sm leading-none font-medium">Tags</h4>
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className={`
                  border-b border-border py-2 text-sm
                  last:border-0
                `}
              >
                Item {i + 1}
              </div>
            ))}
          </div>
        </ScrollArea>
        <ScrollArea className="w-96 rounded-lg border whitespace-nowrap">
          <div className="flex w-max space-x-4 p-4">
            <div className="h-[250px] w-[200px] rounded-md bg-surface" />
            <div className="h-[250px] w-[200px] rounded-md bg-surface" />
            <div className="h-[250px] w-[200px] rounded-md bg-surface" />
            <div className="h-[250px] w-[200px] rounded-md bg-surface" />
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </PreviewCard>

      <PreviewCard title="Pagination">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </PreviewCard>

      <PreviewCard title="BackToTop">
        <p className="text-sm text-text-secondary">
          Scroll down on the page to see the BackToTop button appear in the bottom right corner.
        </p>
      </PreviewCard>
    </>
  );
}
