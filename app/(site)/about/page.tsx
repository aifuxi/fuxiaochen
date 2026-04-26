import { type Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import {
  Github,
  Twitter,
  Linkedin,
  Mail,
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { settingsService } from "@/lib/server/settings/service";

import { routes } from "@/constants/routes";
import { siteCopy } from "@/constants/site-copy";

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await settingsService.getSettings();

  return settings.seo.pages.about;
}

export default async function AboutPage() {
  const { settings } = await settingsService.getSettings();
  const socialLinks = [
    { href: settings.social.githubUrl, label: "GitHub", icon: Github },
    { href: settings.social.twitterUrl, label: "Twitter", icon: Twitter },
    { href: settings.social.linkedinUrl, label: "LinkedIn", icon: Linkedin },
    { href: `mailto:${settings.general.email}`, label: "邮箱", icon: Mail },
  ].filter((link) => link.href.length > 0);

  return (
    <>
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-12">
            <div className="relative size-32 shrink-0 overflow-hidden rounded-2xl border border-border md:size-48">
              <Image
                src={settings.general.avatarUrl}
                alt={settings.general.siteName}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col gap-4">
              <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                {settings.profile.aboutTitle}
              </h1>
              <p className="text-lg text-primary">
                {settings.profile.aboutRole}
              </p>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="size-4" />
                <span className="text-sm">
                  {settings.profile.aboutLocation}
                </span>
              </div>
              <div className="flex items-center gap-3 pt-2">
                {socialLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <link.icon className="size-5" />
                    <span className="sr-only">{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bio Section */}
      <section className="border-t border-border py-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold text-foreground">
              {settings.profile.bioTitle}
            </h2>
            {settings.profile.bio.map((paragraph) => (
              <p
                key={paragraph}
                className="leading-relaxed text-muted-foreground"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="border-t border-border py-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-8 flex items-center gap-3">
            <Briefcase className="size-5 text-primary" />
            <h2 className="text-2xl font-semibold text-foreground">
              {settings.profile.experienceTitle}
            </h2>
          </div>
          <div className="flex flex-col gap-8">
            {settings.profile.experience.map((exp, index) => (
              <div
                key={index}
                className="relative flex flex-col gap-2 border-l-2 border-border pb-2 pl-6"
              >
                <div className="absolute top-0 -left-[9px] size-4 rounded-full border-2 border-primary bg-background" />
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="font-semibold text-foreground">{exp.role}</h3>
                  <span className="text-sm text-muted-foreground">
                    {exp.period}
                  </span>
                </div>
                <p className="text-sm font-medium text-primary">
                  {exp.company}
                </p>
                <p className="text-sm text-muted-foreground">
                  {exp.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="border-t border-border py-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-8 flex items-center gap-3">
            <GraduationCap className="size-5 text-primary" />
            <h2 className="text-2xl font-semibold text-foreground">
              {settings.profile.skillsTitle}
            </h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-2">
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
                {siteCopy.about.skillLabels.languages}
              </h3>
              <div className="flex flex-wrap gap-2">
                {settings.profile.skills.languages.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-border bg-muted px-3 py-1 text-sm text-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
                {siteCopy.about.skillLabels.frontend}
              </h3>
              <div className="flex flex-wrap gap-2">
                {settings.profile.skills.frontend.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-border bg-muted px-3 py-1 text-sm text-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
                {siteCopy.about.skillLabels.backend}
              </h3>
              <div className="flex flex-wrap gap-2">
                {settings.profile.skills.backend.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-border bg-muted px-3 py-1 text-sm text-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
                {siteCopy.about.skillLabels.tools}
              </h3>
              <div className="flex flex-wrap gap-2">
                {settings.profile.skills.tools.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-border bg-muted px-3 py-1 text-sm text-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interests Section */}
      <section className="border-t border-border py-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-8 flex items-center gap-3">
            <Heart className="size-5 text-primary" />
            <h2 className="text-2xl font-semibold text-foreground">
              {settings.profile.beyondCodeTitle}
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {settings.profile.interests.map((interest) => (
              <div
                key={interest.title}
                className="flex flex-col gap-2 rounded-lg border border-border p-4"
              >
                <h3 className="font-medium text-foreground">
                  {interest.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {interest.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border py-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="flex flex-col items-center gap-6 rounded-lg border border-border bg-muted/50 p-8 text-center">
            <h2 className="text-2xl font-semibold text-foreground">
              {settings.profile.ctaTitle}
            </h2>
            <p className="max-w-md text-muted-foreground">
              {settings.profile.ctaDescription}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button asChild>
                <Link href={`mailto:${settings.general.email}`}>
                  <Mail className="mr-2 size-4" />
                  {siteCopy.about.ctaPrimary}
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={routes.site.projects}>
                  {siteCopy.about.ctaSecondary}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
