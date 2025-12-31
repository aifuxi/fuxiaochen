package repository

import (
	"context"
	"errors"

	"github.com/aifuxi/fgo/internal/model"
	"gorm.io/gorm"
)

type TagListOption struct {
	Page     int
	PageSize int
	Name     string
	Slug     string
	SortBy   string
	Order    string
	WithBlog bool
}

type TagRepository interface {
	Create(ctx context.Context, tag model.Tag) (*model.Tag, error)
	FindBySlug(ctx context.Context, slug string, withBlog bool) (*model.Tag, error)
	FindByName(ctx context.Context, name string) (*model.Tag, error)
	FindByID(ctx context.Context, id int64, withBlog bool) (*model.Tag, error)
	List(ctx context.Context, option TagListOption) ([]model.Tag, int64, error)
	DeleteByID(ctx context.Context, id int64) error
	UpdateByID(ctx context.Context, id int64, tag model.Tag) (*model.Tag, error)
}

type tagRepository struct {
	db *gorm.DB
}

func NewTagRepository(db *gorm.DB) TagRepository {
	return &tagRepository{db: db}
}

func (r *tagRepository) Create(ctx context.Context, tag model.Tag) (*model.Tag, error) {
	err := r.db.WithContext(ctx).Create(&tag).Error
	if err != nil {
		return nil, err
	}
	return &tag, nil
}

func (r *tagRepository) FindBySlug(ctx context.Context, slug string, withBlog bool) (*model.Tag, error) {
	query := r.db.WithContext(ctx).Model(&model.Tag{})

	if withBlog {
		query = query.Preload("Blogs")
	}

	var tag model.Tag
	err := query.Where("slug = ?", slug).First(&tag).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return &tag, nil
		}
		return nil, err
	}
	return &tag, nil
}

func (r *tagRepository) FindByName(ctx context.Context, name string) (*model.Tag, error) {
	var tag model.Tag
	err := r.db.WithContext(ctx).Where("name = ?", name).First(&tag).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return &tag, nil
		}
		return nil, err
	}
	return &tag, nil
}

func (r *tagRepository) FindByID(ctx context.Context, id int64, withBlog bool) (*model.Tag, error) {
	query := r.db.WithContext(ctx).Model(&model.Tag{})

	if withBlog {
		query = query.Preload("Blogs")
	}

	var tag model.Tag
	err := query.Where("id = ?", id).First(&tag).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return &tag, nil
		}
		return nil, err
	}
	return &tag, nil
}

func (r *tagRepository) List(ctx context.Context, option TagListOption) ([]model.Tag, int64, error) {
	var tags []model.Tag
	var total int64

	query := r.db.WithContext(ctx).Model(&model.Tag{})

	if option.WithBlog {
		query = query.Preload("Blogs")
	}

	if option.Name != "" {
		query = query.Where("name LIKE ?", "%"+option.Name+"%")
	}

	if option.Slug != "" {
		query = query.Where("slug LIKE ?", "%"+option.Slug+"%")
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
		Find(&tags).Error
	if err != nil {
		return nil, 0, err
	}

	return tags, total, nil
}

func (r *tagRepository) DeleteByID(ctx context.Context, id int64) error {
	return r.db.WithContext(ctx).Delete(&model.Tag{}, id).Error
}

func (r *tagRepository) UpdateByID(ctx context.Context, id int64, tag model.Tag) (*model.Tag, error) {
	err := r.db.WithContext(ctx).Where("id = ?", id).Updates(tag).Error
	if err != nil {
		return nil, err
	}
	return &tag, nil
}
