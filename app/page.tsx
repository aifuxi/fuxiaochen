import { FeaturedPosts } from "@/components/featured-posts";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { Navbar } from "@/components/navbar";
import { RecentPosts } from "@/components/recent-posts";

export default function Page() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <FeaturedPosts />
        <RecentPosts />
      </main>
      <Footer />
    </div>
  );
}
