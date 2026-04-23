import { type Metadata } from "next";

import { FriendsPageClient } from "./friends-page-client";

export const metadata: Metadata = {
  title: "Friends | Fuxiaochen",
  description: "Links to my friends and people whose work I admire.",
};

export default function FriendsPage() {
  return <FriendsPageClient />;
}
