package handler

import (
	"github.com/aifuxi/fgo/internal/model"
	"github.com/aifuxi/fgo/internal/model/dto"
)

func convertCategoryResp(category model.Category) dto.CategoryResp {
	return dto.CategoryResp{
		Category:  category,
		BlogCount: int64(len(category.Blogs)),
	}
}

func convertTagResp(tag model.Tag) dto.TagResp {
	return dto.TagResp{
		Tag:       tag,
		BlogCount: int64(len(tag.Blogs)),
	}
}