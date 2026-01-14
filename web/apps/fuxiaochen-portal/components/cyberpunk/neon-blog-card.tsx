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
      <Card className="bg-cyber-gray/40 border-white/5 backdrop-blur-sm hover:border-neon-cyan/50 hover:shadow-[0_0_30px_rgba(0,255,255,0.1)] transition-all duration-500 group overflow-hidden relative h-full flex flex-col rounded-xl pt-0">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 to-neon-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="relative w-full h-48 overflow-hidden border-b border-white/5 bg-black/50">
          <Image
            src={cover || "/images/placeholder.avif"}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cyber-gray/80 to-transparent opacity-60" />
        </div>

        <CardHeader className="pb-2 relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div className="flex gap-2 flex-wrap">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] uppercase tracking-wider text-neon-cyan border border-neon-cyan/30 px-2 py-0.5 rounded-sm bg-neon-cyan/5"
                >
                  {tag}
                </span>
              ))}
            </div>
            <span className="text-xs text-gray-500 font-mono">{date}</span>
          </div>
          <h3 className="text-xl font-bold text-white group-hover:text-neon-cyan transition-colors duration-300 line-clamp-2 leading-tight">
            {title}
          </h3>
        </CardHeader>

        <CardContent className="flex-grow relative z-10">
          <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed">
            {excerpt}
          </p>
        </CardContent>

        <CardFooter className="pt-4 border-t border-white/5 relative z-10">
          <span className="text-xs font-bold text-neon-purple uppercase tracking-widest group-hover:translate-x-2 transition-transform duration-300 flex items-center gap-2">
            Read Protocol <span className="text-lg">›</span>
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
