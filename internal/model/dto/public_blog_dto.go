package dto

import (
	"github.com/aifuxi/fuxiaochen-api/internal/model"
)

type PublicBlogListReq struct {
	Page           int      `json:"page" form:"page" binding:"required,min=1"`
	PageSize       int      `json:"pageSize" form:"pageSize" binding:"required,min=1,max=10000"`
	FeaturedStatus string   `json:"featuredStatus" form:"featured" binding:"omitempty,oneof=featured unfeatured"`
	CategorySlug   string   `json:"category" form:"category" binding:"omitempty"`
	TagSlugs       []string `json:"tags" form:"tags" binding:"omitempty"`
}

type PublicBlogListResp struct {
	Total int64         `json:"total"`
	Lists []*model.Blog `json:"lists"`
}

type PublicBlogFindBySlugReq struct {
	Slug string `uri:"slug" binding:"required"`
}
