export type DemoCategory = { name: string; count: number; color: string };
export type DemoTag = { name: string; count: number };

export const initialDemoCategories: DemoCategory[] = [
  { name: "生活随感", count: 18, color: "#3b82f6" },
  { name: "效率工具", count: 12, color: "#8b5cf6" },
  { name: "创作心得", count: 15, color: "#10b981" },
  { name: "探店记录", count: 9, color: "#f97316" },
  { name: "旅行指南", count: 21, color: "#ec4899" },
  { name: "科技视界", count: 11, color: "#14b8a6" },
];

export const initialDemoTags: DemoTag[] = [
  { name: "旅行", count: 32 },
  { name: "写作", count: 25 },
  { name: "Mac", count: 14 },
  { name: "效率", count: 19 },
  { name: "摄影", count: 16 },
  { name: "感悟", count: 28 },
  { name: "咖啡", count: 10 },
  { name: "读书", count: 22 },
  { name: "极简", count: 12 },
];
