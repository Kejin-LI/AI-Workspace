require('dotenv').config();
const express = require('express');
const cors = require('cors');
// using dynamic import for node-fetch as it is an ESM module
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Support large payloads for images

// Mock function to simulate pulling from TCC
// In a real ByteDance environment, you would use the internal TCC SDK here
function getTCCConfig() {
  return {
    apiKey: process.env.ARK_API_KEY,
    baseUrl: process.env.ARK_BASE_URL || 'https://ark-cn-beijing.bytedance.net/api/v3',
    botId: process.env.ARK_MODEL_ID || process.env.ARK_BOT_ID || 'bot-20260416153516-sxswh',
    visionId: process.env.ARK_VISION_MODEL_ID || process.env.ARK_MODEL_ID // Fallback to standard if no vision id provided
  };
}

app.post('/api/chat', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    const { messages } = req.body;
    const config = getTCCConfig();

    if (!config.apiKey || config.apiKey === 'your_tcc_ark_api_key_here') {
      return res.status(500).json({ error: 'API Key not configured. Please set it in .env or via TCC.' });
    }

    // Log the request for debugging (simulating trajectory tracking)
    console.log(`[Turing Arena Backend] Received chat request with ${messages.length} messages.`);

    // 1. Check if the request contains any images
    let hasImage = false;
    for (const msg of messages) {
      if (Array.isArray(msg.content)) {
        for (const item of msg.content) {
          if (item.type === 'image_url') {
            hasImage = true;
            break;
          }
        }
      }
      if (hasImage) break;
    }

    // 2. Select the target model: Vision Endpoint vs Web Search Bot
    const targetModelId = hasImage ? config.visionId : config.botId;
    console.log(`[Turing Arena Backend] Routing request to model: ${targetModelId} (hasImage: ${hasImage})`);

    // Inject System Prompt if configured in .env
    const baseSystemPrompt = process.env.SYSTEM_PROMPT || "你是Turing。";
    const antiHallucinationPrompt = "【重要规则】：绝对不要对你无法直接访问的网页或视频内容进行猜测或编造。如果你没有收到该网页/视频的具体文本内容（例如字幕或抓取的内容），请直接回答无法获取内容，严禁基于链接地址的字面特征产生幻觉数据。";
    const systemPrompt = baseSystemPrompt + "\n\n" + antiHallucinationPrompt;
    
    if (messages.length === 0 || messages[0].role !== 'system') {
      messages.unshift({
        role: 'system',
        content: systemPrompt
      });
      console.log(`[Turing Arena Backend] Injected System Prompt with Anti-Hallucination rules.`);
    } else {
      messages[0].content += "\n\n" + antiHallucinationPrompt;
      console.log(`[Turing Arena Backend] Appended Anti-Hallucination rules to existing System Prompt.`);
    }

    // 3. YouTube Link Interception & Transcript Fetching
    if (messages.length > 0) {
      // Find the last user message
      let lastUserMsgIndex = -1;
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === 'user') {
          lastUserMsgIndex = i;
          break;
        }
      }

      if (lastUserMsgIndex !== -1) {
        const lastMessage = messages[lastUserMsgIndex];
        let userText = '';
        if (typeof lastMessage.content === 'string') {
          userText = lastMessage.content;
        } else if (Array.isArray(lastMessage.content)) {
          const textItem = lastMessage.content.find(item => item.type === 'text');
          if (textItem) userText = textItem.text;
        }

        const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/;
        const match = ytRegex.exec(userText);
        
        if (match && match[1]) {
          const videoId = match[1];
          console.log(`[Turing Arena Backend] Detected YouTube URL, fetching transcript for video: ${videoId}`);
          try {
            const { YoutubeTranscript } = await import('youtube-transcript');
            const transcript = await YoutubeTranscript.fetchTranscript(videoId);
            const transcriptText = transcript.map(t => t.text).join(' ');
            
            const injectedText = `\n\n[系统自动抓取的YouTube视频字幕(CC)内容如下，请严格且仅基于以下内容回答用户关于此视频的问题，绝对不要产生任何幻觉：]\n${transcriptText}`;
            
            if (typeof lastMessage.content === 'string') {
              lastMessage.content += injectedText;
            } else if (Array.isArray(lastMessage.content)) {
              const textItem = lastMessage.content.find(item => item.type === 'text');
              if (textItem) {
                textItem.text += injectedText;
              } else {
                lastMessage.content.push({ type: 'text', text: injectedText });
              }
            }
            console.log(`[Turing Arena Backend] Successfully injected ${transcriptText.length} characters of transcript.`);
          } catch (err) {
            console.error(`[Turing Arena Backend] Failed to fetch transcript:`, err.message);
            const errorNotice = `\n\n[系统提示：无法获取此YouTube视频的字幕内容（可能未提供英/中文字幕或视频为私有）。请直接告诉用户无法获取视频内容，严禁对视频内容进行猜测或编造。]`;
            if (typeof lastMessage.content === 'string') {
              lastMessage.content += errorNotice;
            } else if (Array.isArray(lastMessage.content)) {
              const textItem = lastMessage.content.find(item => item.type === 'text');
              if (textItem) {
                textItem.text += errorNotice;
              } else {
                lastMessage.content.push({ type: 'text', text: errorNotice });
              }
            }
          }
        }
      }
    }

    // Prepare the payload for Volcengine Ark Bot API
    const payload = {
      model: targetModelId,
      stream: false, // For simplicity in MVP, we use non-streaming. You can change to true later.
      messages: messages
    };
    
    // Only inject tools if we are routing to the BOT (no images) and it is actually a bot
    // We let the Volcengine Bot configuration handle the plugins implicitly
    // Injecting explicit tools payload causes MissingParameter on some SDK versions/endpoints
    // if (!hasImage && targetModelId.startsWith('bot-')) {
    //   payload.tools = [{
    //     type: 'web_search',
    //     web_search: {
    //       search_mode: 'auto'
    //     }
    //   }];
    //   console.log(`[Turing Arena Backend] Injected web_search tool for Bot.`);
    // }

    // Determine the correct endpoint path. 
    // Volcengine uses /chat/completions for "ep-" endpoints and /bots/chat/completions for "bot-" endpoints
    const endpointPath = targetModelId.startsWith('ep-') ? '/chat/completions' : '/bots/chat/completions';

    console.log("[Turing Arena Backend] Payload being sent to Ark:", JSON.stringify(payload));

    const response = await fetch(`${config.baseUrl}${endpointPath}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Turing Arena Backend] Ark API Error:', errorText);
      return res.status(response.status).json({ error: 'Failed to call Ark API', details: errorText });
    }

    const data = await response.json();
    
    // Save trajectory data to DB here (O2-KR3)
    // ... DB save logic ...

    res.json(data);

  } catch (error) {
    console.error('[Turing Arena Backend] Internal Server Error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Turing Arena Backend proxy running on http://localhost:${PORT}`);
  console.log(`Ready to receive requests from the Chrome Extension.`);
});
