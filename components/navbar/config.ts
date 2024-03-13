import { PATHS, PATHS_MAP } from '@/config';

export const navItems: Array<{
  label?: string;
  link: string;
  external?: boolean;
}> = [
  {
    label: PATHS_MAP[PATHS.SITE_HOME],
    link: PATHS.SITE_HOME,
  },
  {
    label: PATHS_MAP[PATHS.SITE_BLOG],
    link: PATHS.SITE_BLOG,
  },
  {
    label: PATHS_MAP[PATHS.SITE_SNIPPET],
    link: PATHS.SITE_SNIPPET,
  },
];
