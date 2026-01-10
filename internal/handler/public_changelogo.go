package handler

import (
	"github.com/aifuxi/fuxiaochen-api/internal/model/dto"
	"github.com/aifuxi/fuxiaochen-api/internal/service"
	"github.com/aifuxi/fuxiaochen-api/pkg/response"
	"github.com/gin-gonic/gin"
)

type PublicChangelogHandler struct {
	svc service.ChangelogService
}

func NewPublicChangelogHandler(svc service.ChangelogService) *PublicChangelogHandler {
	return &PublicChangelogHandler{svc: svc}
}

func (h *PublicChangelogHandler) List(ctx *gin.Context) {
	var req dto.PublicChangelogListReq

	if err := ctx.ShouldBindQuery(&req); err != nil {
		response.ParamError(ctx, err.Error())
		return
	}

	lists, total, err := h.svc.List(ctx, dto.ChangelogListReq{
		ListReq: dto.ListReq{
			Page:     req.Page,
			PageSize: req.PageSize,
		},
	})

	if err != nil {
		response.BusinessError(ctx, err.Error())
		return
	}

	var Changelogs []dto.ChangelogResp

	for _, Changelog := range lists {
		Changelogs = append(Changelogs, convertChangelogResp(Changelog))
	}

	response.Success(ctx, dto.ChangelogListResp{
		Total: total,
		Lists: Changelogs,
	})
}
