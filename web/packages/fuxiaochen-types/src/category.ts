import { Blog } from "./blog";
import type { CommonModel, ListReq } from "./common";

export interface Category extends CommonModel {
	name: string;
	slug: string;
	description: string;
	blogCount: number;
	blogs?: Blog[];
}

export interface CategoryListReq extends ListReq {
	name?: string;
	slug?: string;
}

export interface CategoryListResp {
	total: number;
	lists: Category[];
}

export interface CategoryCreateReq {
	name: string;
	slug: string;
	description?: string;
}
