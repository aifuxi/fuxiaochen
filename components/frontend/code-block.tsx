import type { RootContent } from "hast";
import type { ReactNode } from "react";

import { CopyCodeButton } from "@/components/ui/copy-code-button";
import { highlightCode } from "@/lib/posts/code-highlight";
import { codeLanguageLabel } from "@/lib/posts/code-languages";

function highlightNodes(nodes: RootContent[]): ReactNode {
  return nodes.map((node, index) => {
    if (node.type === "text") return node.value;
    if (node.type !== "element") return null;
    const classes = node.properties.className;
    return (
      <span key={index} className={Array.isArray(classes) ? classes.join(" ") : undefined}>
        {highlightNodes(node.children)}
      </span>
    );
  });
}

export function ArticleCodeBlock({ code, language }: { code: string; language?: string | null }) {
  return (
    <div className="code-block article-code-block">
      <div className="code-block-toolbar">
        <span className="code-block-language">{codeLanguageLabel(language)}</span>
        <CopyCodeButton code={code} />
      </div>
      {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- 保留长代码块的键盘滚动入口。 */}
      <pre tabIndex={0} aria-label={`${codeLanguageLabel(language)}代码块`}>
        <code>{highlightNodes(highlightCode(code, language).children)}</code>
      </pre>
    </div>
  );
}
