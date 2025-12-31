package dto

import (
	"github.com/aifuxi/fgo/internal/model"
)

type PublicCategoryListReq struct {
	Page     int `json:"page" form:"page" binding:"required,min=1"`
	PageSize int `json:"pageSize" form:"pageSize" binding:"required,min=1,max=10000"`
}

type PublicCategoryListResp struct {
	Total int64             `json:"total"`
	Lists []*model.Category `json:"lists"`
}

type PublicCategoryFindBySlugReq struct {
	Slug string `uri:"slug" binding:"required"`
}
