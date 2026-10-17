// 正文只保存这些主题变量，避免任意 CSS 进入文档，也使深浅模式使用同一份内容。
export const CONTENT_COLORS = [
  { name: "灰色", key: "gray" },
  { name: "红色", key: "red" },
  { name: "橙色", key: "orange" },
  { name: "黄色", key: "yellow" },
  { name: "绿色", key: "green" },
  { name: "蓝色", key: "blue" },
  { name: "紫色", key: "purple" },
] as const;

export type ContentColor = (typeof CONTENT_COLORS)[number]["key"];
export const contentColorKeys = CONTENT_COLORS.map((item) => item.key);
export const textColor = (key: ContentColor) => `var(--article-${key})`;
export const highlightColor = (key: ContentColor, strong = false) =>
  `var(--article-${key}-bg${strong ? "-strong" : ""})`;
export const CONTENT_BACKGROUNDS = [
  ...CONTENT_COLORS.map((item) => ({ name: item.name, value: highlightColor(item.key) })),
  { name: "默认", value: highlightColor("gray") },
  ...CONTENT_COLORS.map((item) => ({
    name: `深${item.name}`,
    value: highlightColor(item.key, true),
  })),
];
export const isTextColor = (value: unknown): value is string =>
  CONTENT_COLORS.some((item) => textColor(item.key) === value);
export const isHighlightColor = (value: unknown): value is string =>
  CONTENT_COLORS.some(
    (item) => highlightColor(item.key) === value || highlightColor(item.key, true) === value,
  );
export const isContentColor = (value: unknown): value is ContentColor =>
  contentColorKeys.some((key) => key === value);
