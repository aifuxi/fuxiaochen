package handler

import (
	"github.com/aifuxi/fgo/internal/model/dto"
	"github.com/aifuxi/fgo/internal/service"
	"github.com/aifuxi/fgo/pkg/response"
	"github.com/gin-gonic/gin"
)

type PublicTagHandler struct {
	svc service.TagService
}

func NewPublicTagHandler(svc service.TagService) *PublicTagHandler {
	return &PublicTagHandler{svc: svc}
}

func (h *PublicTagHandler) List(ctx *gin.Context) {
	var req dto.PublicTagListReq

	if err := ctx.ShouldBindQuery(&req); err != nil {
		response.ParamError(ctx, err.Error())
		return
	}

	lists, total, err := h.svc.List(ctx, dto.TagListReq{
		ListReq: dto.ListReq{
			Page:     req.Page,
			PageSize: req.PageSize,
		},
	}, true)

	if err != nil {
		response.BusinessError(ctx, err.Error())
		return
	}

	var tags []dto.TagResp

	for _, tag := range lists {
		tags = append(tags, convertTagResp(tag))
	}

	response.Success(ctx, dto.TagListResp{
		Total: total,
		Lists: tags,
	})
}

func (h *PublicTagHandler) FindBySlug(ctx *gin.Context) {
	var req dto.PublicTagFindBySlugReq

	if err := ctx.ShouldBindUri(&req); err != nil {
		response.ParamError(ctx, err.Error())
		return
	}

	tag, err := h.svc.FindBySlug(ctx, req.Slug, true)

	if err != nil {
		response.BusinessError(ctx, err.Error())
		return
	}

	response.Success(ctx, convertTagResp(*tag))
}
