import {
  Changelog,
  ChangelogCreateReq,
  ChangelogListReq,
  ChangelogListResp,
} from "@/types/changelog";

export interface IChangelogStore {
  create(data: ChangelogCreateReq): Promise<Changelog>;
  update(
    id: string,
    data: Partial<ChangelogCreateReq>,
  ): Promise<Changelog | null>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Changelog | null>;
  findAll(params?: ChangelogListReq): Promise<ChangelogListResp>;
}
