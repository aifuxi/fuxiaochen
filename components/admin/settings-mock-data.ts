export type BlogSettings = {
  title: string;
  subtitle: string;
  authorName: string;
  authorRole: string;
  avatarUrl: string;
  aboutMe: string;
  postsPerPage: number;
  enableComments: boolean;
  autoBackup: boolean;
};

export const initialSettings: BlogSettings = {
  title: "fuxiaochen",
  subtitle: "记录生活，分享想法",
  authorName: "fuxiaochen",
  authorRole: "开发者 / 设计爱好者",
  avatarUrl: "/avatar.avif",
  aboutMe:
    "记录生活，分享关于效率工具、创意设计、读书感悟与科技探索的见闻。在漫漫时光中，拾起那些散落的吉光片羽。",
  postsPerPage: 10,
  enableComments: true,
  autoBackup: true,
};
