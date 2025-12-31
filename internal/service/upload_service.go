package service

import (
	"context"
	"strings"
	"time"

	"github.com/aifuxi/fgo/config"
	"github.com/aifuxi/fgo/internal/model/dto"
	"github.com/aifuxi/fgo/pkg/logger"
	"github.com/aifuxi/fgo/pkg/upload"
	"github.com/aliyun/alibabacloud-oss-go-sdk-v2/oss"
)

type UploadService interface {
	UploadPresign(ctx context.Context, req *dto.UploadPresignReq) (*dto.UploadPresignResp, error)
}

type uploadService struct{}

func NewUploadService() UploadService {
	return &uploadService{}
}

func (s *uploadService) UploadPresign(ctx context.Context, req *dto.UploadPresignReq) (*dto.UploadPresignResp, error) {
	filename := config.AppConfig.OSS.UploadDir + "/" + req.Name

	result, err := upload.GetClient().Presign(ctx, &oss.PutObjectRequest{
		Bucket:      oss.Ptr(config.AppConfig.OSS.Bucket),
		Key:         oss.Ptr(filename),
		ContentType: oss.Ptr("application/octet-stream"),
	},
		oss.PresignExpires(10*time.Minute),
	)
	if err != nil {
		logger.Sugar.Errorf("failed to put object presign %v", err)
		return nil, err
	}

	return &dto.UploadPresignResp{
		URL:           strings.SplitN(result.URL, "?", 2)[0],
		Name:          req.Name,
		SignedHeaders: result.SignedHeaders,
		UploadURL:     result.URL,
	}, nil
}

