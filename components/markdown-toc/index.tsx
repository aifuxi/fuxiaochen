"use client";

import React from "react";

import Link from "next/link";

import { useMount } from "ahooks";
import { load } from "cheerio";

export const MarkdownTOC = () => {
  const [headerIds, setHeaderIds] = React.useState<string[]>([]);

  useMount(() => {
    const markdownBodyElement = document.querySelector(".markdown-body")!;
    const $ = load(markdownBodyElement.innerHTML);
    const h2Elems = $("h2");
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
      <ul className="flex flex-col gap-2 pt-8 text-sm text-muted-foreground">
        {headerIds.length > 0 ? (
          headerIds.map((el) => (
            <li key={el}>
              <Link
                href={`#${el}`}
                className="line-clamp-1 text-ellipsis transition-colors hover:text-primary"
              >
                {el}
              </Link>
            </li>
          ))
        ) : (
          <li>无目录</li>
        )}
      </ul>
    </div>
  );
};
