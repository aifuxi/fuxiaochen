package repository

import (
	"context"
	"errors"
	"time"

	"github.com/aifuxi/fgo/internal/model"
	"gorm.io/gorm"
)

type UserListOption struct {
	Page     int
	PageSize int
	Nickname string
	Email    string
}

type UserRepository interface {
	Create(ctx context.Context, user model.User) error
	Update(ctx context.Context, user model.User) error
	List(ctx context.Context, option UserListOption) ([]model.User, int64, error)
	FindByID(ctx context.Context, id int64) (*model.User, error)
	FindByEmail(ctx context.Context, email string) (*model.User, error)
	DeleteByID(ctx context.Context, id int64) error
	BanByID(ctx context.Context, id int64, ban bool) error
	UpdatePasswordByID(ctx context.Context, id int64, password string) error
}

type userRepo struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepo{db: db}
}

func (r *userRepo) Create(ctx context.Context, user model.User) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&user).Error; err != nil {
			return err
		}

		if err := tx.Model(&user).Association("Roles").Replace(user.Roles); err != nil {
			return err
		}

		return nil
	})
}

func (r *userRepo) Update(ctx context.Context, user model.User) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Updates(&model.User{
			CommonModel: model.CommonModel{ID: user.ID},
			Nickname:    user.Nickname,
			Email:       user.Email,
		}).Error; err != nil {
			return err
		}

		if err := tx.Model(&user).Association("Roles").Replace(user.Roles); err != nil {
			return err
		}

		return nil
	})
}

func (r *userRepo) List(ctx context.Context, option UserListOption) ([]model.User, int64, error) {
	var users []model.User
	var total int64

	query := r.db.WithContext(ctx).Model(&model.User{})

	if option.Nickname != "" {
		query = query.Where("nickname LIKE ?", "%"+option.Nickname+"%")
	}

	if option.Email != "" {
		query = query.Where("email LIKE ?", "%"+option.Email+"%")
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := query.Preload("Roles").Preload("Roles.Permissions").
		Offset((option.Page - 1) * option.PageSize).
		Limit(option.PageSize).
		Find(&users).Error
	if err != nil {
		return nil, 0, err
	}

	return users, total, nil
}

func (r *userRepo) FindByID(ctx context.Context, id int64) (*model.User, error) {
	var user model.User
	if err := r.db.WithContext(ctx).Preload("Roles").Preload("Roles.Permissions").First(&user, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func (r *userRepo) FindByEmail(ctx context.Context, email string) (*model.User, error) {
	var user model.User
	if err := r.db.WithContext(ctx).Preload("Roles").Preload("Roles.Permissions").Where("email = ?", email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func (r *userRepo) DeleteByID(ctx context.Context, id int64) error {
	return r.db.WithContext(ctx).Delete(&model.User{}, id).Error
}

func (r *userRepo) BanByID(ctx context.Context, id int64, ban bool) error {

	if ban {
		return r.db.WithContext(ctx).Model(&model.User{}).Where("id = ?", id).Updates(map[string]any{"banned": ban, "banned_at": time.Now()}).Error
	}

	return r.db.WithContext(ctx).Model(&model.User{}).Where("id = ?", id).Updates(map[string]any{"banned": false, "banned_at": nil}).Error
}

func (r *userRepo) UpdatePasswordByID(ctx context.Context, id int64, password string) error {
	return r.db.WithContext(ctx).Model(&model.User{}).Where("id = ?", id).Updates(map[string]any{"password": password}).Error
}
