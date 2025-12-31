package service

import (
	"context"
	"errors"

	"github.com/aifuxi/fgo/internal/model"
	"github.com/aifuxi/fgo/internal/model/dto"
	"github.com/aifuxi/fgo/internal/repository"
)

type CategoryService interface {
	Create(ctx context.Context, req dto.CategoryCreateReq) error
	List(ctx context.Context, req dto.CategoryListReq, withBlog bool) ([]model.Category, int64, error)
	FindByID(ctx context.Context, id int64, withBlog bool) (*model.Category, error)
	FindBySlug(ctx context.Context, slug string, withBlog bool) (*model.Category, error)
	UpdateByID(ctx context.Context, id int64, req *dto.CategoryUpdateReq) error
	DeleteByID(ctx context.Context, id int64) error
}

type categoryService struct {
	repo repository.CategoryRepository
}

var (
	ErrCategoryNotFound   = errors.New("category not found")
	ErrCategoryNameExists = errors.New("category name already exists")
	ErrCategorySlugExists = errors.New("category slug already exists")
)

func NewCategoryService(repo repository.CategoryRepository) CategoryService {
	return &categoryService{repo: repo}
}

func (s *categoryService) Create(ctx context.Context, req dto.CategoryCreateReq) error {
	// Check if slug exists
	existingCategory, err := s.repo.FindBySlug(ctx, req.Slug, false)
	if err != nil {
		return err
	}
	if existingCategory != nil {
		return ErrCategorySlugExists
	}

	// Check if name exists
	existingCategory, err = s.repo.FindByName(ctx, req.Name)
	if err != nil {
		return err
	}
	if existingCategory != nil {
		return ErrCategoryNameExists
	}

	category := model.Category{
		Name:        req.Name,
		Slug:        req.Slug,
		Description: req.Description,
	}

	return s.repo.Create(ctx, category)
}

func (s *categoryService) List(ctx context.Context, req dto.CategoryListReq, withBlog bool) ([]model.Category, int64, error) {
	return s.repo.List(ctx, repository.CategoryListOption{
		Page:     req.Page,
		PageSize: req.PageSize,
		Name:     req.Name,
		Slug:     req.Slug,
		SortBy:   req.SortBy,
		Order:    req.Order,
		WithBlog: withBlog,
	})
}

func (s *categoryService) FindByID(ctx context.Context, id int64, withBlog bool) (*model.Category, error) {
	category, err := s.repo.FindByID(ctx, id, withBlog)
	if err != nil {
		return nil, err
	}
	if category == nil {
		return nil, ErrCategoryNotFound
	}
	return category, nil
}

func (s *categoryService) FindBySlug(ctx context.Context, slug string, withBlog bool) (*model.Category, error) {
	category, err := s.repo.FindBySlug(ctx, slug, withBlog)
	if err != nil {
		return nil, err
	}
	if category == nil {
		return nil, ErrCategoryNotFound
	}
	return category, nil
}

func (s *categoryService) DeleteByID(ctx context.Context, id int64) error {
	// Check if category exists
	category, err := s.repo.FindByID(ctx, id, false)
	if err != nil {
		return err
	}
	if category == nil {
		return ErrCategoryNotFound
	}

	return s.repo.DeleteByID(ctx, id)
}

func (s *categoryService) UpdateByID(ctx context.Context, id int64, req *dto.CategoryUpdateReq) error {
	// Check if category exists
	category, err := s.repo.FindByID(ctx, id, false)
	if err != nil {
		return err
	}
	if category == nil {
		return ErrCategoryNotFound
	}

	// Check if slug exists (if changed)
	if req.Slug != category.Slug {
		existingCategory, err := s.repo.FindBySlug(ctx, req.Slug, false)
		if err != nil {
			return err
		}
		if existingCategory != nil {
			return ErrCategorySlugExists
		}
	}

	// Check if name exists (if changed)
	if req.Name != category.Name {
		existingCategory, err := s.repo.FindByName(ctx, req.Name)
		if err != nil {
			return err
		}
		if existingCategory != nil {
			return ErrCategoryNameExists
		}
	}

	category.Name = req.Name
	category.Slug = req.Slug
	category.Description = req.Description

	return s.repo.Update(ctx, *category)
}
