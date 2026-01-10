package dto

import (
	"github.com/aifuxi/fuxiaochen-api/internal/model"
)

type PublicChangelogListReq struct {
	Page     int `json:"page" form:"page" binding:"required,min=1"`
	PageSize int `json:"pageSize" form:"pageSize" binding:"required,min=1,max=10000"`
}

type PublicChangelogListResp struct {
	Total int64              `json:"total"`
	Lists []*model.Changelog `json:"lists"`
}
