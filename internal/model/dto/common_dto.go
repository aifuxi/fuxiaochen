package dto

import (
	"encoding/json"
	"strconv"
)

type ListReq struct {
	Page     int `json:"page" form:"page" binding:"required,min=1"`
	PageSize int `json:"pageSize" form:"pageSize" binding:"required,min=1,max=100"`

	SortBy string `json:"sortBy" form:"sortBy" binding:"omitempty,oneof=createdAt updatedAt"`
	Order  string `json:"order" form:"order" binding:"omitempty,oneof=asc desc"`
}

type StringInt64Slice []int64

func (s *StringInt64Slice) UnmarshalJSON(b []byte) error {
	var stringSlice []string
	if err := json.Unmarshal(b, &stringSlice); err == nil {
		result := make([]int64, 0, len(stringSlice))
		for _, v := range stringSlice {
			if v == "" {
				continue
			}
			id, err := strconv.ParseInt(v, 10, 64)
			if err != nil {
				return err
			}
			result = append(result, id)
		}
		*s = result
		return nil
	}

	var intSlice []int64
	if err := json.Unmarshal(b, &intSlice); err != nil {
		return err
	}
	*s = intSlice
	return nil
}
