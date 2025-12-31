import request from "@/libs/request";
import type { Permission } from "./permission";
import type { UserResp } from "./user";
import type { CommonModel, CommonResponse, ListReq } from "./common";

export interface Role extends CommonModel {
  name: string;
  code: string;
  description?: string;
  users?: UserResp[];
  permissions?: Permission[];
}

export interface RoleResp extends CommonModel {
  name: string;
  code: string;
  description?: string;
  userCount: number;
  permissions?: Permission[];
}

export interface RoleListReq extends ListReq {
  name?: string;
  code?: string;
}

export interface RoleListResp {
  total: number;
  lists: RoleResp[];
}

const API_BASE_PATH = "/api/v1/roles";

/** 获取角色列表 */
export async function getRoleList(req: RoleListReq) {
  const res = await request.get<CommonResponse<RoleListResp>>(API_BASE_PATH, {
    params: req,
  });
  return res.data;
}

/** 获取角色详情 */
export async function getRoleDetail(roleID: string) {
  const res = await request.get<CommonResponse<RoleResp>>(
    `${API_BASE_PATH}/${roleID}`
  );
  return res.data;
}
