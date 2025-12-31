package repository

import (
	"context"
	"errors"

	"github.com/aifuxi/fgo/internal/model"
	"github.com/aifuxi/fgo/pkg/logger"
	"gorm.io/gorm"
)

type CategoryListOption struct {
	Page     int
	PageSize int
	Name     string
	Slug     string
	SortBy   string
	Order    string
	WithBlog bool
}

type CategoryRepository interface {
	Create(ctx context.Context, category model.Category) error
	Update(ctx context.Context, category model.Category) error
	List(ctx context.Context, option CategoryListOption) ([]model.Category, int64, error)
	FindByID(ctx context.Context, id int64, withBlog bool) (*model.Category, error)
	FindBySlug(ctx context.Context, slug string, withBlog bool) (*model.Category, error)
	FindByName(ctx context.Context, name string) (*model.Category, error)
	DeleteByID(ctx context.Context, id int64) error
}

type categoryRepo struct {
	db *gorm.DB
}

func NewCategoryRepository(db *gorm.DB) CategoryRepository {
	return &categoryRepo{db: db}
}

func (r *categoryRepo) Create(ctx context.Context, category model.Category) error {
	return r.db.WithContext(ctx).Create(&category).Error
}

func (r *categoryRepo) Update(ctx context.Context, category model.Category) error {
	return r.db.WithContext(ctx).Model(&category).Updates(&category).Error
}

func (r *categoryRepo) List(ctx context.Context, option CategoryListOption) ([]model.Category, int64, error) {
	var categories []model.Category
	var total int64

	query := r.db.WithContext(ctx).Model(&model.Category{})

	logger.GetLoggerWithSkip(1).Infof("CategoryRepository.List: %v", option)

	if option.WithBlog {
		query = query.Preload("Blogs")
	}

	if option.Name != "" {
		query = query.Where("name like ?", "%"+option.Name+"%")
	}

	if option.Slug != "" {
		query = query.Where("slug LIKE ?", "%"+option.Slug+"%")
	}

	if err := query.Count(&total).Error; err != nil {
		logger.GetLoggerWithSkip(1).Errorf("CategoryRepository.Count: %v", err)
		return nil, 0, err
	}

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
		Find(&categories).Error
	if err != nil {
		return nil, 0, err
	}

	return categories, total, nil
}

func (r *categoryRepo) FindByID(ctx context.Context, id int64, withBlog bool) (*model.Category, error) {

	query := r.db.WithContext(ctx).Model(&model.Category{})
	if withBlog {
		query = query.Preload("Blogs")
	}

	var category model.Category
	if err := query.First(&category, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &category, nil
}

func (r *categoryRepo) FindBySlug(ctx context.Context, slug string, withBlog bool) (*model.Category, error) {
	query := r.db.WithContext(ctx).Model(&model.Category{})
	if withBlog {
		query = query.Preload("Blogs")
	}
	var category model.Category
	if err := query.Where("slug = ?", slug).First(&category).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &category, nil
}

func (r *categoryRepo) FindByName(ctx context.Context, name string) (*model.Category, error) {
	var category model.Category
	if err := r.db.WithContext(ctx).Where("name = ?", name).First(&category).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &category, nil
}

func (r *categoryRepo) DeleteByID(ctx context.Context, id int64) error {
	return r.db.WithContext(ctx).Delete(&model.Category{}, id).Error
}
