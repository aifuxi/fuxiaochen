package repository

import (
	"context"
	"errors"

	"github.com/aifuxi/fgo/internal/model"
	"gorm.io/gorm"
)

type TokenRepository interface {
	Create(ctx context.Context, token model.Token) error
	FindByToken(ctx context.Context, token string) (*model.Token, error)
	DeleteByToken(ctx context.Context, token string) error
	DeleteByUserID(ctx context.Context, userID int64) error
}

type tokenRepository struct {
	db *gorm.DB
}

func NewTokenRepository(db *gorm.DB) TokenRepository {
	return &tokenRepository{db: db}
}

func (r *tokenRepository) Create(ctx context.Context, token model.Token) error {
	return r.db.WithContext(ctx).Create(&token).Error
}

func (r *tokenRepository) FindByToken(ctx context.Context, tk string) (*model.Token, error) {
	var t model.Token
	if err := r.db.WithContext(ctx).Where("token = ?", tk).First(&t).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &t, nil
}

func (r *tokenRepository) DeleteByToken(ctx context.Context, tk string) error {
	return r.db.WithContext(ctx).Where("token = ?", tk).Delete(&model.Token{}).Error
}

func (r *tokenRepository) DeleteByUserID(ctx context.Context, userID int64) error {
	return r.db.WithContext(ctx).Where("user_id = ?", userID).Delete(&model.Token{}).Error
}
