package service

import (
	"context"
	"errors"

	"github.com/aifuxi/fuxiaochen-api/internal/model"
	"github.com/aifuxi/fuxiaochen-api/internal/model/dto"
	"github.com/aifuxi/fuxiaochen-api/internal/repository"
)

type ChangelogService interface {
	Create(ctx context.Context, req dto.ChangelogCreateReq) (*model.Changelog, error)
	List(ctx context.Context, req dto.ChangelogListReq) ([]model.Changelog, int64, error)
	FindByID(ctx context.Context, id int64) (*model.Changelog, error)
	UpdateByID(ctx context.Context, id int64, req dto.ChangelogUpdateReq) (*model.Changelog, error)
	DeleteByID(ctx context.Context, id int64) error
}

type changelogService struct {
	changelogRepo repository.ChangelogRepository
}

var (
	ErrChangelogNotFound = errors.New("changelog not found")
)

func NewChangelogService(changelogRepo repository.ChangelogRepository) ChangelogService {
	return &changelogService{changelogRepo: changelogRepo}
}

func (s *changelogService) Create(ctx context.Context, req dto.ChangelogCreateReq) (*model.Changelog, error) {
	changelog := model.Changelog{
		Version: req.Version,
		Content: req.Content,
		Date:    req.Date,
	}

	createdChangelog, err := s.changelogRepo.Create(ctx, changelog)
	if err != nil {
		return nil, err
	}

	return createdChangelog, nil
}

func (s *changelogService) List(ctx context.Context, req dto.ChangelogListReq) ([]model.Changelog, int64, error) {
	changelogs, total, err := s.changelogRepo.List(ctx, repository.ChangelogListOption{
		Version:  req.Version,
		Page:     req.Page,
		PageSize: req.PageSize,
		SortBy:   req.SortBy,
		Order:    req.Order,
	})
	if err != nil {
		return nil, 0, err
	}

	return changelogs, total, nil
}

func (s *changelogService) FindByID(ctx context.Context, id int64) (*model.Changelog, error) {
	changelog, err := s.changelogRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if changelog.ID == 0 {
		return nil, ErrChangelogNotFound
	}

	return changelog, nil
}

func (s *changelogService) UpdateByID(ctx context.Context, id int64, req dto.ChangelogUpdateReq) (*model.Changelog, error) {
	_, err := s.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	changelog := model.Changelog{
		Version: req.Version,
		Content: req.Content,
		Date:    req.Date,
	}

	updatedChangelog, err := s.changelogRepo.UpdateByID(ctx, id, changelog)
	if err != nil {
		return nil, err
	}

	return updatedChangelog, nil
}

func (s *changelogService) DeleteByID(ctx context.Context, id int64) error {
	_, err := s.FindByID(ctx, id)
	if err != nil {
		return err
	}

	return s.changelogRepo.DeleteByID(ctx, id)
}
