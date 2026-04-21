import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

import { BlogListClient } from "./blog-list-client";

export default function BlogListPage() {
  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <BlogListClient />
      <Footer />
    </div>
  );
}
