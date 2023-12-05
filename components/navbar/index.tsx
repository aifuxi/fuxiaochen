import { PATHS } from '@/constants/path';

const _navItems: Array<{
  label: string;
  link: string;
}> = [
  {
    label: '首页',
    link: PATHS.SITE_HOME,
  },
  {
    label: '文章',
    link: PATHS.SITE_ARTICLES,
  },
  {
    label: '标签',
    link: PATHS.SITE_TAGS,
  },
  {
    label: '关于',
    link: PATHS.SITE_ABOUT,
  },
];

export function Navbar() {
  return null;
}
