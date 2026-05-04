import type { Metadata } from "next";

import { AdminPostEditor } from "@/components/admin/admin-post-editor";

import { adminMetadata } from "@/constants/admin-metadata";

export const metadata: Metadata = adminMetadata.postEdit;

type EditPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { slug } = await params;

  return <AdminPostEditor mode="edit" slug={slug} />;
}
