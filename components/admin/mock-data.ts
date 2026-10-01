export type PostStatus = "已发布" | "草稿" | "已排期";
export type Post = {
  id: string;
  title: string;
  category: string;
  tags: string[];
  content: string;
  status: PostStatus;
  date: string;
  views: number | null;
  scheduledFor?: string;
};
export type CommentStatus = "待审核" | "已通过" | "已拒绝";
export type Comment = {
  id: string;
  author: string;
  time: string;
  content: string;
  postTitle: string;
  status: CommentStatus;
  email: string;
  timestamp: string;
  replyTo?: string;
};
export type Schedule = { id: string; title: string; date: string };
export type Notice = { id: string; title: string; detail: string; time: string; read: boolean };

export const initialPosts: Post[] = [
  {
    id: "post-1",
    title: "在路上小确幸的生活",
    category: "生活随感",
    tags: ["旅行", "感悟"],
    content: "记录旅途中那些微小而确实的喜悦。",
    status: "已发布",
    date: "2025-05-19",
    views: 2458,
  },
  {
    id: "post-2",
    title: "Mac 效率工具清单（2025 版）",
    category: "效率工具",
    tags: ["Mac", "工具"],
    content: "整理日常使用的效率工具与写作工作流。",
    status: "已发布",
    date: "2025-05-18",
    views: 1876,
  },
  {
    id: "post-3",
    title: "如何保持写作灵感：10 个实用方法",
    category: "创作心得",
    tags: ["写作", "灵感"],
    content: "从灵感收集、自由写作和阅读输入开始，建立稳定的创作节奏。",
    status: "已发布",
    date: "2025-05-16",
    views: 3241,
  },
  {
    id: "post-4",
    title: "周末咖啡馆探店记录",
    category: "探店记录",
    tags: ["咖啡"],
    content: "一个适合慢下来的周末下午。",
    status: "草稿",
    date: "2025-05-20",
    views: null,
  },
  {
    id: "post-5",
    title: "旅行目的地 7 个小技巧",
    category: "旅行指南",
    tags: ["旅行"],
    content: "从路线到行李，整理让旅途更轻松的方法。",
    status: "草稿",
    date: "2025-05-18",
    views: null,
  },
];

export const initialComments: Comment[] = [
  {
    id: "comment-1",
    email: "xiaoyu@example.test",
    timestamp: "2025-05-20T13:00:00+08:00",
    author: "小雨",
    time: "10 分钟前",
    content: "这篇文章太实用了！特别是建立灵感库和自由写作的部分，很有启发。",
    postTitle: "如何保持写作灵感：10 个实用方法",
    status: "待审核",
  },
  {
    id: "comment-2",
    email: "jason@example.test",
    timestamp: "2025-05-20T12:00:00+08:00",
    author: "Jason",
    time: "35 分钟前",
    content: "工具清单很给力，已经收藏了。期待更多真实的使用体验。",
    postTitle: "Mac 效率工具清单（2025 版）",
    status: "待审核",
  },
  {
    id: "comment-3",
    email: "chenguang@example.test",
    timestamp: "2025-05-20T11:00:00+08:00",
    author: "晨光大海",
    time: "1 小时前",
    content: "关于光线的解释很清楚。入门相机和定焦镜头有什么推荐？",
    postTitle: "摄影入门：光线的魔法",
    status: "待审核",
  },
  {
    id: "comment-4",
    email: "traveler@example.test",
    timestamp: "2025-05-20T10:00:00+08:00",
    author: "旅行者",
    time: "2 小时前",
    content: "这个咖啡馆看起来很温暖，想知道具体位置和推荐的手冲。",
    postTitle: "周末咖啡馆探店记录",
    status: "待审核",
  },
  {
    id: "comment-5",
    email: "forest@example.test",
    timestamp: "2025-05-20T09:00:00+08:00",
    author: "Forest",
    time: "3 小时前",
    content: "文字很有温度，已加入书签，期待更多路上的故事。",
    postTitle: "在路上小确幸的生活",
    status: "待审核",
  },
  {
    id: "comment-6",
    author: "林间",
    email: "linjian@example.test",
    time: "昨天",
    timestamp: "2025-05-19T18:00:00+08:00",
    content: "喜欢这种慢下来的记录方式，谢谢分享。",
    postTitle: "在路上小确幸的生活",
    status: "已通过",
  },
  {
    id: "comment-7",
    author: "阿宁",
    email: "aning@example.test",
    time: "昨天",
    timestamp: "2025-05-19T15:00:00+08:00",
    content: "按照清单整理了工作流，写作效率提升了很多。",
    postTitle: "Mac 效率工具清单（2025 版）",
    status: "已通过",
  },
  {
    id: "comment-8",
    author: "小北",
    email: "xiaobei@example.test",
    time: "2 天前",
    timestamp: "2025-05-18T12:00:00+08:00",
    content: "每天记录一个观察，这个方法很适合我。",
    postTitle: "如何保持写作灵感：10 个实用方法",
    status: "已通过",
  },
  {
    id: "comment-9",
    author: "推广账号",
    email: "promo@example.test",
    time: "3 天前",
    timestamp: "2025-05-17T10:00:00+08:00",
    content: "与文章无关的重复推广留言（垃圾评论演示）。",
    postTitle: "在路上小确幸的生活",
    status: "已拒绝",
  },
];

export const initialSchedules: Schedule[] = [
  { id: "schedule-1", title: "如何写出让人共鸣的文案", date: "2025-05-22 10:00" },
  { id: "schedule-2", title: "我的自驾工具推荐", date: "2025-05-24 14:00" },
  { id: "schedule-3", title: "摄影入门：光线的魔法", date: "2025-05-28 09:00" },
];

export const initialNotices: Notice[] = [
  {
    id: "notice-1",
    title: "有新的评论待审核",
    detail: "小雨评论了你的文章",
    time: "10 分钟前",
    read: false,
  },
  {
    id: "notice-2",
    title: "文章发布计划完成",
    detail: "定时文章已发布",
    time: "1 小时前",
    read: false,
  },
  {
    id: "notice-3",
    title: "模拟备份检查完成",
    detail: "演示数据状态正常",
    time: "4 小时前",
    read: true,
  },
];

export const initialSources = [
  { name: "直接访问", percentage: 52.7 },
  { name: "搜索引擎", percentage: 24.3 },
  { name: "社交媒体", percentage: 12.7 },
  { name: "外部链接", percentage: 6.1 },
  { name: "其他", percentage: 4.2 },
];

const visits = [
  3900, 4300, 4700, 4100, 5200, 5800, 5100, 5600, 6100, 5900, 5400, 6700, 6300, 7000, 6600, 6200,
  7100, 7300, 6800, 7500, 6900, 7200, 6500, 4000, 4200, 6000, 7500, 5800, 6400, 8200,
];
export const traffic30Days = visits.map((count, index) => {
  const day = new Date(Date.UTC(2025, 3, 21 + index));
  return {
    date: `${String(day.getUTCMonth() + 1).padStart(2, "0")}-${String(day.getUTCDate()).padStart(2, "0")}`,
    visits: count,
  };
});

export type MediaItem = {
  id: string;
  name: string;
  url: string;
  size: string;
  dimension: string;
  time: string;
  type: string;
  temporary?: boolean;
};

export const initialMedia: MediaItem[] = [
  {
    id: "media-1",
    name: "在路上的风景.jpg",
    url: "/media/road.jpg",
    size: "1.2 MB",
    dimension: "1920×1080",
    time: "2025-05-19 20:12",
    type: "image/jpeg",
  },
  {
    id: "media-2",
    name: "极简咖啡杯.jpg",
    url: "/media/coffee.jpg",
    size: "840 KB",
    dimension: "1200×1200",
    time: "2025-05-18 15:30",
    type: "image/jpeg",
  },
  {
    id: "media-3",
    name: "摄影镜头微距.jpg",
    url: "/media/camera.jpg",
    size: "2.1 MB",
    dimension: "2400×1600",
    time: "2025-05-16 11:24",
    type: "image/jpeg",
  },
  {
    id: "media-4",
    name: "复古黑胶唱片.jpg",
    url: "/media/vinyl.jpg",
    size: "1.5 MB",
    dimension: "1800×1200",
    time: "2025-05-15 09:40",
    type: "image/jpeg",
  },
  {
    id: "media-5",
    name: "博主精选写字台.jpg",
    url: "/media/desk.jpg",
    size: "1.8 MB",
    dimension: "2000×1333",
    time: "2025-05-14 14:15",
    type: "image/jpeg",
  },
  {
    id: "media-6",
    name: "绿色苔藓森林.jpg",
    url: "/media/forest.jpg",
    size: "2.4 MB",
    dimension: "2560×1440",
    time: "2025-05-12 18:22",
    type: "image/jpeg",
  },
];
