export const friendCategories = ["技术博客", "生活感悟", "创意设计"] as const;
export const friendStatuses = ["正常", "待审核", "异常"] as const;

export type FriendLink = {
  id: string;
  name: string;
  url: string;
  avatar: string;
  description: string;
  category: (typeof friendCategories)[number];
  status: (typeof friendStatuses)[number];
};

export const initialFriendsLinks: FriendLink[] = [
  {
    id: "friend-1",
    name: "拾光漫步",
    url: "https://shiguang.example.com",
    avatar: "/media/forest.jpg",
    description: "记录生活中的小确幸，留存每一抹温柔。",
    category: "生活感悟",
    status: "正常",
  },
  {
    id: "friend-2",
    name: "代码与诗",
    url: "https://codepoetry.example.com",
    avatar: "/media/desk.jpg",
    description: "用逻辑构建世界，用诗意点缀灵魂。",
    category: "技术博客",
    status: "正常",
  },
  {
    id: "friend-3",
    name: "数字极简主义",
    url: "https://minimalist.example.com",
    avatar: "/media/vinyl.jpg",
    description: "专注极简生活，摆脱数字噪音，回归纯真。",
    category: "创意设计",
    status: "正常",
  },
  {
    id: "friend-4",
    name: "极客风暴",
    url: "https://geekstorm.example.com",
    avatar: "/media/camera.jpg",
    description: "探索前沿科技，分享极客折腾日记。",
    category: "技术博客",
    status: "异常",
  },
  {
    id: "friend-5",
    name: "云端彼岸",
    url: "https://cloudside.example.com",
    avatar: "/media/road.jpg",
    description: "渴望交换友链，期待与有温度的你相遇。",
    category: "生活感悟",
    status: "待审核",
  },
];
