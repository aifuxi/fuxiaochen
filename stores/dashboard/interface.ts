import { type Blog } from "@/types/blog";

export interface DashboardStats {
  blogCount: number;
  publishedBlogCount: number;
  categoryCount: number;
  tagCount: number;
  userCount: number;
  recentBlogs: Blog[];
}

export interface IDashboardStore {
  getDashboardStats(): Promise<DashboardStats>;
}
