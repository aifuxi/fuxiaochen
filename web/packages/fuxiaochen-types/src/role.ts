import type { Permission } from "./permission";
import type { UserResp } from "./user";
import type { CommonModel, ListReq } from "./common";

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
