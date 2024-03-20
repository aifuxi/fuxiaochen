import Link from 'next/link';

import { Button } from '@/components/ui/button';

import {
  IconLogoCentOS,
  IconLogoRockyLinux,
  IconSkillCSS,
  IconSkillDebianDark,
  IconSkillDebianLight,
  IconSkillDocker,
  IconSkillFigmaDark,
  IconSkillFigmaLight,
  IconSkillGolang,
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
  IconSkillTailwindcssDark,
  IconSkillTailwindcssLight,
  IconSkillTypeScript,
} from '@/components/icons';
import { PageHeader } from '@/components/page-header';

import { NICKNAME, PATHS } from '@/constants';
import { socialMediaList } from '@/features/home';

export const revalidate = 60;

export default function Page() {
  let delay = 0;

  // 每次调用，增加延时
  const getDelay = () => (delay += 200);

  return (
    <div className="w-full flex flex-col justify-center px-6 md:max-w-screen-md  2xl:max-w-6xl  md:mx-auto pb-24 pt-8">
      <PageHeader
        breadcrumbList={[PATHS.SITE_HOME, PATHS.SITE_ABOUT]}
        className="mb-0"
      />

      <section className="prose dark:prose-invert prose-zinc  2xl:max-w-6xl">
        <div
          className="animate-fade-up animate-ease-in-out"
          style={{
            animationDelay: `${getDelay()}ms`,
          }}
        >
          <h2>我是谁</h2>
          <p>
            Hi~ 我是{NICKNAME}
            ，一名前端开发工程师，2020年大专毕业，喜欢 Coding 和打游戏
          </p>
        </div>

        <div
          className="animate-fade-up animate-ease-in-out"
          style={{
            animationDelay: `${getDelay()}ms`,
          }}
        >
          <h2>我的技能</h2>
        </div>

        <div
          className="animate-fade-up animate-ease-in-out"
          style={{
            animationDelay: `${getDelay()}ms`,
          }}
        >
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
                <IconSkillReactDark className="dark:hidden mx-1 translate-y-0.5" />
                <IconSkillReactLight className="hidden dark:inline-block mx-1 translate-y-0.5" />
              </>
              React +
              <>
                <IconSkillNextjsDark className="dark:hidden mx-1 translate-y-0.5" />
                <IconSkillNextjsLight className="hidden dark:inline-block mx-1 translate-y-0.5" />
              </>
              Next.js + ahooks +
              <>
                <IconSkillTailwindcssDark className="dark:hidden mx-1 translate-y-0.5" />
                <IconSkillTailwindcssLight className="hidden dark:inline-block mx-1 translate-y-0.5" />
              </>
              Tailwind CSS，熟练使用
            </li>
          </ul>
        </div>
        <div
          className="animate-fade-up animate-ease-in-out"
          style={{
            animationDelay: `${getDelay()}ms`,
          }}
        >
          <h3>后端</h3>
          <ul>
            <li>
              <>
                <IconSkillNodejsDark className="dark:hidden mx-1 translate-y-0.5" />
                <IconSkillNodejsLight className="hidden dark:inline-block mx-1 translate-y-0.5" />
              </>
              Node.js，能简单 CRUD 水平
            </li>
            <li>
              <>
                <IconSkillNextjsDark className="dark:hidden mx-1 translate-y-0.5" />
                <IconSkillNextjsLight className="hidden dark:inline-block mx-1 translate-y-0.5" />
              </>
              Next.js + <IconSkillPrisma className="mx-1 translate-y-0.5" />
              Prisma +
              <>
                <IconSkillMysqlDark className="dark:hidden mx-1 translate-y-0.5" />
                <IconSkillMysqlLight className="hidden dark:inline-block mx-1 translate-y-0.5" />
              </>
              MySQL 搞全栈开发
            </li>
            <li>
              <IconSkillGolang className="mx-1 translate-y-0.5" />
              Golang，非常感兴趣，目前能简单 CRUD，还在努力学习中
            </li>
          </ul>
        </div>
        <div
          className="animate-fade-up animate-ease-in-out"
          style={{
            animationDelay: `${getDelay()}ms`,
          }}
        >
          <h3>其它</h3>
          <ul>
            <li>
              Zsh + Oh My Zsh + iTerm2 + Mononoki Nerd Font Mono，舒服的很
            </li>
            <li>
              用过 <IconLogoCentOS className="mx-1 translate-y-0.5" />
              CentOS、
              <>
                <IconSkillDebianDark className="dark:hidden mx-1 translate-y-0.5" />
                <IconSkillDebianLight className="hidden dark:inline-block mx-1 translate-y-0.5" />
              </>
              Debian、
              <IconLogoRockyLinux className="mx-1 translate-y-0.5" />
              Rocky Linux （最近使用）
            </li>
            <li>
              <IconSkillDocker className="mx-1 translate-y-0.5" />
              Docker +
              <span className="line-through">Docker Desktop 太卡了</span>+
              Orbstack，Docker 本地起数据库服务是真的方便
            </li>
            <li>
              使用
              <span className="line-through">
                <IconSkillNginx className="mx-1 translate-y-0.5" />
                NGINX （相比 Caddy 配置有点麻烦）
              </span>
              、 Caddy （配置超简单，无需手动配置 HTTPS 证书），反向代理 + 配置
              HTTPS + 开启 HTTP2
            </li>
            <li>
              <>
                <IconSkillFigmaDark className="dark:hidden mx-1 translate-y-0.5" />
                <IconSkillFigmaLight className="hidden dark:inline-block mx-1 translate-y-0.5" />
              </>
              Figma，会一点，用来画画图标，制作博客封面非常方便
            </li>
          </ul>
        </div>

        <div
          className="animate-fade-up animate-ease-in-out"
          style={{
            animationDelay: `${getDelay()}ms`,
          }}
        >
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

        <div
          className="animate-fade-up animate-ease-in-out"
          style={{
            animationDelay: `${getDelay()}ms`,
          }}
        >
          <h2>联系我</h2>
          <ul className="!list-none flex space-x-4 items-center !pl-0 !mb-0">
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
    </div>
  );
}
