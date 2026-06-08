package main

import (
	"encoding/json"
	"encoding/xml"
	"errors"
	"io"
	"net/http"
	"regexp"
	"strings"
)

const ytUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

var captionsRegex = regexp.MustCompile(`"captionTracks":(\[.*?\])`)

type captionTrack struct {
	BaseURL      string `json:"baseUrl"`
	LanguageCode string `json:"languageCode"`
}

type transcriptXML struct {
	Texts []struct {
		Value string `xml:",chardata"`
	} `xml:"text"`
}

// fetchYouTubeTranscript 对应 server.js 里的 YoutubeTranscript.fetchTranscript。
// 返回拼接后的字幕全文；无字幕时返回 error。
func fetchYouTubeTranscript(videoID string) (string, error) {
	watchURL := "https://www.youtube.com/watch?v=" + videoID
	req, err := http.NewRequest(http.MethodGet, watchURL, nil)
	if err != nil {
		return "", err
	}
	req.Header.Set("User-Agent", ytUserAgent)
	req.Header.Set("Accept-Language", "en-US,en;q=0.9")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	m := captionsRegex.FindSubmatch(body)
	if m == nil {
		return "", errors.New("no captions available for this video")
	}

	var tracks []captionTrack
	if err := json.Unmarshal(m[1], &tracks); err != nil {
		return "", err
	}
	if len(tracks) == 0 {
		return "", errors.New("no caption tracks found")
	}

	// 优先英文/中文，否则取第一条（与原库默认行为接近）。
	track := tracks[0]
	for _, t := range tracks {
		lc := strings.ToLower(t.LanguageCode)
		if strings.HasPrefix(lc, "en") || strings.HasPrefix(lc, "zh") {
			track = t
			break
		}
	}

	tReq, err := http.NewRequest(http.MethodGet, track.BaseURL, nil)
	if err != nil {
		return "", err
	}
	tReq.Header.Set("User-Agent", ytUserAgent)
	tResp, err := http.DefaultClient.Do(tReq)
	if err != nil {
		return "", err
	}
	defer tResp.Body.Close()
	tBody, err := io.ReadAll(tResp.Body)
	if err != nil {
		return "", err
	}

	var parsed transcriptXML
	if err := xml.Unmarshal(tBody, &parsed); err != nil {
		return "", err
	}

	var sb strings.Builder
	for i, t := range parsed.Texts {
		if i > 0 {
			sb.WriteString(" ")
		}
		sb.WriteString(t.Value)
	}
	text := strings.TrimSpace(sb.String())
	if text == "" {
		return "", errors.New("empty transcript")
	}
	return text, nil
}
