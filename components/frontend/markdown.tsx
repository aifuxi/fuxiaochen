import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

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
export function ArticleMarkdown({ content }: { content: string }) {
  return (
    <div className="site-markdown">
      <Markdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </Markdown>
    </div>
  );
}
