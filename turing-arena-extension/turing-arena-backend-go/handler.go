package main

import (
	"bytes"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"regexp"
	"strings"

	"github.com/gin-gonic/gin"
)

const antiHallucinationPrompt = "【重要规则】：绝对不要对你无法直接访问的网页或视频内容进行猜测或编造。如果你没有收到该网页/视频的具体文本内容（例如字幕或抓取的内容），请直接回答无法获取内容，严禁基于链接地址的字面特征产生幻觉数据。"

var ytRegex = regexp.MustCompile(`(?:https?://)?(?:www\.)?(?:youtube\.com/watch\?v=|youtu\.be/)([^&\s]+)`)

// Message 中 Content 可能是字符串，也可能是 [{type,text|image_url}...]，用 RawMessage 兜底。
type Message struct {
	Role    string          `json:"role"`
	Content json.RawMessage `json:"content"`
}

type chatRequest struct {
	Messages []Message `json:"messages"`
}

type contentItem struct {
	Type     string          `json:"type"`
	Text     string          `json:"text,omitempty"`
	ImageURL json.RawMessage `json:"image_url,omitempty"`
}

func handleChat(c *gin.Context) {
	var req chatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON body"})
		return
	}
	messages := req.Messages
	config := getTCCConfig()

	if config.APIKey == "" || config.APIKey == "your_tcc_ark_api_key_here" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "API Key not configured. Please set it in env or via TCC."})
		return
	}

	log.Printf("[Turing Arena Backend] Received chat request with %d messages.", len(messages))

	// 1. 检测是否含图片
	hasImage := false
	for _, msg := range messages {
		items, ok := parseContentItems(msg.Content)
		if !ok {
			continue
		}
		for _, it := range items {
			if it.Type == "image_url" {
				hasImage = true
				break
			}
		}
		if hasImage {
			break
		}
	}

	// 2. 选择目标模型：vision vs bot
	targetModelID := config.BotID
	if hasImage {
		targetModelID = config.VisionID
	}
	log.Printf("[Turing Arena Backend] Routing request to model: %s (hasImage: %v)", targetModelID, hasImage)

	// 注入系统提示 + 防幻觉
	baseSystemPrompt := getEnvOr("SYSTEM_PROMPT", "你是Turing。")
	systemPrompt := baseSystemPrompt + "\n\n" + antiHallucinationPrompt

	if len(messages) == 0 || messages[0].Role != "system" {
		sysContent, _ := json.Marshal(systemPrompt)
		messages = append([]Message{{Role: "system", Content: sysContent}}, messages...)
		log.Printf("[Turing Arena Backend] Injected System Prompt with Anti-Hallucination rules.")
	} else {
		messages[0].Content = appendToContent(messages[0].Content, "\n\n"+antiHallucinationPrompt)
		log.Printf("[Turing Arena Backend] Appended Anti-Hallucination rules to existing System Prompt.")
	}

	// 3. YouTube 链接拦截 + 字幕抓取
	if len(messages) > 0 {
		lastUserIdx := -1
		for i := len(messages) - 1; i >= 0; i-- {
			if messages[i].Role == "user" {
				lastUserIdx = i
				break
			}
		}
		if lastUserIdx != -1 {
			userText := extractText(messages[lastUserIdx].Content)
			if match := ytRegex.FindStringSubmatch(userText); match != nil && match[1] != "" {
				videoID := match[1]
				log.Printf("[Turing Arena Backend] Detected YouTube URL, fetching transcript for video: %s", videoID)
				transcript, err := fetchYouTubeTranscript(videoID)
				if err != nil {
					log.Printf("[Turing Arena Backend] Failed to fetch transcript: %v", err)
					notice := "\n\n[系统提示：无法获取此YouTube视频的字幕内容（可能未提供英/中文字幕或视频为私有）。请直接告诉用户无法获取视频内容，严禁对视频内容进行猜测或编造。]"
					messages[lastUserIdx].Content = appendToContentText(messages[lastUserIdx].Content, notice)
				} else {
					injected := "\n\n[系统自动抓取的YouTube视频字幕(CC)内容如下，请严格且仅基于以下内容回答用户关于此视频的问题，绝对不要产生任何幻觉：]\n" + transcript
					messages[lastUserIdx].Content = appendToContentText(messages[lastUserIdx].Content, injected)
					log.Printf("[Turing Arena Backend] Successfully injected %d characters of transcript.", len([]rune(transcript)))
				}
			}
		}
	}

	// 组装发往 Ark 的 payload
	payload := map[string]any{
		"model":    targetModelID,
		"stream":   false,
		"messages": messages,
	}

	endpointPath := "/bots/chat/completions"
	if strings.HasPrefix(targetModelID, "ep-") {
		endpointPath = "/chat/completions"
	}

	payloadBytes, _ := json.Marshal(payload)
	log.Printf("[Turing Arena Backend] Payload being sent to Ark: %s", string(payloadBytes))

	arkReq, err := http.NewRequest(http.MethodPost, config.BaseURL+endpointPath, bytes.NewReader(payloadBytes))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error", "message": err.Error()})
		return
	}
	arkReq.Header.Set("Authorization", "Bearer "+config.APIKey)
	arkReq.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(arkReq)
	if err != nil {
		log.Printf("[Turing Arena Backend] Internal Server Error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error", "message": err.Error()})
		return
	}
	defer resp.Body.Close()
	respBody, _ := io.ReadAll(resp.Body)

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		log.Printf("[Turing Arena Backend] Ark API Error: %s", string(respBody))
		c.JSON(resp.StatusCode, gin.H{"error": "Failed to call Ark API", "details": string(respBody)})
		return
	}

	c.Data(http.StatusOK, "application/json", respBody)
}

func getEnvOr(key, def string) string {
	if v := getEnv(key); v != "" {
		return v
	}
	return def
}
