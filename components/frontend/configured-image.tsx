"use client";
import {
  Globe,
  Code,
  Video,
  Camera,
  Briefcase,
  AtSign,
  MessageCircle,
  Rss,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import type { SocialAccount } from "@/lib/settings/schema";

import { imageUrlSchema } from "@/lib/admin/schema";
export function ConfiguredImage({
  src,
  size = 20,
  profile = false,
}: {
  src: string;
  size?: number;
  profile?: boolean;
}) {
  const [failed, setFailed] = useState<string | null>(null);
  return src && failed !== src && imageUrlSchema.safeParse(src).success ? (
    <Image
      src={src}
      width={size}
      height={size}
      alt=""
      unoptimized
      referrerPolicy="no-referrer"
      onError={() => setFailed(src)}
      style={{
        width: size,
        height: size,
        objectFit: "cover",
        borderRadius: profile ? "50%" : undefined,
        flexShrink: 0,
      }}
    />
  ) : profile ? (
    <UserRound size={size} aria-hidden="true" />
  ) : (
    <Globe size={size} aria-hidden="true" />
  );
}
const icons = {
  globe: Globe,
  github: Code,
  youtube: Video,
  instagram: Camera,
  linkedin: Briefcase,
  twitter: AtSign,
  message: MessageCircle,
  rss: Rss,
};
export function SocialIcon({ account }: { account: SocialAccount }) {
  if (account.icon === "image") return <ConfiguredImage src={account.imageUrl} />;
  const Icon = icons[account.icon];
  return <Icon size={20} aria-hidden="true" />;
}
