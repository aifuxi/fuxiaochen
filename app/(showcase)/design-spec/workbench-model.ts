export const sectionGroups = [
  {
    label: "基础",
    sections: [
      {
        id: "colors",
        label: "颜色",
        english: "Color",
        description: "从表面到文字，为每一种颜色明确用途。色值对应本页当前预览。",
      },
      {
        id: "typography",
        label: "排版",
        english: "Typography",
        description: "以中文阅读为基础，建立标题、正文与辅助信息的清晰层级。",
      },
      {
        id: "spacing",
        label: "圆角与间距",
        english: "Shape & space",
        description: "用一致的形状和间距，保持工作台紧凑、清晰的阅读节奏。",
      },
    ],
  },
  {
    label: "组件",
    sections: [
      {
        id: "buttons",
        label: "按钮",
        english: "Button",
        description: "按操作的重要程度选择样式，体验悬停、按下、焦点与禁用状态。",
      },
      {
        id: "cards",
        label: "卡片",
        english: "Card",
        description: "让内容决定卡片结构，并为可操作的卡片提供明确入口。",
      },
      {
        id: "inputs",
        label: "输入",
        english: "Input",
        description: "用填充底色、可见标签和独立的键盘焦点识别输入区域。",
      },
      {
        id: "selection",
        label: "选择",
        english: "Select & combobox",
        description: "固定选项使用选择器，较长的列表允许输入筛选。",
      },
      {
        id: "switch",
        label: "开关",
        english: "Switch",
        description: "用明确的标签和文字反馈表达即时生效的二元状态。",
      },
      {
        id: "tabs",
        label: "标签页",
        english: "Tabs",
        description: "在同一上下文中切换内容，保持位置与当前选择清晰可见。",
      },
      {
        id: "accordion",
        label: "折叠面板",
        english: "Accordion",
        description: "按需展开补充信息，保留标题作为稳定的浏览入口。",
      },
      {
        id: "dialog",
        label: "弹窗",
        english: "Dialog",
        description: "将注意力集中到一个任务，完成或取消后返回原来的操作位置。",
      },
    ],
  },
  {
    label: "组合场景",
    sections: [
      {
        id: "contact",
        label: "联系表单",
        english: "Contact form",
        description: "把标签、输入、选择和反馈组合成可完成的表单。提交仅在本页演示。",
      },
      {
        id: "input-group",
        label: "搜索与组合输入",
        english: "Input group",
        description: "让输入与附加操作共用填充表面，兼顾密度与清晰的焦点反馈。",
      },
      {
        id: "errors",
        label: "错误与恢复",
        english: "Error & recovery",
        description: "对照六类真实控件，检查错误、禁用与恢复后的状态。",
      },
    ],
  },
  {
    label: "动效",
    sections: [
      {
        id: "timing",
        label: "反馈节奏",
        english: "Timing",
        description: "短反馈跟随操作，较长过渡帮助理解状态变化。",
      },
      {
        id: "effects",
        label: "效果舞台",
        english: "Effects",
        description: "主动播放与比较效果，每次只运行一个舞台。离开后自动暂停。",
      },
      {
        id: "cursor",
        label: "指针",
        english: "Cursor",
        description: "在普通区域、按钮和输入框中核对指针造型与语义反馈。",
      },
    ],
  },
  {
    label: "使用说明",
    sections: [
      {
        id: "guidelines",
        label: "原则与来源",
        english: "Guidelines",
        description: "了解设计取舍、组件来源，以及当前试验的适用范围。",
      },
    ],
  },
] as const;

export type SectionId = (typeof sectionGroups)[number]["sections"][number]["id"];

export function resolveSection(hash: string): SectionId {
  const aliases: Record<string, SectionId> = {
    overview: "colors",
    foundations: "colors",
    components: "buttons",
    forms: "contact",
    motion: "effects",
  };
  for (const group of sectionGroups) {
    for (const section of group.sections) if (section.id === hash) return section.id;
  }
  return Object.hasOwn(aliases, hash) ? aliases[hash] : "colors";
}

export function findSection(id: SectionId) {
  for (const group of sectionGroups) {
    for (const section of group.sections) if (section.id === id) return { section, group };
  }
  return { section: sectionGroups[0].sections[0], group: sectionGroups[0] };
}
