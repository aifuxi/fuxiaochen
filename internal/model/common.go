package model

import (
	"time"

	"github.com/aifuxi/fgo/pkg/snowflake"
	"gorm.io/gorm"
)

type CommonModel struct {
	ID        int64          `gorm:"primarykey" json:"id,string"`
	CreatedAt time.Time      `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt time.Time      `gorm:"autoUpdateTime" json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (m *CommonModel) BeforeCreate(tx *gorm.DB) error {
	if m.ID == 0 {
		m.ID = snowflake.GenerateID()
	}
	return nil
}
