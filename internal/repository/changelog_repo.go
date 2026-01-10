package repository

import (
	"context"
	"errors"

	"github.com/aifuxi/fuxiaochen-api/internal/model"
	"gorm.io/gorm"
)

type ChangelogListOption struct {
	Version  string
	Page     int
	PageSize int
	SortBy   string
	Order    string
}

type ChangelogRepository interface {
	Create(ctx context.Context, changelog model.Changelog) (*model.Changelog, error)
	FindByID(ctx context.Context, id int64) (*model.Changelog, error)
	List(ctx context.Context, option ChangelogListOption) ([]model.Changelog, int64, error)
	DeleteByID(ctx context.Context, id int64) error
	UpdateByID(ctx context.Context, id int64, changelog model.Changelog) (*model.Changelog, error)
}

type changelogRepository struct {
	db *gorm.DB
}

func NewChangelogRepository(db *gorm.DB) ChangelogRepository {
	return &changelogRepository{db: db}
}

func (r *changelogRepository) Create(ctx context.Context, changelog model.Changelog) (*model.Changelog, error) {
	err := r.db.WithContext(ctx).Create(&changelog).Error
	if err != nil {
		return nil, err
	}
	return &changelog, nil
}

func (r *changelogRepository) FindByID(ctx context.Context, id int64) (*model.Changelog, error) {
	var changelog model.Changelog
	err := r.db.WithContext(ctx).Where("id = ?", id).First(&changelog).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return &changelog, nil
		}
		return nil, err
	}
	return &changelog, nil
}

func (r *changelogRepository) List(ctx context.Context, option ChangelogListOption) ([]model.Changelog, int64, error) {
	var changelogs []model.Changelog
	var total int64

	query := r.db.WithContext(ctx).Model(&model.Changelog{})
	if option.Version != "" {
		query = query.Where("version LIKE ?", "%"+option.Version+"%")
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if option.SortBy != "" && option.Order != "" {
		query = query.Order(option.SortBy + " " + option.Order)
	} else {
		query = query.Order("created_at desc")
	}

	offset := (option.Page - 1) * option.PageSize
	if err := query.Offset(offset).Limit(option.PageSize).Find(&changelogs).Error; err != nil {
		return nil, 0, err
	}

	return changelogs, total, nil
}

func (r *changelogRepository) DeleteByID(ctx context.Context, id int64) error {
	return r.db.WithContext(ctx).Delete(&model.Changelog{}, id).Error
}

func (r *changelogRepository) UpdateByID(ctx context.Context, id int64, changelog model.Changelog) (*model.Changelog, error) {
	err := r.db.WithContext(ctx).Model(&model.Changelog{CommonModel: model.CommonModel{ID: id}}).Updates(&changelog).Error
	if err != nil {
		return nil, err
	}
	return r.FindByID(ctx, id)
}
