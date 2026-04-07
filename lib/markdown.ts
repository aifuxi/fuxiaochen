export type TocItem = {
  depth: number;
  id: string;
  title: string;
};

export function slugifyHeading(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[`~!@#$%^&*()+=,[\]/{}|\\:;"'<>,.?]/g, "")
    .replace(/\s+/g, "-");
}

export function extractToc(markdown: string) {
  return markdown
    .split("\n")
    .map((line) => line.match(/^(#{2,3})\s+(.+)$/))
    .filter((match): match is RegExpMatchArray => Boolean(match))
    .map((match) => ({
      depth: match[1].length,
      id: slugifyHeading(match[2]),
      title: match[2].trim(),
    }));
}
