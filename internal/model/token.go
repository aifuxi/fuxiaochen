package model

type Token struct {
	CommonModel
	Token  string `gorm:"column:token"`
	UserID int64  `gorm:"column:user_id"`
}
