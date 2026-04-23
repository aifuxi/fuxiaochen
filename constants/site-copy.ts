import { routes } from "@/constants/routes";

export const siteNavLinks = [
  { href: routes.site.home, label: "首页" },
  { href: routes.site.blog, label: "博客" },
  { href: routes.site.projects, label: "项目" },
  { href: routes.site.friends, label: "友链" },
  { href: routes.site.about, label: "关于" },
  { href: routes.site.changelog, label: "更新日志" },
] as const;

export const siteCopy = {
  metadata: {
    root: {
      title: "Fuxiaochen - 全栈开发者",
      description:
        "专注于构建可访问、细节扎实的 Web 产品，持续分享 Web 开发、设计与效率实践。",
    },
    about: {
      title: "关于 | Fuxiaochen",
      description:
        "了解 Fuxiaochen 的经历、技能栈，以及我对产品、工程与创作的长期兴趣。",
    },
    blog: {
      title: "博客 | Fuxiaochen",
      description: "分享关于 Web 开发、设计、工具与工作流的文章与思考。",
    },
    projects: {
      title: "项目 | Fuxiaochen",
      description: "浏览 Fuxiaochen 的项目实践、开源作品与长期积累。",
    },
    friends: {
      title: "友链 | Fuxiaochen",
      description: "这里收录了我关注的朋友，以及他们的博客、作品与主页。",
    },
    changelog: {
      title: "更新日志 | Fuxiaochen",
      description: "查看站点、内容和项目的最新迭代、优化与修复记录。",
    },
  },
  hero: {
    role: "全栈开发者",
    summary:
      "我专注于构建可访问、细节扎实且易于维护的 Web 体验，持续打磨能真正解决问题的产品与工作流。",
    description:
      "过去几年里，我在不同规模的团队中参与过从前端体验到全栈交付的工作，也会记录 Web 开发、设计与效率实践中的经验。",
    primaryCta: "阅读博客",
    secondaryCta: "了解我",
  },
  home: {
    featuredTitle: "精选文章",
    featuredAction: "查看全部",
    featuredEmptyTitle: "暂无精选文章",
    featuredEmptyDescription: "可以先去博客页看看最新发布的内容。",
    recentTitle: "最新文章",
    recentAction: "全部文章",
  },
  footer: {
    description: "用代码与审美构建可信赖的数字体验。",
    linksTitle: "站点导航",
    connectTitle: "保持联系",
    copyright: "版权所有",
    builtWith: "使用 Next.js 与 Tailwind CSS 构建",
  },
  about: {
    title: "关于我",
    role: "全栈开发者",
    bioTitle: "你好",
    location: "San Francisco, CA",
    bio: [
      "我是一名全栈开发者，长期关注产品体验、工程效率与长期可维护性，习惯用 React、Next.js 与 TypeScript 构建现代 Web 应用。",
      "进入软件开发领域以来，我参与过创业团队、数字代理机构和企业项目的交付。我重视清晰的架构、稳定的实现，以及真正对用户有帮助的体验设计。",
      "不写代码的时候，我通常会整理技术文章、关注开源社区的新动态，或者继续研究前端工程、设计系统和工作流优化相关的话题。",
    ],
    experienceTitle: "经历",
    experience: [
      {
        role: "高级全栈开发者",
        company: "科技创业公司",
        period: "2022 - 至今",
        description:
          "负责前端架构和关键功能交付，使用 React、Next.js 与 TypeScript 构建可扩展的 Web 应用。",
      },
      {
        role: "全栈开发者",
        company: "数字代理机构",
        period: "2020 - 2022",
        description:
          "为不同行业客户定制 Web 方案，重点关注性能、可访问性与交互体验。",
      },
      {
        role: "前端开发者",
        company: "软件公司",
        period: "2018 - 2020",
        description:
          "负责企业级界面开发与设计系统落地，持续提升组件复用与界面一致性。",
      },
    ],
    skillsTitle: "技能",
    skillLabels: {
      languages: "语言",
      frontend: "前端",
      backend: "后端",
      tools: "工具",
    },
    beyondCodeTitle: "代码之外",
    interests: [
      {
        title: "开源",
        description: "关注并参与能提升开发者效率与体验的开源项目。",
      },
      {
        title: "写作",
        description: "通过文章、教程与笔记沉淀经验，分享可复用的方法。",
      },
      {
        title: "摄影",
        description: "用影像记录细节，也借此训练对构图与叙事的敏感度。",
      },
    ],
    ctaTitle: "一起做点有意思的事",
    ctaDescription:
      "如果你正在推进新的项目、内容或产品，也欢迎来聊合作、创意和实现方案。",
    ctaPrimary: "联系我",
    ctaSecondary: "查看项目",
  },
  blogList: {
    title: "博客",
    description: "记录我在 Web 开发、设计、效率与产品实践中的思考。",
    searchPlaceholder: "按标题、摘要或正文搜索文章",
    categoryPlaceholder: "分类",
    categoryAll: "全部分类",
    tagPlaceholder: "标签",
    tagAll: "全部标签",
    clearFilters: "清除筛选",
    resultCount: (count: number) => `共找到 ${count} 篇文章`,
    emptyTitle: "没有找到相关文章",
    emptyDescription: "试试调整搜索关键词或筛选条件。",
    clearAllFilters: "清除全部筛选",
  },
  blogPost: {
    notFound: "文章不存在或暂未公开。",
    loading: "文章加载中...",
    backToBlog: "返回博客",
    similarTitle: "相关文章",
  },
  comments: {
    title: (count: number) => `评论（${count}）`,
    formTitle: "发表评论",
    success: "评论已提交，审核通过后会显示在页面上。",
    name: "昵称",
    namePlaceholder: "你的名字",
    email: "邮箱",
    emailPlaceholder: "your@email.com",
    content: "评论内容",
    contentPlaceholder: "分享你的看法...",
    submitLoading: "提交中...",
    submitAction: "发布评论",
    submitError: "评论提交失败，请稍后再试。",
    empty: "还没有评论，欢迎留下第一条留言。",
  },
  projects: {
    title: "项目",
    description:
      "这里收录了我持续投入的项目与作品，从开源工具到完整应用，每个项目都对应一段真实的学习与迭代过程。",
    featuredTitle: "精选项目",
    allTitle: "全部项目",
    githubLabel: "GitHub",
    demoLabel: "在线预览",
    emptyTitle: "暂时还没有公开项目",
    emptyDescription: "项目内容整理完成后会在这里更新。",
    featuredEmpty: "暂无精选项目",
    ctaTitle: "有项目想法？",
    ctaDescription:
      "如果你正在筹备新项目、产品或合作机会，欢迎联系我，一起把想法落地。",
    ctaPrimary: "开始交流",
    ctaSecondary: "关注 GitHub",
  },
  friends: {
    title: "友链",
    description:
      "这里收录了我关注的朋友，以及他们值得一看的博客、项目和个人主页。",
    categories: {
      developer: "开发者",
      designer: "设计师",
      blogger: "博主",
      creator: "创作者",
    },
    emptyTitle: "暂无友链内容",
    emptyDescription: "后续整理完成后会在这里陆续补充。",
    ctaTitle: "想交换友链？",
    ctaDescription:
      "如果你也有博客、作品集或个人主页，欢迎联系我，一起互相推荐。",
    ctaAction: "联系我",
  },
  changelog: {
    title: "更新日志",
    description: "记录站点、内容与项目的最新迭代、优化与修复。",
    types: {
      feature: "新功能",
      improvement: "优化",
      bugfix: "修复",
      breaking: "破坏性变更",
    },
    emptyTitle: "暂无更新记录",
    emptyDescription: "新的版本说明会在后续发布后显示在这里。",
  },
  errors: {
    linksLabel: "你可以继续前往",
    notFound: {
      code: "404",
      eyebrow: "页面未找到",
      title: "这个页面已经不在这里了",
      description:
        "你访问的链接可能已经失效、被移动，或者从未存在过。先回到首页，或者直接去博客和项目页继续浏览。",
      primaryAction: "返回首页",
      secondaryAction: "查看博客",
      tertiaryAction: "浏览项目",
    },
    internal: {
      code: "500",
      eyebrow: "服务异常",
      title: "页面加载时出了点问题",
      description:
        "这通常是暂时性的错误。你可以重新尝试当前操作，或者先回到首页继续浏览其他内容。",
      primaryAction: "再试一次",
      secondaryAction: "返回首页",
      tertiaryAction: "查看博客",
    },
  },
  toc: {
    title: "本页目录",
  },
  theme: {
    toggle: "切换主题",
    light: "浅色",
    dark: "深色",
    system: "跟随系统",
  },
} as const;
