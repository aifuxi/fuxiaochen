import { documentText, readDocument } from "./document";

export function textExcerpt(text: string, maxLength: number): string {
  const characters = Array.from(text.replace(/\s+/g, " ").trim());
  return characters.slice(0, maxLength).join("") + (characters.length > maxLength ? "…" : "");
}

// 人工摘要保留完整文字；只有正文回退按调用场景截取，不回写数据库。
export function postExcerpt(summary: string, content: string, maxLength = 160): string {
  return summary.trim()
    ? summary.replace(/\s+/g, " ").trim()
    : textExcerpt(documentText(readDocument(content)), maxLength);
}
