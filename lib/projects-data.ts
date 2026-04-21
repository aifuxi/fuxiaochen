export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  image: string;
  tags: string[];
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
  year: string;
}

export const projects: Project[] = [
  {
    id: "tweakcn",
    title: "tweakcn",
    description:
      "A visual theme editor for shadcn/ui with real-time preview and code export.",
    longDescription:
      "tweakcn is a powerful visual editor that allows developers to customize shadcn/ui themes in real-time. Features include live preview, one-click code export, and support for both light and dark modes.",
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop",
    tags: ["React", "TypeScript", "Tailwind CSS", "shadcn/ui"],
    githubUrl: "https://github.com/tweakcn/tweakcn",
    liveUrl: "https://tweakcn.com",
    featured: true,
    year: "2024",
  },
  {
    id: "nextjs-blog-starter",
    title: "Next.js Blog Starter",
    description:
      "A minimal, SEO-friendly blog starter built with Next.js 14 and MDX.",
    longDescription:
      "A production-ready blog template featuring MDX support, automatic sitemap generation, RSS feeds, and optimized images. Perfect for developers who want to start writing without configuration headaches.",
    image:
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=400&fit=crop",
    tags: ["Next.js", "MDX", "SEO", "TypeScript"],
    githubUrl: "https://github.com/example/nextjs-blog-starter",
    liveUrl: "https://blog-starter.vercel.app",
    featured: true,
    year: "2024",
  },
  {
    id: "devtools-extension",
    title: "DevTools Extension",
    description:
      "Browser extension that enhances developer experience with quick actions.",
    longDescription:
      "A Chrome/Firefox extension providing quick access to common developer tools like JSON formatting, base64 encoding, color conversion, and regex testing directly in the browser.",
    image:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop",
    tags: ["Browser Extension", "JavaScript", "Chrome API"],
    githubUrl: "https://github.com/example/devtools-extension",
    featured: true,
    year: "2024",
  },
  {
    id: "react-hooks-library",
    title: "React Hooks Library",
    description: "A collection of reusable React hooks for common use cases.",
    longDescription:
      "30+ battle-tested React hooks including useLocalStorage, useDebounce, useMediaQuery, useIntersectionObserver, and more. Fully typed with TypeScript and tree-shakeable.",
    image:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop",
    tags: ["React", "Hooks", "TypeScript", "npm"],
    githubUrl: "https://github.com/example/react-hooks",
    liveUrl: "https://hooks-docs.vercel.app",
    featured: false,
    year: "2023",
  },
  {
    id: "cli-task-manager",
    title: "CLI Task Manager",
    description:
      "A fast, keyboard-driven task manager that lives in your terminal.",
    longDescription:
      "Manage your tasks without leaving the terminal. Features include projects, tags, due dates, recurring tasks, and sync across devices. Written in Rust for blazing fast performance.",
    image:
      "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&h=400&fit=crop",
    tags: ["Rust", "CLI", "Terminal"],
    githubUrl: "https://github.com/example/cli-tasks",
    featured: false,
    year: "2023",
  },
  {
    id: "design-system",
    title: "Design System",
    description:
      "A comprehensive design system with React components and Figma library.",
    longDescription:
      "End-to-end design system built for consistency across products. Includes 50+ React components, Figma component library, design tokens, and comprehensive documentation.",
    image:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=400&fit=crop",
    tags: ["Design System", "React", "Figma", "Storybook"],
    githubUrl: "https://github.com/example/design-system",
    liveUrl: "https://design.example.com",
    featured: false,
    year: "2023",
  },
  {
    id: "api-rate-limiter",
    title: "API Rate Limiter",
    description: "Distributed rate limiting library for Node.js applications.",
    longDescription:
      "A flexible rate limiting solution supporting multiple algorithms (sliding window, token bucket, fixed window) with Redis backend. Perfect for protecting APIs at scale.",
    image:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop",
    tags: ["Node.js", "Redis", "API", "npm"],
    githubUrl: "https://github.com/example/rate-limiter",
    featured: false,
    year: "2022",
  },
  {
    id: "markdown-editor",
    title: "Markdown Editor",
    description:
      "A distraction-free markdown editor with live preview and vim keybindings.",
    longDescription:
      "Write in markdown with a beautiful, minimal interface. Features include live preview, vim mode, custom themes, export to PDF/HTML, and automatic cloud backup.",
    image:
      "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&h=400&fit=crop",
    tags: ["Electron", "React", "Markdown", "Desktop"],
    githubUrl: "https://github.com/example/markdown-editor",
    liveUrl: "https://md-editor.example.com",
    featured: false,
    year: "2022",
  },
];

export function getFeaturedProjects(): Project[] {
  return projects.filter((p) => p.featured);
}

export function getProjectsByYear(): Record<string, Project[]> {
  const grouped: Record<string, Project[]> = {};
  projects.forEach((project) => {
    if (!grouped[project.year]) {
      grouped[project.year] = [];
    }
    grouped[project.year].push(project);
  });
  return grouped;
}

export function getProjectById(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}
