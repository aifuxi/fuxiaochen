import Link from "next/link";

import { Button } from "@/components/ui/button";

import {
  IconBrandGithub,
  IconLogoBing,
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
  IconSkillNodejsDark,
  IconSkillNodejsLight,
  IconSkillPrisma,
  IconSkillReactDark,
  IconSkillReactLight,
  IconSkillStackoverflowDark,
  IconSkillStackoverflowLight,
  IconSkillTailwindcssDark,
  IconSkillTailwindcssLight,
  IconSkillTypeScript,
} from "@/components/icons";

import { NICKNAME } from "@/constants";

import { socialMediaList } from "../components/hero-section";

export const revalidate = 60;

export default function Page() {
  return (
    // eslint-disable-next-line better-tailwindcss/no-unregistered-classes
    <section className={`prose mx-auto pt-8`}>
      <h1 className="!my-4">关于</h1>
      <div>
        <h2>我是谁</h2>
        <p>
          Hi~ 我是{NICKNAME}
          ，一名前端开发工程师，2020年大专毕业，喜欢 Coding 和打游戏
        </p>
      </div>

      <div>
        <h2 className="!my-4">我的技能</h2>
      </div>

      <div>
        <h3>前端</h3>
        <ul>
          <li>
            <IconSkillHTML className="mx-1 translate-y-0.5" /> HTML +
            <IconSkillCSS className="mx-1 translate-y-0.5" />
            CSS + <IconSkillJavaScript className="mx-1 translate-y-0.5" />
            JavaScript ，熟练使用
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
            <>
              <IconSkillNodejsDark
                className={`
                  mx-1 translate-y-0.5
                  dark:hidden
                `}
              />
              <IconSkillNodejsLight
                className={`
                  mx-1 hidden translate-y-0.5
                  dark:inline-block
                `}
              />
            </>
            Node.js，能简单 CRUD 水平
          </li>
          <li>
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
            Next.js + <IconSkillPrisma className="mx-1 translate-y-0.5" />
            Prisma +
            <>
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
            </>
            MySQL 搞全栈开发
          </li>
        </ul>
      </div>
      <div>
        <h3>其它</h3>
        <ul>
          <li>
            Zsh + Oh My Zsh + iTerm2 + JetBrainsMono Nerd Font Mono，舒服的很
          </li>
          <li>
            用过 <IconLogoCentOS className="mx-1 translate-y-0.5" />
            CentOS、
            <>
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
            </>
            Debian、
            <IconLogoRockyLinux className="mx-1 translate-y-0.5" />
            Rocky Linux （最近使用）
          </li>
          <li>
            <IconSkillDocker className="mx-1 translate-y-0.5" />
            Docker +<span className="line-through">Docker Desktop 太卡了</span>+
            Orbstack，Docker 本地起数据库服务是真的方便
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
            Google/
            <IconLogoBing className="mx-1 translate-y-0.5" />
            Bing 搜索
            <span className="ml-1 line-through">百度（浪费生命）</span> +
            <IconBrandGithub className="mx-1 translate-y-0.5" />
            GitHub +
            <>
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
            </>
            Stack Overflow + Chat GPT 解决遇到的各种问题，复制粘贴我最行 🙋
          </li>
        </ul>
      </div>

      <div>
        <h2>我的设备</h2>
        <ul>
          <li>
            MacBook Pro 14-inch M3 Max：64G + 2TB，
            <span className="line-through">
              赚的几个窝囊费全花电子产品上去了
            </span>
            🙃
          </li>
          <li>微星（msi） GP76：64G + 1TB + RTX3070</li>
          <li>LG 27英寸 4K</li>
          <li>键盘：珂芝（KIZI）K75</li>
          <li>鼠标：罗技（G）PRO 2代</li>
        </ul>
      </div>

      <div>
        <h2>联系我</h2>
        <p>你可以通过👇下面任意一种方式联系我</p>
        <ul className="!mb-0 flex !list-none items-center space-x-4 !pl-0">
          {socialMediaList.map((el) => (
            <li key={el.link}>
              <Button asChild variant="outline" size="icon">
                <Link href={el.link} target="_blank">
                  {el.icon}
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
