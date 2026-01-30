import type { CommonModel, ListReq } from "./common";

export interface User extends CommonModel {
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  role: "admin" | "visitor";
}

export interface UserListReq extends ListReq {
  name?: string;
  email?: string;
  role?: "admin" | "visitor";
}

export interface UserListResp {
  total: number;
  lists: User[] | null;
}

export interface UserUpdateReq {
  role: "admin" | "visitor";
}
