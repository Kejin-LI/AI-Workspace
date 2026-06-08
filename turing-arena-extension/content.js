// Content script to intercept DOM events and generate robust CSS selectors

// Simple utility to generate a unique CSS selector for a given DOM node
function generateCSSSelector(el) {
  if (!(el instanceof Element)) return '';
  let path = [];
  
  while (el.nodeType === Node.ELEMENT_NODE) {
    let selector = el.nodeName.toLowerCase();
    
    if (el.id) {
      selector += '#' + el.id;
      path.unshift(selector);
      break; // IDs are usually unique, stop here for brevity
    } else {
      let sibling = el;
      let nth = 1;
      while (sibling = sibling.previousElementSibling) {
        if (sibling.nodeName.toLowerCase() === selector) nth++;
      }
      
      if (nth !== 1) {
        selector += ':nth-of-type(' + nth + ')';
      }
    }
    path.unshift(selector);
    el = el.parentNode;
  }
  
  return path.join(' > ');
}

// Extract meaningful text or value from the element
function getElementContext(el) {
  const tagName = el.tagName.toLowerCase();
  
  if (tagName === 'input' || tagName === 'textarea') {
    // Basic scrubbing to avoid logging raw passwords
    if (el.type === 'password') {
      return '[MASKED_PASSWORD]';
    }
    return el.value;
  }
  
  // For buttons and links, grab the visible text
  const text = el.innerText || el.textContent;
  return text ? text.trim().substring(0, 50) : '';
}

// Intercept Clicks
document.addEventListener('click', (e) => {
  // Check if we are recording
  if (!chrome.runtime?.id) return;
  try {
    chrome.runtime.sendMessage({ action: 'getState' }, (state) => {
      if (chrome.runtime.lastError) return;
      if (state && state.isTrajRecording) {
        const target = e.target;
        const selector = generateCSSSelector(target);
        const contextText = getElementContext(target);
        
        // Basic position info just in case
        const rect = target.getBoundingClientRect();
        const boundingBox = {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height
        };

        const eventData = {
          type: 'click',
          selector: selector,
          tagName: target.tagName.toLowerCase(),
          contextText: contextText,
          boundingBox: boundingBox,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight
        };

        if (chrome.runtime?.id) {
          chrome.runtime.sendMessage({
            action: 'recordEvent',
            eventData: eventData
          });
        }
      }
    });
  } catch (err) {
    console.warn('Extension context invalidated', err);
  }
}, true);

// ============================================================================
// Screenshot Crop UI Implementation
// ============================================================================

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log('content script received message:', msg);
  if (msg.action === 'startScreenshotMode') {
    initScreenshotMode();
    sendResponse({success: true});
  }
  return true;
});

function initScreenshotMode() {
  const overlayId = 'ta-screenshot-overlay';
  if (document.getElementById(overlayId)) return;

  const overlay = document.createElement('div');
  overlay.id = overlayId;
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.zIndex = '2147483647';
  overlay.style.cursor = 'crosshair';
  overlay.style.overflow = 'hidden';
  overlay.style.background = 'rgba(0, 0, 0, 0.3)';

  const selectionBox = document.createElement('div');
  selectionBox.style.position = 'absolute';
  selectionBox.style.border = '2px solid #6366F1';
  selectionBox.style.boxShadow = '0 0 0 9999px rgba(0,0,0,0.5)';
  selectionBox.style.display = 'none';
  selectionBox.style.background = 'transparent';
  overlay.appendChild(selectionBox);

  document.body.appendChild(overlay);

  let isDrawing = false;
  let startX = 0;
  let startY = 0;

  const onMouseDown = (e) => {
    isDrawing = true;
    startX = e.clientX;
    startY = e.clientY;
    
    // Once drawing starts, clear overlay background so boxShadow handles the darkening
    overlay.style.background = 'transparent';
    
    selectionBox.style.left = `${startX}px`;
    selectionBox.style.top = `${startY}px`;
    selectionBox.style.width = '0px';
    selectionBox.style.height = '0px';
    selectionBox.style.display = 'block';
  };

  const onMouseMove = (e) => {
    if (!isDrawing) return;
    const currentX = e.clientX;
    const currentY = e.clientY;

    const left = Math.min(startX, currentX);
    const top = Math.min(startY, currentY);
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);

    selectionBox.style.left = `${left}px`;
    selectionBox.style.top = `${top}px`;
    selectionBox.style.width = `${width}px`;
    selectionBox.style.height = `${height}px`;
  };

  const onMouseUp = (e) => {
    if (!isDrawing) return;
    isDrawing = false;

    const currentX = e.clientX;
    const currentY = e.clientY;

    const left = Math.min(startX, currentX);
    const top = Math.min(startY, currentY);
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);

    // Cleanup
    overlay.removeEventListener('mousedown', onMouseDown);
    overlay.removeEventListener('mousemove', onMouseMove);
    overlay.removeEventListener('mouseup', onMouseUp);

    if (width > 5 && height > 5) {
      // Prevent multiple sends globally across multiple mousedown/up events
      if (window._taIsCapturingArea) {
        overlay.remove();
        return;
      }
      window._taIsCapturingArea = true;
      
      // Remove overlay immediately to ensure it's not captured
      overlay.remove();

      // Wait a tick for DOM to update and overlay to disappear before capturing
      setTimeout(() => {
        if (!chrome.runtime?.id) {
          window._taIsCapturingArea = false;
          return;
        }
        try {
          // Use absolute positions relative to the entire document
          const absoluteLeft = left + window.scrollX;
          const absoluteTop = top + window.scrollY;
          
          chrome.runtime.sendMessage({
            action: 'captureArea',
            rect: { 
              x: absoluteLeft, 
              y: absoluteTop, 
              width: width, 
              height: height, 
              dpr: window.devicePixelRatio,
              scrollX: window.scrollX,
              scrollY: window.scrollY
            }
          });
        } catch (err) {
          console.warn('Context invalidated', err);
        } finally {
          // Reset flag after a short delay to allow next capture
          setTimeout(() => { window._taIsCapturingArea = false; }, 500);
        }
      }, 100);
    } else {
      overlay.remove();
    }
  };

  overlay.addEventListener('mousedown', onMouseDown);
  overlay.addEventListener('mousemove', onMouseMove);
  overlay.addEventListener('mouseup', onMouseUp);
}

// ============================================================================
// Global Helper Functions
// ============================================================================

window.extractFirstUserPromptOnPage = () => {
  let allUserPrompts = [];
  
  // Attempt 1: Look for Doubao specific structure
  // Some versions of Doubao use data-message-role="user", others might just use classes containing "user"
  // Exclude .message-assistant to avoid catching generated documents inside assistant replies
  const doubaoUserBubbles = document.querySelectorAll('div[data-message-role="user"], div[class*="message-user" i]:not([class*="message-assistant" i]), div[class*="user-message" i]:not([class*="assistant-message" i]), .markdown-body[data-testid*="user" i]');
  if (doubaoUserBubbles && doubaoUserBubbles.length > 0) {
    doubaoUserBubbles.forEach(el => {
      // Specifically filter out elements that are actually part of the assistant's reply (like generated docs)
      if (!el.closest('[data-message-role="assistant"]') && !el.closest('.message-assistant')) {
        const text = el.innerText || el.textContent;
        if (text && text.trim().length > 0) {
          allUserPrompts.push(text);
        }
      }
    });
    if (allUserPrompts.length > 0) return allUserPrompts; // return early if found
  }
  
  // Fallback for Doubao: if data attributes are missing, look for the avatar/bubble structure
  // Usually user messages in Doubao are on the right or have a specific avatar
  if (window.location.hostname.includes('doubao.com') && allUserPrompts.length === 0) {
     const possibleBubbles = document.querySelectorAll('.content-wrapper, .message-content, [class*="Message"]');
     possibleBubbles.forEach(el => {
       // A heuristic: if it contains the text we are looking for (not ideal for general extraction, but helps fallback)
       // Better heuristic: user messages usually don't have the "copy/like" toolbar immediately inside them in the same way
       const text = el.innerText || el.textContent;
       if (text && text.trim().length > 0 && !el.querySelector('svg')) {
          // This is risky, but if we really found nothing, let's try to grab all text blocks that look like messages
          // allUserPrompts.push(text); 
       }
     });
     
     // Let's try another common Doubao selector
     const alternativeDoubao = document.querySelectorAll('[data-testid="chat-message-user"]');
     if (alternativeDoubao.length > 0) {
        alternativeDoubao.forEach(el => allUserPrompts.push(el.innerText || el.textContent));
        return allUserPrompts;
     }
  }

  // Attempt 2: Look for Deepseek specific structure
  const deepseekUserBubbles = document.querySelectorAll('.f6004764, div[class*="user" i]');
  if (deepseekUserBubbles && deepseekUserBubbles.length > 0) {
    deepseekUserBubbles.forEach(el => {
      const text = el.innerText || el.textContent;
      if (text && text.trim().length > 0) {
        allUserPrompts.push(text);
      }
    });
  }
  
  // Final fallback: if we still have nothing, try to find any element that contains the expected text
  // This is handled in the verification function itself if userPrompts is empty, but we want to avoid that.
  return allUserPrompts;
};

window.verifyFirstPromptMatch = (expectedPrompt) => {
  if (!expectedPrompt) return { match: true }; // Nothing to verify against
  
  // Normalize whitespace, newlines, and non-breaking spaces
  const cleanExpected = expectedPrompt.replace(/[\s\n\r\u00A0\u200B]+/g, '').trim();
  if (!cleanExpected) return { match: true };

  const userPrompts = window.extractFirstUserPromptOnPage();
  if (!userPrompts || userPrompts.length === 0) {
    // Ultimate fallback: if we couldn't parse the DOM structure AT ALL, just check the whole page text.
    // This prevents blocking the user when our DOM selectors fail on a new UI update.
    const pageText = document.body.innerText || document.body.textContent;
    const cleanPageText = pageText.replace(/[\s\n\r\u00A0\u200B]+/g, '').trim();
    if (cleanPageText.includes(cleanExpected)) {
      return { match: true, actual: '页面包含该文本（通过全局扫描兜底）' };
    }
    return { match: false, skipped: true, actual: '未获取到对话内容，且全局未发现匹配文本' }; 
  }

  const actualFirstPrompt = userPrompts[0].replace(/[\s\n\r\u00A0\u200B]+/g, '').trim();
  const isMatch = actualFirstPrompt.includes(cleanExpected) || cleanExpected.includes(actualFirstPrompt);
  
  return { match: isMatch, actual: userPrompts[0] };
};

// ============================================================================
// Text Selection & Quick Bar (Floating Toolbar) Implementation
// ============================================================================

let quickBarElement = null;
let askPopupElement = null;
let resultPopupElement = null;
let annotatePopupElement = null;
let currentSelectionText = '';
let currentSelectionRange = null; // Store range for highlighting
let isCrowdtesting = false;

// Sync crowdtest state
if (typeof chrome !== 'undefined' && chrome.storage) {
  chrome.storage.local.get(['activeCrowdtestQuestion'], (res) => {
    isCrowdtesting = (res.activeCrowdtestQuestion !== undefined && res.activeCrowdtestQuestion !== null);
  });
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.activeCrowdtestQuestion) {
      isCrowdtesting = (changes.activeCrowdtestQuestion.newValue !== undefined && changes.activeCrowdtestQuestion.newValue !== null);
    }
  });
}

let modelDropdownElement = null;

  // Create and inject the Quick Bar UI
  function createQuickBar() {
    if (quickBarElement) return;

  const style = document.createElement('style');
  style.textContent = `
    .turing-arena-quickbar {
      position: absolute;
      z-index: 2147483647; /* Max z-index */
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0,0,0,0.05);
      display: flex;
      align-items: center;
      padding: 4px;
      gap: 4px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      transition: opacity 0.15s ease-in-out, transform 0.15s ease-in-out;
      opacity: 0;
      transform: translateY(10px) scale(0.95);
      pointer-events: none;
    }
    
    .turing-arena-quickbar.visible {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }

    .ta-qb-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      border: none;
      background: transparent;
      cursor: pointer;
      color: #4B5563;
      transition: background-color 0.2s, color 0.2s;
      position: relative;
    }

    /* Custom Tooltip */
    .turing-arena-quickbar .ta-qb-btn[data-tooltip]:hover::after {
      content: attr(data-tooltip);
      position: absolute;
      bottom: calc(100% + 6px);
      left: 50%;
      transform: translateX(-50%);
      background: #111827; /* Dark background */
      color: #F9FAFB; /* Light text */
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 4px;
      white-space: nowrap;
      pointer-events: none;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      z-index: 10;
      opacity: 1;
      font-weight: 500;
    }
    
    .turing-arena-quickbar .ta-qb-btn[data-tooltip]:hover::before {
      content: '';
      position: absolute;
      bottom: calc(100% + 2px);
      left: 50%;
      transform: translateX(-50%);
      border-width: 4px;
      border-style: solid;
      border-color: #111827 transparent transparent transparent;
      pointer-events: none;
      z-index: 10;
    }

    .ta-qb-btn:hover {
      background-color: #F3F4F6;
      color: #111827;
    }
    
    .ta-qb-btn.primary {
      color: #6366F1; /* Indigo/Purple theme */
    }
    
    .ta-qb-btn.primary:hover {
      background-color: #EEF2FF;
      color: #4F46E5;
    }

    .ta-qb-divider {
      width: 1px;
      height: 16px;
      background-color: #E5E7EB;
      margin: 0 4px;
    }
    
    .ta-qb-btn svg {
      width: 18px;
      height: 18px;
    }
    
    /* Disable Menu Popup */
    .ta-qb-disable-menu {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 8px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05);
      display: none;
      flex-direction: column;
      min-width: 120px;
      padding: 4px;
      z-index: 2147483647;
    }
    
    .ta-qb-disable-menu.visible {
      display: flex;
    }
    
    .ta-qb-disable-item {
      padding: 8px 12px;
      font-size: 13px;
      color: #374151;
      cursor: pointer;
      border-radius: 4px;
      text-align: left;
      border: none;
      background: transparent;
      transition: background-color 0.2s;
    }
    
    .ta-qb-disable-item:hover {
      background-color: #F3F4F6;
      color: #111827;
    }
    
    /* Ask AI Input Popup */
    .turing-arena-ask-popup {
      position: absolute;
      z-index: 2147483647;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0,0,0,0.05);
      width: 400px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: none;
      flex-direction: column;
      overflow: hidden;
      padding: 12px 16px;
    }

    .ta-ap-selected-text {
      font-size: 13px;
      color: #6B7280;
      margin-bottom: 12px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ta-ap-input-container {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .ta-ap-model-selector {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      background-color: #F9FAFB;
      border-radius: 16px;
      font-size: 13px;
      color: #111827;
      cursor: pointer;
    }
    
    .ta-ap-model-selector svg {
      width: 14px;
      height: 14px;
      color: #6366F1;
    }
    
    .ta-ap-input {
      flex: 1;
      border: none;
      outline: none;
      font-size: 14px;
      color: #111827;
      padding: 8px 0;
    }
    
    .ta-ap-input::placeholder {
      color: #9CA3AF;
    }
    
    .ta-ap-send-btn {
      background: none;
      border: none;
      color: #6366F1;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
    }
    .ta-ap-send-btn:hover { color: #4F46E5; }
    
    /* Result Popup for Translate/Explain */
    .turing-arena-result-popup {
      position: absolute;
      z-index: 2147483647;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0,0,0,0.05);
      width: 360px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: none;
      flex-direction: column;
      overflow: hidden;
    }
    
    .ta-rp-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid transparent;
    }
    
    .ta-rp-title {
      font-size: 15px;
      font-weight: 600;
      color: #111827;
      margin: 0;
    }
    
    .ta-rp-actions {
      display: flex;
      gap: 8px;
    }
    
    .ta-rp-icon-btn {
      background: none;
      border: none;
      color: #6B7280;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      display: flex;
    }
    
    .ta-rp-icon-btn:hover { background-color: #F3F4F6; color: #111827; }
    .ta-rp-icon-btn svg { width: 16px; height: 16px; }
    
    .ta-rp-body {
      padding: 0 16px 16px 16px;
      max-height: 300px;
      overflow-y: auto;
      overscroll-behavior: contain;
    }
    
    .ta-rp-body::-webkit-scrollbar {
      width: 6px;
    }
    .ta-rp-body::-webkit-scrollbar-track {
      background: transparent;
    }
    .ta-rp-body::-webkit-scrollbar-thumb {
      background-color: #D1D5DB;
      border-radius: 3px;
    }
    
    .ta-rp-original {
      font-size: 12px;
      color: #6B7280;
      padding: 8px 12px;
      border: 1px solid #E5E7EB;
      border-radius: 8px;
      margin-bottom: 12px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .ta-rp-content {
      font-size: 14px;
      color: #111827;
      line-height: 1.5;
      margin-bottom: 16px;
      min-height: 40px;
    }
    
    .ta-rp-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background-color: #F9FAFB;
      border-top: 1px solid #F3F4F6;
    }
    
    .ta-rp-footer-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      background: white;
      border: 1px solid #E5E7EB;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      color: #4B5563;
      cursor: pointer;
    }
    .ta-rp-footer-btn:hover { background-color: #F3F4F6; }
    
    .ta-rp-footer-btn.primary {
      color: #6366F1;
      border-color: #EEF2FF;
      background-color: #F5F3FF;
    }
    .ta-rp-footer-btn.primary:hover { background-color: #E0E7FF; }
    
    /* Loading Spinner */
    .ta-spinner {
      animation: ta-spin 1s linear infinite;
      width: 20px;
      height: 20px;
      border: 2px solid #E5E7EB;
      border-top-color: #6366F1;
      border-radius: 50%;
      margin: 10px auto;
    }
    @keyframes ta-spin { 100% { transform: rotate(360deg); } }

    /* Model Selector Dropdown */
    .ta-model-dropdown {
      position: absolute;
      z-index: 2147483648;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0,0,0,0.05);
      width: 200px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: none;
      flex-direction: column;
      overflow-y: auto;
      max-height: 400px;
      padding: 6px 0;
    }
    .ta-model-dropdown.visible {
      display: flex;
    }
    .ta-model-group-title {
      font-size: 11px;
      font-weight: 600;
      color: #9CA3AF;
      padding: 6px 12px 2px 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .ta-model-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 12px;
      cursor: pointer;
      color: #111827;
      font-size: 13px;
      transition: background-color 0.15s;
      margin: 1px 6px;
      border-radius: 6px;
    }
    .ta-model-item:hover {
      background-color: #F3F4F6;
    }
    .ta-model-item.active {
      background-color: #EEF2FF;
      color: #4F46E5;
    }
    .ta-model-icon {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }
    .ta-model-item-details {
      display: flex;
      flex-direction: column;
    }
    .ta-model-item-desc {
      font-size: 11px;
      color: #9CA3AF;
      margin-top: 2px;
    }
  `;
  document.head.appendChild(style);

  // 1. Quick Bar DOM
  quickBarElement = document.createElement('div');
  quickBarElement.className = 'turing-arena-quickbar';
  
  // Turing Arena Logo (Ask AI)
  const askAiBtn = document.createElement('button');
  askAiBtn.className = 'ta-qb-btn primary';
  askAiBtn.setAttribute('data-tooltip', '问问AI');
  askAiBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4L4 18H20L12 4Z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="12" cy="13" r="3.5" fill="currentColor"/>
    </svg>
  `;
  
  // Copy
  const copyBtn = document.createElement('button');
  copyBtn.className = 'ta-qb-btn';
  copyBtn.setAttribute('data-tooltip', '复制');
  copyBtn.innerHTML = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>`;

  // Annotate (Crowdtest only)
  const annotateBtn = document.createElement('button');
  annotateBtn.className = 'ta-qb-btn primary';
  annotateBtn.setAttribute('data-tooltip', '批注');
  annotateBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
  `;
  annotateBtn.style.display = 'none'; // Hidden by default

  // Translate
  const translateBtn = document.createElement('button');
  translateBtn.className = 'ta-qb-btn';
  translateBtn.setAttribute('data-tooltip', '翻译/解释');
  translateBtn.innerHTML = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path></svg>`;

  // Divider
  const divider = document.createElement('div');
  divider.className = 'ta-qb-divider';

  // Close
  const closeBtn = document.createElement('button');
  closeBtn.className = 'ta-qb-btn';
  closeBtn.setAttribute('data-tooltip', '关闭');
  closeBtn.innerHTML = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;

  // Disable Menu
  const disableMenu = document.createElement('div');
  disableMenu.className = 'ta-qb-disable-menu';
  disableMenu.innerHTML = `
    <button class="ta-qb-disable-item" data-duration="1">禁用1天</button>
    <button class="ta-qb-disable-item" data-duration="7">禁用7天</button>
    <button class="ta-qb-disable-item" data-duration="-1">永久禁用</button>
  `;
  closeBtn.appendChild(disableMenu);

  quickBarElement.appendChild(askAiBtn);
  quickBarElement.appendChild(annotateBtn);
  quickBarElement.appendChild(copyBtn);
  quickBarElement.appendChild(translateBtn);
  quickBarElement.appendChild(divider);
  quickBarElement.appendChild(closeBtn);

  document.body.appendChild(quickBarElement);

  // 1.5 Ask Popup DOM
  askPopupElement = document.createElement('div');
  askPopupElement.className = 'turing-arena-ask-popup';
  askPopupElement.innerHTML = `
    <div class="ta-ap-header" style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 8px; margin-bottom: 8px; border-bottom: 1px solid #E5E7EB;">
      <span style="font-size: 14px; font-weight: 600; color: #111827;">问问 AI</span>
      <button class="ta-ap-close-btn" style="background: none; border: none; color: #6B7280; cursor: pointer; padding: 2px;"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width:16px;height:16px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
    </div>
    <div class="ta-ap-selected-text" id="taApSelectedText"></div>
    <div class="ta-ap-input-container">
      <div class="ta-ap-model-selector" style="cursor: default; pointer-events: none;">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 4L4 18H20L12 4Z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><circle cx="12" cy="13" r="3.5" fill="currentColor"/></svg>
      </div>
      <input type="text" class="ta-ap-input" id="taApInput" placeholder="让AI基于选中文本回答..." autocomplete="off" />
      <button class="ta-ap-send-btn" id="taApSendBtn" style="cursor: pointer;">
        <svg viewBox="0 0 24 24" fill="currentColor" style="width:20px;height:20px; pointer-events: none;"><path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" /></svg>
      </button>
    </div>
  `;
  document.body.appendChild(askPopupElement);

  // 1.6 Annotate Popup DOM
  annotatePopupElement = document.createElement('div');
  annotatePopupElement.className = 'turing-arena-ask-popup';
  annotatePopupElement.innerHTML = `
    <div class="ta-ap-header" style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 8px; margin-bottom: 8px; border-bottom: 1px solid #E5E7EB;">
      <span style="font-size: 14px; font-weight: 600; color: #111827; display: flex; align-items: center; gap: 8px;">
        添加批注
        <div style="display:flex; align-items:center; gap:4px; font-weight:normal;">
          <span style="font-size:12px; color:#6B7280;">第</span>
          <input type="number" id="taApRoundSelect" value="1" min="1" style="width:40px; height:24px; font-size:12px; text-align:center; border:1px solid #E5E7EB; border-radius:4px; outline:none; padding:0; margin:0; cursor:text; background:#fff; color:#111827; pointer-events: auto;" />
          <span style="font-size:12px; color:#6B7280;">轮</span>
        </div>
      </span>
      <button class="ta-ap-close-btn" id="taAnCloseBtn" style="background: none; border: none; color: #6B7280; cursor: pointer; padding: 2px;"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width:16px;height:16px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
    </div>
    <div class="ta-ap-selected-text" id="taAnSelectedText"></div>
    <div class="ta-ap-input-container" style="position: relative;">
      <textarea class="ta-ap-input" id="taAnInput" placeholder="输入批注内容..." style="resize: vertical; min-height: 60px; padding: 10px 40px 10px 10px; border: 1px solid #E5E7EB; border-radius: 8px; width: 100%; box-sizing: border-box;"></textarea>
      <button class="ta-ap-send-btn" id="taAnSendBtn" style="position: absolute; right: 8px; bottom: 8px; z-index: 10; cursor: pointer;">
        <svg viewBox="0 0 24 24" fill="currentColor" style="width:20px;height:20px; pointer-events: none;"><path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" /></svg>
      </button>
    </div>
  `;
  document.body.appendChild(annotatePopupElement);

  // 2. Result Popup DOM
  resultPopupElement = document.createElement('div');
  resultPopupElement.className = 'turing-arena-result-popup';
  resultPopupElement.innerHTML = `
    <div class="ta-rp-header">
      <h3 class="ta-rp-title">翻译 / 解释</h3>
      <div class="ta-rp-actions">
        <button class="ta-rp-icon-btn" id="taRpClose"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
      </div>
    </div>
    <div class="ta-rp-body">
      <div class="ta-rp-original" id="taRpOriginal"></div>
      <div class="ta-rp-content" id="taRpContent">
        <div class="ta-spinner"></div>
      </div>
      <div style="font-size: 12px; color: #9CA3AF;">By Turing</div>
    </div>
    <div class="ta-rp-footer">
      <button class="ta-rp-footer-btn primary" id="taRpChatBtn">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:14px;height:14px;"><path d="M12 4L4 18H20L12 4Z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><circle cx="12" cy="13" r="3.5" fill="currentColor"/></svg>
        继续对话
      </button>
      <div style="display:flex; gap:8px;">
        <button class="ta-rp-footer-btn" id="taRpCopyBtn">复制 <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width:14px;height:14px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg></button>
      </div>
    </div>
  `;
  document.body.appendChild(resultPopupElement);

  // --- Draggable Setup ---
  function makeDraggable(element, handle) {
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    handle.style.cursor = 'move';

    handle.addEventListener('mousedown', (e) => {
            // Don't drag if clicking on a button, input, select, textarea, link, or inside scrollable body
            if (e.target.closest('button') || e.target.closest('input') || e.target.closest('select') || e.target.closest('textarea') || e.target.closest('a') || e.target.closest('.ta-rp-body') || e.target.closest('.ta-ap-input-container')) return;
            
            // Also don't drag if user is selecting text
            if (window.getSelection().toString().length > 0) return;
            
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            
            // Parse exact current pixel values instead of using getBoundingClientRect
            // which can be unreliable if user scrolled
            initialLeft = parseFloat(element.style.left) || 0;
            initialTop = parseFloat(element.style.top) || 0;
            
            // Prevent text selection while dragging
            e.preventDefault();
          });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      
      element.style.left = `${initialLeft + dx}px`;
      element.style.top = `${initialTop + dy}px`;
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }

  // Instead of just headers, use the whole elements
  makeDraggable(resultPopupElement, resultPopupElement);
  makeDraggable(askPopupElement, askPopupElement);
  makeDraggable(annotatePopupElement, annotatePopupElement);

  // Scroll lock for result popup
  resultPopupElement.addEventListener('wheel', (e) => {
    const body = e.target.closest('.ta-rp-body');
    if (body) {
      const isAtTop = body.scrollTop === 0;
      const isAtBottom = body.scrollHeight - body.scrollTop <= body.clientHeight + 1;
      
      if ((e.deltaY < 0 && isAtTop) || (e.deltaY > 0 && isAtBottom)) {
        e.preventDefault(); // Prevent scrolling the page when at the edge of the popup
      }
      // Stop propagation to prevent document scrolling
      e.stopPropagation();
    } else {
      // If scrolling on header/footer, prevent page scroll
      e.preventDefault();
    }
  }, { passive: false });

  // --- Event Listeners for Quick Bar (Event Delegation) ---
  
  // Prevent mousedown from clearing the text selection
  quickBarElement.addEventListener('mousedown', (e) => {
    e.preventDefault();
    e.stopPropagation();
  });

  quickBarElement.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const item = e.target.closest('.ta-qb-disable-item');
    if (item) {
      const duration = parseInt(item.getAttribute('data-duration'), 10);
      let disableUntil = 0;
      
      if (duration === -1) {
        disableUntil = Date.now() + 100 * 365 * 24 * 60 * 60 * 1000;
      } else {
        disableUntil = Date.now() + duration * 24 * 60 * 60 * 1000;
      }
      
      if (typeof chrome !== 'undefined' && chrome.storage) {
        try {
          chrome.storage.local.set({ 'quickbarDisableUntil': disableUntil }, () => {
            hideQuickBar();
          });
        } catch (err) {
          console.warn("Turing Arena Probe: Context invalidated.", err);
          hideQuickBar();
        }
      } else {
        hideQuickBar();
      }
      return;
    }

    const btn = e.target.closest('.ta-qb-btn');
    if (!btn) return;

    const action = btn.getAttribute('data-tooltip');
    if (action === '问问AI') {
      showAskPopup();
    } else if (action === '批注') {
      showAnnotatePopup();
    } else if (action === '复制') {
      navigator.clipboard.writeText(currentSelectionText).then(() => hideQuickBar());
    } else if (action === '翻译/解释') {
      if (chrome.runtime?.id) {
        chrome.runtime.sendMessage({ action: 'checkLoginState' }, (response) => {
          if (response && response.isLoggedIn) {
            showResultPopup("翻译 / 解释", currentSelectionText, true);
          } else {
            chrome.runtime.sendMessage({ action: 'openLoginModal' });
            hideQuickBar();
          }
        });
      }
    } else if (action === '关闭') {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        try {
          chrome.storage.local.get(['activeCrowdtestQuestion'], (res) => {
            if (chrome.runtime.lastError) {
              console.warn("Turing Arena Probe: context invalidated (lastError).");
              hideQuickBar();
              return;
            }
            const isTargetSite = window.location.hostname.includes('doubao.com') || window.location.hostname.includes('deepseek.com');
            const isTesting = isTargetSite && res.activeCrowdtestQuestion !== undefined && res.activeCrowdtestQuestion !== null;
            if (isTesting) {
              hideQuickBar();
            } else {
              const disableMenu = btn.querySelector('.ta-qb-disable-menu');
              if (disableMenu) {
                disableMenu.classList.toggle('visible');
              } else {
                hideQuickBar();
              }
            }
          });
        } catch (err) {
          console.warn("Turing Arena Probe: context invalidated (exception).", err);
          hideQuickBar();
        }
      } else {
        hideQuickBar();
      }
    }
  });

  // --- Event Listeners for Ask Popup ---
  
  const inputEl = askPopupElement.querySelector('.ta-ap-input');
  const sendBtn = askPopupElement.querySelector('.ta-ap-send-btn');
  const apCloseBtn = askPopupElement.querySelector('.ta-ap-close-btn');

  let isSending = false;

  const sendAskAi = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (isSending) return;
    isSending = true;
    setTimeout(() => { isSending = false; }, 500); // debounce for 500ms
    
    let promptText = inputEl.value.trim();
    if (!promptText) {
      // If user didn't type anything, use a generic prompt
      promptText = "请解释这段文字";
    }
    
    // Check login state first via background script
    if (typeof chrome !== 'undefined' && chrome.runtime?.id) {
      try {
        chrome.runtime.sendMessage({ action: 'checkLoginState' }).then((response) => {
          if (response && response.isLoggedIn) {
            showResultPopup(promptText, currentSelectionText, false);
            inputEl.value = ''; // clear
          } else {
            // If not logged in, tell background to open sidebar and trigger login modal
            chrome.runtime.sendMessage({ action: 'openLoginModal' }).catch(() => {});
            hideAskPopup();
            hideQuickBar();
          }
        }).catch((err) => {
          console.error("Turing Arena Probe:", err);
          alert("插件通信失败，请刷新当前页面重试。");
        });
      } catch (err) {
        console.error("Extension context invalidated. Please refresh the page.", err);
        alert("插件已更新，请刷新当前页面以继续使用。");
      }
    } else {
      console.error("Extension context invalidated. Please refresh the page.");
      alert("插件已更新，请刷新当前页面以继续使用。");
    }
  };

  // Trigger on click and mousedown for robustness
  sendBtn.addEventListener('click', sendAskAi);
  sendBtn.addEventListener('mousedown', (e) => {
    e.preventDefault(); // Prevent focus loss
    sendAskAi(e);
  });
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendAskAi();
    }
  });

  if (apCloseBtn) {
    apCloseBtn.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      hideAskPopup();
    });
  }

  askPopupElement.addEventListener('mousedown', (e) => {
    e.stopPropagation();
  });

  // --- Event Listeners for Annotate Popup ---
  const anInputEl = annotatePopupElement.querySelector('.ta-ap-input');
  const anRoundSelect = annotatePopupElement.querySelector('#taApRoundSelect');

  // Fix dropdown clickability issue caused by draggable popup
  if (anRoundSelect) {
    anRoundSelect.addEventListener('mousedown', (e) => {
      e.stopPropagation(); // Prevent drag from starting
    });
    anRoundSelect.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  const anSendBtn = annotatePopupElement.querySelector('#taAnSendBtn');
  const anCloseBtn = annotatePopupElement.querySelector('#taAnCloseBtn');

  const sendAnnotate = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const promptText = anInputEl.value.trim();
    if (!promptText) return;
    
    // Read round from dropdown instead of re-inferring
    let finalRound = 1;
    if (anRoundSelect) {
      finalRound = parseInt(anRoundSelect.value, 10);
    }

    // Check login state first via background script
    if (chrome.runtime?.id) {
      // 1. Verify prompt consistency first
      chrome.storage.local.get(['activeCrowdtestQuestion', 'currentRoundCount'], (res) => {
        if (chrome.runtime.lastError) return;
        
        const q = res.activeCrowdtestQuestion;
        
        // 2. Proceed with login check and annotation
        chrome.runtime.sendMessage({ action: 'checkLoginState' }).then((response) => {
          if (response && response.isLoggedIn) {
            // Identify source, fallback to doubao for testing on localhost or other domains
            let source = 'doubao';
            if (window.location.hostname.includes('deepseek.com')) source = 'deepseek';

            // Send to sidebar/background
            const annotationId = annotatePopupElement.getAttribute('data-annotation-id');
            const contentType = annotatePopupElement.getAttribute('data-content-type') || 'reply';
            
            chrome.runtime.sendMessage({
              action: 'addAnnotation',
              data: {
                id: annotationId,
                selectedText: currentSelectionText,
                annotation: promptText,
                source: source,
                contentType: contentType,
                round: finalRound // Use the round selected by the user
              }
            }).catch(() => {});
            
            // Set flag so sidebar knows to scroll to it
            chrome.storage.local.set({ lastAddedAnnotationId: annotationId });

            // Make the temporary highlight permanent
            const tempHighlights = document.querySelectorAll('.ta-temp-highlight');
            tempHighlights.forEach(el => {
              el.classList.remove('ta-temp-highlight');
            });

            hideAnnotatePopup();
            anInputEl.value = ''; // clear
          } else {
            // If not logged in, tell background to open sidebar and trigger login modal
            chrome.runtime.sendMessage({ action: 'openLoginModal' }).catch(() => {});
            hideAnnotatePopup();
            hideQuickBar();
          }
        }).catch((err) => {
          console.error("Turing Arena Probe:", err);
          alert("插件通信失败，请刷新当前页面重试。");
        });
      });
    } else {
      console.error("Extension context invalidated. Please refresh the page.");
      alert("插件已更新，请刷新当前页面以继续使用。");
    }
  };

  anSendBtn.addEventListener('click', sendAnnotate);
  anSendBtn.addEventListener('mousedown', (e) => {
    e.preventDefault(); // Prevent focus loss and ensure it fires before click is swallowed
    sendAnnotate(e);
  });
  anInputEl.addEventListener('keydown', (e) => {
    // For textarea, enter should create new line, shift+enter or ctrl+enter to send
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendAnnotate();
    }
  });

  if (anCloseBtn) {
    anCloseBtn.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      hideAnnotatePopup();
    });
  }

  annotatePopupElement.addEventListener('mousedown', (e) => {
    e.stopPropagation();
  });

  // --- Event Listeners for Result Popup ---
  
  const rpCloseBtn = resultPopupElement.querySelector('#taRpClose');
  const rpCopyBtn = resultPopupElement.querySelector('#taRpCopyBtn');
  const rpChatBtn = resultPopupElement.querySelector('#taRpChatBtn');

// ----------------------------------------------------
// Listen for messages from background/sidebar
// ----------------------------------------------------
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scanFullChatHistory') {
    // If window.extractFirstUserPromptOnPage is not available due to old context, fallback to inline extraction
    let history = [];
    if (typeof window.extractFirstUserPromptOnPage === 'function') {
      history = window.extractFirstUserPromptOnPage();
    } else {
      const doubaoUserBubbles = document.querySelectorAll('div[data-message-role="user"]');
      if (doubaoUserBubbles && doubaoUserBubbles.length > 0) {
        doubaoUserBubbles.forEach(el => history.push(el.innerText || el.textContent));
      } else {
        const deepseekUserBubbles = document.querySelectorAll('.f6004764, div[class*="user" i]');
        if (deepseekUserBubbles && deepseekUserBubbles.length > 0) {
          deepseekUserBubbles.forEach(el => {
            const text = el.innerText || el.textContent;
            if (text && text.trim().length > 0) history.push(text);
          });
        }
      }
    }
    sendResponse({ history: history });
    return true;
  }
  
  if (request.action === 'locateAnnotation') {
    let found = false;
    
    // Helper function to animate scroll and flash
    const highlightAndScroll = (el) => {
      // 1. Native scroll
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // 2. Deepseek/Doubao specific container scroll
      // Because scrollIntoView sometimes fails in complex overflow containers
      setTimeout(() => {
        let parent = el.parentElement;
        while (parent && parent !== document.body) {
          try {
            const style = window.getComputedStyle(parent);
            if (style.overflowY === 'auto' || style.overflowY === 'scroll' || style.overflowY === 'overlay') {
              const elRect = el.getBoundingClientRect();
              const parentRect = parent.getBoundingClientRect();
              // Scroll to center
              const scrollTop = parent.scrollTop + (elRect.top - parentRect.top) - (parentRect.height / 2) + (elRect.height / 2);
              parent.scrollTo({
                top: scrollTop,
                behavior: 'smooth'
              });
            }
          } catch(e) {}
          parent = parent.parentElement;
        }
      }, 50);

      const originalBg = el.style.backgroundColor;
      const originalColor = el.style.color;
      const originalTransition = el.style.transition;
      
      el.style.transition = 'background-color 0.3s, color 0.3s';
      el.style.backgroundColor = '#EF4444'; // Red flash for better visibility
      el.style.color = '#FFFFFF';
      
      setTimeout(() => { 
        el.style.backgroundColor = originalBg; 
        el.style.color = originalColor;
        setTimeout(() => {
          el.style.transition = originalTransition;
        }, 300);
      }, 1500);
      found = true;
    };

    // 1. Try to find by ID
    if (request.id) {
      const el = document.getElementById(request.id);
      if (el) {
        highlightAndScroll(el);
        sendResponse({success: true});
        return;
      }
    }
    
    // 2. Try to find by text if ID fails (e.g. fallback hiliteColor or older annotations)
    if (!found && request.text) {
      // Clean up text
      const cleanText = request.text.replace(/\s+/g, ' ').trim();
      
      // Find elements with ta-annotation-highlight or mark tags
      const marks = Array.from(document.querySelectorAll('mark, .ta-annotation-highlight, font[style*="background-color: yellow"]'));
      for (const mark of marks) {
        if (mark.textContent.includes(request.text) || request.text.includes(mark.textContent) || 
            mark.textContent.replace(/\s+/g, ' ').includes(cleanText)) {
          highlightAndScroll(mark);
          sendResponse({success: true});
          return;
        }
      }
      
      // 3. By window.find (try full text, then partial chunk)
      // window.find is robust for cross-node text finding
      const chunks = [
        request.text, 
        cleanText,
        cleanText.substring(0, 30) // try first 30 chars as fallback
      ];
      
      for (const chunk of chunks) {
        if (!chunk) continue;
        const selection = window.getSelection();
        selection.removeAllRanges();
        
        // Move focus to top before searching to search from beginning
        if (window.find(chunk, false, false, true, false, true, false)) {
            const range = selection.getRangeAt(0);
            let el = range.commonAncestorContainer;
            if (el.nodeType === 3) el = el.parentElement; // Get the element wrapping the text node
            
            highlightAndScroll(el);
            selection.removeAllRanges();
            sendResponse({success: true});
            return;
        }
      }
      
      // 4. TreeWalker fallback (last resort)
      const searchText = cleanText.substring(0, 20).trim();
      if (searchText) {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while (node = walker.nextNode()) {
            if (node.nodeValue.includes(searchText)) {
                highlightAndScroll(node.parentElement);
                sendResponse({success: true});
                return;
            }
        }
      }
    }
    sendResponse({success: false, reason: 'not_found'});
  } else if (request.action === 'removeHighlight') {
    if (request.id) {
      // Find elements by exact ID
      let els = Array.from(document.querySelectorAll(`[id="${request.id}"]`));
      
      // Fallback: if we can't find by ID (e.g. after refresh), try finding the highlight class
      // Note: without ID, we can't be 100% sure it's the exact one, but we try our best 
      // if text is provided. Since removeHighlight from sidebar only gives ID right now,
      // we'll rely on the ID matching logic or clean up orphaned ta-annotation-highlight elements
      // that match the ID.
      if (els.length === 0) {
        const fallbackMarks = document.querySelectorAll(`mark.ta-annotation-highlight, font.ta-annotation-highlight`);
        fallbackMarks.forEach(mark => {
          if (mark.id === request.id) {
            els.push(mark);
          }
        });
      }

      els.forEach(el => {
        // If it's a mark or font tag we created, unwrap it
        if (el.tagName.toLowerCase() === 'mark' || el.tagName.toLowerCase() === 'font') {
          const parent = el.parentNode;
          while (el.firstChild) {
            parent.insertBefore(el.firstChild, el);
          }
          parent.removeChild(el);
        } else {
          // If it was attached to an existing element somehow, just remove our classes and inline styles
          el.classList.remove('ta-annotation-highlight');
          el.style.backgroundColor = '';
          if (el.style.length === 0) el.removeAttribute('style');
          el.removeAttribute('id');
        }
      });
      sendResponse({success: true});
    }
  }
});

  // Instead of attaching click to rpChatBtn, attach mousedown to capture it before the drag logic prevents default
  rpChatBtn.addEventListener('mousedown', (e) => {
    // Stop propagation so the drag logic doesn't catch it and call e.preventDefault()
    e.stopPropagation();
  });
  
  rpChatBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Stop propagation just in case
    try {
      const title = resultPopupElement.querySelector('.ta-rp-title').textContent;
      const originalText = resultPopupElement.querySelector('#taRpOriginal').innerText;
      const contentBox = resultPopupElement.querySelector('#taRpContent');
      const isThinking = contentBox.querySelector('.ta-spinner') !== null;
      const aiResponse = isThinking ? '' : contentBox.innerText;

      let userMessage = originalText;
      let isTranslate = false;
      if (title !== "翻译 / 解释") {
        userMessage = `${title}`;
      } else {
        userMessage = `请翻译或解释这段文字`;
        isTranslate = true;
      }

      hideResultPopup();

      if (!chrome.runtime?.id) return;
      chrome.runtime.sendMessage({ 
        action: 'openSidePanelAndChat',
        chatHistory: {
          user: userMessage,
          ai: aiResponse,
          quoteText: originalText,
          isThinking: isThinking,
          title: title,
          isTranslate: isTranslate
        }
      });
    } catch (err) {
      console.warn('Error in rpChatBtn click:', err);
    }
  });

  rpCloseBtn.addEventListener('mousedown', (e) => e.stopPropagation());
  rpCloseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    hideResultPopup();
  });

  rpCopyBtn.addEventListener('mousedown', (e) => e.stopPropagation());
  rpCopyBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const content = resultPopupElement.querySelector('#taRpContent').innerText;
    navigator.clipboard.writeText(content);
    rpCopyBtn.innerHTML = '已复制 ✓';
    setTimeout(() => {
      rpCopyBtn.innerHTML = '复制 <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width:14px;height:14px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>';
    }, 2000);
  });

  resultPopupElement.addEventListener('mousedown', (e) => {
    e.stopPropagation();
  });
}

function showQuickBar(x, y) {
  if (!quickBarElement) createQuickBar();
  
  // Toggle Annotate Button Visibility
  const annotateBtn = quickBarElement.querySelector('.ta-qb-btn[data-tooltip="批注"]');
  if (annotateBtn) {
    const isTargetSite = window.location.hostname.includes('doubao.com') || window.location.hostname.includes('deepseek.com');
    if (isTargetSite) {
      // Fetch crowdtest state from storage on demand just to be sure it's fresh
      try {
        chrome.storage.local.get(['activeCrowdtestQuestion'], (result) => {
          if (result && result.activeCrowdtestQuestion) {
            annotateBtn.style.display = 'flex';
          } else {
            annotateBtn.style.display = 'none';
          }
        });
      } catch (err) {
        console.warn("Turing Arena: Extension context invalidated, hiding annotate btn.", err);
        annotateBtn.style.display = 'none';
      }
    } else {
      annotateBtn.style.display = 'none';
    }
  }
  
  // Make sure it doesn't go off the right edge of the screen
  const quickBarWidth = 140; // Approximate width of quick bar
  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;
  
  let leftPos = x + 5;
  let topPos = y + 15;
  
  if (leftPos + quickBarWidth > window.innerWidth + scrollX) {
    leftPos = window.innerWidth + scrollX - quickBarWidth - 10;
  }
  
  // Make sure it doesn't go off the bottom edge
  if (topPos + 40 > window.innerHeight + scrollY) {
    // Show above the selection if no space below
    topPos = y - 40; 
  }
  
  quickBarElement.style.left = `${leftPos}px`;
  quickBarElement.style.top = `${topPos}px`;
  quickBarElement.classList.add('visible');
  
  hideResultPopup(); 
  hideAskPopup();
}

function hideQuickBar() {
  if (quickBarElement) {
    quickBarElement.classList.remove('visible');
    const disableMenu = quickBarElement.querySelector('.ta-qb-disable-menu');
    if (disableMenu) {
      disableMenu.classList.remove('visible');
    }
  }
}

function showAskPopup() {
  if (!askPopupElement) return;
  
  const qbRect = quickBarElement.getBoundingClientRect();
  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;
  
  const popupWidth = 400;
  const popupHeight = 150; // Estimated height of ask popup
  
  let topPos = qbRect.bottom + scrollY + 10;
  let leftPos = qbRect.left + scrollX;
  
  // Horizontal bounds check
  if (leftPos + popupWidth > window.innerWidth + scrollX) {
    leftPos = window.innerWidth + scrollX - popupWidth - 10;
  }
  
  // Vertical bounds check (if it goes off bottom, show above quick bar)
  if (topPos + popupHeight > window.innerHeight + scrollY) {
    topPos = qbRect.top + scrollY - popupHeight - 10;
    // If it still goes off top, just force it into view
    if (topPos < scrollY) {
      topPos = scrollY + 10;
    }
  }
  
  askPopupElement.style.left = `${leftPos}px`;
  askPopupElement.style.top = `${topPos}px`;
  askPopupElement.style.display = 'flex';
  
  hideQuickBar();
  hideResultPopup();
  hideAnnotatePopup();
  
  askPopupElement.querySelector('#taApSelectedText').textContent = currentSelectionText;
  askPopupElement.querySelector('#taApInput').focus();
}

function hideAskPopup() {
  if (askPopupElement) {
    askPopupElement.style.display = 'none';
  }
}

function showAnnotatePopup() {
  if (!annotatePopupElement) return;
  
  // Calculate inferred round immediately before showing
  let inferredRound = null;
  try {
    if (currentSelectionRange) {
      let node = currentSelectionRange.commonAncestorContainer;
      if (node.nodeType === 3) node = node.parentNode;
      
      const isDoubao = window.location.hostname.includes('doubao.com');
      const isDeepseek = window.location.hostname.includes('deepseek.com');
      
      if (isDoubao) {
        const allUserMsgs = Array.from(document.querySelectorAll('div[data-message-role="user"], div[class*="message-user" i]:not([class*="message-assistant" i]), div[class*="user-message" i]:not([class*="assistant-message" i])'));
        console.log(`[Turing Arena] Found ${allUserMsgs.length} Doubao user messages for inference.`);
        if (allUserMsgs.length > 0) {
          inferredRound = allUserMsgs.length; // Default to last round if something goes wrong
          let foundPreceding = false;
          for (let i = 0; i < allUserMsgs.length; i++) {
            const position = node.compareDocumentPosition(allUserMsgs[i]);
            if (allUserMsgs[i].contains(node)) {
              inferredRound = i + 1;
              foundPreceding = true;
              break;
            } else if (position & Node.DOCUMENT_POSITION_PRECEDING) {
              inferredRound = i + 1;
              foundPreceding = true;
            }
          }
          if (!foundPreceding && allUserMsgs.length > 0) {
             inferredRound = allUserMsgs.length; // Default to last round
          }
        }
      } else if (isDeepseek) {
        const userElements = Array.from(document.querySelectorAll('.f6004764, div[class*="user" i]:not([class*="assistant" i])'));
        console.log(`[Turing Arena] Found ${userElements.length} Deepseek user messages for inference.`);
        if (userElements.length > 0) {
          inferredRound = userElements.length; // Default to last round
          let foundPreceding = false;
          for (let i = 0; i < userElements.length; i++) {
            const position = node.compareDocumentPosition(userElements[i]);
            if (userElements[i].contains(node)) {
              inferredRound = i + 1;
              foundPreceding = true;
              break;
            } else if (position & Node.DOCUMENT_POSITION_PRECEDING) {
              inferredRound = i + 1;
              foundPreceding = true;
            }
          }
          if (!foundPreceding && userElements.length > 0) {
             inferredRound = userElements.length; // Default to last round
          }
        }
      }
      console.log(`[Turing Arena] Final Inferred Round: ${inferredRound}`);
    }
  } catch (err) {
    console.warn('Round inference failed before showing popup.', err);
  }

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.runtime?.id) {
    chrome.storage.local.get(['activeCrowdtestQuestion'], (res) => {
      if (chrome.runtime.lastError) return;
      const q = res.activeCrowdtestQuestion;
      
      let modelRounds = 1;
      const isDoubao = window.location.hostname.includes('doubao.com');
      const modelKey = isDoubao ? 'doubao' : 'deepseek';
      
      if (q && q.savedPrompts) {
        if (Array.isArray(q.savedPrompts)) {
          modelRounds = Math.max(q.savedPrompts.length, 1);
        } else if (q.savedPrompts[modelKey]) {
          modelRounds = Math.max(q.savedPrompts[modelKey].length, 1);
        }
      }
      
      // Trust the DOM's physical structure if it has more rounds than our stored state
      if (inferredRound !== null) {
        modelRounds = Math.max(modelRounds, inferredRound);
      }
      
      // Setup the round dropdown
      const anRoundSelect = annotatePopupElement.querySelector('#taApRoundSelect');
      if (anRoundSelect) {
        anRoundSelect.max = modelRounds;
        // Also clamp the input dynamically so user cannot exceed max via keyboard
        anRoundSelect.oninput = function() {
          if (parseInt(this.value, 10) > modelRounds) {
            this.value = modelRounds;
          }
        };
        anRoundSelect.value = inferredRound !== null ? inferredRound : modelRounds;
      }

      if (q && q.title) {
        const isTargetSite = window.location.hostname.includes('doubao.com') || window.location.hostname.includes('deepseek.com');
        if (isTargetSite) {
          const result = window.verifyFirstPromptMatch ? window.verifyFirstPromptMatch(q.title) : { match: true };
          if (!result.match && !result.skipped) {
            alert(`无法批注：\n\n检测到您当前网页中发送的首个 Prompt 与插件评测任务要求的第一轮 Prompt 不一致。\n\n期望：${q.title}\n实际：${result.actual || '空'}\n\n请检查是否完整复制了任务提示词并发送成功！`);
            hideQuickBar();
            return; // Block annotation
          }
        }
      }
      _renderAnnotatePopup();
    });
  } else {
    _renderAnnotatePopup();
  }
}

function _renderAnnotatePopup() {
  const qbRect = quickBarElement.getBoundingClientRect();
  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;
  
  const popupWidth = 400;
  const popupHeight = 150; 
  
  let topPos = qbRect.bottom + scrollY + 10;
  let leftPos = qbRect.left + scrollX;
  
  if (leftPos + popupWidth > window.innerWidth + scrollX) {
    leftPos = window.innerWidth + scrollX - popupWidth - 10;
  }
  
  if (topPos + popupHeight > window.innerHeight + scrollY) {
    topPos = qbRect.top + scrollY - popupHeight - 10;
    if (topPos < scrollY) {
      topPos = scrollY + 10;
    }
  }
  
  annotatePopupElement.style.left = `${leftPos}px`;
  annotatePopupElement.style.top = `${topPos}px`;
  annotatePopupElement.style.display = 'flex';
  
  hideQuickBar();
  hideResultPopup();
  hideAskPopup();
  
  annotatePopupElement.querySelector('#taAnSelectedText').textContent = currentSelectionText;
  annotatePopupElement.querySelector('#taAnInput').focus();
  
  // Generate a unique ID for this annotation
  const annotationId = 'ta_anno_' + Date.now();
  annotatePopupElement.setAttribute('data-annotation-id', annotationId);
  
  // Pass the content type from quick bar to popup
  const contentType = quickBarElement.getAttribute('data-content-type') || 'reply';
  annotatePopupElement.setAttribute('data-content-type', contentType);
  
  // Highlight the text temporarily while the popup is open
  if (currentSelectionRange) {
    try {
      // Simple wrapper highlight
      const mark = document.createElement('mark');
      mark.id = annotationId;
      mark.style.backgroundColor = 'yellow';
      mark.style.color = 'inherit';
      mark.className = 'ta-annotation-highlight ta-temp-highlight';
      currentSelectionRange.surroundContents(mark);
    } catch (err) {
      // Fallback for complex ranges spanning multiple nodes
      try {
        document.designMode = "on";
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(currentSelectionRange);
        document.execCommand("hiliteColor", false, "yellow");
        document.designMode = "off";
        sel.removeAllRanges();
        
        // Try to find the generated tags and add class/id
        const highlightTags = Array.from(document.querySelectorAll('font[style*="background-color: yellow"], span[style*="background-color: yellow"]'));
        highlightTags.forEach(f => {
          if (!f.id || f.id === annotationId) {
            f.id = annotationId;
            if (!f.classList.contains('ta-annotation-highlight')) f.classList.add('ta-annotation-highlight');
            if (!f.classList.contains('ta-temp-highlight')) f.classList.add('ta-temp-highlight');
          }
        });
      } catch (fallbackErr) {
        console.warn('Fallback highlighting failed', fallbackErr);
      }
    }
  }
}

function hideAnnotatePopup() {
  if (annotatePopupElement) {
    annotatePopupElement.style.display = 'none';
  }
  
  // Remove temporary highlights if the popup is closed without sending
  const tempHighlights = document.querySelectorAll('.ta-temp-highlight');
  tempHighlights.forEach(el => {
    // If it's a wrapper tag we created or generated by execCommand, unwrap it
    if (el.tagName.toLowerCase() === 'mark' || el.tagName.toLowerCase() === 'font' || el.tagName.toLowerCase() === 'span') {
      const parent = el.parentNode;
      if (parent) {
        while (el.firstChild) {
          parent.insertBefore(el.firstChild, el);
        }
        parent.removeChild(el);
      }
    } else {
      // Fallback
      el.classList.remove('ta-temp-highlight');
      el.classList.remove('ta-annotation-highlight');
      el.style.backgroundColor = '';
    }
  });
}

function showResultPopup(title, contentToProcess, isTranslate) {
  if (!resultPopupElement) return;
  
  const refElement = (askPopupElement && askPopupElement.style.display === 'flex') 
                     ? askPopupElement 
                     : quickBarElement;
                     
  const rect = refElement.getBoundingClientRect();
  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;
  
  const popupWidth = 360;
  // Use a conservative estimate for max height (header + content + footer)
  // Our max-height on content is 300px, plus header (~50px) + footer (~50px) = ~400px
  const estimatedMaxHeight = 400;
  
  let topPos = rect.bottom + scrollY + 10;
  let leftPos = rect.left + scrollX;
  
  // Check right edge
  if (leftPos + popupWidth > window.innerWidth + scrollX) {
    leftPos = window.innerWidth + scrollX - popupWidth - 10;
  }
  
  // Check left edge just in case
  if (leftPos < scrollX) {
    leftPos = scrollX + 10;
  }
  
  // Check bottom edge
  if (topPos + estimatedMaxHeight > window.innerHeight + scrollY) {
    // Attempt to position above the reference element instead
    topPos = rect.top + scrollY - estimatedMaxHeight - 10;
    
    // If it still goes off the top of the screen, just place it near the top
    if (topPos < scrollY) {
      topPos = scrollY + 10;
    }
  }
  
  resultPopupElement.style.left = `${leftPos}px`;
  resultPopupElement.style.top = `${topPos}px`;
  resultPopupElement.style.display = 'flex';
  
  hideQuickBar(); 
  hideAskPopup();
  
  // Setup content
  resultPopupElement.querySelector('.ta-rp-title').textContent = title;
  resultPopupElement.querySelector('#taRpOriginal').textContent = contentToProcess;
  const contentBox = resultPopupElement.querySelector('#taRpContent');
  contentBox.innerHTML = '<div class="ta-spinner"></div>';
  
  // Setup Chat Button visibility based on crowdtest status
  const chatBtn = resultPopupElement.querySelector('#taRpChatBtn');
  if (chatBtn) {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      try {
        chrome.storage.local.get(['activeCrowdtestQuestion'], (res) => {
          if (!chrome.runtime.lastError && res.activeCrowdtestQuestion) {
            chatBtn.style.display = 'none';
          } else {
            chatBtn.style.display = 'flex';
          }
        });
      } catch(e) {
        chatBtn.style.display = 'flex';
      }
    } else {
      chatBtn.style.display = 'flex';
    }
  }

  // Real AI Request to Backend Proxy
  let promptMsg = '';
  if (isTranslate) {
    promptMsg = `请翻译或解释这段文字：\n"${contentToProcess}"`;
  } else {
    promptMsg = `${title}\n\n"${contentToProcess}"`;
  }

  // Call background script for AI fetch
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
    try {
      chrome.runtime.sendMessage({
        action: 'fetchAiChat',
        messages: [{ role: 'user', content: promptMsg }]
      }, (response) => {
        if (chrome.runtime.lastError) {
          contentBox.innerHTML = `<p style="color: #EF4444; margin-top:0;">请求失败: 插件可能已更新，请刷新当前网页重试。</p>`;
          return;
        }

        let aiReply = "抱歉，解析模型回复失败。";
        
        if (response && response.error) {
          aiReply = `服务连接失败: ${response.error}`;
        } else {
          const data = response && response.data;
          if (data) {
            if (data.choices && data.choices.length > 0 && data.choices[0].message) {
              aiReply = data.choices[0].message.content;
            } else if (data.data && data.data.choices && data.data.choices.length > 0 && data.data.choices[0].message) {
              aiReply = data.data.choices[0].message.content;
            } else if (data.error) {
              aiReply = `调用错误: ${data.error.message || data.error}`;
            } else {
              console.warn("Unknown API response format in content.js:", data);
              aiReply = `解析模型回复失败。未知的返回结构。`;
            }
          } else if (response && response.reply) {
            aiReply = response.reply;
          }
        }
        
        // Basic markdown formatting
        let formattedText = aiReply.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        // Headers (h1 to h6)
        formattedText = formattedText.replace(/^######\s+(.*$)/gm, '<h6 style="margin: 8px 0; font-weight: 600;">$1</h6>');
        formattedText = formattedText.replace(/^#####\s+(.*$)/gm, '<h5 style="margin: 8px 0; font-weight: 600;">$1</h5>');
        formattedText = formattedText.replace(/^####\s+(.*$)/gm, '<h4 style="margin: 10px 0; font-weight: 600;">$1</h4>');
        formattedText = formattedText.replace(/^###\s+(.*$)/gm, '<h3 style="margin: 12px 0; font-weight: 600; font-size: 15px;">$1</h3>');
        formattedText = formattedText.replace(/^##\s+(.*$)/gm, '<h2 style="margin: 14px 0; font-weight: 700; font-size: 16px;">$1</h2>');
        formattedText = formattedText.replace(/^#\s+(.*$)/gm, '<h1 style="margin: 16px 0; font-weight: 700; font-size: 18px;">$1</h1>');
        // Bold
        formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Italic
        formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
        // Lists
        formattedText = formattedText.replace(/^\s*-\s+(.*$)/gm, '<li style="margin-left: 16px;">$1</li>');
        // Horizontal Rule
        formattedText = formattedText.replace(/^\s*---\s*$/gm, '<hr style="border:none; border-top:1px solid #E5E7EB; margin:12px 0;">');
        // Line breaks
        formattedText = formattedText.replace(/\n/g, '<br>');
        // Fix extra breaks after block elements
        formattedText = formattedText.replace(/(<\/?h[1-6][^>]*>)<br>/g, '$1');
        formattedText = formattedText.replace(/(<hr[^>]*>)<br>/g, '$1');

        contentBox.innerHTML = `
          <p style="margin-top:0;"><strong>AI 回复：</strong></p>
          <div style="color: #374151; font-size: 14px; line-height: 1.5;">${formattedText}</div>
        `;
      });
    } catch (err) {
      console.error("Context invalidated during fetchAiChat:", err);
      contentBox.innerHTML = `<p style="color: #EF4444; margin-top:0;">请求失败: 插件已更新，请刷新当前网页以继续使用。</p>`;
    }
  } else {
    contentBox.innerHTML = `<p style="color: #EF4444; margin-top:0;">环境异常，无法发送请求。</p>`;
  }
}

function hideResultPopup() {
  if (resultPopupElement) {
    resultPopupElement.style.display = 'none';
  }
}

// --- Auto Capture Prompt (For Crowdtesting Multi-turn) ---
let lastCapturedPrompt = '';

// We use a MutationObserver to watch for new user chat bubbles being added to the DOM.
// This is much more robust than intercepting clicks, as it catches API-driven quick replies too.
let chatObserver = null;

function setupChatObserver() {
  if (chatObserver) return; // Already running

  const isDoubao = window.location.hostname.includes('doubao.com');
  const isDeepseek = window.location.hostname.includes('deepseek.com');
  if (!isDoubao && !isDeepseek) return;

  chatObserver = new MutationObserver((mutations) => {
    try {
      chrome.storage.local.get(['activeCrowdtestQuestion'], (res) => {
        if (chrome.runtime.lastError || !res.activeCrowdtestQuestion) return;

        mutations.forEach(mutation => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
              if (node.nodeType === 1) { // ELEMENT_NODE
                let userBubble = null;

                // Check if the added node itself is a user bubble
                if (isDoubao && node.getAttribute('data-message-role') === 'user') {
                  userBubble = node;
                } else if (isDeepseek && (node.classList.contains('f6004764') || node.className.toLowerCase().includes('user'))) {
                  userBubble = node;
                } 
                // Or if it CONTAINS a user bubble (sometimes the wrapper is added)
                else {
                  if (isDoubao) {
                    userBubble = node.querySelector('div[data-message-role="user"]');
                  } else if (isDeepseek) {
                    userBubble = node.querySelector('.f6004764, div[class*="user" i]');
                  }
                }

                if (userBubble) {
                  const extractText = (retries = 0) => {
                    let userPromptText = userBubble.innerText || userBubble.textContent;
                    if (userPromptText && userPromptText.trim().length > 0) {
                      userPromptText = userPromptText.trim();
                      // Deduplicate: avoid firing multiple times for the same text in quick succession
                      if (userPromptText !== lastCapturedPrompt) {
                        lastCapturedPrompt = userPromptText;
                        setTimeout(() => { lastCapturedPrompt = ''; }, 3000);

                        // Send to background
                        chrome.runtime.sendMessage({
                          action: 'autoSyncPrompt',
                          text: userPromptText,
                          source: isDoubao ? 'doubao' : 'deepseek'
                        });
                      }
                    } else if (retries < 15) { // Poll up to 3 seconds
                      setTimeout(() => extractText(retries + 1), 200);
                    }
                  };
                  extractText();
                }
              }
            });
          } else if (mutation.type === 'attributes' && mutation.attributeName === 'data-message-role') {
             const node = mutation.target;
             if (isDoubao && node.getAttribute('data-message-role') === 'user') {
               const extractTextAttr = (retries = 0) => {
                 let userPromptText = node.innerText || node.textContent;
                 if (userPromptText && userPromptText.trim().length > 0) {
                   userPromptText = userPromptText.trim();
                   if (userPromptText !== lastCapturedPrompt) {
                     lastCapturedPrompt = userPromptText;
                     setTimeout(() => { lastCapturedPrompt = ''; }, 3000);
                     chrome.runtime.sendMessage({
                       action: 'autoSyncPrompt',
                       text: userPromptText,
                       source: 'doubao'
                     });
                   }
                 } else if (retries < 15) {
                   setTimeout(() => extractTextAttr(retries + 1), 200);
                 }
               };
               extractTextAttr();
             }
          }
        });
      });
    } catch (err) {
      // Extension context might be invalidated
    }
  });

  // Start observing the body for added nodes
  chatObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-message-role'] });
}

// Start the observer
setupChatObserver();

function attemptCapturePrompt(e) {
  if (typeof chrome === 'undefined' || !chrome.storage) return;

  const isTargetSite = window.location.hostname.includes('doubao.com') || window.location.hostname.includes('deepseek.com');
  if (!isTargetSite) return;

  // Check if we are inside our own UI to ignore
  if (e.target && e.target.closest && (e.target.closest('.turing-arena-quickbar') || e.target.closest('.turing-arena-ask-popup') || e.target.closest('.turing-arena-result-popup'))) return;

  let promptText = '';
  let isSubmit = false;
  let activeInput = null;

  // 1. Detect Enter key on textareas or contenteditables
  if (e.type === 'keydown' && e.key === 'Enter' && !e.shiftKey) {
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') {
      promptText = e.target.value;
      activeInput = e.target;
      isSubmit = true;
    } else if (e.target.isContentEditable) {
      promptText = e.target.innerText;
      activeInput = e.target;
      isSubmit = true;
    }
  } 
  // 2. Detect click on send buttons or quick suggestions
  else if (e.type === 'mousedown' || e.type === 'click') {
    // A) Check for Quick Suggestions (Doubao specific) FIRST
    const suggestionBtn = e.target.closest('button[class*="suggestion" i], div[class*="suggestion" i], [class*="quick-reply" i], [class*="recommend" i], [class*="chip" i], [class*="shortcut" i], [class*="prompt" i], div[data-testid*="suggestion" i], div[class*="related-question" i]');
    
    if (suggestionBtn) {
      const textNode = suggestionBtn.innerText || suggestionBtn.textContent || '';
      // Exclude text that looks like purely UI buttons rather than prompts
      if (textNode.trim().length > 0 && !textNode.includes('换一批')) {
        // Specifically for Doubao, sometimes there is an arrow icon inside the text
        promptText = textNode.replace(/→/g, '').trim();
        isSubmit = true;
        activeInput = null; // No input box to poll
      }
    } 
    // B) Check for normal send buttons
    else {
      let isSendBtn = false;
      const btn = e.target.closest('button, [role="button"], div[class*="send" i], div[class*="submit" i], .send-btn, .submit-btn');
      if (btn) {
        // 进一步确认这是不是发送按钮（包含 svg，或有特定的 aria-label，或内部文本包含发送）
        const text = btn.textContent || '';
        const aria = btn.getAttribute('aria-label') || '';
        const isSendIcon = btn.querySelector('svg') !== null;
        const isSendText = /发送|send|submit/i.test(text) || /发送|send|submit/i.test(aria);
        
        if (isSendText || isSendIcon || btn.tagName === 'BUTTON') {
          isSendBtn = true;
        }
      } else if (e.target.closest('svg')) {
        const svg = e.target.closest('svg');
        if (svg.closest('div[class*="chat" i], div[class*="input" i], form')) {
          isSendBtn = true;
        }
      }

      if (isSendBtn) {
        // 找出当前有内容的输入框
        const inputs = Array.from(document.querySelectorAll('textarea, [contenteditable="true"]'));
        activeInput = inputs.find(el => {
           const val = el.tagName === 'TEXTAREA' || el.tagName === 'INPUT' ? el.value : el.innerText;
           return val && val.trim().length > 0 && val.trim() !== '输入主题和写作要求' && val.trim() !== '给豆包发送消息';
        });

        if (activeInput) {
          promptText = activeInput.tagName === 'TEXTAREA' || activeInput.tagName === 'INPUT' ? activeInput.value : activeInput.innerText;
          isSubmit = true;
        }
      }
    }
  }

  if (isSubmit && promptText) {
    promptText = promptText.trim();
    if (!promptText || promptText === lastCapturedPrompt) return; // Ignore empty or duplicate within short time
    
    // If we captured a quick suggestion, we don't have an input box to poll. 
    // We just assume it was sent immediately.
    if (!activeInput) {
        lastCapturedPrompt = promptText;
        setTimeout(() => { lastCapturedPrompt = ''; }, 2000); 

        try {
          chrome.storage.local.get(['activeCrowdtestQuestion'], (res) => {
            if (!chrome.runtime.lastError && res.activeCrowdtestQuestion) {
              chrome.runtime.sendMessage({
                action: 'autoSyncPrompt',
                text: promptText,
                source: window.location.hostname.includes('doubao.com') ? 'doubao' : 'deepseek'
              });
            }
          });
        } catch (err) {
          console.warn(err);
        }
        return; // Exit early since we don't need to poll
    }

    // Poll to see if the input is actually cleared (meaning the message was successfully sent)
    let checkCount = 0;
    const pollInterval = setInterval(() => {
      let currentVal = '';
      if (activeInput && document.body.contains(activeInput)) {
        currentVal = activeInput.tagName === 'TEXTAREA' || activeInput.tagName === 'INPUT' ? activeInput.value : activeInput.innerText;
      }
      
      // If the input becomes empty, we consider it a successful send
      if (currentVal.trim() === '' || currentVal.trim() === '输入主题和写作要求' || currentVal.trim() === '给豆包发送消息') {
        clearInterval(pollInterval);
        
        lastCapturedPrompt = promptText;
        setTimeout(() => { lastCapturedPrompt = ''; }, 2000); 

        try {
          chrome.storage.local.get(['activeCrowdtestQuestion'], (res) => {
            if (!chrome.runtime.lastError && res.activeCrowdtestQuestion) {
              // It's active, send to background
              chrome.runtime.sendMessage({
                action: 'autoSyncPrompt',
                text: promptText,
                source: window.location.hostname.includes('doubao.com') ? 'doubao' : 'deepseek'
              });
            }
          });
        } catch (err) {
          console.warn(err);
        }
      }
      
      checkCount++;
      // Deepseek/Doubao sometimes takes a while to clear the input if network is slow. 
      // Increase timeout to 3 seconds (30 * 100ms)
      if (checkCount > 30) { 
        clearInterval(pollInterval);
      }
    }, 100);
  }
}

document.addEventListener('keydown', attemptCapturePrompt, true);
document.addEventListener('mousedown', attemptCapturePrompt, true);
document.addEventListener('click', attemptCapturePrompt, true);

// Listen for text selection
document.addEventListener('mouseup', (e) => {
  // Don't trigger if clicking inside our own UI
  if (e.target.closest('.turing-arena-quickbar') || 
      e.target.closest('.turing-arena-result-popup') ||
      e.target.closest('.turing-arena-ask-popup')) {
    return;
  }

  // Use setTimeout to allow the browser's selection to finish updating
  setTimeout(() => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    
    if (text.length > 0) {
      currentSelectionText = text;
      try {
        currentSelectionRange = selection.getRangeAt(0).cloneRange();
      } catch (e) {
        currentSelectionRange = null;
      }
      
      // Determine if selection is inside a "Thinking" block or "Reply" block
      let contentType = 'reply'; // default
      try {
        if (currentSelectionRange) {
          const container = currentSelectionRange.commonAncestorContainer;
          const el = container.nodeType === 3 ? container.parentNode : container;
          
          // Deepseek specific checks
          if (window.location.hostname.includes('deepseek.com')) {
            // In deepseek, thinking blocks often have a specific class or are inside a details/summary or a specific div
            // We look for common patterns in Deepseek's DOM for thinking process
            if (el.closest('.ds-markdown--thought') || 
                el.closest('.thought-content') || 
                el.closest('[class*="think"]') ||
                el.closest('details')) {
              contentType = 'thought';
            }
          }
          // Doubao specific checks
          else if (window.location.hostname.includes('doubao.com')) {
            if (el.closest('.thinking-process') || 
                el.closest('[class*="thought"]') ||
                el.closest('[class*="think"]')) {
              contentType = 'thought';
            }
          }
        }
      } catch(err) {
        console.warn('Failed to determine content type', err);
      }
      
      // Save content type to element dataset so it can be picked up when clicking the button
      if (quickBarElement) {
        quickBarElement.setAttribute('data-content-type', contentType);
      }
      
      const scrollX = window.scrollX || window.pageXOffset;
      const scrollY = window.scrollY || window.pageYOffset;
      
      // Get the bounding rect of the selection to position the quick bar at the end of it
      try {
        const range = selection.getRangeAt(0);
        // Get all rects in the selection to find the last one
        const rects = range.getClientRects();
        
        // Determine coordinates
          let targetX, targetY;
          if (rects && rects.length > 0) {
            // Find the visually last rect (bottom-most, then right-most)
            let lastRect = rects[0];
            for (let i = 1; i < rects.length; i++) {
              const currentRect = rects[i];
              if (currentRect.bottom > lastRect.bottom) {
                lastRect = currentRect;
              } else if (currentRect.bottom === lastRect.bottom && currentRect.right > lastRect.right) {
                lastRect = currentRect;
              }
            }
            targetX = lastRect.right + scrollX;
            targetY = lastRect.bottom + scrollY;
          } else {
            // Fallback if no rects found
            const rect = range.getBoundingClientRect();
            targetX = rect.right + scrollX;
            targetY = rect.bottom + scrollY;
          }
          
          // Check if quickbar is disabled
          if (typeof chrome !== 'undefined' && chrome.storage) {
            try {
              chrome.storage.local.get(['activeCrowdtestQuestion', 'quickbarDisableUntil'], (res) => {
                if (chrome.runtime.lastError) {
                  console.warn("Turing Arena Probe: context invalidated (lastError).");
                  showQuickBar(targetX, targetY);
                  return;
                }
                const isTargetSite = window.location.hostname.includes('doubao.com') || window.location.hostname.includes('deepseek.com');
                const isTesting = isTargetSite && res.activeCrowdtestQuestion !== undefined && res.activeCrowdtestQuestion !== null;
                if (isTesting) {
                  // Always show during crowdtesting tasks, ignore disable limits
                  showQuickBar(targetX, targetY);
                  return;
                }
                const disableUntil = res.quickbarDisableUntil || 0;
                if (Date.now() < disableUntil) {
                  return; // It is disabled
                }
                showQuickBar(targetX, targetY);
              });
            } catch (err) {
              console.warn("Turing Arena Probe: context invalidated.", err);
              showQuickBar(targetX, targetY);
            }
          } else {
            showQuickBar(targetX, targetY);
          }
          
        } catch (err) {
          // Fallback to mouse position if range fails
          if (typeof chrome !== 'undefined' && chrome.storage) {
            try {
              chrome.storage.local.get(['activeCrowdtestQuestion', 'quickbarDisableUntil'], (res) => {
                if (chrome.runtime.lastError) {
                  showQuickBar(e.clientX + scrollX, e.clientY + scrollY);
                  return;
                }
                const isTargetSite = window.location.hostname.includes('doubao.com') || window.location.hostname.includes('deepseek.com');
                const isTesting = isTargetSite && res.activeCrowdtestQuestion !== undefined && res.activeCrowdtestQuestion !== null;
                if (isTesting) {
                  showQuickBar(e.clientX + scrollX, e.clientY + scrollY);
                  return;
                }
                const disableUntil = res.quickbarDisableUntil || 0;
                if (Date.now() < disableUntil) {
                  return; // It is disabled
                }
                showQuickBar(e.clientX + scrollX, e.clientY + scrollY);
              });
            } catch (err) {
              showQuickBar(e.clientX + scrollX, e.clientY + scrollY);
            }
          } else {
            showQuickBar(e.clientX + scrollX, e.clientY + scrollY);
          }
        }
    } else {
      // If click didn't result in selection, hide everything
      hideQuickBar();
      // Only hide popup if we clicked completely outside
      if (!e.target.closest('.turing-arena-result-popup')) {
        hideResultPopup();
      }
    }
  }, 10);
});

  // Also hide on mousedown if we are clicking away to start a new selection
  document.addEventListener('mousedown', (e) => {
    // If click is outside Quick Bar AND selection is empty, hide Quick Bar
    if (quickBarElement && !quickBarElement.contains(e.target) && !e.target.closest('.turing-arena-ask-popup') && !e.target.closest('.turing-arena-result-popup') && !e.target.closest('.ta-model-dropdown') && !e.target.closest('.turing-arena-ask-popup')) {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.toString().trim() === '') {
        hideQuickBar();
      }
    }
  
    // Hide ask popup if clicking outside
    if (askPopupElement && askPopupElement.style.display === 'flex' && !askPopupElement.contains(e.target)) {
      // Don't hide if we are clicking the quickbar button that opened it
      if (!e.target.closest('.ta-qb-btn')) {
        hideAskPopup();
      }
    }
    
    // Hide annotate popup if clicking outside
    if (annotatePopupElement && annotatePopupElement.style.display === 'flex' && !annotatePopupElement.contains(e.target)) {
      if (!e.target.closest('.ta-qb-btn')) {
        hideAnnotatePopup();
      }
    }
  }, true); // Use capture phase to ensure we catch it before default behavior prevents propagation

// --- Labeleases Account Sync Logic ---
if (window.location.hostname.includes('labeleases.com')) {
  console.log('Turing Arena Probe: Running on labeleases.com, initiating account sync...');

  const syncLabeleasesUser = () => {
    let userInfo = null;

    try {
      // 1. Try to find user info in localStorage (common approach for modern SPAs)
      const possibleKeys = ['user', 'userInfo', 'user_info', 'account', 'profile', 'auth_user'];
      
      for (const key of possibleKeys) {
        const val = localStorage.getItem(key);
        if (val) {
          try {
            const parsed = JSON.parse(val);
            // Check if it looks like a user object
            if (parsed && (parsed.id || parsed.userId || parsed.uid || parsed.email || parsed.phone || parsed.username)) {
              userInfo = parsed;
              break;
            }
          } catch(e) {}
        }
      }

      // 2. If no clear object found, check for a simple token/username string
      if (!userInfo && localStorage.getItem('token') && localStorage.getItem('username')) {
        userInfo = {
          name: localStorage.getItem('username')
        };
      }

      // 3. Check for specific Labeleases Personal Center page (Highest Priority if on this page)
      if (window.location.href.includes('personal-center')) {
        // Look for the phone number text based on the screenshot layout
        // Usually it's an element next to a phone icon, or in a specific grid
        const allSpans = Array.from(document.querySelectorAll('span, div'));
        const phoneMatch = allSpans.find(el => {
          const text = el.textContent.trim();
          return /^1[3-9]\d{9}$/.test(text) && el.children.length === 0;
        });

        if (phoneMatch) {
          userInfo = userInfo || {};
          userInfo.phone = phoneMatch.textContent.trim();
          console.log('Turing Arena Probe: Found specific phone number in DOM:', userInfo.phone);
        }
      }

      // If we only have a name from localstorage but no phone, we should NOT just blindly sync,
      // because the user requested strict phone number matching.
      // We will still extract avatar and name if possible, but the background will handle the mismatch logic.

      // 4. Fallback: Try to scrape DOM for avatar or username (generic approach)
      if (!userInfo) {
        // Specifically for labeleases.com layout: look for the avatar/profile block in the header
        // We will try several common selectors since we don't have the exact DOM
        const nameEl = document.querySelector('.user-name, .profile-name, .account-name, [class*="avatar"] + span, .ant-dropdown-trigger span, .user-info span');
        
        // Sometimes the user's email or name is in the avatar img alt attribute
        const avatarImg = document.querySelector('.ant-avatar img, .user-avatar img');
        
        if (nameEl && nameEl.textContent.trim()) {
          userInfo = { name: nameEl.textContent.trim() };
        } else if (avatarImg && avatarImg.alt) {
          userInfo = { name: avatarImg.alt };
        } else {
          // If we are definitely on a logged-in page (e.g. /operation/task-v2) but can't find the name
          // we create a generic logged-in user so the plugin knows we are authenticated
          if (window.location.pathname.includes('/operation/')) {
            userInfo = { name: 'Labeleases User' };
          }
        }
      }
      
    } catch(e) {
      console.error('Turing Arena Probe: Error during account sync extraction', e);
    }

    // If we successfully found something that looks like a user, send it to the extension
    if (userInfo) {
      console.log('Turing Arena Probe: Found Labeleases user info', userInfo);
      
      // Standardize the user object for our extension's format
      const standardizedUser = {
        id: userInfo.id || userInfo.userId || userInfo.uid || `labeleases_${Date.now()}`,
        email: userInfo.email || userInfo.account || '',
        phone: userInfo.phone || userInfo.mobile || '',
        name: userInfo.name || userInfo.nickname || userInfo.username || userInfo.userName || 'Labeleases User',
        avatar: userInfo.avatar || userInfo.headImg || userInfo.avatarUrl || ''
      };

      // Only send message if the extension context is valid
      if (chrome.runtime?.id) {
        chrome.runtime.sendMessage({
          action: 'syncWebUser',
          user: standardizedUser
        });
      }
    }
  };

  // Run the sync function after a short delay to allow the SPA to finish rendering/auth
  setTimeout(syncLabeleasesUser, 2500);

  // Also listen for storage events in case the user logs in without refreshing the page
  window.addEventListener('storage', () => {
    // Small debounce
    setTimeout(syncLabeleasesUser, 500);
  });

  // --- Task ID Extraction Logic ---
  // Periodically check for Task ID (题目 ID) on task pages
  let lastReportedTaskId = null;
  let lastReportedQuestionId = null;

  setInterval(() => {
    // 1. Task ID extraction (Existing logic)
    // Look for text matching "题目 ID: 7614027052451991359" or similar
    const matchTask = document.body.textContent.match(/题目\s*ID[:：]?\s*(\d{15,})/i);
    const newTaskId = matchTask ? matchTask[1] : null;
    
    // 2. Question ID extraction (New logic)
    // We can extract Question ID from URL params or specific DOM elements depending on the platform
    let newQuestionId = null;
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('questionId')) {
      newQuestionId = urlParams.get('questionId');
    } else if (urlParams.has('id')) {
      // Sometimes it's just 'id' in the URL
      newQuestionId = urlParams.get('id');
    } else {
      // Fallback: try to find it in the DOM if it has a specific class or data attribute
      const questionEl = document.querySelector('[data-question-id], .question-id-display');
      if (questionEl) {
        newQuestionId = questionEl.getAttribute('data-question-id') || questionEl.textContent.trim();
      }
    }

    // 3. Handle changes
    let contextChanged = false;

    if (newTaskId !== lastReportedTaskId) {
      lastReportedTaskId = newTaskId;
      if (newTaskId) console.log('Turing Arena Probe: Found Task ID in DOM:', newTaskId);
      contextChanged = true;
    }

    if (newQuestionId !== lastReportedQuestionId) {
      lastReportedQuestionId = newQuestionId;
      if (newQuestionId) console.log('Turing Arena Probe: Found Question ID:', newQuestionId);
      contextChanged = true;
    }

    // 4. Send updates to background
    if (contextChanged && chrome.runtime?.id) {
      // First update the general task ID for trajectory recording (legacy support)
      if (newTaskId) {
        chrome.runtime.sendMessage({ 
          action: 'updateTaskId', 
          taskId: newTaskId 
        }).catch(() => {});
      }

      // Then trigger the new contextChanged logic for auto-slicing
      chrome.runtime.sendMessage({ 
        action: 'contextChanged', 
        newTaskId: newTaskId,
        newQuestionId: newQuestionId
      }).catch(() => {});
    }

  }, 2000); // Check every 2 seconds to handle SPA routing

  // Also send task ID when tab becomes visible again
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && lastReportedTaskId && chrome.runtime?.id) {
      chrome.runtime.sendMessage({ 
        action: 'updateTaskId', 
        taskId: lastReportedTaskId 
      }).catch(() => {});
    }
  });
  
  window.addEventListener('focus', () => {
    if (lastReportedTaskId && chrome.runtime?.id) {
      chrome.runtime.sendMessage({ 
        action: 'updateTaskId', 
        taskId: lastReportedTaskId 
      }).catch(() => {});
    }
  });
}

// Intercept Input/Change events (Debounced slightly for performance if needed)
document.addEventListener('change', (e) => {
  if (!chrome.runtime?.id) return;
  try {
    chrome.runtime.sendMessage({ action: 'getState' }, (state) => {
      if (chrome.runtime.lastError) return;
      if (state && state.isTrajRecording) {
        const target = e.target;
        const selector = generateCSSSelector(target);
        const contextText = getElementContext(target);
        
        const eventData = {
          type: 'input',
          selector: selector,
          tagName: target.tagName.toLowerCase(),
          value: contextText
        };

        if (chrome.runtime?.id) {
          chrome.runtime.sendMessage({
            action: 'recordEvent',
            eventData: eventData
          });
        }
      }
    });
  } catch (err) {
    console.warn('Extension context invalidated', err);
  }
}, true);
