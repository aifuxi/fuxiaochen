package handler

import (
	"github.com/aifuxi/fgo/internal/model/dto"
	"github.com/aifuxi/fgo/internal/service"
	"github.com/aifuxi/fgo/pkg/response"
	"github.com/gin-gonic/gin"
)

type PublicCategoryHandler struct {
	svc service.CategoryService
}

func NewPublicCategoryHandler(svc service.CategoryService) *PublicCategoryHandler {
	return &PublicCategoryHandler{svc: svc}
}

func (h *PublicCategoryHandler) List(ctx *gin.Context) {
	var req dto.PublicCategoryListReq

	if err := ctx.ShouldBindQuery(&req); err != nil {
		response.ParamError(ctx, err.Error())
		return
	}

	lists, total, err := h.svc.List(ctx, dto.CategoryListReq{
		ListReq: dto.ListReq{
			Page:     req.Page,
			PageSize: req.PageSize,
		},
	}, true)

	if err != nil {
		response.BusinessError(ctx, err.Error())
		return
	}

	var categories []dto.CategoryResp

	for _, category := range lists {
		categories = append(categories, convertCategoryResp(category))
	}

	response.Success(ctx, dto.CategoryListResp{
		Total: total,
		Lists: categories,
	})
}

func (h *PublicCategoryHandler) FindBySlug(ctx *gin.Context) {
	var req dto.PublicCategoryFindBySlugReq

	if err := ctx.ShouldBindUri(&req); err != nil {
		response.ParamError(ctx, err.Error())
		return
	}

	category, err := h.svc.FindBySlug(ctx, req.Slug, true)

	if err != nil {
		response.BusinessError(ctx, err.Error())
		return
	}

	response.Success(ctx, convertCategoryResp(*category))
}
