import {
  BILIBILI_PAGE,
  BRAND_COLOR_BILIBILI,
  BRAND_COLOR_JUEJIN,
  EMAIL,
  GITHUB_PAGE,
  JUEJIN_PAGE,
} from '@/config';

import {
  IconBaranGithub,
  IconBrandBilibili,
  IconLogoGmail,
  IconLogoJuejin,
} from '@/components/icons';

export const socialMediaList: Array<{
  icon: React.ReactNode;
  label: string;
  link: string;
}> = [
  {
    icon: <IconBaranGithub className="text-2xl" />,
    label: 'Github',
    link: GITHUB_PAGE,
  },
  {
    icon: <IconLogoGmail className="text-lg" />,
    label: 'Gmail',
    link: `mailto:${EMAIL}`,
  },
  {
    icon: (
      <IconBrandBilibili
        className={`text-2xl transition-colors text-[${BRAND_COLOR_BILIBILI}]`}
      />
    ),
    label: 'Bilibili',
    link: BILIBILI_PAGE,
  },
  {
    icon: (
      <IconLogoJuejin
        className={`text-2xl transition-colors text-[${BRAND_COLOR_JUEJIN}]`}
      />
    ),
    label: '掘金',
    link: JUEJIN_PAGE,
  },
];
