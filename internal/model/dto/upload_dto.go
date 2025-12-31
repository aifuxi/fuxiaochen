package dto

type UploadPresignReq struct {
	Name string `json:"name" binding:"required"`
}

type UploadPresignResp struct {
	URL           string            `json:"url"`
	Name          string            `json:"name"`
	SignedHeaders map[string]string `json:"signedHeaders"`
	UploadURL     string            `json:"uploadUrl"`
}
