try { importScripts('config.local.js'); } catch (e) { console.warn('config.local.js missing; APP_CONFIG not loaded'); }

let isMediaRecording = false;
let isTrajRecording = false;
let recordedEvents = [];
let currentLabeleasesTaskId = null; // Store the currently viewed task ID
let activeTaskDurations = {}; // Store { taskId: duration_in_ms } during recording
let lastTaskSwitchTime = null; // Track when the current task ID became active

// Master Recording State
let isMasterRecording = false;
let isMasterPaused = false;
let masterTotalPausedMs = 0;
let masterPauseTime = null;
let masterRecordingConfig = { screen: false, traj: false };
let masterRecordingContext = { taskId: null, questionId: null };
let masterRecordingStartTime = null;

function accumulateTaskTime() {
  if (currentLabeleasesTaskId && lastTaskSwitchTime) {
    const duration = Date.now() - lastTaskSwitchTime;
    activeTaskDurations[currentLabeleasesTaskId] = (activeTaskDurations[currentLabeleasesTaskId] || 0) + duration;
  }
  lastTaskSwitchTime = Date.now();
}

function getSortedTaskIds() {
  accumulateTaskTime(); // Force an update of the current task's duration
  return Object.entries(activeTaskDurations)
    .map(([id, duration]) => ({ id, duration }))
    .sort((a, b) => b.duration - a.duration)
    .map(t => t.id);
}

const getUserKey = async (baseKey) => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['taUser'], (result) => {
      if (result.taUser && result.taUser.id) {
        resolve(`taUser_${result.taUser.id}_${baseKey}`);
      } else {
        resolve(`taGuest_${baseKey}`);
      }
    });
  });
};

const getSavedData = async (type) => {
  const key = await getUserKey(type);
  return new Promise((resolve) => {
    // Also try to fetch from the legacy key (e.g., 'savedMedia', 'savedTrajectories')
    const legacyKey = type === 'media' ? 'savedMedia' : (type === 'trajectories' ? 'savedTrajectories' : type);
    chrome.storage.local.get([key, legacyKey], (result) => {
      // Merge legacy data and user-specific data, removing duplicates by id
      const userData = result[key] || [];
      const legacyData = result[legacyKey] || [];
      
      const mergedMap = new Map();
      legacyData.forEach(item => mergedMap.set(item.id, item));
      userData.forEach(item => mergedMap.set(item.id, item));
      
      const mergedList = Array.from(mergedMap.values());
      // Sort newest first
      mergedList.sort((a, b) => b.id - a.id); // assuming id is timestamp
      resolve(mergedList);
    });
  });
};

const saveNewData = async (type, newData) => {
  const key = await getUserKey(type);
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      const list = result[key] || [];
      list.unshift(newData);
      chrome.storage.local.set({ [key]: list }, () => resolve(list));
    });
  });
};

// ==========================================
// Recording Badge Indicator (Breathing Target Icon with Base Logo)
// ==========================================
let recordingAnimationInterval = null;
let animationStep = 0; // 用于实现正弦波平滑呼吸

// 预先创建一个离屏画布，用于动态绘制帧
const badgeCanvas = new OffscreenCanvas(16, 16);
const badgeCtx = badgeCanvas.getContext('2d', { willReadFrequently: true });

// 缓存基础图标以避免每帧重复加载
let baseIconBitmap = null;

// 初始化时加载基础图标
fetch(chrome.runtime.getURL('icon16.png'))
  .then(res => res.blob())
  .then(blob => createImageBitmap(blob))
  .then(bitmap => {
    baseIconBitmap = bitmap;
  })
  .catch(err => console.error("Failed to load base icon for animation:", err));


function drawBreathingIcon() {
  // 清空画布
  badgeCtx.clearRect(0, 0, 16, 16);
  
  // 1. 绘制底层的 Turing 基础图标
  if (baseIconBitmap) {
    badgeCtx.drawImage(baseIconBitmap, 0, 0, 16, 16);
  }
  
  // 利用正弦波函数计算平滑的透明度，范围在 0.2 到 0.9 之间
  const opacity = 0.2 + (Math.sin(animationStep) + 1) / 2 * 0.7;
  // 外圈大小也跟着微弱呼吸 (尺寸缩小以适应角落)
  const outerRadius = 2.5 + (Math.sin(animationStep) + 1) / 2 * 1.0;
  
  animationStep += 0.15; // 控制呼吸频率
  
  // 确定红点中心的坐标（右下角）
  const centerX = 12;
  const centerY = 12;
  
  // 2. 为了让红点更清晰，在右下角画一个白色的半透明底衬（可选，增加对比度）
  badgeCtx.beginPath();
  badgeCtx.arc(centerX, centerY, 4.5, 0, 2 * Math.PI);
  badgeCtx.fillStyle = `rgba(255, 255, 255, 0.7)`;
  badgeCtx.fill();

  // 3. 绘制中心实心红点
  badgeCtx.beginPath();
  badgeCtx.arc(centerX, centerY, 1.5, 0, 2 * Math.PI);
  badgeCtx.fillStyle = `rgba(239, 68, 68, 1)`; // 始终保持鲜艳的中心红点
  badgeCtx.fill();

  // 4. 绘制外围的红色光晕圈
  badgeCtx.beginPath();
  badgeCtx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
  badgeCtx.strokeStyle = `rgba(239, 68, 68, ${opacity})`;
  badgeCtx.lineWidth = 1;
  badgeCtx.stroke();
  
  return badgeCtx.getImageData(0, 0, 16, 16);
}

function updateBadgeState() {
  const isRecording = isMediaRecording || isTrajRecording;
  
  if (isRecording) {
    if (!recordingAnimationInterval) {
      // 确保清空之前的文字 Badge 和可能的底色
      chrome.action.setBadgeText({ text: '' });
      chrome.action.setBadgeBackgroundColor({ color: [0, 0, 0, 0] });
      
      // 重置动画步数
      animationStep = 0;
      
      // 开启高帧率的平滑呼吸动画
      recordingAnimationInterval = setInterval(() => {
        chrome.action.setIcon({ imageData: drawBreathingIcon() }).catch(() => {});
      }, 50); // 每 50ms 渲染一帧（约 20 FPS，肉眼非常平滑）
    }
  } else {
    // 停止动画，恢复默认插件图标
    if (recordingAnimationInterval) {
      clearInterval(recordingAnimationInterval);
      recordingAnimationInterval = null;
    }
    chrome.action.setIcon({ 
      path: { 
        "16": "icon16.png", 
        "48": "icon48.png", 
        "128": "icon128.png" 
      } 
    }).catch(() => {});
  }
}

// ==========================================
// Side Panel Setup
// ==========================================
// Allows users to open the side panel by clicking on the action toolbar icon
if (chrome.sidePanel) {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));
}

// ==========================================
// Message Handling (UI <-> Content Scripts)
// ==========================================
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startTrajRecording') {
    isTrajRecording = true;
    recordedEvents = []; // Reset on new recording
    activeTaskDurations = {}; // Reset durations
    lastTaskSwitchTime = Date.now(); // Start tracking time
    
    console.log('Turing Arena Probe: Trajectory Recording started');
    updateBadgeState();
    broadcastState();
    sendResponse({ success: true });
  } 
  
  else if (request.action === 'stopTrajRecording') {
    isTrajRecording = false;
    const taskIds = getSortedTaskIds(); // Get all task IDs recorded during session
    console.log('Turing Arena Probe: Trajectory Recording stopped', recordedEvents, 'Task IDs:', taskIds);
    
    updateBadgeState();
    (async () => {
      // Save to storage if we have events
      if (recordedEvents.length > 0) {
        const newTrajectory = {
          id: Date.now().toString(),
          name: request.associatedTaskId || '轨迹 ' + new Date().toLocaleTimeString(),
          taskId: request.associatedQuestionId || (taskIds.length > 0 ? taskIds[0] : null), // Use associated crowdtest ID if available
          taskIds: request.associatedQuestionId ? [request.associatedQuestionId] : taskIds, // Array of all task IDs sorted by duration
          events: [...recordedEvents],
          date: new Date().toLocaleDateString()
        };
        await saveNewData('trajectories', newTrajectory);
      }
      broadcastState();
    })();
    
    sendResponse({ success: true });
  } 
  
  else if (request.action === 'startMediaRecording') {
    isMediaRecording = true;
    activeTaskDurations = {}; // Reset durations
    lastTaskSwitchTime = Date.now(); // Start tracking time
    console.log('Turing Arena Probe: Media Recording started');
    updateBadgeState();
    broadcastState();
    sendResponse({ success: true });
  }
  
  else if (request.action === 'stopMediaRecording') {
    isMediaRecording = false;
    const taskIds = getSortedTaskIds(); // Get all task IDs recorded during session
    console.log('Turing Arena Probe: Media Recording stopped, Task IDs:', taskIds);
    
    updateBadgeState();
    
    if (request.discard) {
      broadcastState();
      sendResponse({ success: true });
      return true;
    }
    
    (async () => {
      // Determine task and question for title
      let displayTask = request.associatedTaskId || "UnknownTask";
      let displayQuestion = request.associatedQuestionId || (taskIds.length > 0 ? taskIds[0] : "UnknownQuestion");
      let startTimeStr = request.startTime || new Date().toLocaleTimeString();
      let displayName = displayTask;

      // Calculate duration
      let durationMs = request.durationMs || 0;
      if (!durationMs && request.startTime) {
        try {
          const todayStr = new Date().toLocaleDateString();
          const start = new Date(`${todayStr} ${request.startTime}`);
          const end = new Date();
          let diffSecs = Math.round((end.getTime() - start.getTime()) / 1000);
          if (diffSecs < 0) diffSecs += 24 * 3600;
          durationMs = diffSecs * 1000;
        } catch (e) {}
      }

      // Save media to storage
      const newMedia = {
        id: Date.now().toString(),
        name: displayName,
        taskId: displayQuestion, // Keep legacy field pointing to question for compatibility
        taskIds: request.associatedQuestionId ? [request.associatedQuestionId] : taskIds, // Array of all task IDs sorted by duration
        date: new Date().toLocaleDateString(),
        url: request.blobUrl || null,
        startTime: request.startTime || new Date().toLocaleTimeString(),
        endTime: new Date().toLocaleTimeString(),
        hasVideo: !!request.blobUrl,
        hasTraj: request.hasTraj || false,
        durationMs: durationMs,
        associatedTaskId: request.associatedTaskId,
        associatedQuestionId: request.associatedQuestionId,
        trajectoryEvents: request.trajectoryEvents || [] // Store traj directly in media for unified view
      };
      await saveNewData('media', newMedia);
      broadcastState();
    })();
    
    sendResponse({ success: true });
  }
  
  else if (request.action === 'getState') {
    chrome.storage.local.get(['savedTrajectories', 'savedMedia'], async (result) => {
      // For backwards compatibility, get data if not in storage result
      const trajectories = await getSavedData('trajectories');
      const media = await getSavedData('media');
      let recordingSeconds = 0;
      if (isMasterRecording && masterRecordingStartTime) {
        const now = isMasterPaused ? masterPauseTime : Date.now();
        recordingSeconds = Math.floor((now - masterRecordingStartTime - masterTotalPausedMs) / 1000);
      }
      sendResponse({
        isMediaRecording: isMediaRecording,
        isTrajRecording: isTrajRecording,
        isMasterRecording: isMasterRecording,
        isMasterPaused: isMasterPaused,
        eventCount: recordedEvents.length,
        currentTaskId: currentLabeleasesTaskId,
        savedTrajectories: trajectories,
        savedMedia: media,
        currentTask: masterRecordingContext.taskId,
        currentQuestion: masterRecordingContext.questionId,
        recordingSeconds: recordingSeconds
      });
    });
    return true; // indicates async response
  } 
  
  else if (request.action === 'startMasterRecording') {
    isMasterRecording = true;
    isMasterPaused = false;
    masterTotalPausedMs = 0;
    masterPauseTime = null;
    masterRecordingConfig = { screen: request.recordScreen, traj: request.recordTraj };
    masterRecordingContext = { taskId: request.taskId, questionId: request.questionId };
    masterRecordingStartTime = Date.now();
    
    updateBadgeState();
    broadcastState();
    sendResponse({ success: true });
  }

  else if (request.action === 'pauseMasterRecording') {
    if (isMasterRecording && !isMasterPaused) {
      isMasterPaused = true;
      masterPauseTime = Date.now();
      updateBadgeState();
      broadcastState();
    }
    sendResponse({ success: true });
  }

  else if (request.action === 'resumeMasterRecording') {
    if (isMasterRecording && isMasterPaused) {
      isMasterPaused = false;
      masterTotalPausedMs += (Date.now() - masterPauseTime);
      masterPauseTime = null;
      updateBadgeState();
      broadcastState();
    }
    sendResponse({ success: true });
  }

  else if (request.action === 'stopMasterRecording') {
    isMasterRecording = false;
    
    // Save duration if needed
    const endMs = isMasterPaused ? masterPauseTime : Date.now();
    const durationMs = endMs - masterRecordingStartTime - masterTotalPausedMs;
    console.log(`Master recording stopped for Task: ${masterRecordingContext.taskId}, Question: ${masterRecordingContext.questionId}, Duration: ${durationMs}ms`);
    
    // Reset context
    isMasterPaused = false;
    masterTotalPausedMs = 0;
    masterPauseTime = null;
    masterRecordingContext = { taskId: null, questionId: null };
    masterRecordingStartTime = null;
    
    updateBadgeState();
    broadcastState();
    sendResponse({ success: true });
  }
  
  else if (request.action === 'contextChanged') {
    const { newTaskId, newQuestionId } = request;
    
    if (isMasterRecording) {
      // If we are currently recording and the context changed significantly
      if (masterRecordingContext.questionId !== newQuestionId && masterRecordingContext.questionId !== null) {
        console.log(`[Turing Arena] Auto-slicing triggered! Context changed from ${masterRecordingContext.questionId} to ${newQuestionId}`);
        
        // 1. Stop current master recording (which stops traj)
        const prevContext = { ...masterRecordingContext };
        const durationMs = Date.now() - masterRecordingStartTime;
        
        // Save duration
        if (prevContext.taskId) {
          activeTaskDurations[prevContext.taskId] = (activeTaskDurations[prevContext.taskId] || 0) + durationMs;
        }
        
        // Stop Traj
        if (masterRecordingConfig.traj) {
          // We need to pass the recorded events to the slice
          const eventsToSave = [...recordedEvents];
          recordedEvents = []; // reset for next slice
          
          chrome.runtime.sendMessage({ action: 'stopTrajRecording' }, () => {
             // Restart Traj
             chrome.runtime.sendMessage({ action: 'startTrajRecording' });
          });
          
          // Inject events into the media recording stop payload
          chrome.runtime.sendMessage({
             action: 'triggerAutoSlice',
             prevContext: prevContext,
             newContext: { taskId: newTaskId, questionId: newQuestionId },
             config: masterRecordingConfig,
             trajectoryEvents: eventsToSave
          });
        } else {
          // We cannot stop mediaRecording from background directly without the blob logic in sidebar, 
          // so we tell sidebar to perform the slice.
          chrome.runtime.sendMessage({
             action: 'triggerAutoSlice',
             prevContext: prevContext,
             newContext: { taskId: newTaskId, questionId: newQuestionId },
             config: masterRecordingConfig
          });
        }
        
        // Update background state
        masterRecordingContext = { taskId: newTaskId, questionId: newQuestionId };
        masterRecordingStartTime = Date.now();
      } else if (masterRecordingContext.questionId === null) {
        // Just started, but didn't have a question ID yet
        masterRecordingContext.questionId = newQuestionId;
        masterRecordingContext.taskId = newTaskId || masterRecordingContext.taskId;
      }
    }
    
    // Broadcast context to sidebar even if not recording, so UI can show "Preparation" state
    chrome.runtime.sendMessage({
      action: 'scrapedContextUpdate',
      taskId: newTaskId,
      questionId: newQuestionId
    });
  }

  else if (request.action === 'updateTaskId') {
    if (currentLabeleasesTaskId !== request.taskId) {
      accumulateTaskTime(); // Accumulate time for the previous task ID before switching
      currentLabeleasesTaskId = request.taskId;
    }
    // Broadcast state to UI so they know the task ID updated
    broadcastState();
    sendResponse({ success: true });
  }
  
  else if (request.action === 'getTrajectoryEvents') {
    sendResponse({ events: [...recordedEvents] });
  }

  else if (request.action === 'recordEvent') {
    if (isTrajRecording) {
      const event = {
        category: 'DOM_ACTION',
        taskId: currentLabeleasesTaskId, // Inject task ID into every event JSON!
        ...request.eventData,
        timestamp: new Date().toISOString(),
        url: sender.tab ? sender.tab.url : 'unknown',
        title: sender.tab ? sender.tab.title : 'unknown'
      };
      recordedEvents.push(event);
      console.log('Captured DOM Event:', event);
      broadcastState();
    }
    sendResponse({ success: true });
  }
  
  else if (request.action === 'openSidePanelAndChat') {
    const newChatId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    // Attempt to open the side panel IMMEDIATELY to preserve user gesture
    if (chrome.sidePanel && chrome.sidePanel.open && sender.tab) {
      chrome.sidePanel.open({ windowId: sender.tab.windowId }).catch(console.error);
    }

    // Store in storage so sidebar can pick it up instantly
    chrome.storage.local.set({ 
      pendingChat: {
        id: newChatId,
        history: request.chatHistory,
        timestamp: Date.now()
      }
    });
    
    sendResponse({ success: true });
  }
  
  else if (request.action === 'checkLoginState') {
    chrome.storage.local.get(['taUser'], (result) => {
      sendResponse({ isLoggedIn: !!(result.taUser && result.taUser.id) });
    });
    return true; // Keep channel open for async storage read
  }

  else if (request.action === 'autoSyncPrompt') {
    chrome.storage.local.get(['activeCrowdtestQuestion', 'currentRoundCount'], (res) => {
      const q = res.activeCrowdtestQuestion;
      if (!q) return;

      let roundCount = res.currentRoundCount || 1;
      
      if (!q.savedPrompts) q.savedPrompts = { doubao: [], deepseek: [] };
      if (Array.isArray(q.savedPrompts)) {
        q.savedPrompts = { doubao: [...q.savedPrompts], deepseek: [...q.savedPrompts] };
      }
      if (!q.savedPrompts.doubao) q.savedPrompts.doubao = [];
      if (!q.savedPrompts.deepseek) q.savedPrompts.deepseek = [];

      const promptText = request.text;
      const targetSource = request.source || 'doubao';
      
      let targetArray = q.savedPrompts[targetSource];
      let lastIndex = targetArray.length - 1;
      let syncedRound = 1;
      
      if (lastIndex < 0) {
        if (promptText === q.title) {
          targetArray[0] = promptText;
          syncedRound = 1;
        } else {
          targetArray[0] = q.title;
          targetArray[1] = promptText;
          syncedRound = 2;
        }
      } else {
        const lastPrompt = targetArray[lastIndex] || '';
        if (lastPrompt.trim() === '') {
          targetArray[lastIndex] = promptText;
          syncedRound = lastIndex + 1;
        } else if (lastPrompt.trim() !== promptText.trim()) {
          targetArray.push(promptText);
          syncedRound = targetArray.length;
        } else {
          syncedRound = targetArray.length;
        }
      }

      const maxRound = Math.max(q.savedPrompts.doubao.length, q.savedPrompts.deepseek.length, res.currentRoundCount || 1);

      chrome.storage.local.set({
        activeCrowdtestQuestion: q,
        currentRoundCount: maxRound,
        lastAutoSyncedPrompt: { source: targetSource, round: syncedRound }
      });
    });
    sendResponse({ success: true });
    return true;
  }
  else if (request.action === 'addAnnotation') {
    // Persist annotation in background to ensure it's not lost if side panel is closed
    chrome.storage.local.get(['currentAnnotations', 'currentRoundCount'], (result) => {
      const anns = result.currentAnnotations || [];
      const currentRoundCount = result.currentRoundCount || 1;
      
      const newAnnotation = request.data;
      
      // If the frontend didn't pass an inferred round, fallback to the latest round
      if (!newAnnotation.round) {
         newAnnotation.round = currentRoundCount;
      }
      
      anns.push(newAnnotation);
      chrome.storage.local.set({ currentAnnotations: anns });
    });
    sendResponse({ success: true });
    return true;
  }

  else if (request.action === 'openLoginModal') {
    // Open side panel if closed
    if (chrome.sidePanel && chrome.sidePanel.open && sender.tab) {
      chrome.sidePanel.open({ windowId: sender.tab.windowId }).catch(console.error);
    }
    
    // Set flag in storage for sidebar to read on open
    chrome.storage.local.set({ pendingLoginModal: true });
    sendResponse({ success: true });
  }
  else if (request.action === 'syncWebUser' && request.user) {
    console.log('Turing Arena Probe: Checking web user against plugin user:', request.user);
    
    // Always store the latest web user so we can check it immediately when the user logs into the plugin later
    chrome.storage.local.set({ latestWebUser: request.user });
    
    chrome.storage.local.get(['taUser'], (result) => {
      const currentPluginUser = result.taUser;
      
      // Safely extract the plugin user's phone number
      let pluginPhone = '';
      if (currentPluginUser) {
        if (currentPluginUser.phone) {
          // Remove +86 if Supabase added it
          pluginPhone = currentPluginUser.phone.replace(/^\+86/, '');
        } else if (currentPluginUser.email && /^1[3-9]\d{9}$/.test(currentPluginUser.email)) {
           // Fallback in case old data is stored
           pluginPhone = currentPluginUser.email;
        }
      }
      
      // Only perform check if plugin has a logged-in user and web user has a phone number
      if (currentPluginUser && pluginPhone && request.user.phone) {
        if (pluginPhone !== request.user.phone) {
          console.warn('Turing Arena Probe: User mismatch detected!', pluginPhone, 'vs', request.user.phone);
          
          // Save the mismatch state so it persists if the user closes/reopens the sidebar
          chrome.storage.local.set({ 
            pendingUserMismatchAlert: true,
            mismatchWebUser: request.user 
          }, () => {
            // Alert the sidebar to show a warning
            chrome.runtime.sendMessage({
              action: 'userMismatchAlert',
              webUser: request.user,
              pluginUser: { ...currentPluginUser, phone: pluginPhone }
            }).catch(() => {
              // Sidebar might be closed, which is fine since we saved to storage
            });
          });
        } else {
          // Phones match. Do nothing. DO NOT overwrite taUser.
          console.log('Turing Arena Probe: User phones match, all good.');
        }
      } else {
        // Either plugin user is not logged in, or web user phone not found.
        // Do nothing. DO NOT auto-login.
        console.log('Turing Arena Probe: Skipping mismatch check (not logged in or missing phone).');
      }
    });
    
    sendResponse({ success: true });
    return true;
  }

  else if (request.action === 'fetchAiChat') {
    // 采用“动态下发 Key + 客户端直连”的安全架构
    // API Key 存储在云端，彻底防止 F12 抓包和源码窃取，同时解决公网无法访问字节内网 (ark-cn-beijing) 的问题
    const SUPABASE_FUNCTION_URL = ((self.APP_CONFIG && self.APP_CONFIG.SUPABASE_URL) || '') + '/functions/v1/ark-chat';
    const SUPABASE_ANON_KEY = (self.APP_CONFIG && self.APP_CONFIG.SUPABASE_ANON_KEY) || '';
    
    // 1. 先向云端请求获取最新的 API Key 和配置
    fetch(SUPABASE_FUNCTION_URL, {
      method: 'GET', // Edge Function 被重构为 GET 请求配置
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    })
    .then(async res => {
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`云端函数获取配置失败! status: ${res.status}, details: ${errText}`);
      }
      return res.json();
    })
    .then(config => {
      // 2. 拿到云端下发的 Key 之后，利用用户浏览器的内网环境，向 ark-cn-beijing 真实发起请求
      const ARK_API_KEY = config.apiKey;
      const ARK_BASE_URL = config.baseUrl;
      
      const hasImage = request.messages.some(msg => 
        Array.isArray(msg.content) && msg.content.some(item => item.type === 'image_url')
      );

      const targetModelId = hasImage ? 'ep-20260417180139-mstfd' : 'bot-20260416153516-sxswh';
      const endpointPath = targetModelId.startsWith('ep-') ? '/chat/completions' : '/bots/chat/completions';
      const API_URL = `${ARK_BASE_URL}${endpointPath}`;

      return fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ARK_API_KEY}`
        },
        body: JSON.stringify({
          model: targetModelId,
          messages: request.messages,
          stream: false
        })
      });
    })
    .then(async res => {
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`请求 Ark API 失败! status: ${res.status}, details: ${errText}`);
      }
      return res.json();
    })
    .then(data => {
      console.log('Ark API Response:', data); // 调试日志，查看真实的返回结构
      // 火山引擎智能体 (bots) 的返回格式可能与标准 OpenAI 略有不同
      // 我们在后台统一把它包装成标准结构，或者把完整数据传给前端解析
      sendResponse({ data });
    })
    .catch(err => {
      console.error('Error in secure fetch architecture:', err);
      sendResponse({ error: err.message });
    });
    
    return true; // Keep channel open for async fetch
  }
  else if (request.action === 'captureArea') {
    // Prevent duplicate forwarding in background
    if (self._taCaptureDebounce) {
      console.log('Debouncing duplicate captureArea in background');
      sendResponse({ success: false, reason: 'debounced' });
      return true;
    }
    self._taCaptureDebounce = true;
    setTimeout(() => { self._taCaptureDebounce = false; }, 1000);

    // Forward the message to the side panel
    chrome.runtime.sendMessage({
      action: 'captureArea',
      rect: request.rect
    }).catch(() => {});
    sendResponse({ success: true });
  }
  
  return true; 
});

function broadcastState() {
  (async () => {
    const trajectories = await getSavedData('trajectories');
    const media = await getSavedData('media');
    chrome.runtime.sendMessage({
      type: 'STATE_UPDATED',
      isMediaRecording: isMediaRecording,
      isTrajRecording: isTrajRecording,
      eventCount: recordedEvents.length,
      currentTaskId: currentLabeleasesTaskId,
      savedTrajectories: trajectories,
      savedMedia: media
    }).catch(() => {
      // Ignore errors when panel is closed
    });
  })();
}

// ==========================================
// Network Request Interception
// ==========================================
const networkFilters = {
  urls: ["<all_urls>"],
  types: ["xmlhttprequest", "websocket", "other"] 
};

chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    if (!isTrajRecording) return;
    if (details.initiator && details.initiator.startsWith('chrome-extension://')) return;

    const event = {
      category: 'NETWORK_REQUEST',
      timestamp: new Date().toISOString(),
      requestId: details.requestId,
      method: details.method,
      url: details.url,
      initiator: details.initiator,
    };

    recordedEvents.push(event);
    broadcastState();
  },
  networkFilters,
  ["requestHeaders", "extraHeaders"]
);

chrome.webRequest.onCompleted.addListener(
  (details) => {
    if (!isTrajRecording) return;
    if (details.initiator && details.initiator.startsWith('chrome-extension://')) return;

    const event = {
      category: 'NETWORK_RESPONSE',
      timestamp: new Date().toISOString(),
      requestId: details.requestId,
      statusCode: details.statusCode,
      url: details.url,
    };

    recordedEvents.push(event);
    broadcastState();
  },
  networkFilters,
  ["responseHeaders", "extraHeaders"]
);