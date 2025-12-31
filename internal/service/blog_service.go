package service

import (
	"context"
	"errors"

	"github.com/aifuxi/fgo/internal/model"
	"github.com/aifuxi/fgo/internal/model/dto"
	"github.com/aifuxi/fgo/internal/repository"
)

type BlogService interface {
	Create(ctx context.Context, req dto.BlogCreateReq) error
	List(ctx context.Context, req dto.BlogListReq) ([]model.Blog, int64, error)
	FindByID(ctx context.Context, id int64) (*model.Blog, error)
	FindBySlug(ctx context.Context, slug string) (*model.Blog, error)
	UpdateByID(ctx context.Context, id int64, req *dto.BlogUpdateReq) error
	DeleteByID(ctx context.Context, id int64) error
}

type blogService struct {
	repo repository.BlogRepository
}

var (
	ErrBlogNotFound    = errors.New("blog not found")
	ErrBlogTitleExists = errors.New("blog title already exists")
	ErrBlogSlugExists  = errors.New("blog slug already exists")
)

func NewBlogService(repo repository.BlogRepository) BlogService {
	return &blogService{repo: repo}
}

func (s *blogService) Create(ctx context.Context, req dto.BlogCreateReq) error {
	// Check if slug exists
	existingBlog, err := s.repo.FindBySlug(ctx, req.Slug)
	if err != nil {
		return err
	}
	if existingBlog != nil {
		return ErrBlogSlugExists
	}

	// Check if title exists
	existingBlog, err = s.repo.FindByTitle(ctx, req.Title)
	if err != nil {
		return err
	}
	if existingBlog != nil {
		return ErrBlogTitleExists
	}

	// Prepare tags
	var tags []*model.Tag
	if len(req.TagIDs) > 0 {
		for _, tagID := range req.TagIDs {
			tags = append(tags, &model.Tag{
				CommonModel: model.CommonModel{ID: tagID},
			})
		}
	}

	blog := model.Blog{
		Title:       req.Title,
		Slug:        req.Slug,
		Description: req.Description,
		Cover:       req.Cover,
		Content:     req.Content,
		CategoryID:  req.CategoryID,
		Tags:        tags,
		Published:   req.Published,
	}

	return s.repo.Create(ctx, blog)
}

func (s *blogService) List(ctx context.Context, req dto.BlogListReq) ([]model.Blog, int64, error) {
	var published *bool
	switch req.PublishedStatus {
	case "published":
		published = new(bool)
		*published = true
	case "unpublished":
		published = new(bool)
		*published = false
	}

	return s.repo.List(ctx, repository.BlogListOption{
		Page:       req.Page,
		PageSize:   req.PageSize,
		Title:      req.Title,
		Slug:       req.Slug,
		Published:  published,
		SortBy:     req.SortBy,
		Order:      req.Order,
		CategoryID: req.CategoryID,
		TagIDs:     req.TagIDs,
	})
}

func (s *blogService) FindByID(ctx context.Context, id int64) (*model.Blog, error) {
	blog, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if blog == nil {
		return nil, ErrBlogNotFound
	}
	return blog, nil
}

func (s *blogService) FindBySlug(ctx context.Context, slug string) (*model.Blog, error) {
	blog, err := s.repo.FindBySlug(ctx, slug)
	if err != nil {
		return nil, err
	}
	if blog == nil {
		return nil, ErrBlogNotFound
	}
	return blog, nil
}

func (s *blogService) DeleteByID(ctx context.Context, id int64) error {
	// Check if blog exists
	blog, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return err
	}
	if blog == nil {
		return ErrBlogNotFound
	}

	return s.repo.DeleteByID(ctx, id)
}

func (s *blogService) UpdateByID(ctx context.Context, id int64, req *dto.BlogUpdateReq) error {
	// Check if blog exists
	blog, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return err
	}
	if blog == nil {
		return ErrBlogNotFound
	}

	// Check if slug exists (if changed)
	if req.Slug != blog.Slug {
		existingBlog, err := s.repo.FindBySlug(ctx, req.Slug)
		if err != nil {
			return err
		}
		if existingBlog != nil {
			return ErrBlogSlugExists
		}
	}

	// Check if title exists (if changed)
	if req.Title != blog.Title {
		existingBlog, err := s.repo.FindByTitle(ctx, req.Title)
		if err != nil {
			return err
		}
		if existingBlog != nil {
			return ErrBlogTitleExists
		}
	}

	// Prepare tags
	var tags []*model.Tag
	if len(req.TagIDs) > 0 {
		for _, tagID := range req.TagIDs {
			tags = append(tags, &model.Tag{
				CommonModel: model.CommonModel{ID: tagID},
			})
		}
	}

	blog.Title = req.Title
	blog.Slug = req.Slug
	blog.Description = req.Description
	blog.Cover = req.Cover
	blog.Content = req.Content
	blog.CategoryID = req.CategoryID
	blog.Tags = tags

	return s.repo.Update(ctx, *blog)
}
