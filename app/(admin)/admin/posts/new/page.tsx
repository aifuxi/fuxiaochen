import type { Metadata } from "next";

import { AdminPostEditor } from "@/components/admin/admin-post-editor";

import { adminMetadata } from "@/constants/admin-metadata";

export const metadata: Metadata = adminMetadata.postsNew;

export default function NewPostPage() {
  return <AdminPostEditor mode="create" />;
}
