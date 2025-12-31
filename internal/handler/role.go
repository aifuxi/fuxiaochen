package handler

import (
	"errors"

	"github.com/aifuxi/fgo/internal/model/dto"
	"github.com/aifuxi/fgo/internal/service"
	"github.com/aifuxi/fgo/pkg/response"
	"github.com/gin-gonic/gin"
)

type RoleHandler struct {
	svc service.RoleService
}

func NewRoleHandler(svc service.RoleService) *RoleHandler {
	return &RoleHandler{svc: svc}
}

func (h *RoleHandler) Create(c *gin.Context) {
	var req dto.RoleCreateReq
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ParamError(c, err.Error())
		return
	}

	if err := h.svc.Create(c, req); err != nil {
		if errors.Is(err, service.ErrRoleNameExists) || errors.Is(err, service.ErrRoleCodeExists) {
			response.BusinessError(c, err.Error())
			return
		}
		response.BusinessError(c, "Failed to create role")
		return
	}

	response.Success(c, nil)
}

func (h *RoleHandler) Update(c *gin.Context) {
	var idReq dto.RoleFindByIDReq
	if err := c.ShouldBindUri(&idReq); err != nil {
		response.ParamError(c, err.Error())
		return
	}

	var req dto.RoleUpdateReq
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ParamError(c, err.Error())
		return
	}

	if err := h.svc.Update(c, idReq.ID, req); err != nil {
		if errors.Is(err, service.ErrRoleNotFound) {
			response.BusinessError(c, err.Error())
			return
		}
		if errors.Is(err, service.ErrRoleNameExists) || errors.Is(err, service.ErrRoleCodeExists) {
			response.BusinessError(c, err.Error())
			return
		}
		response.BusinessError(c, "Failed to update role")
		return
	}

	response.Success(c, nil)
}

func (h *RoleHandler) Delete(c *gin.Context) {
	var idReq dto.RoleFindByIDReq
	if err := c.ShouldBindUri(&idReq); err != nil {
		response.ParamError(c, err.Error())
		return
	}

	if err := h.svc.Delete(c, idReq.ID); err != nil {
		if errors.Is(err, service.ErrRoleNotFound) {
			response.BusinessError(c, err.Error())
			return
		}
		response.BusinessError(c, "Failed to delete role")
		return
	}

	response.Success(c, nil)
}

func (h *RoleHandler) FindByID(c *gin.Context) {
	var idReq dto.RoleFindByIDReq
	if err := c.ShouldBindUri(&idReq); err != nil {
		response.ParamError(c, err.Error())
		return
	}

	role, err := h.svc.FindByID(c, idReq.ID)
	if err != nil {
		if errors.Is(err, service.ErrRoleNotFound) {
			response.BusinessError(c, err.Error())
			return
		}
		response.BusinessError(c, "Failed to get role")
		return
	}

	response.Success(c, role)
}

func (h *RoleHandler) List(c *gin.Context) {
	var req dto.RoleListReq
	if err := c.ShouldBindQuery(&req); err != nil {
		response.ParamError(c, err.Error())
		return
	}

	resp, err := h.svc.List(c, req)
	if err != nil {
		response.BusinessError(c, "Failed to list roles")
		return
	}

	response.Success(c, dto.RoleListResp{
		Total: resp.Total,
		Lists: resp.Lists,
	})
}
