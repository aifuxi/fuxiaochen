package handler

import (
	"github.com/aifuxi/fgo/internal/model/dto"
	"github.com/aifuxi/fgo/internal/service"
	"github.com/aifuxi/fgo/pkg/response"
	"github.com/gin-gonic/gin"
)

type TagHandler struct {
	svc service.TagService
}

func NewTagHandler(svc service.TagService) *TagHandler {
	return &TagHandler{svc: svc}
}

func (h *TagHandler) Create(ctx *gin.Context) {
	var req dto.TagCreateReq

	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.ParamError(ctx, err.Error())
		return
	}

	tag, err := h.svc.Create(ctx, req)

	if err != nil {
		response.BusinessError(ctx, err.Error())
		return
	}

	response.Success(ctx, tag)
}

func (h *TagHandler) List(ctx *gin.Context) {
	var req dto.TagListReq

	if err := ctx.ShouldBindQuery(&req); err != nil {
		response.ParamError(ctx, err.Error())
		return
	}

	lists, total, err := h.svc.List(ctx, req, true)

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

func (h *TagHandler) FindByID(ctx *gin.Context) {
	var req dto.TagFindByIDReq

	if err := ctx.ShouldBindUri(&req); err != nil {
		response.ParamError(ctx, err.Error())
		return
	}

	tag, err := h.svc.FindByID(ctx, req.ID, false)

	if err != nil {
		response.BusinessError(ctx, err.Error())
		return
	}

	response.Success(ctx, tag)
}

func (h *TagHandler) DeleteByID(ctx *gin.Context) {
	var req dto.TagFindByIDReq

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

func (h *TagHandler) UpdateByID(ctx *gin.Context) {
	var req dto.TagUpdateReq

	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.ParamError(ctx, err.Error())
		return
	}

	var idReq dto.TagFindByIDReq
	if err := ctx.ShouldBindUri(&idReq); err != nil {
		response.ParamError(ctx, err.Error())
		return
	}

	tag, err := h.svc.UpdateByID(ctx, idReq.ID, req)

	if err != nil {
		response.BusinessError(ctx, err.Error())
		return
	}

	response.Success(ctx, tag)
}
