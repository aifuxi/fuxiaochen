package handler

import (
	"github.com/aifuxi/fgo/internal/model/dto"
	"github.com/aifuxi/fgo/internal/service"
	"github.com/aifuxi/fgo/pkg/response"
	"github.com/gin-gonic/gin"
)

type PublicBlogHandler struct {
	svc service.BlogService
}

func NewPublicBlogHandler(svc service.BlogService) *PublicBlogHandler {
	return &PublicBlogHandler{svc: svc}
}

func (h *PublicBlogHandler) List(ctx *gin.Context) {
	var req dto.PublicBlogListReq

	if err := ctx.ShouldBindQuery(&req); err != nil {
		response.ParamError(ctx, err.Error())
		return
	}

	lists, total, err := h.svc.List(ctx, dto.BlogListReq{
		ListReq: dto.ListReq{
			Page:     req.Page,
			PageSize: req.PageSize,
		},
	})

	if err != nil {
		response.BusinessError(ctx, err.Error())
		return
	}

	response.Success(ctx, dto.BlogListResp{
		Total: total,
		Lists: lists,
	})
}

func (h *PublicBlogHandler) FindBySlug(ctx *gin.Context) {
	var req dto.PublicBlogFindBySlugReq

	if err := ctx.ShouldBindUri(&req); err != nil {
		response.ParamError(ctx, err.Error())
		return
	}

	blog, err := h.svc.FindBySlug(ctx, req.Slug)

	if err != nil {
		response.BusinessError(ctx, err.Error())
		return
	}

	response.Success(ctx, blog)
}
