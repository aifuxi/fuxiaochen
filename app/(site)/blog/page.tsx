import { type Metadata } from "next";

import { siteCopy } from "@/constants/site-copy";

import { BlogListClient } from "./blog-list-client";

export const metadata: Metadata = {
  title: siteCopy.metadata.blog.title,
  description: siteCopy.metadata.blog.description,
};

export default function BlogListPage() {
  return <BlogListClient />;
}
