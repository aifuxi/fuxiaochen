# 镜像名称和标签
IMAGE_NAME ?= fuxiaochen
TAG ?= latest

# 如果存在 .env 文件，则包含它
ifneq (,$(wildcard ./.env))
    include .env
    export
endif

.PHONY: build_image help

help:
	@echo "Usage:"
	@echo "  make build_image  - Build docker image with environment variables from .env"

build_image:
	@echo "Building docker image $(IMAGE_NAME):$(TAG)..."
	docker build \
		--build-arg DATABASE_HOST="$(DATABASE_HOST)" \
		--build-arg DATABASE_PORT="$(DATABASE_PORT)" \
		--build-arg DATABASE_USER="$(DATABASE_USER)" \
		--build-arg DATABASE_PASSWORD="$(DATABASE_PASSWORD)" \
		--build-arg DATABASE_DBNAME="$(DATABASE_DBNAME)" \
		--build-arg DATABASE_NAME="$(DATABASE_NAME)" \
		--build-arg DATABASE_URL="$(DATABASE_URL)" \
		--build-arg OSS_ACCESS_KEY_ID="$(OSS_ACCESS_KEY_ID)" \
		--build-arg OSS_ACCESS_KEY_SECRET="$(OSS_ACCESS_KEY_SECRET)" \
		--build-arg OSS_REGION="$(OSS_REGION)" \
		--build-arg OSS_BUCKET="$(OSS_BUCKET)" \
		--build-arg OSS_UPLOAD_DIR="$(OSS_UPLOAD_DIR)" \
		--build-arg GITHUB_CLIENT_ID="$(GITHUB_CLIENT_ID)" \
		--build-arg GITHUB_CLIENT_SECRET="$(GITHUB_CLIENT_SECRET)" \
		--build-arg BETTER_AUTH_SECRET="$(BETTER_AUTH_SECRET)" \
		--build-arg BETTER_AUTH_URL="$(BETTER_AUTH_URL)" \
		--build-arg NEXT_PUBLIC_UMAMI_URL="$(NEXT_PUBLIC_UMAMI_URL)" \
		--build-arg NEXT_PUBLIC_UMAMI_WEBSITE_ID="$(NEXT_PUBLIC_UMAMI_WEBSITE_ID)" \
		--build-arg NEXT_PUBLIC_GOOGLE_ANALYTICS_ID="$(NEXT_PUBLIC_GOOGLE_ANALYTICS_ID)" \
		--build-arg NEXT_PUBLIC_GOOGLE_SEARCH_CONSOLE_CONTENT="$(NEXT_PUBLIC_GOOGLE_SEARCH_CONSOLE_CONTENT)" \
		--build-arg NEXT_PUBLIC_SITE_URL="$(NEXT_PUBLIC_SITE_URL)" \
		-t $(IMAGE_NAME):$(TAG) .
