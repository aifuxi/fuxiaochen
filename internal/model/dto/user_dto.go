package dto

import (
	"time"

	"github.com/aifuxi/fuxiaochen-api/internal/model"
)

type UserRegisterReq struct {
	Nickname string `json:"nickname" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6,max=20"`
}

type UserLoginReq struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6,max=20"`
}

type UserUpdateReq struct {
	Nickname string `json:"nickname" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Role     string `json:"role"`
}

type UserListReq struct {
	ListReq
	Nickname string `json:"nickname" form:"nickname"`
	Email    string `json:"email" form:"email"`
}

type UserResp struct {
	model.CommonModel
	Nickname string     `json:"nickname"`
	Email    string     `json:"email"`
	Role     string     `json:"role"`
	Banned   bool       `gorm:"default:false;comment:是否禁用" json:"banned"`
	BannedAt *time.Time `gorm:"comment:禁用时间" json:"bannedAt,omitempty"`
}

type UserListResp struct {
	Total int64      `json:"total"`
	Lists []UserResp `json:"lists"`
}

type UserFindByIDReq struct {
	ID int64 `uri:"id" binding:"required"`
}

type UserCreateReq struct {
	Nickname string `json:"nickname" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Role     string `json:"role" binding:"required"`
}

type UserBanReq struct {
	Ban bool `json:"ban"`
}

type UserUpdatePasswordReq struct {
	Password string `json:"password" binding:"required,min=6,max=20"`
}
