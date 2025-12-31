package handler

import (
    "strings"

    "github.com/aifuxi/fgo/internal/model/dto"
    "github.com/aifuxi/fgo/internal/service"
    "github.com/aifuxi/fgo/pkg/response"
    "github.com/gin-gonic/gin"
)

type UserHandler struct {
	svc service.UserService
}

func NewUserHandler(svc service.UserService) *UserHandler {
	return &UserHandler{svc: svc}
}

func (h *UserHandler) Register(ctx *gin.Context) {
	var req dto.UserRegisterReq
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.ParamError(ctx, err.Error())
		return
	}

	err := h.svc.Register(ctx, req)
	if err != nil {
		response.BusinessError(ctx, err.Error())
		return
	}

	response.Success(ctx, nil)
}

func (h *UserHandler) Create(ctx *gin.Context) {
	var req dto.UserCreateReq
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

func (h *UserHandler) Login(ctx *gin.Context) {
	var req dto.UserLoginReq
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.ParamError(ctx, err.Error())
		return
	}

	token, err := h.svc.Login(ctx, req)
	if err != nil {
		response.BusinessError(ctx, err.Error())
		return
	}

	response.Success(ctx, gin.H{"token": token})
}

func (h *UserHandler) Logout(ctx *gin.Context) {
    authHeader := ctx.GetHeader("Authorization")
    if authHeader == "" {
        response.Unauthorized(ctx, "Authorization header is required")
        return
    }

    parts := strings.SplitN(authHeader, " ", 2)
    if !(len(parts) == 2 && parts[0] == "Bearer") {
        response.Unauthorized(ctx, "Authorization header format must be Bearer {token}")
        return
    }

    if err := h.svc.Logout(ctx, parts[1]); err != nil {
        response.BusinessError(ctx, err.Error())
        return
    }
    response.Success(ctx, nil)
}

func (h *UserHandler) List(ctx *gin.Context) {
	var req dto.UserListReq
	if err := ctx.ShouldBindQuery(&req); err != nil {
		response.ParamError(ctx, err.Error())
		return
	}

	resp, err := h.svc.List(ctx, req)
	if err != nil {
		response.BusinessError(ctx, err.Error())
		return
	}

	response.Success(ctx, resp)
}

func (h *UserHandler) FindByID(ctx *gin.Context) {
	var req dto.UserFindByIDReq
	if err := ctx.ShouldBindUri(&req); err != nil {
		response.ParamError(ctx, err.Error())
		return
	}

	user, err := h.svc.FindByID(ctx, req.ID)
	if err != nil {
		response.BusinessError(ctx, err.Error())
		return
	}

	response.Success(ctx, user)
}

func (h *UserHandler) Info(ctx *gin.Context) {
	// 从ctx取出用户ID
	id := ctx.GetInt64("userID")
	if id == 0 {
		response.Unauthorized(ctx, "not login")
		return
	}

	user, err := h.svc.Info(ctx, id)
	if err != nil {
		response.BusinessError(ctx, err.Error())
		return
	}

	response.Success(ctx, user)
}

func (h *UserHandler) Update(ctx *gin.Context) {
	var req dto.UserUpdateReq
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.ParamError(ctx, err.Error())
		return
	}

	var idReq dto.UserFindByIDReq
	if err := ctx.ShouldBindUri(&idReq); err != nil {
		response.ParamError(ctx, err.Error())
		return
	}

	err := h.svc.Update(ctx, idReq.ID, req)
	if err != nil {
		response.BusinessError(ctx, err.Error())
		return
	}

	response.Success(ctx, nil)
}

func (h *UserHandler) Delete(ctx *gin.Context) {
	var req dto.UserFindByIDReq
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

func (h *UserHandler) Ban(ctx *gin.Context) {
	var idReq dto.UserFindByIDReq

	if err := ctx.ShouldBindUri(&idReq); err != nil {
		response.ParamError(ctx, err.Error())
		return
	}

	var req dto.UserBanReq
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.ParamError(ctx, err.Error())
		return
	}

	err := h.svc.BanByID(ctx, idReq.ID, req.Ban)
	if err != nil {
		response.BusinessError(ctx, err.Error())
		return
	}

	response.Success(ctx, nil)
}

func (h *UserHandler) UpdatePassword(ctx *gin.Context) {
	var idReq dto.UserFindByIDReq

	if err := ctx.ShouldBindUri(&idReq); err != nil {
		response.ParamError(ctx, err.Error())
		return
	}

	var req dto.UserUpdatePasswordReq

	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.ParamError(ctx, err.Error())
		return
	}

	err := h.svc.UpdatePasswordByID(ctx, idReq.ID, req.Password)
	if err != nil {
		response.BusinessError(ctx, err.Error())
		return
	}

	response.Success(ctx, nil)
}
