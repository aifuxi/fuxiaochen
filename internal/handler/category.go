package handler

import (
	"github.com/aifuxi/fgo/internal/model/dto"
	"github.com/aifuxi/fgo/internal/service"
	"github.com/aifuxi/fgo/pkg/response"
	"github.com/gin-gonic/gin"
)

type CategoryHandler struct {
	svc service.CategoryService
}

func NewCategoryHandler(svc service.CategoryService) *CategoryHandler {
	return &CategoryHandler{svc: svc}
}

func (h *CategoryHandler) Create(ctx *gin.Context) {
	var req dto.CategoryCreateReq

	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.ParamError(ctx, err.Error())
		return
	}

	err := h.svc.Create(ctx, req)

	if err != nil {
		response.BusinessError(ctx, err.Error())
		return
	}

	response.Success(ctx, nil)
}

func (h *CategoryHandler) List(ctx *gin.Context) {
	var req dto.CategoryListReq

	if err := ctx.ShouldBindQuery(&req); err != nil {
		response.ParamError(ctx, err.Error())
		return
	}

	lists, total, err := h.svc.List(ctx, req, true)

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

func (h *CategoryHandler) FindByID(ctx *gin.Context) {
	var req dto.CategoryFindByIDReq

	if err := ctx.ShouldBindUri(&req); err != nil {
		response.ParamError(ctx, err.Error())
		return
	}

	category, err := h.svc.FindByID(ctx, req.ID, false)

	if err != nil {
		response.BusinessError(ctx, err.Error())
		return
	}

	response.Success(ctx, category)
}

func (h *CategoryHandler) DeleteByID(ctx *gin.Context) {
	var req dto.CategoryFindByIDReq

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

func (h *CategoryHandler) UpdateByID(ctx *gin.Context) {
	var req dto.CategoryUpdateReq

	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.ParamError(ctx, err.Error())
		return
	}

	var idReq dto.CategoryFindByIDReq
	if err := ctx.ShouldBindUri(&idReq); err != nil {
		response.ParamError(ctx, err.Error())
		return
	}

	err := h.svc.UpdateByID(ctx, idReq.ID, &req)

	if err != nil {
		response.BusinessError(ctx, err.Error())
		return
	}

	response.Success(ctx, nil)
}
