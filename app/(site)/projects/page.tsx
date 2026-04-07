import { ProjectGallery, type ProjectGalleryItem } from "@/components/blocks/project-gallery";

const projectStats = [
  { label: "Projects", value: "12" },
  { label: "Open Source", value: "5" },
  { label: "GitHub Stars", value: "2.5k" },
  { label: "Happy Clients", value: "8" },
];

const projectCards: ProjectGalleryItem[] = [
  { slug: "supernova", title: "Supernova Design System", description: "A comprehensive design system with 50+ components, tokens, and documentation for consistent product surfaces.", tags: ["React", "TypeScript", "CSS"], category: "design", label: "Open Source", metric: "1.2k stars · 234 forks" },
  { slug: "neuralytics", title: "Neuralytics Dashboard", description: "Real-time analytics platform with AI-powered insights and custom reporting workflows.", tags: ["Next.js", "Python", "TensorFlow"], category: "web", label: "SaaS", metric: "500+ teams" },
  { slug: "habitflow", title: "HabitFlow App", description: "A habit tracking application with gamification, streaks, and personalized coaching powered by ML.", tags: ["React Native", "Firebase"], category: "mobile", label: "Mobile", metric: "10k+ downloads" },
  { slug: "artisan", title: "Artisan Marketplace", description: "A curated marketplace for handcrafted goods with integrated payments and seller dashboards.", tags: ["Vue.js", "Node.js", "Stripe"], category: "web", label: "E-commerce", metric: "$50k/mo" },
  { slug: "figma-kit", title: "Figma UI Kit", description: "A professional Figma UI kit with 200+ components, auto-layout variants, and token-ready foundations.", tags: ["Figma", "FigJam"], category: "design", label: "Open Source", metric: "890 stars · 5k downloads" },
  { slug: "devflow", title: "DevFlow CLI", description: "A CLI tool to manage workflows, automate tasks, and integrate with popular developer tooling.", tags: ["Rust", "CLI", "Tauri"], category: "open-source", label: "Open Source", metric: "2.1k stars · 156 forks" },
  { slug: "medimind", title: "MediMind", description: "A HIPAA-compliant healthcare app for scheduling, telemedicine, and health record management.", tags: ["Flutter", "AWS"], category: "mobile", label: "Healthcare", metric: "50+ clinics" },
  { slug: "codesync", title: "CodeSync", description: "A collaborative code editor with syntax highlighting, multi-language support, and video chat.", tags: ["WebRTC", "Monaco", "Socket.io"], category: "open-source", label: "Open Source", metric: "3.4k stars · 412 forks" },
  { slug: "streamline", title: "StreamLine", description: "A project management tool with kanban boards, time tracking, and workflow automation.", tags: ["Svelte", "Supabase"], category: "web", label: "Productivity", metric: "1.2k teams" },
];

export default function ProjectsPage() {
  return (
    <div>
      <section className="relative px-8 pt-32 pb-16">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="hero-label-dot" />
              <span className="font-mono-tech text-xs tracking-widest text-muted uppercase">My Work</span>
            </div>
            <h1 className={`
              font-serif text-6xl tracking-tighter
              lg:text-7xl
            `} style={{ lineHeight: 0.95 }}>
              Featured
              <br />
              <span className="text-primary-accent italic">Projects</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed font-light text-muted">
              A collection of projects showcasing my work in design systems, web development, and creative technology. Each project represents a unique challenge and solution.
            </p>
          </div>

          <div className={`
            mt-12 grid grid-cols-2 gap-4
            md:grid-cols-4
          `}>
            {projectStats.map((item) => (
              <div key={item.label} className="glass-card rounded-2xl border border-white/8 p-6 text-center">
                <div className="text-primary-accent mb-1 font-serif text-4xl">{item.value}</div>
                <div className="font-mono-tech text-xs tracking-widest text-muted uppercase">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <ProjectGallery projects={projectCards} />
    </div>
  );
}
