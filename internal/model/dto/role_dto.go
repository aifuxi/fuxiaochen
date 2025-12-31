package dto

import "github.com/aifuxi/fgo/internal/model"

type RoleCreateReq struct {
	Name        string `json:"name" binding:"required,max=50"`
	Code        string `json:"code" binding:"required,max=50"`
	Description string `json:"description" binding:"max=255"`
}

type RoleUpdateReq struct {
	Name        string `json:"name" binding:"omitempty,max=50"`
	Code        string `json:"code" binding:"omitempty,max=50"`
	Description string `json:"description" binding:"max=255"`
}

type RoleListReq struct {
	ListReq
	Name string `json:"name" form:"name"`
	Code string `json:"code" form:"code"`
}

type RoleResp struct {
	model.Role
	UserCount int64 `json:"userCount"`
}

type RoleListResp struct {
	Total int64      `json:"total"`
	Lists []RoleResp `json:"lists"`
}

type RoleFindByIDReq struct {
	ID int64 `uri:"id" binding:"required"`
}
