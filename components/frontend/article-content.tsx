import type { Node } from "@tiptap/pm/model";

import { renderToReactElement } from "@tiptap/static-renderer/pm/react";
import { createElement } from "react";

import { contentExtensions } from "@/lib/posts/content-extensions";
import { readDocumentNode } from "@/lib/posts/document";
import { headingEntries } from "@/lib/posts/outline";
import { isImageParagraph } from "@/lib/posts/prose";
import { tableColumns } from "@/lib/posts/table-layout";

import { ArticleCodeBlock } from "./code-block";

const documentRenderOptions: NonNullable<Parameters<typeof renderToReactElement>[0]["options"]> = {
  nodeMapping: {
    paragraph: ({ node, children }) => (
      <p
        className={isImageParagraph(node) ? "article-image-block" : undefined}
        style={node.attrs.textAlign ? { textAlign: node.attrs.textAlign } : undefined}
      >
        {children}
      </p>
    ),
    table: ({ node, children }) => {
      const widths = tableColumns(node);
      const fixed = widths.every((width) => width > 0);
      const size = widths.reduce((sum, width) => sum + (width || 60), 0);
      return (
        // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- 保留宽表格的键盘滚动入口。
        <div className="site-table-scroll" tabIndex={0} aria-label="文章表格">
          <table style={fixed ? { width: size } : { minWidth: size }}>
            <colgroup>
              {widths.map((width, index) => (
                <col key={index} style={width ? { width } : { minWidth: 60 }} />
              ))}
            </colgroup>
            <tbody>{children}</tbody>
          </table>
        </div>
      );
    },
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

function renderOptions(document: Node): typeof documentRenderOptions {
  const anchors = new Map(
    headingEntries(document).map((entry) => [document.nodeAt(entry.position), entry.id]),
  );
  return {
    ...documentRenderOptions,
    nodeMapping: {
      ...documentRenderOptions.nodeMapping,
      heading: ({ node, children }) =>
        createElement(
          `h${node.attrs.level}`,
          {
            id: anchors.get(node),
            tabIndex: -1,
            style: node.attrs.textAlign ? { textAlign: node.attrs.textAlign } : undefined,
          },
          children,
        ),
    },
  };
}

export function ArticleContent({ content }: { content: string | Node }) {
  const document = typeof content === "string" ? readDocumentNode(content) : content;
  return (
    <div className="site-markdown article-prose">
      {renderToReactElement({
        content: document,
        extensions: contentExtensions(),
        options: renderOptions(document),
      })}
    </div>
  );
}
