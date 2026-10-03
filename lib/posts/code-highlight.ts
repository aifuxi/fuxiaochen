import type { Root } from "hast";

import bash from "highlight.js/lib/languages/bash";
import c from "highlight.js/lib/languages/c";
import cpp from "highlight.js/lib/languages/cpp";
import css from "highlight.js/lib/languages/css";
import go from "highlight.js/lib/languages/go";
import java from "highlight.js/lib/languages/java";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import markdown from "highlight.js/lib/languages/markdown";
import plaintext from "highlight.js/lib/languages/plaintext";
import python from "highlight.js/lib/languages/python";
import rust from "highlight.js/lib/languages/rust";
import sql from "highlight.js/lib/languages/sql";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import yaml from "highlight.js/lib/languages/yaml";
import { createLowlight } from "lowlight";

import { codeLanguage, codeLanguages } from "./code-languages";

const lowlight = createLowlight({
  plaintext,
  javascript,
  jsx: javascript,
  typescript,
  tsx: typescript,
  xml,
  css,
  json,
  bash,
  python,
  sql,
  go,
  rust,
  java,
  c,
  cpp,
  yaml,
  markdown,
});

function plainCode(code: string): Root {
  return { type: "root", children: [{ type: "text", value: code }] };
}

export function highlightCode(code: string, language?: string | null): Root {
  const item = codeLanguage(language);
  if (!item || item.value === "plaintext") return plainCode(code);
  try {
    return lowlight.highlight(item.value === "html" ? "xml" : item.value, code);
  } catch {
    // 高亮器异常不能阻断正文编辑或文章阅读。
    return plainCode(code);
  }
}

// 官方插件对未知语言默认调用 highlightAuto；两端统一回退纯文本，避免猜测语言。
export const editorLowlight = {
  highlight: (language: string, code: string) => highlightCode(code, language),
  highlightAuto: plainCode,
  listLanguages: () => codeLanguages.map((item) => item.value),
  registered: (language: string) => Boolean(codeLanguage(language)),
};
