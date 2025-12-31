package service

import (
	"github.com/aifuxi/fgo/internal/model"
	"github.com/aifuxi/fgo/internal/model/dto"
)

func convertToUserResp(u model.User) dto.UserResp {
	return dto.UserResp{
		CommonModel: u.CommonModel,
		Nickname:    u.Nickname,
		Email:       u.Email,
		Roles:       u.Roles,
		Banned:      u.Banned,
		BannedAt:    u.BannedAt,
	}
}

func convertToUserRespList(users []model.User) []dto.UserResp {
	var userRespList []dto.UserResp
	for _, user := range users {
		userRespList = append(userRespList, convertToUserResp(user))
	}
	return userRespList
}
