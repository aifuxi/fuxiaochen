/** 独立预览的示例内容；不读取设置、数据库或环境变量。 */
export type PreviewPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  categoryId: string;
  tagIds: string[];
  featured?: boolean;
  body: string[];
};

export const author = {
  name: "付小晨",
  role: "开发者 / 设计爱好者",
  subtitle: "记录生活，分享想法",
  about: ["记录生活，分享关于效率工具、创意设计、读书感悟与科技探索的见闻。"],
  socials: [] as { label: string; url: string }[],
};

export const categories = [
  { id: "engineering", name: "开发实践" },
  { id: "design", name: "设计思考" },
  { id: "tools", name: "效率工具" },
  { id: "life", name: "阅读与生活" },
];

export const tags = [
  { id: "css", name: "CSS" },
  { id: "javascript", name: "JavaScript" },
  { id: "nextjs", name: "Next.js" },
  { id: "sqlite", name: "SQLite" },
  { id: "writing", name: "写作" },
  { id: "reading", name: "阅读" },
  { id: "workflow", name: "工作流" },
  { id: "typography", name: "排版" },
  { id: "accessibility", name: "可访问性" },
  { id: "browser", name: "浏览器" },
];

// 日期、正文与数量均为预览样例，不代表站点实际发布记录。
export const posts: PreviewPost[] = [
  {
    id: "clear-writing",
    slug: "make-room-for-reading",
    title: "把页面留给阅读",
    excerpt: "从导航、分类到正文排版，重新整理一个个人博客。让内容更容易找到，也让阅读少一点打扰。",
    date: "2026-10-15",
    categoryId: "design",
    tagIds: ["typography", "writing", "accessibility"],
    featured: true,
    body: [
      "整理博客时，我先想的不是添一个新效果，而是打开页面的人想读什么。一个清楚的标题、一段简短的摘要，以及稳定的阅读节奏，往往已经足够。",
      "分类适合回答文章讨论哪个方向，标签适合补充具体主题。把它们放回文章列表，让浏览、搜索和筛选发生在同一个地方，读者就能少走几次往返。",
      "文章内容应该直接出现在页面上。只有需要一起操作或具有独立意义的信息，才值得拥有一个单独的容器。留白用来划分段落，也用来让重要的内容更容易被看见。",
    ],
  },
  {
    id: "sqlite",
    slug: "sqlite-backup-notes",
    title: "小型网站的 SQLite 备份笔记",
    excerpt: "把备份当成一个需要验证的过程：从一致性快照到独立恢复，记录容易被忽略的边界。",
    date: "2026-10-12",
    categoryId: "engineering",
    tagIds: ["sqlite", "workflow"],
    body: [
      "备份是否可用，最终要通过恢复来回答。先明确文件边界、保存位置和验证方式，再选择适合当前网站的维护流程。",
      "这是一篇排版预览样例。正式运维请以项目已有维护文档和实际验证结果为准。",
    ],
  },
  {
    id: "browser",
    slug: "a-smaller-browser-workspace",
    title: "让浏览器工作区轻一点",
    excerpt: "留下正在做的事，归档暂时不用的页面。用几个简单习惯，减少在标签页之间来回寻找的时间。",
    date: "2026-10-09",
    categoryId: "tools",
    tagIds: ["browser", "workflow"],
    body: [
      "浏览器里总有一些页面只是暂时放着。定期整理它们，比给所有页面增加新的分类更有效。",
      "把资料收集和当前任务分开，在结束一天的工作前记录下一步，第二天就更容易继续。",
    ],
  },
  {
    id: "css",
    slug: "a-quiet-type-scale",
    title: "用 CSS 建立稳定的阅读节奏",
    excerpt: "字号、行高和段落间距不必各自为政。让它们围绕正文比例变化，页面就会更自然。",
    date: "2026-10-06",
    categoryId: "engineering",
    tagIds: ["css", "typography"],
    body: [
      "正文是一页里出现最多的元素。先确定正文，再围绕它建立标题和段落间距，往往比从最大的标题开始更稳妥。",
      "在不同的屏幕上保留同一种比例关系，让窄屏里的文章仍然能轻松阅读。",
    ],
  },
  {
    id: "reading",
    slug: "reading-with-a-question",
    title: "带着一个问题去读书",
    excerpt: "少记一点原句，多写一点自己的理解。阅读笔记可以从一个真正想弄明白的问题开始。",
    date: "2026-10-03",
    categoryId: "life",
    tagIds: ["reading", "writing"],
    body: [
      "一本书不一定需要完整的摘录。有时候，记下一个问题和读完后的回答，更能帮助自己保留真正有用的部分。",
      "等过一段时间重新打开笔记，看看当时的回答有没有改变。",
    ],
  },
  {
    id: "focus",
    slug: "focus-is-part-of-the-design",
    title: "键盘焦点也是设计的一部分",
    excerpt:
      "试着不用鼠标走完一次页面。焦点顺序、展开状态和关闭后的去向，会暴露许多平时看不到的问题。",
    date: "2026-09-28",
    categoryId: "design",
    tagIds: ["accessibility", "css"],
    body: [
      "焦点不是最后加上的一圈边框。它告诉使用键盘的人现在在哪里，以及接下来可以做什么。",
      "在真实页面里走一遍打开、选择、取消和返回，才能确认交互是完整的。",
    ],
  },
  {
    id: "next",
    slug: "a-small-nextjs-project",
    title: "整理一个小型 Next.js 项目的边界：从页面、数据读取到交互状态的职责划分",
    excerpt: "把数据读取、页面呈现和交互拆清楚。目录不需要很多，但每个文件应该有明确的职责。",
    date: "2026-09-24",
    categoryId: "engineering",
    tagIds: ["nextjs", "javascript"],
    body: [
      "小项目也需要边界，不过边界不一定意味着增加很多层。先从页面、数据和交互的实际职责开始整理。",
      "让代码的位置能够解释它为什么在这里，比为了统一而统一更重要。",
    ],
  },
  {
    id: "notes",
    slug: "notes-that-can-be-found",
    title: "让笔记在需要的时候找得到",
    excerpt: "给笔记起一个清楚的名字，留下当时的上下文。搜索能解决的问题，不一定要建立复杂目录。",
    date: "2026-09-20",
    categoryId: "tools",
    tagIds: ["workflow", "writing"],
    body: [
      "标题应该能够帮助以后的自己想起内容。写下背景、做出的决定和仍然不确定的地方，比只保留结论更有用。",
    ],
  },
  {
    id: "weekend",
    slug: "an-afternoon-without-a-list",
    title: "一个没有待办清单的下午",
    excerpt: "关掉提醒，读几页书，出去走一小段路。有些时间不需要变成一项完成记录。",
    date: "2026-09-16",
    categoryId: "life",
    tagIds: ["reading"],
    body: [
      "有些下午不需要安排得很满。放下正在做的事，读一点书，或者只是出去走走，也是生活的一部分。",
    ],
  },
  {
    id: "tokens",
    slug: "design-tokens-in-practice",
    title: "设计变量应该表达用途",
    excerpt: "从颜色名字走向界面语义。相同的颜色可以有不同职责，清楚的命名让主题切换更容易维护。",
    date: "2026-09-12",
    categoryId: "design",
    tagIds: ["css", "accessibility"],
    body: [
      "一个颜色变量应该帮助使用它的人做决定。文字、表面和焦点各自承担不同职责，命名也应该体现这种区别。",
    ],
  },
  {
    id: "js",
    slug: "small-javascript-utilities",
    title: "几个值得保留的小工具函数",
    excerpt: "处理日期、整理查询参数和安全地展示空值。把反复遇到的小问题写清楚，比过早抽象更实用。",
    date: "2026-09-08",
    categoryId: "engineering",
    tagIds: ["javascript", "workflow"],
    body: [
      "当一段逻辑在多个地方重复出现，而且有同样的边界条件时，再把它整理成工具函数。让调用处仍然能读懂发生了什么。",
    ],
  },
  {
    id: "devtools",
    slug: "look-closer-with-devtools",
    title: "在 DevTools 里看清一个页面",
    excerpt: "先检查实际尺寸和状态，再猜测原因。截图记录结果，计算样式帮助解释结果是怎么来的。",
    date: "2026-09-03",
    categoryId: "tools",
    tagIds: ["browser", "css"],
    body: [
      "页面看起来不对时，先观察正在发生的事。明确视口、字体、内容和交互状态，问题就会更容易定位。",
    ],
  },
  {
    id: "revision",
    slug: "leave-a-little-time-to-revise",
    title: "写完之后，再读一遍",
    excerpt:
      "删掉重复的句子，把含糊的表达换成具体的例子。修改不只是润色，也是在重新确认自己的理解。",
    date: "2026-08-28",
    categoryId: "life",
    tagIds: ["writing", "reading"],
    body: [
      "把一篇文章放一会儿，再用读者的眼光重新看一遍。试着找出哪里需要例子，哪里只是重复了前面的意思。",
    ],
  },
];

export type PostQuery = { q?: string; categoryId?: string; tagId?: string; page?: number };
export function postsHref(query: PostQuery = {}) {
  const params = new URLSearchParams();
  if (query.q?.trim()) params.set("q", query.q.trim());
  if (query.categoryId) params.set("categoryId", query.categoryId);
  if (query.tagId) params.set("tagId", query.tagId);
  if (query.page && query.page > 1) params.set("page", String(query.page));
  return "#/posts" + (params.size ? "?" + params.toString() : "");
}
