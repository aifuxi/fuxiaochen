import { type Blog, type BlogCreateReq, type BlogListReq, type BlogListResp } from "@/types/blog";

export interface IBlogStore {
  create(data: BlogCreateReq): Promise<Blog>;
  update(id: string, data: Partial<BlogCreateReq>): Promise<Blog | null>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Blog | null>;
  findBySlug(slug: string): Promise<Blog | null>;
  findAll(params?: BlogListReq): Promise<BlogListResp>;
  togglePublish(id: string): Promise<Blog | null>;
  toggleFeature(id: string): Promise<Blog | null>;
}
