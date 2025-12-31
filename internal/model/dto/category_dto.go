package dto

import "github.com/aifuxi/fgo/internal/model"

type CategoryCreateReq struct {
	Name        string `json:"name" binding:"required"`
	Slug        string `json:"slug" binding:"required"`
	Description string `json:"description"`
}

type CategoryUpdateReq struct {
	Name        string `json:"name" binding:"required"`
	Slug        string `json:"slug" binding:"required"`
	Description string `json:"description" binding:"required"`
}

type CategoryListReq struct {
	ListReq
	Name string `json:"name" form:"name" `
	Slug string `json:"slug" form:"slug" `
}

type CategoryResp struct {
	model.Category
	BlogCount int64 `json:"blogCount"`
}

type CategoryListResp struct {
	Total int64          `json:"total"`
	Lists []CategoryResp `json:"lists"`
}

type CategoryFindByIDReq struct {
	ID int64 `uri:"id" binding:"required"`
}
