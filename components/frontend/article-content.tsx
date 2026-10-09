import { renderToReactElement } from "@tiptap/static-renderer/pm/react";

import { contentExtensions } from "@/lib/posts/content-extensions";
import { readDocument } from "@/lib/posts/document";
import { isImageParagraph } from "@/lib/posts/prose";

import { ArticleCodeBlock } from "./code-block";

const documentRenderOptions: NonNullable<Parameters<typeof renderToReactElement>[0]["options"]> = {
  nodeMapping: {
    paragraph: ({ node, children }) => (
      <p className={isImageParagraph(node) ? "article-image-block" : undefined}>{children}</p>
    ),
    table: ({ children }) => (
      // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- 保留宽表格的键盘滚动入口。
      <div className="site-table-scroll" tabIndex={0} aria-label="文章表格">
        <table>
          <tbody>{children}</tbody>
        </table>
      </div>
    ),
    codeBlock: ({ node }) => (
      <ArticleCodeBlock code={node.textContent} language={node.attrs.language} />
    ),
    taskList: ({ children }) => <ul className="article-task-list">{children}</ul>,
    taskItem: ({ node, children }) => (
      <li className="article-task-item">
        <input
          type="checkbox"
          checked={Boolean(node.attrs.checked)}
          disabled
          aria-label={node.attrs.checked ? "已完成任务" : "未完成任务"}
        />
        <div>{children}</div>
      </li>
    ),
  },
  markMapping: {
    link: ({ mark, children }) => (
      <a
        href={String(mark.attrs.href)}
        title={mark.attrs.title ?? undefined}
        {...(/^https?:/.test(mark.attrs.href)
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {children}
      </a>
    ),
  },
};

export function ArticleContent({ content }: { content: string }) {
  const document = readDocument(content);
  return (
    <div className="site-markdown article-prose">
      {renderToReactElement({
        content: document,
        extensions: contentExtensions(),
        options: documentRenderOptions,
      })}
    </div>
  );
}
