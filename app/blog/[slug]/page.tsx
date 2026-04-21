import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

import { BlogPostClient } from "./blog-post-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const readableSlug = slug
    .split("-")
    .map((segment) => segment[0]?.toUpperCase() + segment.slice(1))
    .join(" ");

  return {
    title: `${readableSlug} | Fuxiaochen`,
    description: `Read ${readableSlug} on Fuxiaochen.`,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <BlogPostClient slug={slug} />
      <Footer />
    </div>
  );
}
