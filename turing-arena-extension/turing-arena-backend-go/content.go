package main

import (
	"encoding/json"
	"os"
)

func getEnv(key string) string { return os.Getenv(key) }

// parseContentItems 尝试把 content 解析为数组形式 [{type,...}]。
func parseContentItems(raw json.RawMessage) ([]contentItem, bool) {
	if len(raw) == 0 {
		return nil, false
	}
	var items []contentItem
	if err := json.Unmarshal(raw, &items); err != nil {
		return nil, false
	}
	return items, true
}

// extractText 从 content 中取出文本：字符串直接返回；数组取第一个 type==text。
func extractText(raw json.RawMessage) string {
	var s string
	if err := json.Unmarshal(raw, &s); err == nil {
		return s
	}
	if items, ok := parseContentItems(raw); ok {
		for _, it := range items {
			if it.Type == "text" {
				return it.Text
			}
		}
	}
	return ""
}

// appendToContent 仅用于字符串型 content（系统提示），直接拼接后返回。
func appendToContent(raw json.RawMessage, suffix string) json.RawMessage {
	var s string
	if err := json.Unmarshal(raw, &s); err == nil {
		out, _ := json.Marshal(s + suffix)
		return out
	}
	return appendToContentText(raw, suffix)
}

// appendToContentText 把 suffix 追加到 content 的文本部分：
// - 字符串：直接拼接
// - 数组：追加到第一个 text 项；没有则新增一个 text 项
func appendToContentText(raw json.RawMessage, suffix string) json.RawMessage {
	var s string
	if err := json.Unmarshal(raw, &s); err == nil {
		out, _ := json.Marshal(s + suffix)
		return out
	}
	if items, ok := parseContentItems(raw); ok {
		appended := false
		for i := range items {
			if items[i].Type == "text" {
				items[i].Text += suffix
				appended = true
				break
			}
		}
		if !appended {
			items = append(items, contentItem{Type: "text", Text: suffix})
		}
		out, _ := json.Marshal(items)
		return out
	}
	// 无法解析时，退化为字符串
	out, _ := json.Marshal(suffix)
	return out
}
