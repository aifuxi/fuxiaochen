import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  IconBrandBilibili,
  IconBrandGithub,
  IconLogoJuejin,
  IconSkillGmailDark,
  IconSkillGmailLight,
} from "@/components/icons";

import {
  BILIBILI_PAGE,
  EMAIL,
  GITHUB_PAGE,
  JUEJIN_PAGE,
  NICKNAME,
  PATHS,
} from "@/constants";
import { cn } from "@/lib/utils";

import { TypeIntro } from "./type-intro";

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

export const HeroSection = () => {
  return (
    <div
      className={`
        flex min-h-full max-w-screen-md flex-col justify-center gap-5 px-6
        md:px-10
        2xl:max-w-7xl
      `}
    >
      <p
        className={`
          text-2xl tracking-widest
          md:text-5xl
        `}
      >
        你好，我是
      </p>
      <strong
        className={cn(
          `
            bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-5xl font-black tracking-widest
            md:text-8xl
          `,
        )}
        style={{
          WebkitTextFillColor: "transparent",
        }}
      >
        {NICKNAME}
      </strong>
      <div>
        <TypeIntro />
      </div>
      <p
        className={cn(`
          text-2xl tracking-widest
          md:text-5xl
        `)}
      >
        喜欢
        <span className={`font-semibold text-[#00d8ff]`}>React</span>、
        <span className={`font-semibold text-[#007acc]`}>TypeScript</span>
        <span className="ml-4">\owo/ ~</span>
      </p>
      <p
        className={cn(
          `
            text-base tracking-widest text-muted-foreground
            md:text-2xl
          `,
        )}
      >
        我在这个网站记录我的成长，努力 💪 成为一个更好的程序员。
      </p>
      <div className={cn("flex space-x-4")}>
        <Link
          href={PATHS.BLOGS}
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          我的博客
        </Link>
        <Link
          href={PATHS.ABOUT}
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          关于我
        </Link>
      </div>

      <ul className={cn("flex space-x-4")}>
        {socialMediaList.map((el) => (
          <li key={el.link}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button asChild variant="outline" size="icon">
                  <Link href={el.link} target="_blank">
                    {el.icon}
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{el.label}</TooltipContent>
            </Tooltip>
          </li>
        ))}
      </ul>
    </div>
  );
};
