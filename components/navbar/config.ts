import { PATHS, PATHS_MAP } from "@/constants";

export const navItems: {
  label?: string;
  link: string;
  external?: boolean;
}[] = [
  {
    label: PATHS_MAP[PATHS.HOME],
    link: PATHS.HOME,
  },
  {
    label: PATHS_MAP[PATHS.BLOG],
    link: PATHS.BLOG,
  },
  {
    label: PATHS_MAP[PATHS.SNIPPET],
    link: PATHS.SNIPPET,
  },
  {
    label: PATHS_MAP[PATHS.ABOUT],
    link: PATHS.ABOUT,
  },
];
