import {
  type Tag,
  type TagCreateReq,
  type TagListReq,
  type TagListResp,
} from "@/types/tag";

export interface ITagStore {
  create(data: TagCreateReq): Promise<Tag>;
  update(id: string, data: Partial<TagCreateReq>): Promise<Tag | null>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Tag | null>;
  findAll(params?: TagListReq): Promise<TagListResp>;
}
