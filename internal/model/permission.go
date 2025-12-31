package model

type Permission struct {
	CommonModel
	Name        string  `gorm:"size:100;uniqueIndex;not null" json:"name"`
	Code        string  `gorm:"size:100;uniqueIndex;not null" json:"code"`
	Description string  `gorm:"size:255" json:"description"`
	Roles       []*Role `gorm:"many2many:role_permissions;" json:"roles,omitempty"`
}

const (
	PermissionAdminAll = "admin:all"

	PermissionUserList   = "user:list"
	PermissionUserView   = "user:view"
	PermissionUserCreate = "user:create"
	PermissionUserUpdate = "user:update"
	PermissionUserDelete = "user:delete"

	PermissionRoleList   = "role:list"
	PermissionRoleView   = "role:view"
	PermissionRoleCreate = "role:create"
	PermissionRoleUpdate = "role:update"
	PermissionRoleDelete = "role:delete"

	PermissionTagList   = "tag:list"
	PermissionTagView   = "tag:view"
	PermissionTagCreate = "tag:create"
	PermissionTagUpdate = "tag:update"
	PermissionTagDelete = "tag:delete"

	PermissionBlogList   = "blog:list"
	PermissionBlogView   = "blog:view"
	PermissionBlogCreate = "blog:create"
	PermissionBlogUpdate = "blog:update"
	PermissionBlogDelete = "blog:delete"

	PermissionCategoryList   = "category:list"
	PermissionCategoryView   = "category:view"
	PermissionCategoryCreate = "category:create"
	PermissionCategoryUpdate = "category:update"
	PermissionCategoryDelete = "category:delete"
)
