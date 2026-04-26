export type MarkdownHeading = {
  id: string;
  text: string;
  level: number;
};

export function createHeadingIdGenerator() {
  const seen = new Map<string, number>();

  return (text: string) => {
    const normalized =
      text
        .trim()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
        .replace(/(^-|-$)/g, "") || "section";

    const count = seen.get(normalized) ?? 0;
    seen.set(normalized, count + 1);

    return count === 0 ? normalized : `${normalized}-${count + 1}`;
  };
}

export function extractMarkdownHeadings(content: string): MarkdownHeading[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const nextHeadingId = createHeadingIdGenerator();
  const headings: MarkdownHeading[] = [];
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();

    headings.push({
      id: nextHeadingId(text),
      text,
      level,
    });
  }

  return headings;
}
