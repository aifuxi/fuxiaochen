package handler

import (
	"github.com/aifuxi/fuxiaochen-api/internal/model"
	"github.com/aifuxi/fuxiaochen-api/internal/model/dto"
	"github.com/aifuxi/fuxiaochen-api/internal/service"
	"github.com/aifuxi/fuxiaochen-api/pkg/response"
	"github.com/gin-gonic/gin"
)

type ChangelogHandler struct {
	svc service.ChangelogService
}

func NewChangelogHandler(svc service.ChangelogService) *ChangelogHandler {
	return &ChangelogHandler{svc: svc}
}

func (h *ChangelogHandler) Create(ctx *gin.Context) {
	var req dto.ChangelogCreateReq

	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.ParamError(ctx, err.Error())
		return
	}

	changelog, err := h.svc.Create(ctx, req)

	if err != nil {
		response.BusinessError(ctx, err.Error())
		return
	}

	response.Success(ctx, changelog)
}

func (h *ChangelogHandler) List(ctx *gin.Context) {
	var req dto.ChangelogListReq

	if err := ctx.ShouldBindQuery(&req); err != nil {
		response.ParamError(ctx, err.Error())
		return
	}

	lists, total, err := h.svc.List(ctx, req)

	if err != nil {
		response.BusinessError(ctx, err.Error())
		return
	}

	var changelogs []dto.ChangelogResp

	for _, changelog := range lists {
		changelogs = append(changelogs, convertChangelogResp(changelog))
	}

	response.Success(ctx, dto.ChangelogListResp{
		Total: total,
		Lists: changelogs,
	})
}

func (h *ChangelogHandler) FindByID(ctx *gin.Context) {
	var req dto.ChangelogFindByIDReq

	if err := ctx.ShouldBindUri(&req); err != nil {
		response.ParamError(ctx, err.Error())
		return
	}

	changelog, err := h.svc.FindByID(ctx, req.ID)

	if err != nil {
		response.BusinessError(ctx, err.Error())
		return
	}

	response.Success(ctx, changelog)
}

func (h *ChangelogHandler) DeleteByID(ctx *gin.Context) {
	var req dto.ChangelogFindByIDReq

	if err := ctx.ShouldBindUri(&req); err != nil {
		response.ParamError(ctx, err.Error())
		return
	}

	err := h.svc.DeleteByID(ctx, req.ID)

	if err != nil {
		response.BusinessError(ctx, err.Error())
		return
	}

	response.Success(ctx, nil)
}

func (h *ChangelogHandler) UpdateByID(ctx *gin.Context) {
	var req dto.ChangelogUpdateReq

	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.ParamError(ctx, err.Error())
		return
	}

	var idReq dto.ChangelogFindByIDReq
	if err := ctx.ShouldBindUri(&idReq); err != nil {
		response.ParamError(ctx, err.Error())
		return
	}

	changelog, err := h.svc.UpdateByID(ctx, idReq.ID, req)

	if err != nil {
		response.BusinessError(ctx, err.Error())
		return
	}

	response.Success(ctx, changelog)
}

func convertChangelogResp(changelog model.Changelog) dto.ChangelogResp {
	return dto.ChangelogResp{
		Changelog: changelog,
	}
}
