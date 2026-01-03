import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

import {
  IconBrandGithub,
  IconGo,
  IconLogoCentOS,
  IconLogoGoogle,
  IconLogoRockyLinux,
  IconSkillCSS,
  IconSkillDebianDark,
  IconSkillDebianLight,
  IconSkillDocker,
  IconSkillFigmaDark,
  IconSkillFigmaLight,
  IconSkillHTML,
  IconSkillJavaScript,
  IconSkillMysqlDark,
  IconSkillMysqlLight,
  IconSkillNextjsDark,
  IconSkillNextjsLight,
  IconSkillNginx,
  IconSkillReactDark,
  IconSkillReactLight,
  IconSkillStackoverflowDark,
  IconSkillStackoverflowLight,
  IconSkillTailwindcssDark,
  IconSkillTailwindcssLight,
  IconSkillTypeScript,
} from "@/components/icons";

import { NICKNAME } from "@/constants";
import { cn } from "@/lib/utils";

export const revalidate = 60;

export default function Page() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <div className="mb-12">
        <h1 className="mb-4 text-4xl font-bold">关于</h1>
        <p className="text-lg text-muted-foreground">简单的自我介绍</p>
      </div>
      {/* eslint-disable-next-line better-tailwindcss/no-unregistered-classes */}
      <article className="prose mx-auto">
        <div>
          <div>
            <h2>我是谁</h2>
            <p>
              Hi~ 我是{NICKNAME}
              ，一名前端开发工程师，2020 年大专毕业，喜欢 Coding 和打游戏
            </p>
          </div>

          <div>
            <h2 className="my-4!">我的技能</h2>
          </div>

          <div>
            <h3>前端</h3>
            <ul>
              <li>
                <IconSkillHTML className="mx-1 translate-y-0.5" /> HTML +
                <IconSkillCSS className="mx-1 translate-y-0.5" />
                CSS + <IconSkillJavaScript className="mx-1 translate-y-0.5" />
                JavaScript，熟练使用
              </li>
              <li>
                <IconSkillTypeScript className="mx-1 translate-y-0.5" />
                TypeScript +
                <>
                  <IconSkillReactDark
                    className={`
                      mx-1 translate-y-0.5
                      dark:hidden
                    `}
                  />
                  <IconSkillReactLight
                    className={`
                      mx-1 hidden translate-y-0.5
                      dark:inline-block
                    `}
                  />
                </>
                React +
                <>
                  <IconSkillNextjsDark
                    className={`
                      mx-1 translate-y-0.5
                      dark:hidden
                    `}
                  />
                  <IconSkillNextjsLight
                    className={`
                      mx-1 hidden translate-y-0.5
                      dark:inline-block
                    `}
                  />
                </>
                Next.js + ahooks +
                <>
                  <IconSkillTailwindcssDark
                    className={`
                      mx-1 translate-y-0.5
                      dark:hidden
                    `}
                  />
                  <IconSkillTailwindcssLight
                    className={`
                      mx-1 hidden translate-y-0.5
                      dark:inline-block
                    `}
                  />
                </>
                Tailwind CSS，熟练使用
              </li>
            </ul>
          </div>
          <div>
            <h3>后端</h3>
            <ul>
              <li>
                <IconGo className={`mx-1 inline-block -translate-y-0.5`} />
                Go + MySQL
                <IconSkillMysqlDark
                  className={`
                    mx-1 translate-y-0.5
                    dark:hidden
                  `}
                />
                <IconSkillMysqlLight
                  className={`
                    mx-1 hidden translate-y-0.5
                    dark:inline-block
                  `}
                />
                能简单 CRUD 水平
              </li>
            </ul>
          </div>
          <div>
            <h3>其它</h3>
            <ul>
              <li>
                Zsh + Oh My Zsh + iTerm2 + JetBrainsMono Nerd Font
                Mono，舒服的很
              </li>
              <li>
                用过
                <IconSkillDebianDark
                  className={`
                    mx-1 translate-y-0.5
                    dark:hidden
                  `}
                />
                <IconSkillDebianLight
                  className={`
                    mx-1 hidden translate-y-0.5
                    dark:inline-block
                  `}
                />
                Debian（最近使用）、
                <IconLogoCentOS className="mx-1 translate-y-0.5" />
                CentOS、
                <IconLogoRockyLinux className="mx-1 translate-y-0.5" />
                Rocky Linux
              </li>
              <li>
                <IconSkillDocker className="mx-1 translate-y-0.5" />
                Docker，本地起个服务是真的方便
              </li>
              <li>
                使用
                <span>
                  <IconSkillNginx className="mx-1 translate-y-0.5" />
                  NGINX 配置 反向代理 + HTTPS + 开启 HTTP2
                </span>
              </li>
              <li>
                <>
                  <IconSkillFigmaDark
                    className={`
                      mx-1 translate-y-0.5
                      dark:hidden
                    `}
                  />
                  <IconSkillFigmaLight
                    className={`
                      mx-1 hidden translate-y-0.5
                      dark:inline-block
                    `}
                  />
                </>
                Figma，会一点，用来画画图标，制作博客封面非常方便
              </li>
              <li>
                熟练使用 <IconLogoGoogle className="mx-1 translate-y-0.5" />
                Google +
                <IconBrandGithub className="mx-1 translate-y-0.5" />
                GitHub +
                <IconSkillStackoverflowDark
                  className={`
                    mx-1 translate-y-0.5
                    dark:hidden
                  `}
                />
                <IconSkillStackoverflowLight
                  className={`
                    mx-1 hidden translate-y-0.5
                    dark:inline-block
                  `}
                />
                Stack Overflow + AI 工具 解决遇到的各种问题，复制粘贴我最行 🙋
              </li>
            </ul>
          </div>

          <div>
            <h2>我的设备</h2>
            <ul>
              <li>MacBook Pro 14-inch M3 Max</li>
              <li>微星（msi）GP76 RTX3070，打游戏用</li>
              <li>LG 27 英寸 4K</li>
              <li>键盘：珂芝（KIZI）K75</li>
              <li>鼠标：罗技（G）PRO 2 代</li>
            </ul>
          </div>
        </div>
      </article>
    </div>
  );
}
