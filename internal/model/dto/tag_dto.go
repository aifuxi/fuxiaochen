package dto

import "github.com/aifuxi/fgo/internal/model"

type TagCreateReq struct {
	Name        string `json:"name" binding:"required"`
	Slug        string `json:"slug" binding:"required"`
	Description string `json:"description" binding:"required"`
}

type TagListReq struct {
	ListReq
	Name string `json:"name" form:"name" `
	Slug string `json:"slug" form:"slug" `
}

type TagResp struct {
	model.Tag
	BlogCount int64 `json:"blogCount"`
}

type TagListResp struct {
	Total int64     `json:"total"`
	Lists []TagResp `json:"lists"`
}

type TagFindByIDReq struct {
	ID int64 `uri:"id" binding:"required"`
}

type TagUpdateReq struct {
	Name        string `json:"name" binding:"required"`
	Slug        string `json:"slug" binding:"required"`
	Description string `json:"description"`
}
