import Image from "next/image";
import { SiteSectionHeading } from "@/components/blocks/site-section-heading";

const skills = [
  "Next.js",
  "React",
  "TypeScript",
  "Node.js",
  "PostgreSQL",
  "Figma",
  "Tailwind",
  "Docker",
  "AWS",
  "GraphQL",
  "Git",
  "Rust",
];

const hobbies = ["摄影", "旅行", "咖啡", "阅读"];
const hobbyNotes = [
  "把我从屏幕前带回到更慢的观察里。",
  "帮助我保持节奏感和移动感。",
  "给日常工作留出一个安静的过渡带。",
  "让信息密度下降，注意力重新聚拢。",
];
const gear = [
  ['Laptop', 'MacBook Pro 16"'],
  ['Monitor', 'LG UltraFine 5K'],
  ['Keyboard', 'Keychron Q1 Pro'],
  ['Mouse', 'Logitech MX Master 3S'],
  ['Headphones', 'Sony WH-1000XM5'],
  ['Tablet', 'iPad Pro 12.9"'],
];
const timeline = [
  ['Senior Frontend Engineer', 'Vercel', '2022 - Present'],
  ['Design Engineer', 'Stripe', '2019 - 2022'],
  ['Frontend Developer', 'Airbnb', '2017 - 2019'],
  ['Junior Developer', 'Startup', '2015 - 2017'],
];

export default function AboutPage() {
  return (
    <div className="space-y-16 pb-24">
      <section className="px-8 pt-32">
        <div className="mx-auto max-w-3xl space-y-12">
          <div className="space-y-5">
            <div className="font-mono-tech text-[11px] tracking-[0.28em] text-primary uppercase">关于我</div>
            <h1
              className={`
                font-serif text-5xl tracking-[-0.06em] text-foreground
                lg:text-6xl
              `}
              style={{ lineHeight: 0.95 }}
            >
              你好，我是 Alex Chen
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted">
              我是一位身处旧金山的设计师和开发者，长期在设计系统、前端架构和产品表达之间工作。我的目标很简单：让复杂的产品更容易被理解，也更容易被使用。
            </p>
            <p className="max-w-2xl text-base leading-8 text-muted">
              这份页面更像一本工作手记，记录我对界面秩序、工程实现和团队协作的持续观察。
            </p>
          </div>

          <div className={`
            grid gap-3
            sm:grid-cols-3
          `}>
            <div className="glass-card rounded-[1.5rem] border border-white/10 px-5 py-4">
              <div className="font-mono-tech text-[11px] tracking-[0.22em] text-muted uppercase">简历</div>
              <p className="mt-2 text-sm leading-7 text-muted">需要时可单独发送，不作为公开下载入口。</p>
            </div>
            <div className="glass-card rounded-[1.5rem] border border-white/10 px-5 py-4">
              <div className="font-mono-tech text-[11px] tracking-[0.22em] text-muted uppercase">联系</div>
              <p className="mt-2 text-sm leading-7 text-muted">当前页面只提供阅读入口，不放置误导性的无效按钮。</p>
            </div>
            <div className="glass-card rounded-[1.5rem] border border-white/10 px-5 py-4">
              <div className="font-mono-tech text-[11px] tracking-[0.22em] text-muted uppercase">GitHub</div>
              <p className="mt-2 text-sm leading-7 text-muted">代码仓库入口不在此页重复展示。</p>
            </div>
          </div>

          <div className={`
            grid gap-6
            lg:grid-cols-[0.7fr_1.3fr] lg:items-start
          `}>
            <div className="space-y-4">
              <div className={`overflow-hidden rounded-[1.75rem] border border-white/10`}>
                <Image
                  alt="Alex Chen"
                  className="h-full w-full object-cover"
                  height={400}
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
                  width={400}
                />
              </div>
            </div>
            <div className={`glass-card rounded-[1.5rem] border border-white/10 px-5 py-4`}>
              <div className="space-y-2">
                <div className="font-mono-tech text-[11px] tracking-[0.22em] text-muted uppercase">
                  Portrait / 作者
                </div>
                <p className="text-sm leading-7 text-muted">
                  头像被放回到正文流里，作为对作者身份的补充，而不是页面开场的主舞台。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-8">
        <div className="mx-auto max-w-7xl">
          <div className="space-y-8">
            <SiteSectionHeading
              description="这些工具和技术构成了我日常工作的基础语汇。"
              eyebrow="Practice / 能力"
              title="长期使用的技能"
            />
            <div className={`
              grid grid-cols-2 gap-4
              sm:grid-cols-3
              md:grid-cols-4
              lg:grid-cols-6
            `}>
              {skills.map((skill) => (
                <div key={skill} className="glass-card rounded-[1.5rem] border border-white/10 p-5">
                  <div className="text-primary-accent font-serif text-2xl tracking-[-0.04em]">✦</div>
                  <div className="font-mono-tech mt-4 text-sm font-medium text-foreground">{skill}</div>
                  <div className="font-mono-tech mt-1 text-[11px] tracking-[0.18em] text-muted uppercase">稳定使用</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-8">
        <div className="mx-auto max-w-7xl">
          <div className="space-y-8">
            <SiteSectionHeading
              description="这些爱好会把我从工作节奏里拉出来，让注意力重新变得平稳。"
              eyebrow="Outside work / 生活"
              title="工作之外"
            />
            <div className={`
              grid gap-6
              md:grid-cols-2
              lg:grid-cols-4
            `}>
              {hobbies.map((hobby, index) => (
                <div key={hobby} className="glass-card rounded-[1.5rem] border border-white/10 p-6">
                  <div className="mb-8 flex items-center justify-between gap-4">
                    <span className="font-mono-tech text-[11px] tracking-[0.22em] text-primary uppercase">
                      0{index + 1}
                    </span>
                    <span className={`
                      font-mono-tech rounded-full border border-white/10 px-3 py-1 text-[11px] tracking-[0.18em]
                      text-muted uppercase
                    `}>
                      archive
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="font-serif text-2xl tracking-[-0.04em] text-foreground">{hobby}</div>
                    <p className="text-sm leading-7 text-muted">{hobbyNotes[index]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-8">
        <div className="mx-auto max-w-7xl">
          <div className="space-y-8">
            <SiteSectionHeading
              description="这些设备足够稳定，能让我把精力放在内容和结构上。"
              eyebrow="Tools / 装备"
              title="常用设备"
            />
            <div className={`
              grid gap-6
              md:grid-cols-2
              lg:grid-cols-3
            `}>
              {gear.map(([icon, name]) => (
                <div key={name} className={`
                  glass-card flex items-center gap-4 rounded-[1.5rem] border border-white/10 p-5
                `}>
                  <div className={`
                    text-primary-accent flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10
                  `}>⌁</div>
                  <div className="flex-1">
                    <div className="font-mono-tech text-sm font-medium text-foreground">{name}</div>
                    <div className="font-mono-tech mt-1 text-[11px] tracking-[0.18em] text-muted uppercase">{icon}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-8">
        <div className="mx-auto max-w-3xl">
          <div className="space-y-8">
            <SiteSectionHeading
              description="从产品到平台，我更关注每段经历如何塑造了当下的工作方式。"
              eyebrow="History / 履历"
              title="工作经历"
            />
            <div className="space-y-6">
              {timeline.map(([role, company, years]) => (
                <div key={role} className="glass-card rounded-[1.5rem] border border-white/10 p-6">
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-serif text-2xl tracking-[-0.04em] text-foreground">{role}</h3>
                      <span className="font-mono-tech text-[11px] tracking-[0.22em] text-primary uppercase">{company}</span>
                    </div>
                    <span className="font-mono-tech text-xs tracking-[0.18em] text-muted uppercase">{years}</span>
                  </div>
                  <p className="text-sm leading-7 text-muted">
                    构建连接产品思维与前端执行的系统、组件和工作流。
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-8">
        <div className="mx-auto max-w-3xl text-center">
          <SiteSectionHeading
            description="如果你在做认真、细致且值得被长期打磨的项目，我们可以聊聊。"
            eyebrow="Contact / 合作"
            title="让我们一起合作"
          />
          <div className={`
            mx-auto grid max-w-2xl gap-4
            md:grid-cols-2
          `}>
            <div className="glass-card rounded-[1.5rem] border border-white/10 px-5 py-4 text-left">
              <div className="font-mono-tech text-[11px] tracking-[0.22em] text-muted uppercase">
                联系
              </div>
              <p className="mt-2 text-sm leading-7 text-muted">
                当前没有公开的直达入口，适合在文章和项目上下文里继续阅读。
              </p>
            </div>
            <div className="glass-card rounded-[1.5rem] border border-white/10 px-5 py-4 text-left">
              <div className="font-mono-tech text-[11px] tracking-[0.22em] text-muted uppercase">
                GitHub
              </div>
              <p className="mt-2 text-sm leading-7 text-muted">
                代码仓库入口不在此页重复放置，避免制造无效点击。
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
