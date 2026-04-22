import { type Metadata } from "next";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

import { FriendsPageClient } from "./friends-page-client";

export const metadata: Metadata = {
  title: "Friends | Fuxiaochen",
  description: "Links to my friends and people whose work I admire.",
};

export default function FriendsPage() {
  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <FriendsPageClient />
      <Footer />
    </div>
  );
}
