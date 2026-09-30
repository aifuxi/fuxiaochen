export const releaseTypes = {
  feature: "功能特性",
  fix: "缺陷修复",
  performance: "性能优化",
  security: "安全加固",
} as const;

export type ReleaseType = keyof typeof releaseTypes;
export type ReleaseLog = {
  id: string;
  version: string;
  date: string;
  type: ReleaseType;
  title: string;
  changes: string[];
};

export const initialReleaseLogs: ReleaseLog[] = [
  {
    id: "release-1",
    version: "v2.2.0",
    date: "2026-09-28",
    type: "feature",
    title: "全站组件库重构：统一界面设计与交互规范",
    changes: [
      "全面引入 Base UI 行为原语与本地可组合组件",
      "重构前台读者端与后台控制台，统一界面控件规范与视觉交互标准",
      "保留 Space Grotesk 字体，深度融入项目设计 token",
      "完善暗色主题、键盘焦点与减少动态效果支持",
    ],
  },
  {
    id: "release-2",
    version: "v2.1.0",
    date: "2026-07-18",
    type: "feature",
    title: "引入多维管理面板与友情链接枢纽",
    changes: [
      "优化评论管理模块，改善状态转移时的视觉抖动缺陷",
      "新增“友情链接”与“系统更新日志”核心支撑模块，完善整体管理矩阵布局",
      "强化文章快速检索系统，支持快捷键 ⌘K 随时唤起",
    ],
  },
  {
    id: "release-3",
    version: "v2.0.4",
    date: "2026-06-30",
    type: "security",
    title: "系统安全性加固与 API 可靠性升级",
    changes: [
      "优化接口防抖与拦截策略，防止因密钥缺失引起页面加载挂起",
      "调整 iframe 通信机制，改善高级 Web 接口安全隔离表现",
      "在全局设置模块提供只读形式的 API Key 安全隔离遮罩",
    ],
  },
  {
    id: "release-4",
    version: "v2.0.0",
    date: "2026-05-15",
    type: "feature",
    title: "内容管理系统 V2.0 重大更新",
    changes: [
      "新增全新的“分类与标签”双轴心管理引擎",
      "引入“访客日志”探针，提供包括 IP、系统、驻留时间在内的安全溯源监控",
      "系统主控制台集成多维数据漏斗分析、访问增长曲线",
      "完善暗色模式对齐机制，细化卡片表面层级",
    ],
  },
  {
    id: "release-5",
    version: "v1.4.2",
    date: "2026-03-10",
    type: "performance",
    title: "渲染管道与核心资源吞吐性能优化",
    changes: [
      "优化 Tailwind 编译管道，使构建包缩小近 40%",
      "为文章编写面板内的 Markdown 预览模块添加防无限渲染优化",
      "优化大批量文章查询和标签组合索引的数组搜索时间复杂度",
    ],
  },
];
