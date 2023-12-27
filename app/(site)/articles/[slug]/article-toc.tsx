'use client';

import React from 'react';

import { ChevronDownIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

import { cn } from '@/utils/helper';

export function ArticleTOC() {
  const tocWrapperRef = React.useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = React.useState(true);

  React.useEffect(() => {
    const toc = document.getElementsByClassName('toc')?.[0];

    if (toc) {
      tocWrapperRef.current?.append(toc);
    }
  }, []);

  React.useEffect(() => {
    const tocLinks = document.querySelectorAll('nav.toc .toc-link');
    const headings = document.querySelectorAll(
      '.markdown-body :where(h2, h3, h4)',
    );

    const ob = new IntersectionObserver(() => {
      // 每当内容里面的标题元素发生改变时，先把目录重置
      tocLinks.forEach((el) => {
        el.classList.remove('toc-link-active');
      });

      // 从后往前找，找到最后一个 top <= 0的（即不在可视区内）
      // 当前位置的索引即为需要高亮目录的索引，不再往后找了
      for (let i = headings.length - 1; i >= 0; i--) {
        const currentHeading = headings[i]!;
        const currentTocLink = tocLinks[i]!;
        if (currentHeading.getBoundingClientRect().top <= 0) {
          currentTocLink.classList.add('toc-link-active');
          break;
        }
      }
    }, {});

    headings.forEach((el) => {
      ob.observe(el);
    });

    return () => {
      headings.forEach((el) => {
        ob.unobserve(el);
      });
      ob.disconnect();
    };
  }, []);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="hidden lg:block w-[180px] pt-12 sticky top-12 h-[600px]"
    >
      <div
        className="flex items-center justify-between space-x-4 pl-4 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h4 className="text-sm font-semibold">目录</h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-9 p-0">
            <ChevronDownIcon
              className={cn(!isOpen && 'rotate-180', 'transition-transform')}
              size={16}
            />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent ref={tocWrapperRef}></CollapsibleContent>
    </Collapsible>
  );
}
