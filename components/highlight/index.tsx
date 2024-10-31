import * as React from "react";

import { cn } from "@/lib/utils";

type HighlightProps = {
  className?: string;
  highlightMarkClassName?: string;
  sourceString: string;
  searchWords?: string[];
  // 是否大小写敏感
  caseSensitive?: boolean;
};

type HighlightMarkProps = {
  text: string;
  className?: string;
};

export const HighlightMark = ({ text, className }: HighlightMarkProps) => {
  return (
    <span
      className={cn("bg-green-300/20 dark:bg-green-100/30 mx-1", className)}
    >
      {text}
    </span>
  );
};

export const Highlight = ({
  sourceString,
  searchWords,
  className,
  highlightMarkClassName,
  caseSensitive,
}: HighlightProps) => {
  if (!searchWords?.length) {
    return sourceString;
  }

  if (!sourceString?.trim()) {
    return "";
  }

  // Chat GPT: 将正则表达式改为(${searchWords.join('|')})，这样可以将searchWords作为捕获组，从而在拆分后的数组中保留匹配到的searchWords
  const regex = new RegExp(
    `(${searchWords.join("|")})`,
    // gi 全局匹配且不区分大小写
    caseSensitive ? "gi" : "g",
  );

  // 使用正则表达式将sourceString根据searchWords拆分成数组
  const splitArray = sourceString.split(regex);

  return (
    <div className={cn("inline-flex items-center", className)}>
      {splitArray.map((el, idx) => {
        if (
          searchWords.find((curr) => curr.toLowerCase() === el.toLowerCase())
        ) {
          return (
            <HighlightMark
              key={el + idx}
              text={el}
              className={highlightMarkClassName}
            />
          );
        } else {
          return el;
        }
      })}
    </div>
  );
};
