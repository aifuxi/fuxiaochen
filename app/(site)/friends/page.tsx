import { type Metadata } from "next";

import { siteCopy } from "@/constants/site-copy";

import { FriendsPageClient } from "./friends-page-client";

export const metadata: Metadata = {
  title: siteCopy.metadata.friends.title,
  description: siteCopy.metadata.friends.description,
};

export default function FriendsPage() {
  return <FriendsPageClient />;
}
