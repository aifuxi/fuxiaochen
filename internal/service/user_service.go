package service

import (
	"context"
	"errors"

	"github.com/aifuxi/fgo/internal/model"
	"github.com/aifuxi/fgo/internal/model/dto"
	"github.com/aifuxi/fgo/internal/repository"
	"github.com/aifuxi/fgo/pkg/auth"
	"golang.org/x/crypto/bcrypt"
)

type UserService interface {
    Register(ctx context.Context, req dto.UserRegisterReq) error
    Create(ctx context.Context, req dto.UserCreateReq) error
    Login(ctx context.Context, req dto.UserLoginReq) (string, error)
    Logout(ctx context.Context, token string) error
    Update(ctx context.Context, id int64, req dto.UserUpdateReq) error
    Info(ctx context.Context, id int64) (*dto.UserResp, error)
    List(ctx context.Context, req dto.UserListReq) (*dto.UserListResp, error)
    FindByID(ctx context.Context, id int64) (*dto.UserResp, error)
    DeleteByID(ctx context.Context, id int64) error
    BanByID(ctx context.Context, id int64, ban bool) error
    UpdatePasswordByID(ctx context.Context, id int64, password string) error
}

type userService struct {
    repo     repository.UserRepository
    roleRepo repository.RoleRepository
    tokenRepo repository.TokenRepository
}

var (
	ErrUserNotFound           = errors.New("user not found")
	ErrUserEmailExists        = errors.New("user email already exists")
	ErrInvalidEmailOrPassword = errors.New("invalid email or password")
	ErrVisitorRoleNotFound    = errors.New("visitor role not found")
	ErrUserBanned             = errors.New("user banned")
)

func NewUserService(repo repository.UserRepository, roleRepo repository.RoleRepository, tokenRepo repository.TokenRepository) UserService {
    return &userService{repo: repo, roleRepo: roleRepo, tokenRepo: tokenRepo}
}

func (s *userService) Register(ctx context.Context, req dto.UserRegisterReq) error {
	// Check if email exists
	existingUser, err := s.repo.FindByEmail(ctx, req.Email)
	if err != nil {
		return err
	}
	if existingUser != nil {
		return ErrUserEmailExists
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	// Find visitor role
	visitorRole, err := s.roleRepo.FindByCode(ctx, model.RoleCodeVisitor)
	if err != nil {
		return err
	}
	if visitorRole == nil {
		return ErrVisitorRoleNotFound
	}

	user := &model.User{
		Nickname: req.Nickname,
		Email:    req.Email,
		Password: string(hashedPassword),
		Roles: []*model.Role{
			visitorRole,
		},
	}

	return s.repo.Create(ctx, *user)
}

func (s *userService) Create(ctx context.Context, req dto.UserCreateReq) error {
	// Check if email exists
	existingUser, err := s.repo.FindByEmail(ctx, req.Email)
	if err != nil {
		return err
	}
	if existingUser != nil {
		return ErrUserEmailExists
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	var roles []*model.Role
	for _, roleID := range req.RoleIDs {
		role, err := s.roleRepo.FindByID(ctx, roleID, false)
		if err != nil {
			return err
		}
		roles = append(roles, role)
	}

	user := &model.User{
		Nickname: req.Nickname,
		Email:    req.Email,
		Password: string(hashedPassword),
		Roles:    roles,
	}

	return s.repo.Create(ctx, *user)
}

func (s *userService) Login(ctx context.Context, req dto.UserLoginReq) (string, error) {
	user, err := s.repo.FindByEmail(ctx, req.Email)
	if err != nil {
		return "", err
	}

	if user == nil {
		return "", ErrInvalidEmailOrPassword
	}

	// Verify password
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
	if err != nil {
		return "", ErrInvalidEmailOrPassword
	}

	if user.Banned {
		return "", ErrUserBanned
	}

    // Generate token
    token, err := auth.GenerateToken(user.ID)
    if err != nil {
        return "", err
    }

    // Persist token for session control
    if err := s.tokenRepo.Create(ctx, model.Token{Token: token, UserID: user.ID}); err != nil {
        return "", err
    }

    return token, nil
}

func (s *userService) Logout(ctx context.Context, token string) error {
    return s.tokenRepo.DeleteByToken(ctx, token)
}

func (s *userService) Update(ctx context.Context, id int64, req dto.UserUpdateReq) error {
	user, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return err
	}
	if user == nil {
		return ErrUserNotFound
	}

	if req.Email != "" && req.Email != user.Email {
		existingUser, err := s.repo.FindByEmail(ctx, req.Email)
		if err != nil {
			return err
		}
		if existingUser != nil {
			return ErrUserEmailExists
		}
		user.Email = req.Email
	}

	if req.Nickname != "" {
		user.Nickname = req.Nickname
	}

	if len(req.RoleIDs) > 0 {
		var roles []*model.Role
		for _, roleID := range req.RoleIDs {
			roles = append(roles, &model.Role{
				CommonModel: model.CommonModel{ID: roleID},
			})
		}
		user.Roles = roles
	}

	return s.repo.Update(ctx, *user)
}

func (s *userService) Info(ctx context.Context, id int64) (*dto.UserResp, error) {
	user, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, ErrUserNotFound
	}

	userResp := convertToUserResp(*user)

	return &userResp, nil
}

func (s *userService) List(ctx context.Context, req dto.UserListReq) (*dto.UserListResp, error) {
	users, total, err := s.repo.List(ctx, repository.UserListOption{
		Page:     req.Page,
		PageSize: req.PageSize,
		Nickname: req.Nickname,
		Email:    req.Email,
	})
	if err != nil {
		return nil, err
	}
	userRespList := convertToUserRespList(users)

	return &dto.UserListResp{
		Total: total,
		Lists: userRespList,
	}, nil
}

func (s *userService) FindByID(ctx context.Context, id int64) (*dto.UserResp, error) {
	user, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if user == nil {
		return nil, ErrUserNotFound
	}

	return &dto.UserResp{
		CommonModel: user.CommonModel,
		Nickname:    user.Nickname,
		Email:       user.Email,
		Roles:       user.Roles,
	}, nil
}

func (s *userService) DeleteByID(ctx context.Context, id int64) error {
	user, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return err
	}
	if user == nil {
		return ErrUserNotFound
	}
	return s.repo.DeleteByID(ctx, id)
}

func (s *userService) BanByID(ctx context.Context, id int64, ban bool) error {
	user, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return err
	}
	if user == nil {
		return ErrUserNotFound
	}

	return s.repo.BanByID(ctx, id, ban)
}

func (s *userService) UpdatePasswordByID(ctx context.Context, id int64, password string) error {
	user, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return err
	}
	if user == nil {
		return ErrUserNotFound
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	return s.repo.UpdatePasswordByID(ctx, id, string(hashedPassword))
}
