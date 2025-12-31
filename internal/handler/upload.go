package handler

import (
	"github.com/aifuxi/fgo/internal/model/dto"
	"github.com/aifuxi/fgo/internal/service"
	"github.com/aifuxi/fgo/pkg/response"
	"github.com/gin-gonic/gin"
)

type UploadHandler struct {
	svc service.UploadService
}

func NewUploadHandler(svc service.UploadService) *UploadHandler {
	return &UploadHandler{svc: svc}
}

func (h *UploadHandler) UploadPresign(ctx *gin.Context) {
	var req dto.UploadPresignReq

	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.ParamError(ctx, err.Error())
		return
	}

	result, err := h.svc.UploadPresign(ctx, &req)
	if err != nil {
		response.BusinessError(ctx, err.Error())
		return
	}

	response.Success(ctx, result)
}
