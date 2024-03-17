import { TagTypeEnum } from '@prisma/client';

/** 空数据文案 */
export const PLACEHODER_TEXT = 'N/A';

export const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',');

export const TAG_TYPES = [
  TagTypeEnum.ALL,
  TagTypeEnum.BLOG,
  TagTypeEnum.NOTE,
  TagTypeEnum.SIPPET,
];

export const TAG_TYPE_MAP = {
  [TagTypeEnum.ALL]: '通用',
  [TagTypeEnum.BLOG]: '博客',
  [TagTypeEnum.NOTE]: '笔记',
  [TagTypeEnum.SIPPET]: '片段',
};
