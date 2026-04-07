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

const hobbies = ["Photography", "Travel", "Coffee", "Books"];
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
                  <span className="font-mono-tech text-xs text-muted">Available for work</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <span className="font-mono-tech text-primary-accent text-xs tracking-widest uppercase">About Me</span>
              <h1 className={`
                mt-2 font-serif text-5xl
                lg:text-6xl
              `} style={{ lineHeight: 1 }}>
                Hey, I&apos;m Alex Chen
              </h1>
            </div>
            <p className="text-lg leading-relaxed font-light text-muted">
              A designer and developer based in San Francisco with 8+ years of experience crafting digital experiences. I bridge the gap between design and engineering, creating products that are both beautiful and functional.
            </p>
            <p className="text-base leading-relaxed font-light text-muted">
              My journey started with a fascination for how things work under the hood. Today, I specialize in design systems, frontend architecture, and building tools that help teams ship faster.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <button className={`
                btn-primary-glow font-mono-tech rounded-full px-6 py-3 text-sm tracking-wider uppercase
              `}>Download CV</button>
              <button className={`
                font-mono-tech rounded-full border border-white/20 px-6 py-3 text-sm tracking-wider uppercase transition
                hover:text-primary-accent hover:border-primary
              `}>Contact Me</button>
            </div>
          </div>
        </div>
      </section>

      <section className="relative px-8 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <span className="font-mono-tech text-primary-accent text-xs tracking-widest uppercase">Expertise</span>
            <h2 className="mt-2 font-serif text-4xl">Development Skills</h2>
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
                <div className="font-mono-tech mt-1 text-xs text-muted">5 years</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-8 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <span className="font-mono-tech text-primary-accent text-xs tracking-widest uppercase">Beyond Work</span>
            <h2 className="mt-2 font-serif text-4xl">My Hobbies</h2>
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
                  <p className="text-sm text-white/70">A quiet ritual that keeps my design and engineering work grounded.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-8 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="reveal mb-12">
            <span className="font-mono-tech text-primary-accent text-xs tracking-widest uppercase">Setup</span>
            <h2 className="mt-2 font-serif text-4xl">Current Gear</h2>
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
            <span className="font-mono-tech text-primary-accent text-xs tracking-widest uppercase">Journey</span>
            <h2 className="mt-2 font-serif text-4xl">Experience</h2>
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
                <p className="text-sm leading-relaxed font-light text-muted">
                  Built products, component systems, and workflows that connect product thinking with frontend execution.
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
          `}>Let&apos;s Work Together</h2>
          <p className="mx-auto mb-8 max-w-md text-lg font-light text-muted">
            I&apos;m always open to discussing new opportunities, interesting projects, or just having a chat.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="btn-primary-glow font-mono-tech rounded-full px-8 py-4 text-sm tracking-wider uppercase">Get in Touch</button>
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
