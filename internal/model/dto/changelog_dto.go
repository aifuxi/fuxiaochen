package dto

import "github.com/aifuxi/fuxiaochen-api/internal/model"

type ChangelogCreateReq struct {
	Version string `json:"version" binding:"required"`
	Content string `json:"content" binding:"required"`
}

type ChangelogListReq struct {
	ListReq
}

type ChangelogResp struct {
	model.Changelog
}

type ChangelogListResp struct {
	Total int64           `json:"total"`
	Lists []ChangelogResp `json:"lists"`
}

type ChangelogFindByIDReq struct {
	ID int64 `uri:"id" binding:"required"`
}

type ChangelogUpdateReq struct {
	Version string `json:"version" binding:"required"`
	Content string `json:"content" binding:"required"`
}
