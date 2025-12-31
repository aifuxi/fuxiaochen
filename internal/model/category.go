package model

type Category struct {
	CommonModel

	Name        string `gorm:"size:255;unique;not null;comment:分类名称" json:"name"`
	Slug        string `gorm:"size:255;uniqueIndex;not null;comment:分类 slug" json:"slug"`
	Description string `gorm:"size:255;comment:分类描述" json:"description"`

	Blogs []*Blog `gorm:"foreignKey:CategoryID" json:"blogs,omitempty"`
}
