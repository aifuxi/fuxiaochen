package dto

import (
	"github.com/aifuxi/fgo/internal/model"
)

type PublicTagListReq struct {
	Page     int `json:"page" form:"page" binding:"required,min=1"`
	PageSize int `json:"pageSize" form:"pageSize" binding:"required,min=1,max=10000"`
}

type PublicTagListResp struct {
	Total int64        `json:"total"`
	Lists []*model.Tag `json:"lists"`
}

type PublicTagFindBySlugReq struct {
	Slug string `uri:"slug" binding:"required"`
}
