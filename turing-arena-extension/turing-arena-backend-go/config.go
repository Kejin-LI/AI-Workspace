package main

import "os"

// Config 对应原 server.js 的 getTCCConfig()。
// 生产环境由公司 TCC 注入这些环境变量。
type Config struct {
	APIKey   string
	BaseURL  string
	BotID    string
	VisionID string
}

func getTCCConfig() Config {
	c := Config{
		APIKey:  os.Getenv("ARK_API_KEY"),
		BaseURL: os.Getenv("ARK_BASE_URL"),
		BotID:   os.Getenv("ARK_MODEL_ID"),
	}
	if c.BaseURL == "" {
		c.BaseURL = "https://ark-cn-beijing.bytedance.net/api/v3"
	}
	if c.BotID == "" {
		c.BotID = os.Getenv("ARK_BOT_ID")
	}
	if c.BotID == "" {
		c.BotID = "bot-20260416153516-sxswh"
	}
	c.VisionID = os.Getenv("ARK_VISION_MODEL_ID")
	if c.VisionID == "" {
		c.VisionID = os.Getenv("ARK_MODEL_ID")
	}
	return c
}
