"use client";

import React from "react";

import Link from "next/link";

import { useMount } from "ahooks";
import { load } from "cheerio";

import { type OptionItem } from "@/types";

export const MarkdownTOC = () => {
  const [tocList, setTocList] = React.useState<OptionItem<string>[]>([]);

  useMount(() => {
    const markdownBodyElement = document.querySelector(".markdown-body")!;
    const $ = load(markdownBodyElement.innerHTML);
    const h2Elems = $("h2");
    for (const h2 of h2Elems) {
      const h2Element = $(h2);
      const text = h2Element.text();
      const id = h2Element.attr("id");
      if (text && id) {
        setTocList((prev) => [
          ...prev,
          {
            value: id,
            label: text,
          },
        ]);
      }
    }
  });

  return (
    <div>
      <div>目录</div>
      <ul className="flex flex-col gap-2 pt-8 text-sm text-muted-foreground">
        {tocList.length > 0 ? (
          tocList.map((el) => (
            <li key={el.value}>
              <Link
                href={`#${el.value}`}
                className="line-clamp-1 text-ellipsis transition-colors hover:text-primary"
              >
                {el.label}
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
