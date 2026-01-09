import type { CommonModel, ListReq } from "./common";

export interface Changelog extends CommonModel {
  version: string;
  content: string;
}

export interface ChangelogListReq extends ListReq {
  version?: string;
}

export interface ChangelogListResp {
  total: number;
  lists: Changelog[];
}

export interface ChangelogCreateReq {
  version: string;
  content: string;
}
