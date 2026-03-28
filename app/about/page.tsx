"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Reveal } from "@/components/ui/reveal";
import { NICKNAME, GITHUB_PAGE, EMAIL } from "@/constants/info";
import Navbar from "@/components/navbar";

// Hero / About Me Section
function AboutHeroSection() {
  return (
    <section className="relative px-8 pt-32 pb-20">
      <div className="mx-auto max-w-7xl">
        <div className={`
          grid items-center gap-16
          lg:grid-cols-2
        `}>
          {/* Left - Avatar */}
          <Reveal direction="left" className={`
            flex justify-center
            lg:justify-start
          `}>
            <div className="relative">
              {/* Avatar Ring */}
              <motion.div
                className={`
                  h-72 w-72
                  lg:h-80 lg:w-80
                `}
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary), transparent, var(--primary))",
                  borderRadius: "50%",
                  padding: "4px",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <div className="relative h-full w-full overflow-hidden rounded-full bg-secondary">
                  <Image
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
                    alt={NICKNAME}
                    width={400}
                    height={400}
                    className="h-full w-full object-cover"
                  />
                </div>
              </motion.div>
              {/* Floating Badge */}
              <motion.div
                className="glass-card shimmer-border absolute -right-4 -bottom-4 px-4 py-2"
                style={{ borderRadius: "1rem" }}
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="flex items-center gap-2">
                  <motion.div
                    className="h-2 w-2 rounded-full"
                    style={{ background: "var(--primary)" }}
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <span className="font-mono text-xs text-muted">
                    Available for work
                  </span>
                </div>
              </motion.div>
            </div>
          </Reveal>

          {/* Right - Info */}
          <Reveal direction="right" delay={0.1} className="space-y-6">
            <div>
              <span className="font-mono text-xs tracking-widest text-primary uppercase">
                About Me
              </span>
              <h1
                className={`
                  mt-2 font-serif text-5xl
                  lg:text-6xl
                `}
                style={{ lineHeight: 1 }}
              >
                Hey, I&apos;m {NICKNAME}
              </h1>
            </div>

            <p className="text-lg leading-relaxed font-light text-muted">
              A designer and developer based in San Francisco with 8+ years of
              experience crafting digital experiences. I bridge the gap between
              design and engineering, creating products that are both beautiful
              and functional.
            </p>

            <p className="text-base leading-relaxed font-light text-muted">
              My journey started with a fascination for how things work under
              the hood. Today, I specialize in design systems, frontend
              architecture, and building tools that help teams ship faster. When
              I&apos;m not coding, you&apos;ll find me exploring new technologies or
              contributing to open source.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <motion.a
                href="#"
                className={`
                  flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-mono text-sm tracking-wider
                  text-primary-foreground uppercase transition-all duration-300
                  hover:gap-3
                `}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download CV
              </motion.a>
              <motion.a
                href={`mailto:${EMAIL}`}
                className={`
                  flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 font-mono text-sm tracking-wider
                  uppercase transition-all duration-300
                  hover:border-primary hover:text-primary
                `}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Contact Me
              </motion.a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// Skill Badge Component
function SkillBadge({
  icon,
  name,
  years,
  delay = 0,
}: {
  icon: React.ReactNode;
  name: string;
  years: string;
  delay?: number;
}) {
  return (
    <Reveal delay={delay} className="text-center">
      <motion.div
        className={`
          rounded-xl border border-border bg-card p-6 transition-all duration-300
          hover:border-primary hover:shadow-lg
        `}
        style={{ padding: "1.5rem" }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl transition-all duration-300"
          style={{ background: "rgba(16, 185, 129, 0.1)" }}
        >
          {icon}
        </div>
        <div className="font-mono text-sm font-medium">{name}</div>
        <div className="mt-1 font-mono text-xs text-muted">{years}</div>
      </motion.div>
    </Reveal>
  );
}

// Skills Section
function SkillsSection() {

  const skills = [
    {
      name: "Next.js",
      years: "5 years",
      icon: (
        <svg
          className="h-8 w-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--primary)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      ),
    },
    {
      name: "React",
      years: "6 years",
      icon: (
        <svg
          className="h-8 w-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--primary)"
          strokeWidth={2}
        >
          <circle cx="12" cy="12" r="2" fill="var(--primary)" />
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22" />
          <path d="M22 4L12 14L9 11" />
        </svg>
      ),
    },
    {
      name: "TypeScript",
      years: "4 years",
      icon: (
        <svg
          className="h-8 w-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--primary)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L2 7v17l10 5 10-5V7l-10-5z" />
          <path d="M12 22V12" />
          <path d="M22 7L12 12L2 7" />
        </svg>
      ),
    },
    {
      name: "Node.js",
      years: "7 years",
      icon: (
        <svg
          className="h-8 w-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--primary)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      ),
    },
    {
      name: "PostgreSQL",
      years: "6 years",
      icon: (
        <svg
          className="h-8 w-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--primary)"
          strokeWidth={2}
        >
          <path d="M12 2v20M2 12h20" />
          <rect x="4" y="4" width="16" height="16" rx="2" />
        </svg>
      ),
    },
    {
      name: "Figma",
      years: "5 years",
      icon: (
        <svg
          className="h-8 w-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--primary)"
          strokeWidth={2}
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
          <path d="M9 21V9" />
        </svg>
      ),
    },
    {
      name: "Tailwind",
      years: "4 years",
      icon: (
        <svg
          className="h-8 w-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--primary)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L2 7v10l10 5 10-5V7l-10-5z" />
          <path d="M12 22V12" />
          <circle cx="12" cy="18" r="1" fill="var(--primary)" />
        </svg>
      ),
    },
    {
      name: "Docker",
      years: "5 years",
      icon: (
        <svg
          className="h-8 w-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--primary)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M8 12L11 15L16 9" />
        </svg>
      ),
    },
    {
      name: "AWS",
      years: "4 years",
      icon: (
        <svg
          className="h-8 w-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--primary)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 12H2" />
          <path d="M22 12L17 7" />
          <path d="M22 12L17 17" />
          <path d="M2 12L7 7" />
          <path d="M2 12L7 17" />
        </svg>
      ),
    },
    {
      name: "GraphQL",
      years: "3 years",
      icon: (
        <svg
          className="h-8 w-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--primary)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      ),
    },
    {
      name: "Git",
      years: "8 years",
      icon: (
        <svg
          className="h-8 w-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--primary)"
          strokeWidth={2}
        >
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M4 10h16" />
          <path d="M10 4v16" />
        </svg>
      ),
    },
    {
      name: "Rust",
      years: "2 years",
      icon: (
        <svg
          className="h-8 w-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--primary)"
          strokeWidth={2}
          strokeLinejoin="round"
        >
          <path d="M4 4l16 12-16 12V4z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="relative px-8 py-20">
      <div className="mx-auto max-w-7xl">
        <Reveal className="mb-12">
          <span className="font-mono text-xs tracking-widest text-primary uppercase">
            Expertise
          </span>
          <h2 className="mt-2 font-serif text-4xl">Development Skills</h2>
        </Reveal>

        <div className={`
          grid grid-cols-2 gap-4
          sm:grid-cols-3
          md:grid-cols-4
          lg:grid-cols-6
        `}>
          {skills.map((skill, index) => (
            <SkillBadge
              key={skill.name}
              name={skill.name}
              years={skill.years}
              icon={skill.icon}
              delay={index * 0.05}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// Hobby Card Component
function HobbyCard({
  image,
  title,
  icon,
  description,
  delay = 0,
}: {
  image: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  delay?: number;
}) {
  return (
    <Reveal delay={delay}>
      <motion.div
        className="relative overflow-hidden rounded-2xl"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="aspect-4/3">
          <Image
            src={image}
            alt={title}
            width={400}
            height={300}
            className="h-full w-full object-cover"
          />
        </div>
        {/* Overlay */}
        <div
          className="absolute inset-0 flex items-end"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 60%)",
          }}
        >
          <div className="p-6">
            <div className="mb-1 flex items-center gap-2">
              <span className="h-4 w-4 text-primary">{icon}</span>
              <span className="font-mono text-xs tracking-wider text-primary uppercase">
                {title}
              </span>
            </div>
            <p className="text-sm text-white/70">{description}</p>
          </div>
        </div>
      </motion.div>
    </Reveal>
  );
}

// Hobbies Section
function HobbiesSection() {

  const hobbies = [
    {
      image:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
      title: "Photography",
      description: "Capturing urban landscapes and street scenes",
      icon: (
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
    {
      image:
        "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&h=300&fit=crop",
      title: "Open Source",
      description: "Contributing to side projects and tools",
      icon: (
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
          />
        </svg>
      ),
    },
    {
      image:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
      title: "Hiking",
      description: "Exploring trails and nature reserves",
      icon: (
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l6-6 4 4 8-8"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14.5 9l5 6"
          />
        </svg>
      ),
    },
    {
      image:
        "https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?w=400&h=300&fit=crop",
      title: "Reading",
      description: "Sci-fi novels and tech books",
      icon: (
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
    },
  ];

  return (
    <section className="relative px-8 py-20">
      <div className="mx-auto max-w-7xl">
        <Reveal className="mb-12">
          <span className="font-mono text-xs tracking-widest text-primary uppercase">
            Beyond Work
          </span>
          <h2 className="mt-2 font-serif text-4xl">My Hobbies</h2>
        </Reveal>

        <div className={`
          grid gap-6
          md:grid-cols-2
          lg:grid-cols-4
        `}>
          {hobbies.map((hobby, index) => (
            <HobbyCard key={hobby.title} {...hobby} delay={index * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Device Card Component
function DeviceCard({
  icon,
  name,
  specs,
  delay = 0,
}: {
  icon: React.ReactNode;
  name: string;
  specs: string;
  delay?: number;
}) {
  return (
    <Reveal delay={delay}>
      <motion.div
        className={`
          flex items-center gap-4 rounded-xl border border-white/8 bg-card p-6 transition-all duration-300
          hover:border-primary hover:bg-primary/5
        `}
        whileHover={{ x: 4 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
          style={{ background: "rgba(16, 185, 129, 0.1)" }}
        >
          {icon}
        </div>
        <div>
          <div className="font-mono text-sm font-medium">{name}</div>
          <div className="mt-1 font-mono text-xs text-muted">{specs}</div>
        </div>
      </motion.div>
    </Reveal>
  );
}

// Current Gear Section
function GearSection() {

  const devices = [
    {
      name: "MacBook Pro 16\"",
      specs: "M3 Max, 64GB RAM, 1TB SSD",
      icon: (
        <svg
          className="h-6 w-6 text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      name: "LG UltraFine 5K",
      specs: "27\" Display (Retina)",
      icon: (
        <svg
          className="h-6 w-6 text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      name: "Dell UltraSharp",
      specs: "27\" 4K USB-C Hub",
      icon: (
        <svg
          className="h-6 w-6 text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      name: "Keychron Q1 Pro",
      specs: "QMK/VIA, Gateron G Pro Red",
      icon: (
        <svg
          className="h-6 w-6 text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          />
        </svg>
      ),
    },
    {
      name: "Logitech MX Master 3S",
      specs: "Pale Gray",
      icon: (
        <svg
          className="h-6 w-6 text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 19l-7-7 7-7m0 14l7-7-7-7"
          />
        </svg>
      ),
    },
    {
      name: "Sony WH-1000XM5",
      specs: "Wireless Noise Canceling",
      icon: (
        <svg
          className="h-6 w-6 text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
          />
        </svg>
      ),
    },
    {
      name: "Shure MV7",
      specs: "USB Podcast Microphone",
      icon: (
        <svg
          className="h-6 w-6 text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11a7 7 0 01-14 0m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
          />
        </svg>
      ),
    },
    {
      name: "iPad Pro 12.9\"",
      specs: "M2, with Apple Pencil 2",
      icon: (
        <svg
          className="h-6 w-6 text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      name: "Herman Miller Aeron",
      specs: "Size B, Graphite",
      icon: (
        <svg
          className="h-6 w-6 text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
      ),
    },
  ];

  return (
    <section className="relative px-8 py-20">
      <div className="mx-auto max-w-7xl">
        <Reveal className="mb-12">
          <span className="font-mono text-xs tracking-widest text-primary uppercase">
            Setup
          </span>
          <h2 className="mt-2 font-serif text-4xl">Current Gear</h2>
        </Reveal>

        <div className={`
          grid gap-6
          md:grid-cols-2
          lg:grid-cols-3
        `}>
          {devices.map((device, index) => (
            <DeviceCard
              key={device.name}
              {...device}
              delay={index * 0.05}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// Timeline Item Component
function TimelineItem({
  title,
  company,
  period,
  description,
  delay = 0,
}: {
  title: string;
  company: string;
  period: string;
  description: string;
  delay?: number;
}) {
  return (
    <Reveal delay={delay}>
      <div className="glass-card rounded-2xl border border-white/10 p-6">
        <div className="mb-2 flex items-start justify-between">
          <div>
            <h3 className="font-serif text-xl">{title}</h3>
            <span className="font-mono text-sm text-primary">{company}</span>
          </div>
          <span className="font-mono text-xs text-muted">{period}</span>
        </div>
        <p className="text-sm leading-relaxed font-light text-muted">
          {description}
        </p>
      </div>
    </Reveal>
  );
}

// Timeline Section
function TimelineSection() {

  const experiences = [
    {
      title: "Senior Frontend Engineer",
      company: "Vercel",
      period: "2022 - Present",
      description:
        "Leading the design system team, building Next.js features, and improving developer experience for millions of users worldwide.",
    },
    {
      title: "Design Engineer",
      company: "Stripe",
      period: "2019 - 2022",
      description:
        "Bridged design and engineering, created component libraries, and shipped UI features for the Dashboard and Payments products.",
    },
    {
      title: "Frontend Developer",
      company: "Airbnb",
      period: "2017 - 2019",
      description:
        "Built responsive web experiences, contributed to the design system, and optimized performance for the booking flow.",
    },
    {
      title: "Junior Developer",
      company: "Startup",
      period: "2015 - 2017",
      description:
        "Started my journey building MVPs, learning full-stack development, and discovering my passion for frontend engineering.",
    },
  ];

  return (
    <section className="relative px-8 py-20">
      <div className="mx-auto max-w-3xl">
        <Reveal className="mb-12">
          <span className="font-mono text-xs tracking-widest text-primary uppercase">
            Journey
          </span>
          <h2 className="mt-2 font-serif text-4xl">Experience</h2>
        </Reveal>

        <div className="space-y-8">
          {experiences.map((exp, index) => (
            <TimelineItem key={exp.company} {...exp} delay={index * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA Section
function CTASection() {
  return (
    <section className="relative px-8 py-20">
      <Reveal className="mx-auto max-w-3xl text-center">
        <h2 className={`
          mb-4 font-serif text-4xl
          lg:text-5xl
        `}>
          Let&apos;s Work Together
        </h2>
        <p className="mx-auto mb-8 max-w-md text-lg font-light text-muted">
          I&apos;m always open to discussing new opportunities, interesting
          projects, or just having a chat.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <motion.a
            href={`mailto:${EMAIL}`}
            className={`
              flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-mono text-sm tracking-wider
              text-primary-foreground uppercase transition-all duration-300
              hover:gap-3
            `}
            whileHover={{ x: 4 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Get in Touch
          </motion.a>
          <motion.a
            href={GITHUB_PAGE}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              flex items-center gap-2 rounded-full border border-white/20 px-8 py-4 font-mono text-sm tracking-wider
              uppercase transition-all duration-300
              hover:border-primary hover:text-primary
            `}
            whileHover={{ x: 4 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub
          </motion.a>
        </div>
      </Reveal>
    </section>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="border-t border-white/5 px-8 py-12">
      <div className="mx-auto max-w-7xl">
        <div className={`
          flex flex-col items-center justify-between gap-6
          md:flex-row
        `}>
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
              <span className="font-mono text-xs font-bold text-black">FC</span>
            </div>
            <span className="font-mono text-xs text-muted">{NICKNAME}</span>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-6">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`
                text-muted transition-colors duration-300
                hover:text-foreground
              `}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href={GITHUB_PAGE}
              target="_blank"
              rel="noopener noreferrer"
              className={`
                text-muted transition-colors duration-300
                hover:text-foreground
              `}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
            <a
              href="/rss.xml"
              className={`
                text-muted transition-colors duration-300
                hover:text-foreground
              `}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z" />
              </svg>
            </a>
            <a
              href={`mailto:${EMAIL}`}
              className={`
                text-muted transition-colors duration-300
                hover:text-foreground
              `}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </a>
          </div>

          {/* Copyright */}
          <span className="font-mono text-xs text-muted/60">
            © 2024 {NICKNAME}. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}

// Main Page Component
export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <AboutHeroSection />
      <SkillsSection />
      <HobbiesSection />
      <GearSection />
      <TimelineSection />
      <CTASection />
      <Footer />
    </main>
  );
}
