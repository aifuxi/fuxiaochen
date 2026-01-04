import type { CommonModel, ListReq } from "./common";
import type { Role } from "./role";

export interface UserRegisterReq {
	nickname: string;
	email: string;
	password: string;
}

export interface UserLoginReq {
	email: string;
	password: string;
}

export interface UserUpdateReq {
	nickname?: string;
	email?: string;
	roleIDs?: string[];
}

export interface UserUpdatePasswordReq {
	password: string;
}

export interface UserListReq extends ListReq {
	nickname?: string;
	email?: string;
}

export interface UserResp extends CommonModel {
	nickname: string;
	email: string;
	roles?: Role[];
	banned: boolean;
	bannedAt?: string;
}

export interface UserListResp {
	total: string;
	lists: UserResp[];
}

export interface UserFindByIDReq {
	id: string;
}

export interface UserCreateReq {
	nickname: string;
	email: string;
	password: string;
	roleIDs: string[];
}

export interface UserUpdateBanReq {
	ban: boolean;
}
