'use client';

import React from 'react';

import Link from 'next/link';

import { useMount } from 'ahooks';
import { load } from 'cheerio';

export const MarkdownTOC = () => {
  const [headerIds, setHeaderIds] = React.useState<string[]>([]);

  useMount(() => {
    const markdownBodyElement = document.querySelector('.markdown-body')!;
    const $ = load(markdownBodyElement.innerHTML);
    const h2Elems = $('h2');
    const ids = [];
    for (const h2 of h2Elems) {
      const id = h2.attribs.id;
      if (id) {
        ids.push(id);
      }
    }

    setHeaderIds(ids);
  });

  return (
    <div>
      <div>目录</div>
      <ul className="flex flex-col text-sm text-muted-foreground gap-2 pt-8">
        {headerIds.map((el) => (
          <li key={el}>
            <Link
              href={`#${el}`}
              className="hover:text-primary transition-colors line-clamp-1 text-ellipsis"
            >
              {el}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
