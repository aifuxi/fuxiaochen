import Image from "next/image";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

interface BlogCardProps {
  title: string;
  excerpt: string;
  tags: string[];
  date: string;
  slug: string;
  cover?: string;
}

export function NeonBlogCard({
  title,
  excerpt,
  tags,
  date,
  slug,
  cover,
}: BlogCardProps) {
  return (
    <Link href={`/blog/${slug}`} className="block h-full">
      <Card className={`
        group relative flex h-full flex-col overflow-hidden rounded-xl border-white/5 bg-cyber-gray/40 pt-0
        backdrop-blur-sm transition-all duration-500
        hover:border-neon-cyan/50 hover:shadow-[0_0_30px_rgba(0,255,255,0.1)]
      `}>
        <div className={`
          pointer-events-none absolute inset-0 bg-gradient-to-br from-neon-cyan/5 to-neon-purple/5 opacity-0
          transition-opacity duration-500
          group-hover:opacity-100
        `} />

        <div className="relative h-48 w-full overflow-hidden border-b border-white/5 bg-black/50">
          <Image
            src={cover || "/images/placeholder.avif"}
            alt={title}
            fill
            className={`
              object-cover transition-transform duration-500
              group-hover:scale-105
            `}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cyber-gray/80 to-transparent opacity-60" />
        </div>

        <CardHeader className="relative z-10 pb-2">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className={`
                    rounded-sm border border-neon-cyan/30 bg-neon-cyan/5 px-2 py-0.5 text-[10px] tracking-wider
                    text-neon-cyan uppercase
                  `}
                >
                  {tag}
                </span>
              ))}
            </div>
            <span className="font-mono text-xs text-gray-500">{date}</span>
          </div>
          <h3 className={`
            line-clamp-2 text-xl leading-tight font-bold text-white transition-colors duration-300
            group-hover:text-neon-cyan
          `}>
            {title}
          </h3>
        </CardHeader>

        <CardContent className="relative z-10 flex-grow">
          <p className="line-clamp-3 text-sm leading-relaxed text-gray-400">
            {excerpt}
          </p>
        </CardContent>

        <CardFooter className="relative z-10 border-t border-white/5 pt-4">
          <span className={`
            flex items-center gap-2 text-xs font-bold tracking-widest text-neon-purple uppercase transition-transform
            duration-300
            group-hover:translate-x-2
          `}>
            阅读协议 / Read Protocol <span className="text-lg">›</span>
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
