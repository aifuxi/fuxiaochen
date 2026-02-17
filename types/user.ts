import type { CommonModel, ListReq } from "./common";

export interface User extends CommonModel {
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  role: number; // 1: admin, 2: normal
}

export interface UserListReq extends ListReq {
  name?: string;
  email?: string;
  role?: number; // 1: admin, 2: normal
}

export interface UserListResp {
  total: number;
  lists: User[] | null;
}

export interface UserUpdateReq {
  role: number; // 1: admin, 2: normal
}
