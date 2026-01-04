import request from "@/libs/request";
import type {
	CommonResponse,
	Tag,
	TagCreateReq,
	TagListReq,
	TagListResp,
} from "fuxiaochen-types";

const API_BASE_PATH = "/api/v1/tags";

/** 获取标签列表 */
export async function getTagList(req: TagListReq) {
	const res = await request.get<CommonResponse<TagListResp>>(API_BASE_PATH, {
		params: req,
	});
	return res.data;
}

/** 获取标签详情 */
export async function getTagDetail(tagID: string) {
	const res = await request.get<CommonResponse<Tag>>(
		`${API_BASE_PATH}/${tagID}`
	);
	return res.data;
}

/** 创建标签 */
export async function createTag(req: TagCreateReq) {
	const res = await request.post<CommonResponse<Tag>>(API_BASE_PATH, req);
	return res.data;
}

/** 更新标签 */
export async function updateTag(tagID: string, req: TagCreateReq) {
	const res = await request.put<CommonResponse<Tag>>(
		`${API_BASE_PATH}/${tagID}`,
		req
	);
	return res.data;
}

/** 删除标签 */
export async function deleteTag(tagID: string) {
	const res = await request.delete<CommonResponse<void>>(
		`${API_BASE_PATH}/${tagID}`
	);
	return res.data;
}
