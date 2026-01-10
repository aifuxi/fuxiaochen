package model

type Changelog struct {
	CommonModel

	Version string `gorm:"size:50;not null;comment:版本号" json:"version"`
	Content string `gorm:"type:text;not null;comment:更新内容" json:"content"`
	Date    int    `gorm:"comment:手动指定的发布日期" json:"date"`
}
