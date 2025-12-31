package model

type Role struct {
	CommonModel
	Name        string        `gorm:"size:50;uniqueIndex;not null;comment:角色名称" json:"name"`
	Code        string        `gorm:"size:50;uniqueIndex;not null;comment:角色标识" json:"code"`
	Description string        `gorm:"size:255;comment:角色描述" json:"description"`
	Users       []*User       `gorm:"many2many:user_roles;" json:"users,omitempty"`
	Permissions []*Permission `gorm:"many2many:role_permissions;" json:"permissions,omitempty"`
}

const (
	RoleCodeAdmin   = "admin"
	RoleCodeVisitor = "visitor"
)
