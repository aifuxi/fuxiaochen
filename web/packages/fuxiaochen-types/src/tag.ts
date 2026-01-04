import type { CommonModel, ListReq } from "./common";

export interface Tag extends CommonModel {
	name: string;
	slug: string;
	description: string;
	blogCount: number;
}

export interface TagListReq extends ListReq {
	name?: string;
	slug?: string;
}

export interface TagListResp {
	total: number;
	lists: Tag[];
}

export interface TagCreateReq {
	name: string;
	slug: string;
	description?: string;
}
