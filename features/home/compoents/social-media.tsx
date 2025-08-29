import {
  IconBrandBilibili,
  IconBrandGithub,
  IconLogoJuejin,
  IconSkillGmailDark,
  IconSkillGmailLight,
} from "@/components/icons";

import { BILIBILI_PAGE, EMAIL, GITHUB_PAGE, JUEJIN_PAGE } from "@/constants";

export const socialMediaList: {
  icon: React.ReactNode;
  label: string;
  link: string;
}[] = [
  {
    icon: <IconBrandGithub className="text-base" />,
    label: "Github",
    link: GITHUB_PAGE,
  },
  {
    icon: (
      <>
        <IconSkillGmailDark
          className={`
            text-base
            dark:hidden
          `}
        />
        <IconSkillGmailLight
          className={`
            hidden text-base
            dark:inline-block
          `}
        />
      </>
    ),
    label: "Gmail",
    link: `mailto:${EMAIL}`,
  },
  {
    icon: <IconBrandBilibili className={`text-base text-[#00AEEC]`} />,
    label: "Bilibili",
    link: BILIBILI_PAGE,
  },
  {
    icon: <IconLogoJuejin className={`text-base text-[#2985fc]`} />,
    label: "掘金",
    link: JUEJIN_PAGE,
  },
];
