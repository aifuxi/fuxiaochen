import Image from "next/image";

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
const hobbyImages = [
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?w=400&h=300&fit=crop",
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
    <div>
      <section className="relative px-8 pt-32 pb-20">
        <div className={`
          mx-auto grid max-w-7xl items-center gap-16
          lg:grid-cols-2
        `}>
          <div className={`
            flex justify-center
            lg:justify-start
          `}>
            <div className="relative">
              <div className={`
                h-72 w-72 overflow-hidden rounded-full border border-white/8
                lg:h-80 lg:w-80
              `}>
                <Image
                  alt="Alex Chen"
                  className="h-full w-full object-cover"
                  height={400}
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
                  width={400}
                />
              </div>
              <div className={`
                glass-card absolute right-[-16px] bottom-[-16px] rounded-xl border border-white/10 px-4 py-2
              `}>
                <div className="flex items-center gap-2">
                  <div className="hero-label-dot" />
                  <span className="font-mono-tech text-xs text-muted">可提供服务</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <span className="font-mono-tech text-primary-accent text-xs tracking-widest uppercase">关于我</span>
              <h1 className={`
                mt-2 font-serif text-5xl
                lg:text-6xl
              `} style={{ lineHeight: 1 }}>
                你好，我是 Alex Chen
              </h1>
            </div>
            <p className="text-lg leading-relaxed text-muted">
              一位身处旧金山的设计师和开发者，拥有 8 年以上打造数字产品的经验。我致力于连接设计与工程的鸿沟，创造既美观又实用的产品。
            </p>
            <p className="text-base leading-relaxed text-muted">
              我的旅程始于对事物内在运行原理的好奇。如今，我专注于设计系统、前端架构以及帮助团队更快交付的工具。
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <button className={`
                btn-primary-glow font-mono-tech rounded-full px-6 py-3 text-sm tracking-wider uppercase
              `}>下载简历</button>
              <button className={`
                font-mono-tech rounded-full border border-white/20 px-6 py-3 text-sm tracking-wider uppercase transition
                hover:text-primary-accent hover:border-primary
              `}>联系我</button>
            </div>
          </div>
        </div>
      </section>

      <section className="relative px-8 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <span className="font-mono-tech text-primary-accent text-xs tracking-widest uppercase">专业领域</span>
            <h2 className="mt-2 font-serif text-4xl">开发技能</h2>
          </div>
          <div className={`
            grid grid-cols-2 gap-4
            sm:grid-cols-3
            md:grid-cols-4
            lg:grid-cols-6
          `}>
            {skills.map((skill) => (
              <div key={skill} className="glass-card rounded-2xl border border-white/8 p-5 text-center">
                <div className="text-primary-accent mb-3">✦</div>
                <div className="font-mono-tech text-sm font-medium">{skill}</div>
                <div className="font-mono-tech mt-1 text-xs text-muted">5 年</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-8 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <span className="font-mono-tech text-primary-accent text-xs tracking-widest uppercase">工作之外</span>
            <h2 className="mt-2 font-serif text-4xl">我的爱好</h2>
          </div>
          <div className={`
            grid gap-6
            md:grid-cols-2
            lg:grid-cols-4
          `}>
            {hobbies.map((hobby, index) => (
              <div key={hobby} className="reveal relative aspect-[4/3] overflow-hidden rounded-2xl">
                <Image alt={hobby} className="h-full w-full object-cover" height={300} src={hobbyImages[index]} width={400} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-primary-accent">✦</span>
                    <span className="font-mono-tech text-primary-accent text-xs tracking-wider uppercase">{hobby}</span>
                  </div>
                  <p className="text-sm text-white/70">让我的设计和开发工作保持专注的安静仪式。</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-8 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="reveal mb-12">
            <span className="font-mono-tech text-primary-accent text-xs tracking-widest uppercase">装备</span>
            <h2 className="mt-2 font-serif text-4xl">我的装备</h2>
          </div>
          <div className={`
            grid gap-6
            md:grid-cols-2
            lg:grid-cols-3
          `}>
            {gear.map(([icon, name], index) => (
              <div key={name} className={`
                glass-card reveal flex items-center gap-4 rounded-2xl border border-white/8 p-5
              `} style={{ animationDelay: `${index * 0.05}s` }}>
                <div className="text-primary-accent flex h-12 w-12 items-center justify-center rounded-xl bg-white/4">✦</div>
                <div className="flex-1">
                  <div className="font-mono-tech text-sm font-medium">{name}</div>
                  <div className="font-mono-tech mt-1 text-xs text-muted">{icon}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-8 py-20">
        <div className="mx-auto max-w-3xl">
          <div className="reveal mb-12">
            <span className="font-mono-tech text-primary-accent text-xs tracking-widest uppercase">历程</span>
            <h2 className="mt-2 font-serif text-4xl">工作经历</h2>
          </div>
          <div className="space-y-8">
            {timeline.map(([role, company, years], index) => (
              <div key={role} className="glass-card reveal rounded-2xl border border-white/10 p-6" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h3 className="font-serif text-xl">{role}</h3>
                    <span className="font-mono-tech text-primary-accent text-sm">{company}</span>
                  </div>
                  <span className="font-mono-tech text-xs text-muted">{years}</span>
                </div>
                <p className="text-sm leading-relaxed text-muted">
                  构建了连接产品思维与前端执行的产品、组件系统和工作流。
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-8 py-20">
        <div className="reveal mx-auto max-w-3xl text-center">
          <h2 className={`
            mb-4 font-serif text-4xl
            lg:text-5xl
          `}>让我们一起合作</h2>
          <p className="mx-auto mb-8 max-w-md text-lg text-muted">
            我始终乐于探讨新机会、有趣的项目，或者只是聊聊天。
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="btn-primary-glow font-mono-tech rounded-full px-8 py-4 text-sm tracking-wider uppercase">联系我</button>
            <button className={`
              font-mono-tech rounded-full border border-white/20 px-8 py-4 text-sm tracking-wider uppercase transition
              hover:text-primary-accent hover:border-primary
            `}>GitHub</button>
          </div>
        </div>
      </section>
    </div>
  );
}
