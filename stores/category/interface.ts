import {
  Category,
  CategoryCreateReq,
  CategoryListReq,
  CategoryListResp,
} from "@/types/category";

export interface ICategoryStore {
  create(data: CategoryCreateReq): Promise<Category>;
  update(
    id: string,
    data: Partial<CategoryCreateReq>,
  ): Promise<Category | null>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Category | null>;
  findAll(params?: CategoryListReq): Promise<CategoryListResp>;
}
