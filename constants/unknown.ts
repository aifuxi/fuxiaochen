import { TagTypeEnum } from '@prisma/client';

/** 空数据文案 */
export const PLACEHOLDER_TEXT = 'N/A';

export const ADMIN_EMAILS = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',');

export const TAG_TYPES = [
  TagTypeEnum.ALL,
  TagTypeEnum.BLOG,
  TagTypeEnum.NOTE,
  TagTypeEnum.SNIPPET,
];

export const TAG_TYPE_MAP = {
  [TagTypeEnum.ALL]: '通用',
  [TagTypeEnum.BLOG]: '博客',
  [TagTypeEnum.NOTE]: '笔记',
  [TagTypeEnum.SNIPPET]: '片段',
};

export enum PUBLISHED_ENUM {
  ALL = 'all',
  PUBLISHED = 'published',
  NO_PUBLISHED = 'no_published',
}

export const PUBLISHED_LABEL_MAP = {
  [PUBLISHED_ENUM.ALL]: '全部',
  [PUBLISHED_ENUM.PUBLISHED]: '已发布',
  [PUBLISHED_ENUM.NO_PUBLISHED]: '未发布',
};

export const PUBLISHED_MAP = {
  [PUBLISHED_ENUM.ALL]: undefined,
  [PUBLISHED_ENUM.PUBLISHED]: true,
  [PUBLISHED_ENUM.NO_PUBLISHED]: false,
};

//  埋点信息cuid Local Storage key，使用 cuid 作为用户唯一标识
export const STORAGE_KEY_EVENT_TRACKING_CUID = 'event_tracking_cuid';

type NavItem = {
  link: string;
  label: string;
};

export const navItems: NavItem[] = [
  { label: '首页', link: '/' },
  { label: '博客', link: '/blog' },
  { label: '片段', link: '/snippet' },
  { label: '关于', link: '/about' },
];
