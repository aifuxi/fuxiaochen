package repository

import (
	"context"
	"errors"
	"time"

	"github.com/aifuxi/fgo/internal/model"
	"gorm.io/gorm"
)

type BlogListOption struct {
	Page       int
	PageSize   int
	Title      string
	Slug       string
	SortBy     string
	Order      string
	CategoryID int64
	TagIDs     []int64
	Published  *bool
}

type BlogRepository interface {
	Create(ctx context.Context, blog model.Blog) error
	FindBySlug(ctx context.Context, slug string) (*model.Blog, error)
	FindByID(ctx context.Context, id int64) (*model.Blog, error)
	FindByTitle(ctx context.Context, title string) (*model.Blog, error)
	List(ctx context.Context, option BlogListOption) ([]model.Blog, int64, error)
	DeleteByID(ctx context.Context, id int64) error
	Update(ctx context.Context, blog model.Blog) error
}

type blogRepo struct {
	db *gorm.DB
}

func NewBlogRepository(db *gorm.DB) BlogRepository {
	return &blogRepo{db: db}
}

func (r *blogRepo) Create(ctx context.Context, blog model.Blog) error {
	if blog.Published {
		now := time.Now()
		blog.PublishedAt = &now
	} else {
		blog.PublishedAt = nil
	}

	if err := r.db.WithContext(ctx).Create(&blog).Error; err != nil {
		return err
	}
	// 重新加载关联数据，包括 Category 和 Tags
	return r.db.WithContext(ctx).Preload("Category").Preload("Tags").First(&blog, blog.ID).Error
}

func (r *blogRepo) Update(ctx context.Context, blog model.Blog) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if blog.Published {
			now := time.Now()
			blog.PublishedAt = &now
		} else {
			blog.PublishedAt = nil
		}

		// 更新基本字段
		if err := tx.Model(&model.Blog{}).Updates(&blog).Error; err != nil {
			return err
		}

		// 更新标签关联
		if err := tx.Model(&model.Blog{}).Association("Tags").Replace(blog.Tags); err != nil {
			return err
		}

		// 重新加载关联数据
		return tx.Preload("Category").Preload("Tags").First(&blog, blog.ID).Error
	})
}

func (r *blogRepo) List(ctx context.Context, option BlogListOption) ([]model.Blog, int64, error) {
	var blogs []model.Blog
	var total int64

	query := r.db.WithContext(ctx).Model(&model.Blog{}).Preload("Category").Preload("Tags")

	if option.CategoryID != 0 {
		query = query.Where("category_id = ?", option.CategoryID)
	}

	if len(option.TagIDs) > 0 {
		query = query.Where("blog_tags.tag_id IN ?", option.TagIDs)
	}

	if option.Title != "" {
		query = query.Where("title LIKE ?", "%"+option.Title+"%")
	}

	if option.Slug != "" {
		query = query.Where("slug LIKE ?", "%"+option.Slug+"%")
	}

	if option.Published != nil {
		query = query.Where("published = ?", *option.Published)
	}

	// Count total records with filters but without pagination
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Default sort if not provided
	sortBy := "created_at"

	switch option.SortBy {
	case "createdAt":
		sortBy = "created_at"
	case "updatedAt":
		sortBy = "updated_at"
	}

	order := "desc"
	if option.Order != "" {
		order = option.Order
	}

	err := query.Order(sortBy + " " + order).
		Offset((option.Page - 1) * option.PageSize).
		Limit(option.PageSize).
		Find(&blogs).Error
	if err != nil {
		return nil, 0, err
	}

	return blogs, total, nil
}

func (r *blogRepo) FindByID(ctx context.Context, id int64) (*model.Blog, error) {
	var blog model.Blog
	if err := r.db.WithContext(ctx).Preload("Category").Preload("Tags").First(&blog, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &blog, nil
}

func (r *blogRepo) FindBySlug(ctx context.Context, slug string) (*model.Blog, error) {
	var blog model.Blog
	if err := r.db.WithContext(ctx).Preload("Category").Preload("Tags").Where("slug = ?", slug).First(&blog).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &blog, nil
}

func (r *blogRepo) FindByTitle(ctx context.Context, title string) (*model.Blog, error) {
	var blog model.Blog
	if err := r.db.WithContext(ctx).Preload("Category").Preload("Tags").Where("title = ?", title).First(&blog).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &blog, nil
}

func (r *blogRepo) DeleteByID(ctx context.Context, id int64) error {
	return r.db.WithContext(ctx).Delete(&model.Blog{}, id).Error
}
