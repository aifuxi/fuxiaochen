package upload

import (
	"github.com/aifuxi/fgo/config"
	"github.com/aliyun/alibabacloud-oss-go-sdk-v2/oss"
	"github.com/aliyun/alibabacloud-oss-go-sdk-v2/oss/credentials"
)

var client *oss.Client

func Init(ossConfig config.OSSConfig) {
	// 使用NewStaticCredentialsProvider方法直接设置AK和SK
	provider := credentials.NewStaticCredentialsProvider(
		ossConfig.AccessKeyID,
		ossConfig.AccessKeySecret,
	)

	// 加载默认配置并设置凭证提供者和区域
	cfg := oss.LoadDefaultConfig().
		WithCredentialsProvider(provider).
		WithRegion(ossConfig.Region)
	client = oss.NewClient(cfg)
}

func GetClient() *oss.Client {
	return client
}
