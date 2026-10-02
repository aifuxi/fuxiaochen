import { renderToReactElement } from "@tiptap/static-renderer/pm/react";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import { contentExtensions } from "@/lib/posts/content-extensions";
import { readDocument } from "@/lib/posts/document";

const components: Components = {
  a: ({ children, href }) =>
    href ? (
      <a
        href={href}
        {...(href?.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    ) : (
      <span>{children}</span>
    ),
  // 滚动区域保留键盘焦点，使长表格及代码可用方向键阅读。
  table: ({ children }) => (
    <div
      className="site-table-scroll"
      // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- 允许键盘用户滚动宽表格。
      tabIndex={0}
      aria-label="文章表格"
    >
      <table>{children}</table>
    </div>
  ),
  pre: ({ children }) => (
    <pre
      aria-label="代码块"
      // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- 允许键盘用户滚动长代码块。
      tabIndex={0}
    >
      {children}
    </pre>
  ),
};
const documentRenderOptions: NonNullable<Parameters<typeof renderToReactElement>[0]["options"]> = {
  nodeMapping: {
    table: ({ children }) => (
      // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- 保留宽表格的键盘滚动入口。
      <div className="site-table-scroll" tabIndex={0} aria-label="文章表格">
        <table>
          <tbody>{children}</tbody>
        </table>
      </div>
    ),
    codeBlock: ({ node, children }) => (
      // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- 保留长代码块的键盘滚动入口。
      <pre tabIndex={0} aria-label="代码块">
        <code className={node.attrs.language ? `language-${node.attrs.language}` : undefined}>
          {children}
        </code>
      </pre>
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

export function ArticleMarkdown({ content }: { content: string }) {
  const document = readDocument(content);
  if (document)
    return (
      <div className="site-markdown">
        {renderToReactElement({
          content: document,
          extensions: contentExtensions(),
          options: documentRenderOptions,
        })}
      </div>
    );
  return (
    <div className="site-markdown">
      <Markdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </Markdown>
    </div>
  );
}
