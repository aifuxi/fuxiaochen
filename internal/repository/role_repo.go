package repository

import (
	"context"
	"errors"

	"github.com/aifuxi/fgo/internal/model"
	"gorm.io/gorm"
)

type RoleListOption struct {
	Page     int
	PageSize int
	Code     string
	Name     string
	WithUser bool
}

type RoleRepository interface {
	Create(ctx context.Context, role model.Role) error
	Update(ctx context.Context, role model.Role) error
	Delete(ctx context.Context, id int64) error
	FindByID(ctx context.Context, id int64, withUser bool) (*model.Role, error)
	FindByName(ctx context.Context, name string) (*model.Role, error)
	FindByCode(ctx context.Context, code string) (*model.Role, error)
	List(ctx context.Context, opt RoleListOption) ([]model.Role, int64, error)
}

type roleRepository struct {
	db *gorm.DB
}

func NewRoleRepository(db *gorm.DB) RoleRepository {
	return &roleRepository{db: db}
}

func (r *roleRepository) Create(ctx context.Context, role model.Role) error {
	return r.db.WithContext(ctx).Create(role).Error
}

func (r roleRepository) Update(ctx context.Context, role model.Role) error {
	return r.db.WithContext(ctx).Save(role).Error
}

func (r *roleRepository) Delete(ctx context.Context, id int64) error {
	return r.db.WithContext(ctx).Delete(&model.Role{}, id).Error
}

func (r *roleRepository) FindByID(ctx context.Context, id int64, withUser bool) (*model.Role, error) {

	query := r.db.WithContext(ctx).Model(&model.Role{})
	if withUser {
		query = query.Preload("Users")
	}

	var role model.Role

	if err := query.First(&role, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &role, nil
}

func (r *roleRepository) FindByName(ctx context.Context, name string) (*model.Role, error) {
	var role model.Role
	if err := r.db.WithContext(ctx).Where("name = ?", name).First(&role).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &role, nil
}

func (r *roleRepository) FindByCode(ctx context.Context, code string) (*model.Role, error) {
	var role model.Role
	if err := r.db.WithContext(ctx).Where("code = ?", code).First(&role).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &role, nil
}

func (r *roleRepository) List(ctx context.Context, opt RoleListOption) ([]model.Role, int64, error) {
	var roles []model.Role
	var total int64

	query := r.db.WithContext(ctx).Model(&model.Role{})

	if opt.Name != "" {
		query = query.Where("name LIKE ?", "%"+opt.Name+"%")
	}

	if opt.Code != "" {
		query = query.Where("code LIKE ?", "%"+opt.Code+"%")
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := query.Offset((opt.Page - 1) * opt.PageSize).
		Limit(opt.PageSize).
		Find(&roles).Error; err != nil {
		return nil, 0, err
	}

	return roles, total, nil
}
