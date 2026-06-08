// --- IndexedDB Helper for Video Storage ---
const DB_NAME = 'TuringArenaMediaDB';
const STORE_NAME = 'videos';

function openDB() {
  return new Promise((resolve, reject) => {
    // Open without specifying a version to use the existing one or create a new one
    const request = indexedDB.open(DB_NAME);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveVideoBlob(id, blob) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(blob, id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function getVideoBlob(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function deleteVideoBlob(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
// ----------------------------------------

document.addEventListener('DOMContentLoaded', async () => {
  const initialLoader = document.getElementById('initialLoader');
  
  // Chat History State Management
  let currentChatId = null;
  let currentChatMessages = [];
  let chatHistoryIndex = [];
  let currentUser = null; // Declare early

  const getUserKey = (key) => {
    return currentUser ? `taUser_${currentUser.id}_${key}` : `taGuest_${key}`;
  };

  const saveCurrentChat = () => {
    if (!currentChatId) {
      currentChatId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }
    
    if (currentChatMessages.length === 0) return;

    const title = currentChatMessages[0].text ? currentChatMessages[0].text.substring(0, 20) : '新对话';
    let snippet = currentChatMessages[currentChatMessages.length - 1].text || '[图片]';
    if (snippet.length > 30) snippet = snippet.substring(0, 30) + '...';

    const chatIndexEntry = {
      id: currentChatId,
      title: title,
      snippet: snippet,
      timestamp: Date.now(),
      starred: false
    };

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      const indexKey = getUserKey('chatIndex');
      chrome.storage.local.get([indexKey], (result) => {
        let index = result[indexKey] || [];
        const existingIdx = index.findIndex(c => c.id === currentChatId);
        
        if (existingIdx >= 0) {
          chatIndexEntry.starred = index[existingIdx].starred;
          index[existingIdx] = chatIndexEntry;
        } else {
          index.unshift(chatIndexEntry);
        }
        
        const saveObj = {};
        saveObj[indexKey] = index;
        saveObj[getUserKey(`chat_${currentChatId}`)] = currentChatMessages;
        
        chrome.storage.local.set(saveObj, () => {
          chatHistoryIndex = index;
          renderChatHistoryDrawer();
        });
      });
    }
  };

  const loadChatHistoryIndex = () => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      const indexKey = getUserKey('chatIndex');
      chrome.storage.local.get([indexKey], (result) => {
        chatHistoryIndex = result[indexKey] || [];
        renderChatHistoryDrawer();
      });
    }
  };

  const deleteChat = (chatId, e) => {
    e.stopPropagation();
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      const indexKey = getUserKey('chatIndex');
      const chatKey = getUserKey(`chat_${chatId}`);
      
      chrome.storage.local.get([indexKey], (result) => {
        let index = result[indexKey] || [];
        index = index.filter(c => c.id !== chatId);
        
        const updates = {};
        updates[indexKey] = index;
        
        chrome.storage.local.set(updates, () => {
          chrome.storage.local.remove(chatKey);
          chatHistoryIndex = index;
          renderChatHistoryDrawer();
          
          if (currentChatId === chatId) {
            const newChatBtn = document.getElementById('newChatBtn');
            if (newChatBtn) newChatBtn.click();
          }
        });
      });
    }
  };

  const toggleStarChat = (chatId, e) => {
    e.stopPropagation();
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      const indexKey = getUserKey('chatIndex');
      chrome.storage.local.get([indexKey], (result) => {
        let index = result[indexKey] || [];
        const chat = index.find(c => c.id === chatId);
        if (chat) {
          chat.starred = !chat.starred;
          chrome.storage.local.set({ [indexKey]: index }, () => {
            chatHistoryIndex = index;
            renderChatHistoryDrawer();
          });
        }
      });
    }
  };

  const renderChatHistoryDrawer = () => {
    const listContainer = document.getElementById('chatHistoryList');
    if (!listContainer) return;
    
    const titleSpan = document.querySelector('.chat-history-title span');
    
    // Filter by active tab
    const activeTab = document.querySelector('.chat-history-tab.active');
    const filter = activeTab ? activeTab.dataset.filter : 'all';
    
    // Filter by search
    const searchInput = document.getElementById('chatHistorySearchInput');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    let filteredChats = chatHistoryIndex;
    
    if (filter === 'starred') {
      filteredChats = filteredChats.filter(c => c.starred);
    }
    
    if (searchTerm) {
      filteredChats = filteredChats.filter(c => c.title.toLowerCase().includes(searchTerm) || c.snippet.toLowerCase().includes(searchTerm));
    }
    
    if (titleSpan) titleSpan.textContent = `(${filteredChats.length})`;
    
    listContainer.innerHTML = '';
    
    if (filteredChats.length === 0) {
      listContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--icon-inactive); font-size: 13px;">暂无历史记录</div>';
      return;
    }
    
    // Group by time
    const groups = {
      '今天': [],
      '本周': [],
      '更早': []
    };
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const thisWeek = today - (6 * 24 * 60 * 60 * 1000);
    
    filteredChats.forEach(chat => {
      if (chat.timestamp >= today) {
        groups['今天'].push(chat);
      } else if (chat.timestamp >= thisWeek) {
        groups['本周'].push(chat);
      } else {
        groups['更早'].push(chat);
      }
    });
    
    for (const [groupName, chats] of Object.entries(groups)) {
      if (chats.length === 0) continue;
      
      const groupEl = document.createElement('div');
      groupEl.className = 'chat-history-group';
      
      const groupTitle = document.createElement('div');
      groupTitle.className = 'chat-history-group-title';
      groupTitle.textContent = groupName;
      groupEl.appendChild(groupTitle);
      
      chats.forEach(chat => {
        const itemEl = document.createElement('div');
        itemEl.className = 'chat-history-item';
        itemEl.dataset.id = chat.id;
        
        itemEl.innerHTML = `
          <div class="chat-history-item-header">
            <div class="chat-history-item-title">${chat.title}</div>
            <div class="chat-history-item-actions">
              <button class="chat-history-action-btn delete-chat-btn" title="删除"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
              <button class="chat-history-action-btn star-chat-btn" title="收藏">
                <svg fill="${chat.starred ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16" style="color: ${chat.starred ? '#F59E0B' : 'currentColor'}"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
              </button>
            </div>
          </div>
          <div class="chat-history-item-desc">${chat.snippet}</div>
        `;
        
        // Add click listeners
        itemEl.addEventListener('click', (e) => {
          if (e.target.closest('.chat-history-action-btn')) return;
          
          if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            const chatKey = getUserKey(`chat_${chat.id}`);
            chrome.storage.local.get([chatKey], (result) => {
              const msgs = result[chatKey];
              if (msgs) {
                currentChatId = chat.id;
                currentChatMessages = msgs;
                
                const chatMessages = document.getElementById('chatMessages');
                if (chatMessages) chatMessages.innerHTML = '';
                document.querySelectorAll('.chat-greeting, .chat-subgreeting, .chat-preset-questions').forEach(el => {
                  el.style.display = 'none';
                });
                
                msgs.forEach(m => {
                  appendChatMessage(m.role, m.text, m.attachments || [], m.msgId || null, m.quote || null, true);
                });
                
                const chatHistoryDrawer = document.getElementById('chatHistoryDrawer');
                if (chatHistoryDrawer) chatHistoryDrawer.classList.remove('open');
              }
            });
          }
        });
        
        itemEl.querySelector('.delete-chat-btn').addEventListener('click', (e) => deleteChat(chat.id, e));
        itemEl.querySelector('.star-chat-btn').addEventListener('click', (e) => toggleStarChat(chat.id, e));
        
        groupEl.appendChild(itemEl);
      });
      
      listContainer.appendChild(groupEl);
    }
  };

  // Tab Switching Logic
  const navItems = document.querySelectorAll('.nav-item[data-tab]');
  const viewSections = document.querySelectorAll('.view-section');
  const mainContent = document.querySelector('.main-content');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      // Deactivate all tabs and views
      navItems.forEach(nav => nav.classList.remove('active'));
      
      // Save scroll positions before hiding
      viewSections.forEach(view => {
        if (view.classList.contains('active')) {
          const scrollableArea = view.querySelector('.chat-content') || view;
          view.dataset.savedScrollTop = scrollableArea.scrollTop;
        }
        view.classList.remove('active');
        view.style.display = 'none';
      });

      // Activate clicked tab and corresponding view
      item.classList.add('active');
      const targetId = `view-${item.dataset.tab}`;
      const targetView = document.getElementById(targetId);
      
      if (targetView) {
        targetView.classList.add('active');
        if (targetId === 'view-chat') {
          targetView.style.display = 'flex';
        } else {
          targetView.style.display = 'flex'; // Ensure all views keep their flex context
        }
        
        // Restore scroll position
        if (targetView.dataset.savedScrollTop !== undefined) {
          const scrollableArea = targetView.querySelector('.chat-content') || targetView;
          // Use requestAnimationFrame to ensure the DOM has updated its display property
          requestAnimationFrame(() => {
            if (scrollableArea) scrollableArea.scrollTop = targetView.dataset.savedScrollTop;
          });
        }
      }
    });
  });

  // Chat interaction logic
  const chatInputArea = document.getElementById('chatInputArea');
  const chatSendBtn = document.getElementById('chatSendBtn');
  const chatMessages = document.getElementById('chatMessages');
  
  // Page Context elements
  const pageContextCard = document.getElementById('pageContextCard');
  const pageContextTitle = document.getElementById('pageContextTitle');
  const pageContextUrl = document.getElementById('pageContextUrl');
  const pageContextSummarizeBtn = document.getElementById('pageContextSummarizeBtn');
  const pageContextFavicon = document.getElementById('pageContextFavicon');
  const pageContextDefaultIcon = document.getElementById('pageContextDefaultIcon');

  let currentSummarizeHandler = null;

  function updatePageContextCard(tab) {
    if (!tab || !tab.url || (!tab.url.startsWith('http://') && !tab.url.startsWith('https://'))) {
      if (pageContextCard) pageContextCard.style.display = 'none';
      return;
    }

    if (pageContextTitle && pageContextUrl && pageContextCard) {
      pageContextTitle.textContent = tab.title || tab.url;
      
      try {
        const urlObj = new URL(tab.url);
        pageContextUrl.textContent = urlObj.hostname;
      } catch(e) {
        pageContextUrl.textContent = tab.url;
      }

      // Handle Favicon
      if (tab.favIconUrl && pageContextFavicon && pageContextDefaultIcon) {
        pageContextFavicon.src = tab.favIconUrl;
        pageContextFavicon.style.display = 'block';
        pageContextDefaultIcon.style.display = 'none';
        pageContextFavicon.parentElement.style.background = 'transparent';
      } else if (pageContextFavicon && pageContextDefaultIcon) {
        pageContextFavicon.style.display = 'none';
        pageContextDefaultIcon.style.display = 'block';
        pageContextDefaultIcon.parentElement.style.background = '#EEF2FF';
      }
      
      pageContextCard.style.display = 'flex';
      
      // Update summarize click handler
      if (pageContextSummarizeBtn) {
        // Remove old listener if exists
        if (currentSummarizeHandler) {
          pageContextSummarizeBtn.removeEventListener('click', currentSummarizeHandler);
        }

        currentSummarizeHandler = () => {
          // Check login state first
          if (!currentUser) {
            const authModal = document.getElementById('authModal');
            if (authModal) authModal.classList.add('show');
            return;
          }

          const displayPrompt = `请帮我总结一下这个网页的核心内容：\n[${tab.title}](${tab.url})`;
          
          // Remove the card once summarized to clean up UI
          pageContextCard.style.display = 'none';
          
          // Append user message (short version for UI)
          appendChatMessage('user', displayPrompt, []);
          
          // Show a loading indicator in UI
          const loadingId = Date.now().toString();
          appendChatMessage('ai', 'Turing 思考中...', [], loadingId);

          // Try to extract page content to send to model (avoids LinkReader 500 error)
          chrome.scripting.executeScript({
            target: {tabId: tab.id},
            func: () => document.body.innerText.substring(0, 10000) // Get up to 10k chars of text
          }, (results) => {
            let pageContent = "";
            if (results && results[0] && results[0].result) {
              pageContent = results[0].result;
            }
            
            let modelPrompt = displayPrompt;
            if (pageContent && pageContent.trim().length > 50) {
              modelPrompt = `请基于我提供的网页正文，总结一下这个网页的核心内容。\n\n网页标题：${tab.title}\n网页链接：${tab.url}\n\n网页正文：\n${pageContent}`;
            }
            
            // Call Background Script to perform the actual fetch
            if (chrome.runtime && chrome.runtime.sendMessage) {
              chrome.runtime.sendMessage({ 
                action: 'fetchAiChat',
                messages: [{ role: 'user', content: modelPrompt }]
              }, (response) => {
                const loadingEl = document.getElementById(`msg-${loadingId}`);
                if (loadingEl) loadingEl.remove();

                if (response && response.error) {
                  if (response.error.includes('Failed to fetch')) {
                    appendChatMessage('ai', '网络连接失败，请使用公司内网或连接内网VPN后重试～', []);
                  } else {
                    appendChatMessage('ai', `请求失败: ${response.error}`, []);
                  }
                } else if (response && response.data) {
                  const data = response.data;
                  let aiReply = "抱歉，解析模型回复失败。";
                  if (data.choices && data.choices.length > 0 && data.choices[0].message) {
                    aiReply = data.choices[0].message.content;
                  } else if (data.message && data.message.content) {
                    aiReply = data.message.content;
                  } else if (data.reply) {
                    aiReply = data.reply;
                  }
                  appendChatMessage('ai', aiReply, []);
                } else if (response && response.reply) {
                  appendChatMessage('ai', response.reply, []);
                } else {
                  appendChatMessage('ai', '未知错误，请稍后重试。', []);
                }
              });
            }
          });
        };
        pageContextSummarizeBtn.addEventListener('click', currentSummarizeHandler);
      }
    }
  }

  // Initial load
  if (typeof chrome !== 'undefined' && chrome.tabs) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs && tabs.length > 0) {
        updatePageContextCard(tabs[0]);
      }
    });

    // Listen for tab switching
    chrome.tabs.onActivated.addListener((activeInfo) => {
      chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (chrome.runtime.lastError) return;
        updatePageContextCard(tab);
      });
    });

    // Listen for tab URL/Title updates
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (tab.active && (changeInfo.url || changeInfo.title || changeInfo.favIconUrl)) {
        updatePageContextCard(tab);
      }
    });
  }

  let currentAttachments = [];

  function createUrlCardHtml(url, isEditable = true) {
    const shortUrl = url.length > 35 ? url.substring(0, 32) + '...' : url;
    
    // In chat messages, we don't want the remove button
    const editClass = isEditable ? 'is-editable' : 'is-readonly';
      
    const removeBtnHtml = isEditable 
      ? `<span class="chat-url-remove-btn">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width:14px;height:14px;margin-right:4px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>取消链接
         </span>`
      : '';

    return `<span class="chat-url-attachment ${editClass}" contenteditable="false" data-url="${url}">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width:14px;height:14px;margin-right:4px;color:#6B4EFF;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
      <span style="font-size:12px; color:var(--text-main); font-family:monospace; user-select:none;">${shortUrl}</span>
      ${removeBtnHtml}
    </span>&nbsp;`;
  }

  // Global click handler for delegated events (e.g. injected HTML strings)
  document.addEventListener('click', (e) => {
    // Handle URL card clicks
    const readonlyUrl = e.target.closest('.chat-url-attachment.is-readonly');
    if (readonlyUrl) {
      const url = readonlyUrl.getAttribute('data-url');
      if (url) window.open(url, '_blank');
      return;
    }

    const removeBtn = e.target.closest('.chat-url-remove-btn');
    if (removeBtn) {
      const attachment = removeBtn.closest('.chat-url-attachment');
      if (attachment) attachment.remove();
      return;
    }
  });

  // Add listener to extract URLs dynamically from input
  if (chatInputArea) {
    chatInputArea.addEventListener('paste', (e) => {
      // First, handle images
      let hasImage = false;
      const items = (e.clipboardData || e.originalEvent.clipboardData).items;
      for (let index in items) {
        const item = items[index];
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          hasImage = true;
          // Prevent default browser behavior of pasting image inline into contenteditable
          e.preventDefault(); 
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const remainingSlots = 50 - currentAttachments.length;
              if (remainingSlots <= 0) {
                alert('最多支持50张图片上传');
                return;
              }
              currentAttachments.push(event.target.result);
              updateAttachmentUI();
            };
            reader.readAsDataURL(file);
          }
        }
      }

      // Handle text/URLs
      const text = (e.originalEvent || e).clipboardData.getData('text/plain');
      if (text) {
        e.preventDefault(); // Only prevent default if we have text to insert manually
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        let html = text.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
        
        html = html.replace(urlRegex, (url) => {
          return createUrlCardHtml(url);
        });
        
        document.execCommand('insertHTML', false, html);
      } else if (!hasImage) {
         // Let default happen if it's neither image nor plain text
      }
    });

    chatInputArea.addEventListener('keydown', (e) => {
      // isComposing indicates the user is typing via IME (like Chinese Pinyin)
      if (e.isComposing || e.keyCode === 229) {
        return;
      }

      if (e.key === 'Enter') {
        if (e.metaKey || e.ctrlKey || e.shiftKey) {
          // Allow manual line break (Ctrl/Cmd+Enter or Shift+Enter)
          // Since it's contenteditable, we can insert a <br> and a zero-width space
          e.preventDefault();
          document.execCommand('insertHTML', false, '<br>\u200B');
        } else {
          // Standard Enter -> Send message
          e.preventDefault();
          handleSendChat();
        }
      }
    });
  }

  // Image Preview Modal logic
  const imagePreviewModal = document.getElementById('imagePreviewModal');
  const previewModalImage = document.getElementById('previewModalImage');
  const closeImagePreviewBtn = document.getElementById('closeImagePreviewBtn');

  const openImagePreview = (src) => {
    if (imagePreviewModal && previewModalImage) {
      previewModalImage.src = src;
      imagePreviewModal.classList.add('show');
    }
  };

  const closeImagePreview = () => {
    if (imagePreviewModal) {
      imagePreviewModal.classList.remove('show');
      setTimeout(() => {
        if (previewModalImage) previewModalImage.src = '';
      }, 200); // Wait for fade out transition
    }
  };

  if (closeImagePreviewBtn) {
    closeImagePreviewBtn.addEventListener('click', closeImagePreview);
  }
  if (imagePreviewModal) {
    imagePreviewModal.addEventListener('click', (e) => {
      // Close if clicking outside the image
      if (e.target === imagePreviewModal) {
        closeImagePreview();
      }
    });
  }

  const updateAttachmentUI = () => {
    const chatAttachments = document.getElementById('chatAttachments');
    if (!chatAttachments) return;

    if (currentAttachments.length > 0) {
      chatAttachments.style.display = 'flex';
      chatAttachments.innerHTML = '';
      
      // Render image attachments
      currentAttachments.forEach((dataUrl, index) => {
        const item = document.createElement('div');
        item.style.position = 'relative';
        item.style.width = '64px';
        item.style.height = '64px';
        item.style.borderRadius = '8px';
        item.style.border = '1px solid #E5E7EB';
        item.style.overflow = 'hidden';
        item.style.cursor = 'pointer'; // Add pointer to indicate clickable

        const img = document.createElement('img');
        img.src = dataUrl;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';

        // Click on the container (or image) to open preview
        item.onclick = (e) => {
          if (e.target.tagName.toLowerCase() === 'button') return; // Don't trigger if remove button was clicked
          openImagePreview(dataUrl);
        };

        const removeBtn = document.createElement('button');
        removeBtn.innerHTML = '&times;';
        removeBtn.style.position = 'absolute';
        removeBtn.style.top = '4px';
        removeBtn.style.right = '4px';
        removeBtn.style.background = 'rgba(0,0,0,0.5)';
        removeBtn.style.color = 'white';
        removeBtn.style.border = 'none';
        removeBtn.style.borderRadius = '50%';
        removeBtn.style.width = '16px';
        removeBtn.style.height = '16px';
        removeBtn.style.cursor = 'pointer';
        removeBtn.style.fontSize = '12px';
        removeBtn.style.lineHeight = '1';
        removeBtn.style.display = 'flex';
        removeBtn.style.alignItems = 'center';
        removeBtn.style.justifyContent = 'center';

        removeBtn.onclick = () => {
          currentAttachments.splice(index, 1);
          updateAttachmentUI();
        };

        item.appendChild(img);
        item.appendChild(removeBtn);
        chatAttachments.appendChild(item);
      });
      
    } else {
      chatAttachments.style.display = 'none';
      chatAttachments.innerHTML = '';
    }
  };

  const appendChatMessage = (role, text, attachments = [], msgId = null, quote = null, isFromHistory = false) => {
    if (!chatMessages) return;

    if (!isFromHistory && text !== 'Turing 思考中...') {
      currentChatMessages.push({ role, text, attachments, msgId, quote, timestamp: Date.now() });
      saveCurrentChat();
    }
    
    // Hide greetings if they are visible
    document.querySelectorAll('.chat-greeting, .chat-subgreeting, .chat-preset-questions').forEach(el => {
      el.style.display = 'none';
    });

    const msgEl = document.createElement('div');
    msgEl.className = `chat-bubble ${role}`;
    if (msgId) {
      msgEl.id = `msg-${msgId}`;
    }
    
    if (role === 'ai') {
      if (text && text.trim() === 'Turing 思考中...') {
        const loadingDiv = document.createElement('div');
        loadingDiv.style.color = 'var(--icon-inactive)';
        loadingDiv.style.display = 'flex';
        loadingDiv.style.alignItems = 'center';
        loadingDiv.style.gap = '8px';
        loadingDiv.style.fontSize = '14px';
        loadingDiv.style.fontWeight = '500';
        loadingDiv.innerHTML = `
          <svg class="chat-spinner-icon" viewBox="0 0 24 24" fill="none" style="width: 16px; height: 16px;">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="32" stroke-linecap="round" opacity="0.3"/>
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
          </svg>
          <span>Turing 思考中...</span>
        `;
        msgEl.appendChild(loadingDiv);
      } else {
        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.alignItems = 'center';
        header.style.gap = '6px';
        header.style.marginBottom = '8px';
        header.style.color = 'var(--text-muted)';
        header.style.fontSize = '14px';
        header.style.fontWeight = '500';
        
        const iconSvg = `<svg viewBox="0 0 24 24" fill="none" style="width:18px;height:18px;color:#8B5CF6"><circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2"/><path d="M12 4L4 18H20L12 4Z" fill="currentColor"/></svg>`;
        header.innerHTML = `${iconSvg}<span>Turing</span>`;
        
        const content = document.createElement('div');
        
        // Basic markdown/link parsing for AI messages
        let formattedText = text ? text.replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
        
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
        
        // Links
        formattedText = formattedText.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" style="color: #6B4EFF; text-decoration: underline;">$1</a>');
        
        // Line breaks
        formattedText = formattedText.replace(/\n/g, '<br>');
        // Fix extra breaks after block elements
        formattedText = formattedText.replace(/(<\/?h[1-6][^>]*>)<br>/g, '$1');
        formattedText = formattedText.replace(/(<hr[^>]*>)<br>/g, '$1');
        
        content.innerHTML = formattedText;
        
        msgEl.appendChild(header);
        msgEl.appendChild(content);
      }
    } else {
      // Add quote block if quote text is provided
      if (quote) {
        const quoteDiv = document.createElement('div');
        quoteDiv.className = 'chat-quote';
        
        const quoteTextDiv = document.createElement('div');
        quoteTextDiv.className = 'chat-quote-text';
        quoteTextDiv.textContent = quote;
        
        const quoteTooltipDiv = document.createElement('div');
        quoteTooltipDiv.className = 'chat-quote-tooltip';
        quoteTooltipDiv.textContent = quote;
        
        quoteDiv.appendChild(quoteTextDiv);
        quoteDiv.appendChild(quoteTooltipDiv);
        msgEl.appendChild(quoteDiv);
      }

      // Add images first
      attachments.forEach(dataUrl => {
        const img = document.createElement('img');
        img.src = dataUrl;
        img.style.maxWidth = '100%';
        img.style.borderRadius = '8px';
        img.style.marginBottom = '8px';
        img.style.display = 'block';
        img.style.cursor = 'pointer'; // Make it clickable
        
        // Add click to preview for images sent in chat
        img.onclick = () => openImagePreview(dataUrl);
        
        msgEl.appendChild(img);
      });
      // Then add text
      if (text) {
        const textDiv = document.createElement('div');
        
        // Parse URLs in user text to show them as inline attachments without remove buttons
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        let modifiedText = text.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
        
        modifiedText = modifiedText.replace(urlRegex, (url) => {
          return createUrlCardHtml(url, false);
        });
        
        textDiv.innerHTML = modifiedText;
        textDiv.style.lineHeight = '2'; // Give a bit more room for the inline cards
        
        msgEl.appendChild(textDiv);
      }
    }
    
    chatMessages.appendChild(msgEl);
    
    // Scroll to bottom
    const chatContent = document.querySelector('.chat-content');
    if (chatContent) {
      chatContent.scrollTop = chatContent.scrollHeight;
    }
  };

  let currentAbortController = null;

  const getChatInputText = () => {
    let text = '';
    const walk = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.classList.contains('chat-url-attachment')) {
          text += node.dataset.url;
        } else if (node.tagName === 'BR') {
          text += '\n';
        } else if (node.tagName === 'DIV') {
          if (text.length > 0 && !text.endsWith('\n')) {
            text += '\n';
          }
          node.childNodes.forEach(walk);
        } else {
          node.childNodes.forEach(walk);
        }
      }
    };
    chatInputArea.childNodes.forEach(walk);
    // Replace non-breaking spaces we added for cursor movement
    return text.replace(/\u00A0/g, ' ').replace(/\u200B/g, ''); 
  };

  const handleSendChat = () => {
    if (!chatInputArea) return;
    
    // Check login state first
    if (!currentUser) {
      if (authModal) authModal.classList.add('show');
      return;
    }
    
    // Abort previous fetch if running
    if (currentAbortController) {
      currentAbortController.abort();
      currentAbortController = null;
    }
    
    const text = getChatInputText().trim();
    if (!text && currentAttachments.length === 0) return;

    const attachmentsToSend = [...currentAttachments];

    // Append user message
    appendChatMessage('user', text, attachmentsToSend);
    
    chatInputArea.innerHTML = '';
    currentAttachments = [];
    updateAttachmentUI();

    // Prepare the message payload
    let messageContent;
    if (attachmentsToSend.length > 0) {
      messageContent = [];
      if (text) {
        messageContent.push({ type: "text", text: text });
      } else {
        messageContent.push({ type: "text", text: "请分析上传的图片。" });
      }
      attachmentsToSend.forEach(dataUrl => {
        messageContent.push({
          type: "image_url",
          image_url: { url: dataUrl }
        });
      });
    } else {
      messageContent = text || "请分析上传的图片。";
    }

    // Show a loading indicator in UI
    const loadingId = Date.now().toString();
    appendChatMessage('ai', 'Turing 思考中...', [], loadingId);

    // Call Background Script to perform the actual fetch
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ 
        action: 'fetchAiChat',
        messages: [{ role: 'user', content: messageContent }]
      }, (response) => {
        const loadingEl = document.getElementById(`msg-${loadingId}`);
        if (loadingEl) loadingEl.remove();

        if (response && response.error) {
          if (response.error.includes('Failed to fetch')) {
            appendChatMessage('ai', '网络连接失败，请使用公司内网或连接内网VPN后重试～');
          } else {
            appendChatMessage('ai', `服务连接失败: ${response.error}`);
          }
          return;
        }

        const data = response && response.data;
        let aiReply = "抱歉，解析模型回复失败。";
        
        if (data) {
          // 适配标准的 Chat Completions 格式
          if (data.choices && data.choices.length > 0 && data.choices[0].message) {
            aiReply = data.choices[0].message.content;
          } 
          // 适配火山引擎智能体 (Bot) 的响应格式
          else if (data.data && data.data.choices && data.data.choices.length > 0 && data.data.choices[0].message) {
             aiReply = data.data.choices[0].message.content;
          }
          // 处理 API 返回的错误
          else if (data.error) {
            aiReply = `调用错误: ${data.error.message || data.error}`;
          } else {
             // 打印未知的结构，方便调试
             console.warn("Unknown API response format:", data);
             try {
               aiReply = `未知的返回格式: \n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``;
             } catch(e) {}
          }
        }

        appendChatMessage('ai', aiReply);
      });
    } else {
      const loadingEl = document.getElementById(`msg-${loadingId}`);
      if (loadingEl) loadingEl.remove();
      appendChatMessage('ai', '扩展运行环境异常，无法发送消息。');
    }
  };

  // Chat Header Buttons
  const headerScreenshotBtn = document.getElementById('headerScreenshotBtn');
  const headerHistoryBtn = document.getElementById('headerHistoryBtn');
  const headerNewChatBtn = document.getElementById('headerNewChatBtn');

  if (headerScreenshotBtn) {
    headerScreenshotBtn.addEventListener('click', () => {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ action: 'initiateCapture' });
      }
    });
  }

  if (headerHistoryBtn) {
    headerHistoryBtn.addEventListener('click', () => {
      if (chatHistoryDrawer) {
        chatHistoryDrawer.classList.add('open');
      }
    });
  }

  if (headerNewChatBtn) {
    headerNewChatBtn.addEventListener('click', () => {
      // Clear chat messages
      currentChatId = null;
      currentChatMessages = [];
      if (chatMessages) chatMessages.innerHTML = '';
      if (chatInputArea) chatInputArea.value = '';
      
      // Show greetings again
      document.querySelectorAll('.chat-greeting, .chat-subgreeting, .chat-preset-questions').forEach(el => {
        el.style.display = 'flex';
      });

      if (chatHistoryDrawer) chatHistoryDrawer.classList.remove('open');
    });
  }

  // Legacy Bottom Toolbars (keeping listeners just in case)
  const chatHistoryBtn = document.getElementById('chatHistoryBtn');
  const newChatBtn = document.getElementById('newChatBtn');
  const chatHistoryDrawer = document.getElementById('chatHistoryDrawer');
  const closeHistoryBtn = document.getElementById('closeHistoryBtn');

  if (chatHistoryBtn) {
    chatHistoryBtn.addEventListener('click', () => {
      if (chatHistoryDrawer) {
        chatHistoryDrawer.classList.add('open');
      }
    });
  }

  if (closeHistoryBtn) {
    closeHistoryBtn.addEventListener('click', () => {
      if (chatHistoryDrawer) {
        chatHistoryDrawer.classList.remove('open');
      }
    });
  }

  if (newChatBtn) {
    newChatBtn.addEventListener('click', () => {
      // Clear chat messages
      currentChatId = null;
      currentChatMessages = [];
      if (chatMessages) chatMessages.innerHTML = '';
      // Clear input
      if (chatInputArea) chatInputArea.value = '';
      currentAttachments = [];
      updateAttachmentUI();
      // Show greetings again
      document.querySelectorAll('.chat-greeting, .chat-subgreeting, .chat-preset-questions').forEach(el => {
        el.style.display = '';
      });
      if (chatHistoryDrawer) chatHistoryDrawer.classList.remove('open');
    });
  }

  const historyTabs = document.querySelectorAll('.chat-history-tab');
  historyTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      historyTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderChatHistoryDrawer();
    });
  });

  const chatHistorySearchInput = document.getElementById('chatHistorySearchInput');
  if (chatHistorySearchInput) {
    chatHistorySearchInput.addEventListener('input', () => {
      renderChatHistoryDrawer();
    });
  }

  const clearAllHistoryBtn = document.getElementById('clearAllHistoryBtn');
  const confirmClearModal = document.getElementById('confirmClearModal');
  const cancelClearBtn = document.getElementById('cancelClearBtn');
  const confirmClearBtn = document.getElementById('confirmClearBtn');

  if (clearAllHistoryBtn && confirmClearModal && cancelClearBtn && confirmClearBtn) {
    clearAllHistoryBtn.addEventListener('click', () => {
      confirmClearModal.classList.add('show');
    });

    cancelClearBtn.addEventListener('click', () => {
      confirmClearModal.classList.remove('show');
    });

    confirmClearModal.addEventListener('click', (e) => {
      if (e.target === confirmClearModal) {
        confirmClearModal.classList.remove('show');
      }
    });

    confirmClearBtn.addEventListener('click', () => {
      confirmClearModal.classList.remove('show');
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['taChatIndex'], (result) => {
          let index = result.taChatIndex || [];
          
          const toDelete = index.filter(c => !c.starred);
          const toKeep = index.filter(c => c.starred);
          
          const keysToRemove = toDelete.map(c => `taChat_${c.id}`);
          
          chrome.storage.local.set({ taChatIndex: toKeep }, () => {
            chrome.storage.local.remove(keysToRemove, () => {
              chatHistoryIndex = toKeep;
              renderChatHistoryDrawer();
              
              // If active chat was deleted, clear view
              if (currentChatId && !toKeep.find(c => c.id === currentChatId)) {
                const newChatBtn = document.getElementById('newChatBtn');
                if (newChatBtn) newChatBtn.click();
              }
            });
          });
        });
      }
    });
  }

  // Preset Question Logic
  const presetCrowdtestBtn = document.getElementById('presetCrowdtestBtn');
  if (presetCrowdtestBtn) {
    presetCrowdtestBtn.addEventListener('click', () => {
      appendChatMessage('user', '如何参与众测任务？');
      
      const aiReply = "想搞点大动作顺便赚杯奶茶钱（甚至是一顿大餐）吗？👀\n\n参与众测任务超级简单！\n移步我们的发财基地：[https://www.labeleases.com/](https://www.labeleases.com/)。\n\n那里有一大波高薪任务在向你招手，赶紧去报名认领更适合你的任务吧！别让你的才华和钱包闲着~ 💰✨";
      
      setTimeout(() => {
        appendChatMessage('ai', aiReply);
      }, 500);
    });
  }

  if (chatSendBtn) {
    chatSendBtn.addEventListener('click', handleSendChat);
  }

  // Screenshot logic
  const screenshotBtn = document.getElementById('screenshotBtn');
  if (screenshotBtn) {
    screenshotBtn.addEventListener('click', async () => {
      console.log('Screenshot button clicked');
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.sendMessage) {
        try {
          // Query active tab in current window
          let tabs = await chrome.tabs.query({active: true, currentWindow: true});
          if (!tabs || tabs.length === 0) {
            tabs = await chrome.tabs.query({active: true});
          }
          
          console.log('Found active tabs:', tabs);
          const validTabs = tabs.filter(t => t.url && (t.url.startsWith('http://') || t.url.startsWith('https://')));
          
          if (validTabs.length > 0) {
            console.log('Sending startScreenshotMode to tab:', validTabs[0].id);
            // Send message and expect a response. If no response, show error instead of fallback.
            chrome.tabs.sendMessage(validTabs[0].id, {action: 'startScreenshotMode'}, (response) => {
              if (chrome.runtime.lastError || !response) {
                console.error("Content script not responding or not loaded:", chrome.runtime.lastError?.message);
                
                // Show a temporary tooltip/bubble
                const errorBubble = document.createElement('div');
                errorBubble.textContent = '无法在此页面截图，请刷新页面或在普通网页中尝试。';
                errorBubble.style.position = 'absolute';
                errorBubble.style.bottom = '100%';
                errorBubble.style.left = '50%';
                errorBubble.style.transform = 'translateX(-50%)';
                errorBubble.style.marginBottom = '8px';
                errorBubble.style.padding = '8px 12px';
                errorBubble.style.backgroundColor = '#EF4444'; // Red color for error
                errorBubble.style.color = 'white';
                errorBubble.style.borderRadius = '6px';
                errorBubble.style.fontSize = '12px';
                errorBubble.style.whiteSpace = 'nowrap';
                errorBubble.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                errorBubble.style.zIndex = '1000';
                errorBubble.style.opacity = '1';
                errorBubble.style.transition = 'opacity 0.3s';
                
                // Append relative to the button
                screenshotBtn.style.position = 'relative';
                screenshotBtn.appendChild(errorBubble);
                
                setTimeout(() => {
                  errorBubble.style.opacity = '0';
                  setTimeout(() => errorBubble.remove(), 300);
                }, 3000); // Disappear after 3 seconds
                
              } else {
                console.log('Screenshot mode started successfully in tab');
              }
            });
          } else {
            console.warn("No valid active tab found for screenshot.");
            
            // Show a temporary tooltip/bubble
            const errorBubble = document.createElement('div');
            errorBubble.textContent = '未找到可截图的网页，请切换到普通网页后再试。';
            errorBubble.style.position = 'absolute';
            errorBubble.style.bottom = '100%';
            errorBubble.style.left = '50%';
            errorBubble.style.transform = 'translateX(-50%)';
            errorBubble.style.marginBottom = '8px';
            errorBubble.style.padding = '8px 12px';
            errorBubble.style.backgroundColor = '#EF4444';
            errorBubble.style.color = 'white';
            errorBubble.style.borderRadius = '6px';
            errorBubble.style.fontSize = '12px';
            errorBubble.style.whiteSpace = 'nowrap';
            errorBubble.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            errorBubble.style.zIndex = '1000';
            errorBubble.style.opacity = '1';
            errorBubble.style.transition = 'opacity 0.3s';
            
            screenshotBtn.style.position = 'relative';
            screenshotBtn.appendChild(errorBubble);
            
            setTimeout(() => {
              errorBubble.style.opacity = '0';
              setTimeout(() => errorBubble.remove(), 300);
            }, 3000);
          }
        } catch (error) {
          console.error('Error finding active tab:', error);
        }
      } else {
        console.error('chrome.tabs API not available');
      }
    });
  }

  // Local File Upload logic
  const uploadFileBtn = document.getElementById('uploadFileBtn');
  const fileUploadInput = document.getElementById('fileUploadInput');
  if (uploadFileBtn && fileUploadInput) {
    uploadFileBtn.addEventListener('click', () => {
      fileUploadInput.click();
    });

    fileUploadInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      if (!files.length) return;

      const remainingSlots = 50 - currentAttachments.length;
      if (remainingSlots <= 0) {
        alert('最多支持50张图片上传');
        fileUploadInput.value = '';
        return;
      }

      const filesToProcess = files.slice(0, remainingSlots);
      if (files.length > remainingSlots) {
        alert(`最多支持50张图片上传，本次仅选择了前 ${remainingSlots} 张。`);
      }

      filesToProcess.forEach(file => {
        // Size validation (10MB)
        if (file.size > 10 * 1024 * 1024) {
          alert(`文件 ${file.name} 大小超过10M，已被跳过。`);
          return;
        }

        const reader = new FileReader();
        reader.onload = (evt) => {
          currentAttachments.push(evt.target.result);
          updateAttachmentUI();
        };
        reader.readAsDataURL(file);
      });

      // Clear input to allow re-uploading the same file if needed
      fileUploadInput.value = '';
    });
  }

  // Model Dropdown Logic for Chat (Removed as per user request to only have Turing)
  const modelSelectorBtn = document.querySelector('.model-selector');
  if (modelSelectorBtn) {
    // We keep the button but remove the dropdown functionality
  }

  // Listen for messages from background/content script
  let lastProcessedMessageId = null;

  const handleSwitchToChat = (msg) => {
    const chatTab = document.querySelector('.nav-item[data-tab="chat"]');
    if (chatTab) chatTab.click();

    // Check login state before parsing chat intent
    if (!currentUser) {
      if (authModal) authModal.classList.add('show');
      return;
    }
    
    // Abort previous fetch if running
    if (currentAbortController) {
      currentAbortController.abort();
      currentAbortController = null;
    }

    // Reset current chat state since this is coming from quick actions outside sidebar
    currentChatId = null;
    currentChatMessages = [];
    if (chatMessages) chatMessages.innerHTML = '';
    document.querySelectorAll('.chat-greeting, .chat-subgreeting, .chat-preset-questions').forEach(el => {
      el.style.display = 'none';
    });

    if (msg.history) {
      if (msg.history.user) {
        appendChatMessage('user', msg.history.user, [], null, msg.history.quoteText || null);
      }
      if (msg.history.isThinking) {
        const promptMsg = msg.history.isTranslate 
          ? `请翻译或解释这段文字：\n"${msg.history.quoteText}"` 
          : `${msg.history.title}\n\n"${msg.history.quoteText}"`;

        const loadingId = Date.now().toString();
        appendChatMessage('ai', 'Turing 思考中...', [], loadingId);
        
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
          chrome.runtime.sendMessage({ 
            action: 'fetchAiChat',
            messages: [{ role: 'user', content: promptMsg }]
          }, (response) => {
            const loadingEl = document.getElementById(`msg-${loadingId}`);
            if (loadingEl) loadingEl.remove();

            if (response && response.error) {
              if (response.error.includes('Failed to fetch')) {
                appendChatMessage('ai', '网络连接失败，请使用公司内网或连接内网VPN后重试～');
              } else {
                appendChatMessage('ai', `服务连接失败: ${response.error}`);
              }
              return;
            }

            const data = response && response.data;
            let aiReply = "抱歉，解析模型回复失败。";
            if (data) {
          // 适配标准的 Chat Completions 格式
          if (data.choices && data.choices.length > 0 && data.choices[0].message) {
            aiReply = data.choices[0].message.content;
          } 
          // 适配火山引擎智能体 (Bot) 的响应格式
          else if (data.data && data.data.choices && data.data.choices.length > 0 && data.data.choices[0].message) {
             aiReply = data.data.choices[0].message.content;
          }
          // 处理 API 返回的错误
          else if (data.error) {
            aiReply = `调用错误: ${data.error.message || data.error}`;
          } else {
             // 打印未知的结构，方便调试
             console.warn("Unknown API response format:", data);
             try {
               aiReply = `未知的返回格式: \n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``;
             } catch(e) {}
          }
        }

            appendChatMessage('ai', aiReply);
          });
        } else {
          const loadingEl = document.getElementById(`msg-${loadingId}`);
          if (loadingEl) loadingEl.remove();
          appendChatMessage('ai', '扩展运行环境异常，无法发送消息。');
        }
      } else if (msg.history.ai) {
        appendChatMessage('ai', msg.history.ai);
      }
    }
  };

  // Watch for storage changes to handle chat syncing seamlessly
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.onChanged.addListener((changes, namespace) => {
      // Check for user login/logout to refresh chat history
      if (namespace === 'local' && changes.taUser) {
        // If user changed, reload chat history to show their specific chats
        loadChatHistoryIndex();
        
        // Also reload media and trajectory history for the new user
        updateUI();
        
        // Clear current chat view if we switched users
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) chatMessages.innerHTML = '';
        document.querySelectorAll('.chat-greeting, .chat-subgreeting, .chat-preset-questions').forEach(el => {
          el.style.display = 'block';
        });
        currentChatId = null;
        currentChatMessages = [];
      }
      
      // Check if we need to open login modal from content script
      if (namespace === 'local' && changes.pendingLoginModal && changes.pendingLoginModal.newValue) {
        if (authModal && !currentUser) {
          authModal.classList.add('show');
        }
        chrome.storage.local.remove('pendingLoginModal');
      }
      
      if (namespace === 'local' && changes.pendingChat && changes.pendingChat.newValue) {
        const newChat = changes.pendingChat.newValue;
        if (newChat.id && newChat.id !== lastProcessedMessageId) {
          lastProcessedMessageId = newChat.id;
          handleSwitchToChat(newChat);
          // Clear it out
          chrome.storage.local.remove('pendingChat');
        }
      }
    });

    // Check if there's a pending chat on load
    chrome.storage.local.get('pendingChat', (result) => {
      if (result && result.pendingChat) {
        const newChat = result.pendingChat;
        if (newChat.id && newChat.id !== lastProcessedMessageId) {
          // If the message is older than 5 minutes, ignore it
          if (Date.now() - newChat.timestamp < 5 * 60 * 1000) {
            lastProcessedMessageId = newChat.id;
            handleSwitchToChat(newChat);
          }
          chrome.storage.local.remove('pendingChat');
        }
      }
    });
  }

  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((msg, sender) => {
      console.log('Sidebar received message:', msg);
      
      if (msg.action === 'scrapedContextUpdate') {
        currentScrapedContext = {
          taskId: msg.taskId,
          questionId: msg.questionId
        };
        
        const manualTaskInput = document.getElementById('manualTaskInput');
        const manualQuestionInput = document.getElementById('manualQuestionInput');
        const autoDetectStatus = document.getElementById('autoDetectStatus');
        
        let hasBoth = true;
        
        if (msg.taskId) {
          if (manualTaskInput && !manualTaskInput.value) {
            manualTaskInput.value = msg.taskId;
          }
        } else {
          hasBoth = false;
        }
        
        if (msg.questionId) {
          if (manualQuestionInput && !manualQuestionInput.value) {
            manualQuestionInput.value = msg.questionId;
          }
        } else {
          hasBoth = false;
        }

        if (autoDetectStatus) {
          if (hasBoth) {
            autoDetectStatus.innerHTML = `<span style="color: #10b981;">已自动填充</span>`;
          } else {
            autoDetectStatus.innerHTML = `
              <div class="recording-indicator-dot" style="width: 6px; height: 6px; background-color: var(--primary-color); border-radius: 50%; animation: pulse-blue 1.5s infinite;"></div>
              自动识别中...
            `;
          }
        }
      }

      if (msg.action === 'triggerAutoSlice') {
        console.log('Sidebar received auto-slice trigger');
        
        // Stop current media recording and automatically restart with new context
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
          // By changing the associated ID before stopping, the blob is saved correctly
          // But the previous context is passed in the event
          const oldTaskId = msg.prevContext.taskId;
          const oldQuestionId = msg.prevContext.questionId;
          
          mediaRecorder.associatedTaskId = oldTaskId;
          mediaRecorder.associatedQuestionId = oldQuestionId;
          if (msg.trajectoryEvents) {
            mediaRecorder.associatedEvents = msg.trajectoryEvents;
          }
          mediaRecorder.stop(); 
          
          // Wait a brief moment for IndexedDB save to start, then restart
          setTimeout(() => {
            if (msg.config.screen) {
              startRealMediaRecording(msg.newContext.taskId, msg.newContext.questionId);
            }
          }, 1000);
        } else {
          // If only traj/time was enabled (no media), save manually
          chrome.runtime.sendMessage({ 
            action: 'stopMediaRecording', // We reuse this to create a unified entry
            blobUrl: null,
            startTime: new Date(Date.now() - masterRecordingSeconds * 1000).toLocaleTimeString(),
            associatedQuestionId: msg.prevContext.questionId,
            associatedTaskId: msg.prevContext.taskId,
            durationMs: masterRecordingSeconds * 1000,
            hasTraj: !!msg.config.traj,
            trajectoryEvents: msg.trajectoryEvents || []
          });
          setTimeout(() => {
            if (msg.config.traj) {
               chrome.runtime.sendMessage({ action: 'startTrajRecording' });
            }
          }, 1000);
        }
        
        // Visual feedback
        const mainAppContainer = document.getElementById('mainAppContainer');
        if (mainAppContainer) {
          mainAppContainer.classList.add('flash-warning');
          setTimeout(() => mainAppContainer.classList.remove('flash-warning'), 1500);
        }
        showToast(`题目已切换，已自动切片并重新开始录制`);
      }
      
      if (msg.action === 'captureArea' && msg.rect) {
        console.log('Capture area requested with rect:', msg.rect);
        
        // Final debounce in sidebar just in case background fails to block it
        if (window._taSidebarCaptureDebounce) {
          console.log('Sidebar ignored duplicate captureArea request');
          return;
        }
        window._taSidebarCaptureDebounce = true;
        setTimeout(() => { window._taSidebarCaptureDebounce = false; }, 1000);

        const windowId = sender && sender.tab ? sender.tab.windowId : null;
        chrome.tabs.captureVisibleTab(windowId, {format: 'png'}, (dataUrl) => {
          if (chrome.runtime.lastError || !dataUrl) {
            console.error("captureVisibleTab failed:", chrome.runtime.lastError?.message);
            return;
          }

          console.log('Got visible tab dataUrl, creating image for crop');
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const dpr = msg.rect.dpr || 1;
            canvas.width = msg.rect.width * dpr;
            canvas.height = msg.rect.height * dpr;
            const ctx = canvas.getContext('2d');
            
            // Adjust coordinates based on scroll position to crop correctly from the visible viewport
            const sourceX = (msg.rect.x - (msg.rect.scrollX || 0)) * dpr;
            const sourceY = (msg.rect.y - (msg.rect.scrollY || 0)) * dpr;
            
            ctx.drawImage(img, sourceX, sourceY, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);

            const croppedUrl = canvas.toDataURL('image/png');
            currentAttachments.push(croppedUrl);
            updateAttachmentUI();
            console.log('Crop complete, attachment added');
          };
          img.src = dataUrl;
        });
      }
    });
  }

  // Media controls
  const recordMediaBtn = document.getElementById('recordMediaBtn');
  const stopMediaBtn = document.getElementById('stopMediaBtn');
  const mediaNotesList = document.getElementById('mediaNotesList');
  const mediaEmptyState = document.getElementById('mediaEmptyState');

  // Record Details View Elements
  const mediaDetailOverlay = document.getElementById('mediaDetailOverlay');
  const mediaBackBtn = document.getElementById('mediaBackBtn');
  const mediaDetailTitle = document.getElementById('mediaDetailTitle');
  const detailsStartTime = document.getElementById('detailsStartTime');
  const detailsEndTime = document.getElementById('detailsEndTime');
  const detailsDuration = document.getElementById('detailsDuration');
  const detailsVideoPlayer = document.getElementById('detailsVideoPlayer');
  const detailsVideoPlaceholder = document.getElementById('detailsVideoPlaceholder');
  const videoContainer = document.getElementById('videoContainer');
  const customFullscreenBtn = document.getElementById('customFullscreenBtn');

  // Master View Tabs (Control vs History)
  const masterTabControl = document.getElementById('masterTabControl');
  const masterTabHistory = document.getElementById('masterTabHistory');
  const masterContentControl = document.getElementById('masterContentControl');
  const masterContentHistory = document.getElementById('masterContentHistory');

  function activateMasterTab(tabName) {
    if (tabName === 'control') {
      if (masterTabControl) {
        masterTabControl.style.color = 'var(--primary-color)';
        masterTabControl.style.borderBottomColor = 'var(--primary-color)';
        masterTabControl.style.fontWeight = '600';
      }
      if (masterTabHistory) {
        masterTabHistory.style.color = 'var(--text-muted)';
        masterTabHistory.style.borderBottomColor = 'transparent';
        masterTabHistory.style.fontWeight = '500';
      }
      if (masterContentControl) masterContentControl.style.display = 'block';
      if (masterContentHistory) masterContentHistory.style.display = 'none';
    } else if (tabName === 'history') {
      if (masterTabHistory) {
        masterTabHistory.style.color = 'var(--primary-color)';
        masterTabHistory.style.borderBottomColor = 'var(--primary-color)';
        masterTabHistory.style.fontWeight = '600';
      }
      if (masterTabControl) {
        masterTabControl.style.color = 'var(--text-muted)';
        masterTabControl.style.borderBottomColor = 'transparent';
        masterTabControl.style.fontWeight = '500';
      }
      if (masterContentHistory) masterContentHistory.style.display = 'flex';
      if (masterContentHistory) masterContentHistory.style.flexDirection = 'column';
      if (masterContentControl) masterContentControl.style.display = 'none';
    }
  }

  if (masterTabControl) {
    masterTabControl.addEventListener('click', () => activateMasterTab('control'));
  }
  if (masterTabHistory) {
    masterTabHistory.addEventListener('click', () => activateMasterTab('history'));
  }

  // Detail View Tabs
  const mediaTabVideo = document.getElementById('mediaTabVideo');
  const mediaTabTraj = document.getElementById('mediaTabTraj');
  const mediaContentVideo = document.getElementById('mediaContentVideo');
  const mediaContentTraj = document.getElementById('mediaContentTraj');

  function activateTab(tabName) {
    if (tabName === 'video') {
      if (mediaTabVideo) {
        mediaTabVideo.style.color = 'var(--primary-color)';
        mediaTabVideo.style.borderBottomColor = 'var(--primary-color)';
        mediaTabVideo.style.fontWeight = '600';
      }
      if (mediaTabTraj) {
        mediaTabTraj.style.color = 'var(--text-muted)';
        mediaTabTraj.style.borderBottomColor = 'transparent';
        mediaTabTraj.style.fontWeight = '500';
      }
      if (mediaContentVideo) mediaContentVideo.style.display = 'block';
      if (mediaContentTraj) mediaContentTraj.style.display = 'none';
    } else if (tabName === 'traj') {
      if (mediaTabTraj) {
        mediaTabTraj.style.color = 'var(--primary-color)';
        mediaTabTraj.style.borderBottomColor = 'var(--primary-color)';
        mediaTabTraj.style.fontWeight = '600';
      }
      if (mediaTabVideo) {
        mediaTabVideo.style.color = 'var(--text-muted)';
        mediaTabVideo.style.borderBottomColor = 'transparent';
        mediaTabVideo.style.fontWeight = '500';
      }
      if (mediaContentTraj) mediaContentTraj.style.display = 'block';
      if (mediaContentVideo) mediaContentVideo.style.display = 'none';
    }
  }

  if (mediaTabVideo) {
    mediaTabVideo.addEventListener('click', () => activateTab('video'));
  }
  if (mediaTabTraj) {
    mediaTabTraj.addEventListener('click', () => activateTab('traj'));
  }

  if (mediaBackBtn) {
    mediaBackBtn.addEventListener('click', () => {
      if (mediaDetailOverlay) mediaDetailOverlay.classList.remove('open');
      if (detailsVideoPlayer) {
        detailsVideoPlayer.pause();
        detailsVideoPlayer.src = '';
      }
      if (videoContainer) videoContainer.classList.remove('video-fullscreen-mode');
    });
  }

  if (customFullscreenBtn && videoContainer) {
    customFullscreenBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      videoContainer.classList.toggle('video-fullscreen-mode');
      
      if (videoContainer.classList.contains('video-fullscreen-mode')) {
        customFullscreenBtn.innerHTML = `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3"></path></svg>`;
        customFullscreenBtn.title = "退出全屏";
      } else {
        customFullscreenBtn.innerHTML = `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>`;
        customFullscreenBtn.title = "全屏观看";
      }
    });
  }

  // Trajectory controls
  const recordTrajBtn = document.getElementById('recordTrajBtn');
  const stopTrajBtn = document.getElementById('stopTrajBtn');
  const trajNotesList = document.getElementById('trajNotesList');
  const trajEmptyState = document.getElementById('trajEmptyState');
  const eventCount = document.getElementById('eventCount');

  // Detail View Elements (Trajectory)
  const detailOverlay = document.getElementById('detailOverlay');
  const trajDetailBody = document.getElementById('trajDetailBody');
  const trajBackToTopBtn = document.getElementById('trajBackToTopBtn');
  const backBtn = document.getElementById('backBtn');
  const detailTitle = document.getElementById('detailTitle');
  const eventTimeline = document.getElementById('eventTimeline');
  const detailDownloadBtn = document.getElementById('detailDownloadBtn');

  // Detail View Elements (Crowdtest)
  const taskOverlay = document.getElementById('taskOverlay');
  const taskBackBtn = document.getElementById('taskBackBtn');
  const copyPromptBtn = document.getElementById('copyPromptBtn');
  const taskPrompt = document.getElementById('taskPrompt');
  const submitVoteBtn = document.getElementById('submitVoteBtn');
  const openDoubaoBtn = document.getElementById('openDoubaoBtn');
  const openDeepseekBtn = document.getElementById('openDeepseekBtn');

  // Consent Modal Elements
  const consentModal = document.getElementById('consentModal');
  const agreeConsentBtn = document.getElementById('agreeConsentBtn');
  const cancelConsentBtn = document.getElementById('cancelConsentBtn');
  
  // Mock questions
  const mockQuestions = [
    {
      id: 'q_7594446215762546478',
      title: '作为一名拥有10年经验的资深后端架构师，请帮我设计一个支持十万级 QPS 的高可用分布式抢购系统（如双十一秒杀）。请给出核心架构图的文字描述、数据库防超卖的两种具体实现方案对比，以及 Redis 缓存击穿、雪崩和穿透的对应防护策略。',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_8392103482710384721',
      title: '你是一位精通 React 和前端性能优化的专家。我们团队目前有一个长列表渲染的页面（超过 50,000 条复杂数据卡片），在低端安卓机上滚动非常卡顿。请为我提供一份完整的排查思路，并使用 React 编写一个基于“虚拟列表（Virtual List）”原理的核心组件代码，代码需考虑不定高条目的情况。',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_9128374650192837465',
      title: '我是一名跨境电商的运营总监，最近我们准备把国内的一款智能小家电卖到北美和欧洲市场。请帮我制定一份为期 3 个月的 TikTok 和 Instagram 的社媒冷启动方案，需包含：目标人群画像拆解、每周的内容排期表（需列出具体的爆款 Hook 框架），以及如果遇到转化率低于 0.5% 时的 A/B 测试调整策略。',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_1029384756102938475',
      title: '请阅读以下一段有 Goroutine 泄露隐患的 Go 代码（自行假设代码背景），指出其中的 3 处致命错误，并给出修改后的完整代码。同时解释为什么使用 context.Context 来控制 goroutine 生命周期比直接使用 select-channel 更好，以及在生产环境如何通过 pprof 发现这种泄漏。',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_5839201948572019384',
      title: '我现在手头有一份 50GB 的电商用户点击日志（CSV 格式，包含 user_id, item_id, timestamp, action_type）。请使用 PySpark 写一段完整的代码，计算出过去 7 天内“加购但未购买”流失率最高的前 10 个商品类目。代码中需包含处理数据倾斜（Data Skew）的具体策略和参数调优建议。',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_2938475610293847561',
      title: '以鲁迅的笔调，写一篇讽刺当代“互联网大厂 996 加班文化与形式主义周报”的短篇杂文，字数 800 字左右。要求：语言犀利、夹叙夹议，巧妙融入“对齐颗粒度”、“抓手”、“赋能”等现代互联网黑话，但不能显得生硬。',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_4758392019485720193',
      title: '作为 B2B SaaS 产品经理，请帮我规划一个全新的“企业智能报销与风控”模块。输出一份 PRD 大纲，要求包含：1. 针对财务总监和普通员工的双重视角痛点分析；2. 核心功能矩阵（按 P0/P1/P2 优先级划分）；3. 结合 OCR 与 LLM 的虚假发票拦截逻辑设计。',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_9384756102938475610',
      title: '你现在是哈佛大学经济学教授。请向一个完全没有经济学背景的高中生，解释“沉没成本谬误”和“机会成本”的区别。请先用一个关于“排队买奶茶”的生活场景进行生动对比，然后用 1970 年代协和式客机（Concorde）的商业案例进行深度剖析。',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_5610293847561029384',
      title: '请将以下这段拗口的法律免责声明（英文，自行拟定一段约150词的常见隐私政策条款）翻译成中文。要求：第一版提供“直译”（准确无误），第二版提供“信达雅”的意译（符合中国用户的阅读习惯），第三版用“东北方言”重新转述这段话的核心意思。',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_8475610293847561029',
      title: '假设我们要开发一个类似 Notion 的协同文档编辑器。请从前端架构的角度，详细对比 CRDT（冲突无冲突复制数据类型）和 OT（操作转换）这两种协同算法在实时冲突处理、内存占用以及离线支持方面的优劣势，并说明 Notion 为什么最终选择了它现在的技术栈。',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_1122334455667788990',
      title: '帮我设计一个针对 3-5 岁儿童的“恐龙主题”睡前互动故事。故事需要有 3 个分支选项让孩子自己选择走向。请在故事的每段结尾加上给家长的“互动提示”（比如模仿恐龙叫声或者提问），并确保故事的结局包含一个关于“勇敢尝试新事物”的教育意义。',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_2233445566778899001',
      title: '我是独立开发者，打算用 Next.js + Supabase + Stripe 做一个出海的 AI 证件照生成工具。请帮我梳理：1. 从用户上传图片到生成支付订单的核心数据流转图；2. Stripe Webhook 漏单的重试与补偿机制设计；3. 欧盟 GDPR 针对此类包含人脸数据产品的合规红线。',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_3344556677889900112',
      title: '你是一位精通 MySQL 的 DBA。某天凌晨 2 点，线上主库 CPU 突然飙升到 100%，慢查询日志中出现大量类似于 `SELECT * FROM orders WHERE status = 1 ORDER BY create_time DESC LIMIT 100000, 20` 的深分页查询。请给出立刻恢复系统的应急预案，以及后续彻底根治深分页的两种最佳实践。',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_4455667788990011223',
      title: '请扮演一位资深 HRBP，帮我写一封给“试用期未能通过但工作态度极其认真”的应届生员工的辞退面谈信（邮件草稿）。要求：语气要极度委婉、体现人文关怀，明确指出能力不匹配的客观事实，同时附带 N+1 赔偿说明和后续职业发展的正面建议，绝不能引起劳动纠纷风险。',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_5566778899001122334',
      title: '用 Python 实现一个简单的区块链数据结构，包含区块定义、工作量证明（PoW）机制、以及交易记录的添加。请给出完整的可运行代码，并在代码注释中详细解释“哈希难度（Difficulty）”是如何通过调整前导零来控制出块速度的。',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_6677889900112233445',
      title: '请深入分析埃隆·马斯克（Elon Musk）在接手 Twitter（现 X）后，进行的 3 次重大产品与商业模式调整（如蓝V认证、推文限流、创作者分成）。结合行为经济学和平台网络效应理论，评价这些策略的得失，并预测 X 未来一年的日活用户趋势。',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_7788990011223344556',
      title: '我现在有三个 offer：A 是字节跳动（抖音电商后端开发，薪资很高但大小周，边缘业务）；B 是某不知名但已经 C 轮的 AI 独角兽（期权多，全栈，氛围好）；C 是老家省会的某国企（国网，钱少事少离家近）。我是 25 届 211 硕，家境一般。请用麦肯锡的“多维权重评估模型”帮我打分并给出深度建议。',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_8899001122334455667',
      title: '作为一名 Kubernetes 专家，请解释在 k8s 集群中，Pod 频繁出现 OOMKilled 的完整排查链路。请给出使用 kubectl 和相关监控工具定位问题的具体命令，并解释 request/limit 配置不当是如何导致该问题的，最后给出一个生产环境标准的 JVM 容器内存配置模板。',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_9900112233445566778',
      title: '请帮我策划一场线下“咖啡+书籍”跨界联名快闪店的营销活动方案。活动预算 5 万人民币，周期为 3 天。方案需包含：活动主题（需抓取年轻人的社交打卡痛点）、现场动线与互动机制设计、物料清单明细及预估成本、以及如何通过小红书 KOL 种草实现线上二次传播。',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_0011223344556677889',
      title: '请用 C++ 编写一个高性能的内存池（Memory Pool）分配器。要求：避免频繁调用 new/delete 导致的内存碎片问题；支持多线程并发分配与释放且保证线程安全（尽量减少锁冲突，可以考虑 Thread Local Storage）。附带性能测试用例。',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_1231231231231231231',
      title: '你现在是一位精通心理学的情感咨询师。一位女性客户留言：“我和男朋友谈了 3 年，最近他总是以工作忙为由拒绝见面，发微信也回得很敷衍，但每次我提出分手他又极力挽留并道歉。我该怎么办？”请用“依恋理论（Attachment Theory）”帮她分析男友的潜台词，并给出 3 个打破目前僵局的实质性沟通话术。',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_2342342342342342342',
      title: '我们需要用 Three.js 开发一个浏览器端的 3D 汽车展示页面。请给出加载 50MB 的 GLTF 汽车模型并保证首屏加载在 3 秒内的优化方案矩阵（包括但不限于模型压缩、Draco 解码、LOD 细节层次、纹理合并与懒加载等），并写出初始化场景和相机的核心代码。',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_3453453453453453453',
      title: '我是一名独立音乐制作人，想了解 AI 音乐生成工具（如 Suno、Sudio）对传统音乐工业的冲击。请对比这两款工具在旋律生成、人声合成和混音上的技术差异，并为我这种懂乐理但不会编曲的创作者，设计一套结合 AI 与传统 DAW（如 Logic Pro）的工作流。',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_4564564564564564564',
      title: '请深度拆解《塞尔达传说：旷野之息》中的“开放世界引导设计（引力法则）”。结合具体的游戏场景（如初始台地到卡卡利科村），分析任天堂是如何利用“三角形构图法”、“视觉焦点”和“隐性地标”来让玩家在没有明确任务指引下，依然保持强烈的探索驱动力的。',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_5675675675675675675',
      title: '你是一位资深律师。我的创业公司因为使用了某开源协议（GPL v3）的代码，现在想要将整个项目闭源并进行商业化售卖。请详细告诉我这其中的法律侵权风险，GPL 的“传染性”是如何界定的？如果我仅仅是通过 API 调用该开源组件，是否能规避传染性？',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_6786786786786786786',
      title: '请用 Rust 实现一个简易版的 HTTP/1.1 服务器，不依赖第三方库（除了标准库的 std::net 和 std::thread）。要求能正确解析 GET 请求，返回 200 OK 和一个简单的 HTML 页面，并使用线程池来处理并发连接以防单线程阻塞。',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_7897897897897897897',
      title: '作为数据分析师，请帮我设计一套“用户流失预警模型”的特征工程（Feature Engineering）。业务场景是：一个类似 Keep 的健身记录 APP。请列出你需要提取的 20 个高价值特征（分为基础属性、行为频率、社交互动、生命周期四个维度），并说明选用哪种机器学习算法（如 XGBoost 或随机森林）最合适及原因。',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_8908908908908908908',
      title: '我正在用 LaTeX 排版一篇顶级计算机视觉会议（CVPR）的论文。我需要在双栏布局中插入一张跨两栏的超大表格，并且要求表格的标题（Caption）在表格上方，表格下面还需要加一段带注脚的说明。请给出准确的 LaTeX 代码实现，并解决表格经常自动浮动到下一页的问题。',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_9019019019019019019',
      title: '请扮演莎士比亚，以第一人称视角，对现代人沉迷于“短视频（如抖音/TikTok）”这一现象发表一段不少于 500 字的戏剧独白。要求：保留伊丽莎白时代英语的诗意与韵律（请使用中文翻译腔），使用暗喻，展现出对人类注意力碎片化的深刻悲悯。',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_0120120120120120120',
      title: '你是一个专业的提示词工程师（Prompt Engineer）。我需要一个极其严谨的系统提示词（System Prompt），用来将 LLM 变成一个“无情的 JSON 格式化机器”。输入任意杂乱的文章，它必须从中提取人名、时间、地点和事件，并严格输出合法的 JSON，不能包含任何多余的废话、Markdown 标记或解释。请帮我编写并用少量样本测试（Few-shot）。',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_1351351351351351351',
      title: '请详细阐述 Android 系统中 Handler 机制的底层原理。包括 Looper、MessageQueue 和 Message 之间的关系。并在最后回答一个经典面试题：为什么主线程（UI 线程）中的 Looper.loop() 是一个死循环，却不会导致应用发生 ANR（Application Not Responding）？',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_2462462462462462462',
      title: '我要准备一场关于“气候变化与碳中和”的英文演讲（受众是高中生，时长 10 分钟）。请帮我写出完整的演讲稿（全英文）。要求：开场使用一个震撼的数据或故事抓住注意力；中间用类比解释“温室效应”的原理；结尾用富有激情的口吻呼吁行动（Call to Action）。语言需地道且具煽动性。',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_3573573573573573573',
      title: '作为一名金融量化分析师，请帮我用 Python 和 pandas 编写一个针对“双均线策略（MACD）”的回测脚本框架。要求：输入为某只股票的历史日线数据，输出为策略的总收益率、最大回撤（Max Drawdown）和夏普比率（Sharpe Ratio）。请加上滑点（Slippage）和手续费的考虑。',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_4684684684684684684',
      title: '我是一名室内设计师，客户是一对年轻IT丁克夫妇，买了一套 60 平米的老破小（长条形户型，采光差）。他们要求：必须有独立办公区（两台大显示器）、开放式厨房、并解决收纳痛点。请给出一份详细的户型改造思路和动线规划，并推荐 3 种适合这种暗厅的无主灯照明方案。',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_5795795795795795795',
      title: '请深度科普 TCP/IP 协议中的“拥塞控制”算法。不仅要讲清楚慢启动（Slow Start）、拥塞避免（Congestion Avoidance）、快速重传（Fast Retransmit）和快速恢复（Fast Recovery）的原理，还要对比 Reno 和 BBR 这两种算法在丢包率较高的弱网环境下的表现差异。',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_6806806806806806806',
      title: '你是一位营养学与减脂专家。我今年 28 岁，身高 175cm，体重 85kg，体脂率 26%，久坐办公族，没有去健身房的习惯。请为我量身定制一份为期 4 周的“碳水循环法”饮食打卡表，以及每天 20 分钟的居家 HIIT 训练动作组合。要求菜谱必须是中国胃能接受的家常菜，不能是沙拉配鸡胸肉。',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_7917917917917917917',
      title: '我们正在构建一个基于 RAG（检索增强生成）的企业知识库问答系统。但在测试中发现，当用户的问题比较模糊时，向量数据库检索回来的 chunks 相关性极低。请提供至少 4 种优化 RAG 检索召回率（Recall）的前沿技术方案（例如：Query Rewrite、HyDE、Parent Document Retriever 等），并详述其实现逻辑。',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_8028028028028028028',
      title: '请用 JavaScript 写一个深度克隆（Deep Clone）函数。要求：不能使用简单的 JSON.parse(JSON.stringify(obj))，必须能正确处理 Date 对象、RegExp 对象、Function，最重要的是必须解决“循环引用（Circular Reference）”导致栈溢出的致命问题。',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_9139139139139139139',
      title: '假设你要给一本名为《AI 时代的个体崛起：超级个体的商业密码》的新书写一篇 1500 字的前言/序言。请以一位在硅谷投资了多家 AI 初创公司的投资人视角来写，语言要极具商业洞察力和宏大叙事感，点明“在算力平权的时代，个体的认知颗粒度将取代组织的规模优势”。',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_0240240240240240240',
      title: '在微服务架构中，分布式事务是一个大难题。请详细对比两阶段提交（2PC）、TCC（Try-Confirm-Cancel）和基于可靠消息的最终一致性（如 RocketMQ 半消息）这三种方案。并说明在“用户下单扣减库存”这个高并发业务场景中，为什么大家通常选择后者而不是 TCC？',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_1111111111111111111',
      title: '你是一位资深导演/编剧。我需要为一个扫地机器人的新品拍摄一支 1 分钟的搞笑反转病毒广告。请给我输出分镜头脚本（Storyboard），包含：镜号、景别、画面内容描述、台词/音效、时长。要求核心卖点（毛发防缠绕、越障能力）必须通过拟人化或极度夸张的戏剧冲突来展现。',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_2222222222222222222',
      title: '我正在学习汇编语言与计算机底层原理。请解释“函数调用栈（Call Stack）”在执行时是如何工作的。请结合具体的 x86 汇编指令（如 push, pop, call, ret），详细描述当函数 A 调用函数 B 时，栈指针（ESP/RSP）和基址指针（EBP/RBP）的移动过程，以及局部变量是如何在栈上分配内存的。',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_3333333333333333333',
      title: '请从生物学、社会学和进化心理学三个维度，深度剖析为什么现代人类会如此普遍地患有“拖延症（Procrastination）”。并结合多巴胺分泌机制，给出三个立竿见影、反直觉的克服拖延症的实操方法（不要泛泛而谈的番茄工作法）。',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_4444444444444444444',
      title: '使用 Docker Compose 部署一个包含 Nginx、Node.js 后端、Redis 和 MySQL 的完整项目。请提供详细的 `docker-compose.yml` 文件。要求：Nginx 需要配置 SSL 证书（假设挂载在本地目录）；MySQL 数据必须挂载数据卷持久化；所有服务通过自定义内部网络互相通信，只有 Nginx 暴露 80 和 443 端口到宿主机。',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_5555555555555555555',
      title: '作为一名高级专利代理人，请帮我分析：如果某科技公司利用公开合法的网络数据训练了一个 AI 绘图大模型，然后生成了一幅与某知名插画师画风极度相似（但构图不同）的画作并商用。根据目前中美两国的版权法趋势，这是否构成侵权？判定实质性相似的边界到底在哪里？',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_6666666666666666666',
      title: '你现在是一位中英同声传译。请将下面这段极具中国文化特色的句子，翻译成不仅英语母语者能听懂，还能保留原话气势的英文（请提供逐字翻译和同传优化后的两个版本）：\n“沧海横流，方显英雄本色。面对百年未有之大变局，我们不能在困难面前打退堂鼓，而要逢山开路、遇水架桥，杀出一条血路来！”',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_7777777777777777777',
      title: '请用 Swift 语言编写一个简单的多生产者-单消费者（MPSC）并发队列。要求不能直接使用标准库现成的 mpsc channel，而是利用 Mutex 和 Condvar 从头实现。代码需附带详细的中文注释，说明在哪一步可能会发生“虚假唤醒（Spurious Wakeup）”以及如何防范。',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_8888888888888888888',
      title: '我想给女朋友准备一个一周年纪念日惊喜，但我不想送普通的口红、包包或吃顿烛光晚餐。预算在 3000 元以内。请帮我策划一个“沉浸式解谜寻宝游戏”的惊喜流程。要求：需要在城市里设置 4 个线索打卡点，每个线索都要与我们过去一年的共同回忆相关，最终导向终极大奖的地点。',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_9999999999999999999',
      title: '在 Spring Boot 项目中，我们经常使用 `@Transactional` 注解来控制事务。请列举并详细解释 5 种会导致 `@Transactional` 注解完全失效的经典场景（例如：自调用问题、异常被 catch 吃掉等），并针对“同一个类中的方法自调用导致事务失效”给出两种标准的解决办法。',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_1010101010101010101',
      title: '我正在开发一款像素风的 2D 独立游戏，需要实现一个怪物的 AI 寻路逻辑。由于地图很大且有动态障碍物，A* 算法的性能开销太高。请向我介绍一种更轻量级的寻路算法或 A* 的优化变体（如 JPS 跳点搜索算法），并用通俗的语言解释其核心加速原理和在网格地图中的适用局限。',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_2020202020202020202',
      title: '请站在一个“悲观的未来学家”视角，写一篇分析“AGI（通用人工智能）如果失控，最可能以怎样的方式毁灭人类”的文章。要求：抛弃科幻电影中“终结者机器人开枪射击”的粗浅想象，从“资源获取最优化”、“目标函数错误对齐（纸针工厂思想实验）”以及“悄无声息的金融系统渗透”等深层逻辑进行推演。',
      status: 'unclaimed',
      claimedBy: null
    },
    {
      id: 'q_3030303030303030303',
      title: '我是 0 基础小白，想系统学习区块链智能合约开发。请为我制定一份 6 个月的学习路线图（Roadmap）。要求：具体到每个月应该看什么书籍/官方文档，应该掌握哪些前置知识（如 JavaScript、Solidity），以及每个阶段必须完成的一个“里程碑实战项目”（如发币、写一个去中心化交易所 DEX 模型）。',
      status: 'unclaimed',
      claimedBy: null
    }
  ];

  const persistQuestionsState = () => {
    if (!currentUser) return;
    const key = getUserKey('questionsState');
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      const updates = { [key]: mockQuestions };
      if (currentActiveQuestion) {
        updates.activeCrowdtestQuestion = currentActiveQuestion;
      }
      chrome.storage.local.set(updates);
    }
  };

  const loadQuestionsState = (callback) => {
    if (!currentUser) {
      if(callback) callback();
      return;
    }
    const key = getUserKey('questionsState');
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get([key], (result) => {
        if (result[key] && Array.isArray(result[key])) {
          const savedQuestions = result[key];
          const savedMap = {};
          savedQuestions.forEach(q => savedMap[q.id] = q);
          
          mockQuestions.forEach(q => {
            if (savedMap[q.id]) {
              Object.assign(q, savedMap[q.id]);
            }
          });
        }
        if(callback) callback();
      });
    } else {
      if(callback) callback();
    }
  };

  function renderCrowdtestQuestions() {
    const container = document.getElementById('ctQuestionListContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    const myUserId = currentUser ? currentUser.id : 'guest';
    
    // Rule: Everyone can see questions they have claimed, or questions not claimed by anyone else
    const visibleQuestions = mockQuestions.filter(q => !q.claimedBy || q.claimedBy === myUserId);
    
    if (visibleQuestions.length === 0) {
      container.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 40px 0; font-size: 13px;">暂无可领取的题目</div>';
      return;
    }
    
    visibleQuestions.forEach((q, displayIndex) => {
      const originalIndex = mockQuestions.indexOf(q);
      
      let btnText = '领取题目';
      let btnClass = 'ct-claim-btn btn-primary';
      let badgeHtml = '<span class="ct-status-badge" style="display: none; font-size: 11px; padding: 2px 6px; border-radius: 4px; font-weight: 600; white-space: nowrap; flex-shrink: 0;"></span>';
      
      if (q.status === 'in_progress') {
        btnText = '进入题目';
        btnClass += ' claimed';
        badgeHtml = '<span class="ct-status-badge" style="font-size: 11px; padding: 2px 6px; border-radius: 4px; font-weight: 600; white-space: nowrap; flex-shrink: 0; display: block; background: #FEF3C7; color: #D97706;">进行中</span>';
      } else if (q.status === 'submitted') {
        btnText = '已提交';
        btnClass += ' submitted';
        badgeHtml = '<span class="ct-status-badge" style="font-size: 11px; padding: 2px 6px; border-radius: 4px; font-weight: 600; white-space: nowrap; flex-shrink: 0; display: block; background: var(--btn-secondary-bg); color: var(--icon-inactive);">已提交</span>';
      }
      
      const card = document.createElement('div');
      card.className = 'capability-card';
      card.style.cssText = 'margin-bottom: 12px; display: flex; flex-direction: column; gap: 12px; position: relative;';
      
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
          <div style="font-size: 14px; font-weight: 500; color: var(--text-main);">${displayIndex + 1}. ${q.title}</div>
          ${badgeHtml}
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="ct-question-id-pill" style="margin: 0;">题目ID: ${q.id.replace('q_', '')}</span>
          <button class="${btnClass}" data-index="${originalIndex}" style="margin: 0; padding: 6px 16px; width: auto; font-size: 12px;">${btnText}</button>
        </div>
      `;
      
      container.appendChild(card);
    });
    
    // Bind click events
    container.querySelectorAll('.ct-claim-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
        attemptClaimQuestion(idx, e.currentTarget);
      });
    });
  }

  let currentActiveQuestion = null;

  let pendingQuestion = null;

  function attemptClaimQuestion(index, btn) {
    if (!requireAuth()) return;
    
    if (btn && btn.classList.contains('submitted')) return;
    
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ action: 'getState' }, (response) => {
        if (response && response.isMediaRecording && response.isTrajRecording) {
          // Already recording both, open task directly
          openQuestionDetail(index, btn);
        } else {
          // If already claimed, maybe they stopped recording? We still ask them to record
          pendingQuestion = { index, btn };
          if (consentModal) consentModal.classList.add('show');
        }
      });
    } else {
      console.warn('Chrome runtime not available. Simulating task open.');
      openQuestionDetail(index, btn);
    }
  }

  function openQuestionDetail(index, btn) {
    currentActiveQuestion = mockQuestions[index];
    
    // Mark as claimed
    if (currentActiveQuestion && currentActiveQuestion.status === 'unclaimed') {
      currentActiveQuestion.status = 'in_progress';
      currentActiveQuestion.claimedBy = currentUser ? currentUser.id : 'guest';
      persistQuestionsState(); // Save state
      renderCrowdtestQuestions(); // Re-render list
    }
    
    const promptTextEl = document.getElementById('ctDetailPromptText');
    if (promptTextEl && currentActiveQuestion) {
      promptTextEl.textContent = currentActiveQuestion.title;
    }
    
    const ctDetailQuestionIdBadge = document.getElementById('ctDetailQuestionIdBadge');
    if (ctDetailQuestionIdBadge && currentActiveQuestion) {
      ctDetailQuestionIdBadge.textContent = `题目ID: ${currentActiveQuestion.id.replace('q_', '')}`;
      ctDetailQuestionIdBadge.style.display = 'inline-block';
    }

    const ctQuestionDetailOverlay = document.getElementById('ctQuestionDetailOverlay');
    if (ctQuestionDetailOverlay) {
      ctQuestionDetailOverlay.classList.add('open');
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set({ activeCrowdtestQuestion: currentActiveQuestion });
      }
      
      // Perform consistency check with page when entering
      setTimeout(() => {
        checkConsistencyWithPage();
      }, 1000);
      
      // Render TOC immediately when opening the task
      setTimeout(() => {
        renderToc();
      }, 100);
    }
  }

  if (cancelConsentBtn) {
    cancelConsentBtn.addEventListener('click', () => {
      consentModal.classList.remove('show');
      pendingQuestion = null;
    });
  }

  if (agreeConsentBtn) {
    agreeConsentBtn.addEventListener('click', async () => {
      agreeConsentBtn.textContent = '开启中...';
      
      // Before starting the media recording, we need to make sure currentActiveQuestion is set
      // so that mediaRecorder.onstop can access it
      if (pendingQuestion) {
        currentActiveQuestion = mockQuestions[pendingQuestion.index];
      }
      
      // Call the actual media recording logic
      const taskName = document.querySelector('.task-card h3')?.textContent || "豆包 vs Deepseek";
      const questionId = currentActiveQuestion ? currentActiveQuestion.id : null;
      const started = await startRealMediaRecording(taskName, questionId);
      
      if (started) {
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
          // Send startMasterRecording so the master view works and duration is tracked
          chrome.runtime.sendMessage({
            action: 'startMasterRecording',
            recordScreen: true,
            recordTraj: true,
            taskId: taskName,
            questionId: questionId
          }, () => {
            // Media recording is handled, now start traj recording
            chrome.runtime.sendMessage({ action: 'startTrajRecording' }, () => {
              updateUI();
              agreeConsentBtn.textContent = '同意并开启';
              consentModal.classList.remove('show');
              
              if (pendingQuestion) {
                openQuestionDetail(pendingQuestion.index, pendingQuestion.btn);
                pendingQuestion = null;
              }
            });
          });
        }
      } else {
        // If user cancelled or failed, reset button
        agreeConsentBtn.textContent = '同意并开启';
        consentModal.classList.remove('show');
      }
    });
  }

  // Tab Switching Logic
  const modelTabs = document.querySelectorAll('.ct-model-tab');
  modelTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      const target = e.currentTarget.getAttribute('data-target');
      
      // Update Tab Styles
      modelTabs.forEach(t => {
        t.classList.remove('active');
        t.style.color = 'var(--text-muted)';
        t.style.borderBottom = '2px solid transparent';
      });
      e.currentTarget.classList.add('active');
      e.currentTarget.style.color = 'var(--primary-color)';
      e.currentTarget.style.borderBottom = '2px solid var(--primary-color)';
      
      // Update Content Visibility
      document.querySelectorAll('.ct-tab-content').forEach(c => {
        c.style.display = 'none';
        c.classList.remove('active');
      });
      const activeContent = document.getElementById(`ct-tab-${target}`);
      if (activeContent) {
        activeContent.style.display = 'block';
        activeContent.classList.add('active');
      }
      
      // Update TOC
      renderToc();
    });
  });

  // TOC Toggle Logic
  const tocHeader = document.getElementById('ctTocHeader');
  const tocBody = document.getElementById('ctTocBody');
  const tocIcon = document.getElementById('ctTocToggleIcon');
  if (tocHeader && tocBody && tocIcon) {
    tocHeader.addEventListener('click', () => {
      const isHidden = tocBody.style.display === 'none';
      if (isHidden) {
        tocBody.style.display = 'block';
        tocIcon.style.transform = 'rotate(0deg)';
      } else {
        tocBody.style.display = 'none';
        tocIcon.style.transform = 'rotate(180deg)';
      }
    });
  }

  if (taskBackBtn) {
    taskBackBtn.addEventListener('click', () => {
      taskOverlay.classList.remove('open');
    });
  }

  if (copyPromptBtn) {
    copyPromptBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(taskPrompt.textContent);
        const originalText = copyPromptBtn.textContent;
        copyPromptBtn.textContent = '已复制！';
        copyPromptBtn.style.color = '#10B981'; // Green
        setTimeout(() => {
          copyPromptBtn.textContent = originalText;
          copyPromptBtn.style.color = 'var(--primary-color)';
        }, 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    });
  }

  if (submitVoteBtn) {
    submitVoteBtn.addEventListener('click', () => {
      submitVoteBtn.textContent = '报告提交成功！';
      submitVoteBtn.style.backgroundColor = '#10B981';
      setTimeout(() => {
        if (taskOverlay) taskOverlay.classList.remove('open');
        submitVoteBtn.textContent = '提交完整评测报告';
        submitVoteBtn.style.backgroundColor = '';
        // Reset rounds
        resetRounds();
      }, 1500);
    });
  }

  const addRoundBtn = document.getElementById('addRoundBtn');
  const ctAddRoundBtnTop = document.getElementById('ctAddRoundBtn');
  let roundCount = 1;

  if (ctAddRoundBtnTop) {
    ctAddRoundBtnTop.addEventListener('click', () => {
      chrome.storage.local.get(['currentRoundCount'], (res) => {
        const newRound = (res.currentRoundCount || 1) + 1;
        chrome.storage.local.set({ currentRoundCount: newRound });
      });
    });
  }

  function resetRounds() {
    chrome.storage.local.set({ currentRoundCount: 1 });
    // Reset global GSB vote
    const gsbVotes = document.querySelectorAll('input[name="global_gsb_vote"]');
    gsbVotes.forEach(radio => radio.checked = false);
    // Reset global GSB reason
    const gsbReason = document.getElementById('globalGsbReason');
    if (gsbReason) gsbReason.value = '';
    // Reset avg score displays
    const doubaoScoreEl = document.getElementById('doubaoGlobalAvgScore');
    const deepseekScoreEl = document.getElementById('deepseekGlobalAvgScore');
    if (doubaoScoreEl) doubaoScoreEl.innerText = '0.0';
    if (deepseekScoreEl) deepseekScoreEl.innerText = '0.0';
  }

  let currentActiveTrajectory = null;

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      detailOverlay.classList.remove('open');
      currentActiveTrajectory = null;
    });
  }

  if (detailDownloadBtn) {
    detailDownloadBtn.addEventListener('click', () => {
      if (currentActiveTrajectory) {
        downloadTrajectory(currentActiveTrajectory);
      }
    });
  }

  // Trajectory Back to top logic
  if (trajDetailBody && trajBackToTopBtn) {
    trajDetailBody.addEventListener('scroll', () => {
      if (trajDetailBody.scrollTop > 300) {
        trajBackToTopBtn.classList.add('visible');
      } else {
        trajBackToTopBtn.classList.remove('visible');
      }
    });

    trajBackToTopBtn.addEventListener('click', () => {
      trajDetailBody.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // Dropdown Logic
  const setupDropdown = (controlId, triggerId, menuId, labelId) => {
    const control = document.getElementById(controlId);
    const trigger = document.getElementById(triggerId);
    const menu = document.getElementById(menuId);
    const label = document.getElementById(labelId);
    
    if (trigger && menu && label) {
      const items = menu.querySelectorAll('.dropdown-item');
      
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        // Close all other menus
        document.querySelectorAll('.dropdown-menu').forEach(m => {
          if (m !== menu) m.classList.remove('show');
        });
        menu.classList.toggle('show');
      });

      items.forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          items.forEach(i => i.classList.remove('active'));
          item.classList.add('active');
          
          // Update label text
          const displayLabel = item.getAttribute('data-label') || item.textContent;
          label.textContent = displayLabel;
          
          menu.classList.remove('show');
        });
      });
    }
  };

  // We removed modeMenu and micMenu, so only setup trajModeControl if it exists
  setupDropdown('trajModeControl', 'trajModeTrigger', 'trajModeMenu', 'trajModeLabel');

  // Close menus when clicking outside
  document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('show'));
  });

  // Mic Toggle & Audio Visualization Logic
  const micIconWrapper = document.getElementById('micIconWrapper');
  const micIconActive = document.getElementById('micIconActive');
  const micIconMuted = document.getElementById('micIconMuted');
  const micVolumeFill = document.getElementById('micVolumeFill');
  
  let isMicMuted = false;
  let audioContext = null;
  let analyser = null;
  let microphone = null;
  let animationFrameId = null;

  if (micIconWrapper) {
    micIconWrapper.addEventListener('click', async (e) => {
      e.stopPropagation(); // Prevent opening the dropdown menu
      isMicMuted = !isMicMuted;
      
      if (isMicMuted) {
        // Mute State
        if (micIconActive) micIconActive.style.display = 'none';
        if (micIconMuted) micIconMuted.style.display = 'block';
        stopAudioVisualizer();
      } else {
        // Active State
        if (micIconActive) micIconActive.style.display = 'block';
        if (micIconMuted) micIconMuted.style.display = 'none';
        await startAudioVisualizer();
      }
    });
  }

  async function startAudioVisualizer() {
    try {
      // 获取当前选中的麦克风设备ID
      const micMenu = document.getElementById('micMenu');
      const activeMicItem = micMenu ? micMenu.querySelector('.dropdown-item.active') : null;
      const deviceId = activeMicItem ? activeMicItem.getAttribute('data-value') : null;
      
      const constraints = { audio: true };
      if (deviceId) {
        constraints.audio = { deviceId: { exact: deviceId } };
      }

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      microphone = audioContext.createMediaStreamSource(stream);
      
      microphone.connect(analyser);
      analyser.fftSize = 256;
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      function updateVolume() {
        if (isMicMuted) return;

        analyser.getByteFrequencyData(dataArray);
        
        // Calculate average volume
        let sum = 0;
        for(let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        let average = sum / bufferLength;
        
        // Map average volume (0-255) to a percentage height (0-100%)
        // Add a small baseline (e.g., 10%) so it doesn't look completely empty when quiet
        let volumePercent = Math.min(100, Math.max(10, (average / 128) * 100));
        
        micVolumeFill.style.height = `${volumePercent}%`;

        animationFrameId = requestAnimationFrame(updateVolume);
      }

      updateVolume();
    } catch (err) {
      // Use console.log or simply comment out console.warn to prevent Chrome from flagging it as an Extension Error.
      // In Side Panel, requesting media access without explicit permissions/https can trigger a DOMException.
      console.log('Microphone access denied for visualizer. Using static UI fallback.', err.message || '');
      // Fallback: If permission denied, just set it to a static green level
      if (micVolumeFill) micVolumeFill.style.height = '40%';
    }
  }

  function stopAudioVisualizer() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    if (microphone) {
      microphone.disconnect();
    }
    if (audioContext && audioContext.state !== 'closed') {
      audioContext.close();
    }
    if (micVolumeFill) micVolumeFill.style.height = '0%';
  }

  // Start visualizer by default if not muted
  if (!isMicMuted) {
    startAudioVisualizer();
  }

  // Fetch current state from background script
  const updateUI = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ action: 'getState' }, (response) => {
        if (chrome.runtime.lastError || !response) {
          console.warn('Failed to get state:', chrome.runtime.lastError);
          return;
        }
        
        // Update master recording UI
        updateMasterRecordingUI(response);

        // Update nav recording indicator
        const navIndicator = document.getElementById('navRecordIndicator');
        if (navIndicator) {
          if (response.isMasterRecording || response.isMediaRecording || response.isTrajRecording) {
            navIndicator.classList.add('active');
          } else {
            navIndicator.classList.remove('active');
          }
        }

        // Update lists
        renderMedia(response.savedMedia || []);
        // Trajectories can be rendered inside media card or hidden, based on design
        // renderTrajectories(response.savedTrajectories || []);
      });
    } else {
      console.warn('Chrome runtime not available. Skipping state fetch.');
    }
  };

  // Variables for list expansion state
  let mediaListExpanded = false;
  let trajListExpanded = false;

  const filterTaskIdInput = document.getElementById('filterTaskId');
  const filterQuestionIdInput = document.getElementById('filterQuestionId');
  const sortMediaSelect = document.getElementById('sortMediaSelect');
  const deleteAllMediaBtn = document.getElementById('deleteAllMediaBtn');

  if (filterTaskIdInput) filterTaskIdInput.addEventListener('input', updateUI);
  if (filterQuestionIdInput) filterQuestionIdInput.addEventListener('input', updateUI);
  if (sortMediaSelect) sortMediaSelect.addEventListener('change', updateUI);

  if (deleteAllMediaBtn) {
    deleteAllMediaBtn.addEventListener('click', () => {
      showDeleteConfirmModal('确定要删除所有录制文件吗？删除后将无法恢复。', () => {
        const userKey = getUserKey('media');
        const legacyKey = 'savedMedia';
        chrome.storage.local.get([userKey, legacyKey], async (result) => {
          let savedUser = result[userKey] || [];
          let savedLegacy = result[legacyKey] || [];
          
          const allMedia = [...savedUser, ...savedLegacy];
          
          // Delete blobs
          for (const m of allMedia) {
            if (m.url && m.url.startsWith('vid_')) {
              try {
                await deleteVideoBlob(m.url);
              } catch (err) {
                console.error('Failed to delete blob', err);
              }
            }
          }
          
          const updates = {};
          updates[userKey] = [];
          updates[legacyKey] = [];
          
          chrome.storage.local.set(updates, () => {
            updateUI();
          });
        });
      });
    });
  }

  const renderMedia = (mediaList) => {
    const showMoreBtn = document.getElementById('mediaShowMoreBtn');
    
    // 过滤掉因为取消录屏产生的无效空记录
    const validMediaList = mediaList.filter(m => {
      const isPhantom = m.durationMs === 0 && !m.hasVideo && !m.hasTraj && (!m.name || m.name.includes('UnknownTask'));
      return !isPhantom;
    });

    let filteredList = validMediaList.filter(m => {
      const filterTask = document.getElementById('filterTaskId')?.value.toLowerCase() || '';
      const filterQuestion = document.getElementById('filterQuestionId')?.value.toLowerCase() || '';
      
      const mTask = (m.taskId || '').toLowerCase();
      const mQuestion = (m.questionId || (m.taskIds && m.taskIds[0]) || '').toLowerCase();
      
      if (filterTask && !mTask.includes(filterTask)) return false;
      if (filterQuestion && !mQuestion.includes(filterQuestion)) return false;
      return true;
    });

    const sortOrder = document.getElementById('sortMediaSelect')?.value || 'desc';
    const sortedList = filteredList.sort((a, b) => {
      if (sortOrder === 'asc') return a.id - b.id;
      return b.id - a.id; // desc default
    });

    if (sortedList.length === 0) {
      if (mediaEmptyState) mediaEmptyState.style.display = 'flex';
      if (mediaNotesList) mediaNotesList.style.display = 'none';
      if (showMoreBtn) showMoreBtn.style.display = 'none';
      return;
    } else {
      if (mediaEmptyState) mediaEmptyState.style.display = 'none';
      if (mediaNotesList) {
        mediaNotesList.style.display = 'flex';
        mediaNotesList.style.flexDirection = 'column';
        mediaNotesList.style.gap = '8px';
        mediaNotesList.innerHTML = '';
      }
    }

    const displayCount = mediaListExpanded ? sortedList.length : Math.min(5, sortedList.length);
    
    if (sortedList.length > 5) {
      if (showMoreBtn) {
        showMoreBtn.style.display = 'block';
        showMoreBtn.textContent = mediaListExpanded ? '收起 ▴' : '显示更多 ▾';
        showMoreBtn.onclick = () => {
          mediaListExpanded = !mediaListExpanded;
          renderMedia(mediaList);
        };
      }
    } else {
      if (showMoreBtn) showMoreBtn.style.display = 'none';
    }

    let newlyAddedId = null;
    if (window.justFinishedRecording && sortedList.length > 0) {
      // Find the newest item based on ID (timestamp)
      const newestItem = [...sortedList].sort((a, b) => b.id - a.id)[0];
      newlyAddedId = newestItem.id;
      window.justFinishedRecording = false; // Reset so it only blinks once
    }

    sortedList.slice(0, displayCount).forEach(media => {
      const item = document.createElement('div');
      item.className = 'note-item';
      if (media.id === newlyAddedId) {
        item.classList.add('highlight-new-item');
      }
      item.style.cursor = 'pointer'; // Make card look clickable
      
      const info = document.createElement('div');
      info.className = 'note-info';
      
      const title = document.createElement('div');
      title.className = 'note-title';
      title.style.display = 'flex';
      title.style.alignItems = 'center';
      title.style.flexWrap = 'wrap';

      const titleText = document.createElement('span');
      // 兼容旧数据：去除可能包含的时间和题目ID
      let displayName = media.name || '';
      if (displayName.includes('（题目ID：')) {
        displayName = displayName.split('（')[0].trim();
      }
      titleText.textContent = displayName;
      titleText.style.marginRight = '8px';
      title.appendChild(titleText);

      // 紫色小标签气泡显示题目ID
      const taskIds = media.taskIds || (media.taskId ? [media.taskId] : []);
      if (taskIds.length > 0) {
        const badge = document.createElement('span');
        badge.textContent = `题目ID: ${taskIds[0]}`;
        badge.style.fontSize = '10px';
        badge.style.backgroundColor = 'rgba(107, 78, 255, 0.1)';
        badge.style.color = '#6B4EFF';
        badge.style.padding = '2px 8px';
        badge.style.borderRadius = '12px';
        badge.style.fontWeight = '600';
        badge.style.whiteSpace = 'nowrap';
        title.appendChild(badge);
      }
      
      const meta = document.createElement('div');
      meta.className = 'note-meta';
      meta.textContent = `${media.date} ${media.startTime || ''}`.trim();

      info.appendChild(title);
      info.appendChild(meta);

      // Add Delete Button
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width:20px;height:20px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>';
      deleteBtn.style.cssText = 'background:none; border:none; color:#EF4444; padding:6px; cursor:pointer; border-radius:6px; transition:opacity 0.2s, background 0.2s; opacity:0; flex-shrink:0;';
      
      // Build content for duration and capabilities
      const detailsContainer = document.createElement('div');
      detailsContainer.style.display = 'flex';
      detailsContainer.style.gap = '12px';
      detailsContainer.style.marginTop = '6px';
      detailsContainer.style.fontSize = '12px';
      detailsContainer.style.color = 'var(--text-muted)';
      
      let durationText = '--';
      if (media.durationMs) {
        const dSecs = Math.round(media.durationMs / 1000);
        const dm = Math.floor(dSecs / 60);
        const ds = dSecs % 60;
        durationText = `${dm}分${ds}秒`;
      } else if (media.startTime && media.endTime) {
        try {
          const start = new Date(`1970/01/01 ${media.startTime}`);
          const end = new Date(`1970/01/01 ${media.endTime}`);
          let diffSecs = Math.round((end - start) / 1000);
          if (diffSecs < 0) diffSecs += 24 * 3600;
          const dm = Math.floor(diffSecs / 60);
          const ds = diffSecs % 60;
          durationText = `${dm}分${ds}秒`;
        } catch(e){}
      }
      
      const durationItem = document.createElement('div');
      durationItem.style.display = 'flex';
      durationItem.style.alignItems = 'center';
      durationItem.style.gap = '4px';
      durationItem.innerHTML = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>工时: ${durationText}`;
      
      const hasVideo = media.hasVideo !== false; // default true for old records
      const videoItem = document.createElement('div');
      videoItem.style.display = 'flex';
      videoItem.style.alignItems = 'center';
      videoItem.style.gap = '4px';
      videoItem.innerHTML = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; color: ${hasVideo ? '#10B981' : 'var(--text-muted)'};"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg><span style="color: ${hasVideo ? 'var(--text-main)' : 'var(--text-muted)'};">录屏${hasVideo ? ' ✓' : ' -'}</span>`;

      const hasTraj = media.hasTraj || false;
      const trajItem = document.createElement('div');
      trajItem.style.display = 'flex';
      trajItem.style.alignItems = 'center';
      trajItem.style.gap = '4px';
      trajItem.innerHTML = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; color: ${hasTraj ? '#3B82F6' : 'var(--text-muted)'};"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg><span style="color: ${hasTraj ? 'var(--text-main)' : 'var(--text-muted)'};">轨迹${hasTraj ? ' ✓' : ' -'}</span>`;
      
      detailsContainer.appendChild(durationItem);
      detailsContainer.appendChild(videoItem);
      detailsContainer.appendChild(trajItem);

      info.appendChild(detailsContainer);

      item.appendChild(info);
      item.appendChild(deleteBtn);
      
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showDeleteConfirmModal('确定要删除这个录制文件吗？删除后将无法恢复。', () => {
          const userKey = getUserKey('media');
          const legacyKey = 'savedMedia';
          chrome.storage.local.get([userKey, legacyKey], async (result) => {
            let savedUser = result[userKey] || [];
            let savedLegacy = result[legacyKey] || [];
            
            savedUser = savedUser.filter(m => m.id !== media.id);
            savedLegacy = savedLegacy.filter(m => m.id !== media.id);
            
            const updates = {};
            updates[userKey] = savedUser;
            updates[legacyKey] = savedLegacy;
            
            chrome.storage.local.set(updates, async () => {
              if (media.url && media.url.startsWith('vid_')) {
                try {
                  await deleteVideoBlob(media.url);
                } catch (err) {
                  console.error('Failed to delete blob', err);
                }
              }
              // merge and sort for UI update
              const mergedMap = new Map();
              savedLegacy.forEach(item => mergedMap.set(item.id, item));
              savedUser.forEach(item => mergedMap.set(item.id, item));
              const mergedList = Array.from(mergedMap.values());
              mergedList.sort((a, b) => b.id - a.id);
              renderMedia(mergedList);
            });
          });
        });
      });

      // Make the whole item clickable
      item.addEventListener('click', async () => {
        // Populate details view
        const mediaDetailTitle = document.getElementById('mediaDetailTitle');
        const detailsStartTime = document.getElementById('detailsStartTime');
        const detailsEndTime = document.getElementById('detailsEndTime');
        const detailsDuration = document.getElementById('detailsDuration');
        const mediaDetailOverlay = document.getElementById('mediaDetailOverlay');
        const mediaDetailTaskIds = document.getElementById('mediaDetailTaskIds');
        const detailsVideoPlayer = document.getElementById('detailsVideoPlayer');
        const detailsVideoPlaceholder = document.getElementById('detailsVideoPlaceholder');
        const customFullscreenBtn = document.getElementById('customFullscreenBtn');

        if (mediaDetailTitle) {
          let detailName = media.name || '';
          if (detailName.includes('（题目ID：')) {
            detailName = detailName.split('（')[0].trim();
          }
          mediaDetailTitle.textContent = detailName;
        }
        if (detailsStartTime) detailsStartTime.textContent = media.startTime || '--';
        if (detailsEndTime) detailsEndTime.textContent = media.endTime || '--';
        
        // Calculate duration if possible
        if (detailsDuration && media.startTime && media.endTime) {
          try {
            const start = new Date(`1970/01/01 ${media.startTime}`);
            const end = new Date(`1970/01/01 ${media.endTime}`);
            let diffSecs = Math.round((end - start) / 1000);
            if (diffSecs < 0) diffSecs += 24 * 3600; // cross midnight
            const mins = Math.floor(diffSecs / 60);
            const secs = diffSecs % 60;
            detailsDuration.textContent = `${mins}分${secs}秒`;
          } catch (err) {
            detailsDuration.textContent = '未知';
          }
        } else if (detailsDuration) {
          detailsDuration.textContent = '--';
        }

        // Show full screen overlay first
        if (mediaDetailOverlay) {
          mediaDetailOverlay.classList.add('open');
        }

        // Populate details view task ids
        if (mediaDetailTaskIds) {
          if (media.taskIds && media.taskIds.length > 0) {
            mediaDetailTaskIds.innerHTML = media.taskIds.map(id => `<div style="margin-bottom:2px;">${id}</div>`).join('');
          } else if (media.taskId) {
            mediaDetailTaskIds.textContent = media.taskId;
          } else {
            mediaDetailTaskIds.textContent = '--';
          }
        }

        // 异步从 IndexedDB 获取视频 Blob
        let finalUrl = null;
        let loadError = null;
        if (media.url && media.url.startsWith('vid_')) {
          try {
            let blob = await getVideoBlob(media.url);
            if (!blob) {
              // fallback to media.id in case old ones were saved differently
              blob = await getVideoBlob(media.id);
            }
            if (blob) {
              finalUrl = URL.createObjectURL(blob);
            } else {
              loadError = '该视频文件已被清理或未能成功保存。';
            }
          } catch (err) {
            console.error('Failed to load video from IndexedDB', err);
            loadError = '加载视频失败：' + (err.message || '未知错误');
          }
        } else if (media.url) {
          // Backward compatibility for old blob URLs (though they might be broken)
          if (media.url.startsWith('blob:')) {
            loadError = '早期版本的临时视频文件已失效（插件重启或页面刷新导致）。';
          } else {
            finalUrl = media.url;
          }
        } else {
          loadError = media.hasVideo === false ? '本次任务未开启屏幕录制' : '没有找到关联的视频文件。';
        }

        // Setup Video Player
        if (detailsVideoPlayer && detailsVideoPlaceholder) {
          if (finalUrl) {
            detailsVideoPlayer.src = finalUrl;
            detailsVideoPlayer.style.display = 'block';
            detailsVideoPlaceholder.style.display = 'none';
            if (videoContainer) {
              videoContainer.style.background = '#000';
              videoContainer.style.border = 'none';
            }
            if (customFullscreenBtn) customFullscreenBtn.style.display = 'block';
            // Force load the video so the first frame appears or it becomes playable
            detailsVideoPlayer.load();
          } else {
            detailsVideoPlayer.style.display = 'none';
            detailsVideoPlaceholder.style.display = 'flex';
            if (videoContainer) {
              videoContainer.style.background = 'var(--bg-color)';
              videoContainer.style.border = '1px dashed var(--border-color)';
            }
            const placeholderText = document.getElementById('detailsVideoPlaceholderText');
            if (placeholderText) {
              placeholderText.textContent = loadError || '暂无视频流';
            }
            if (customFullscreenBtn) customFullscreenBtn.style.display = 'none';
          }
        }
        
        // Setup Trajectory Section
        const mediaTrajSection = document.getElementById('mediaTrajSection');
        const mediaTrajCountBadge = document.getElementById('mediaTrajCountBadge');
        const mediaTrajTimeline = document.getElementById('mediaTrajTimeline');
        const mediaTrajDownloadBtn = document.getElementById('mediaTrajDownloadBtn');

        if (mediaTrajSection) {
          mediaTrajSection.style.display = 'block';
          const evs = media.hasTraj ? (media.trajectoryEvents || []) : [];
          if (mediaTrajCountBadge) {
            mediaTrajCountBadge.textContent = evs.length;
            mediaTrajCountBadge.style.display = media.hasTraj ? 'inline-block' : 'none';
          }
          
          if (mediaTrajTimeline) {
            mediaTrajTimeline.innerHTML = '';
            if (media.hasTraj && evs.length > 0) {
              evs.forEach((event, index) => {
                mediaTrajTimeline.appendChild(createEventCard(event, index));
              });
            } else {
              const emptyMsg = document.createElement('div');
              emptyMsg.style.textAlign = 'center';
              emptyMsg.style.color = 'var(--text-muted)';
              emptyMsg.style.padding = '32px 0';
              emptyMsg.style.fontSize = '12px';
              emptyMsg.textContent = media.hasTraj ? '暂无交互记录（录制期间未检测到页面点击或网络请求）' : '本次未开启交互轨迹录制';
              mediaTrajTimeline.appendChild(emptyMsg);
            }
          }
          
          if (mediaTrajDownloadBtn) {
            if (media.hasTraj && evs.length > 0) {
              mediaTrajDownloadBtn.style.display = 'flex';
              mediaTrajDownloadBtn.onclick = () => {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(evs, null, 2));
                const downloadAnchorNode = document.createElement('a');
                downloadAnchorNode.setAttribute("href", dataStr);
                downloadAnchorNode.setAttribute("download", `trajectory_${(media.name||'').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`);
                document.body.appendChild(downloadAnchorNode);
                downloadAnchorNode.click();
                downloadAnchorNode.remove();
              };
            } else {
              mediaTrajDownloadBtn.style.display = 'none';
            }
          }
        }
        
        // Auto-switch tabs based on availability
        if (!media.hasVideo && media.hasTraj) {
          activateTab('traj');
        } else {
          activateTab('video');
        }
      });

      item.style.display = 'flex';
      item.style.alignItems = 'center';
      item.style.justifyContent = 'space-between';
      item.appendChild(info);
      item.appendChild(deleteBtn);

      mediaNotesList.appendChild(item);
    });
  };

  const renderTrajectories = (trajectories) => {
    if (trajectories.length === 0) {
      trajEmptyState.style.display = 'flex';
      trajNotesList.style.display = 'none';
      const showMoreBtn = document.getElementById('trajShowMoreBtn');
      if (showMoreBtn) showMoreBtn.style.display = 'none';
      return;
    }

    trajEmptyState.style.display = 'none';
    trajNotesList.style.display = 'flex';
    trajNotesList.style.flexDirection = 'column';
    trajNotesList.style.gap = '8px';
    trajNotesList.innerHTML = ''; 

    const showMoreBtn = document.getElementById('trajShowMoreBtn');
    
    // Sort list by time (newest first).
    // The background.js uses unshift() to add new items to the front of the array.
    // So trajectories is already sorted newest first. We do NOT need to reverse it.
    const sortedList = [...trajectories];
    
    const displayCount = trajListExpanded ? sortedList.length : Math.min(5, sortedList.length);
    
    if (sortedList.length > 5) {
      if (showMoreBtn) {
        showMoreBtn.style.display = 'block';
        showMoreBtn.textContent = trajListExpanded ? '收起 ▴' : '显示更多 ▾';
        showMoreBtn.onclick = () => {
          trajListExpanded = !trajListExpanded;
          renderTrajectories(trajectories);
        };
      }
    } else {
      if (showMoreBtn) showMoreBtn.style.display = 'none';
    }

    sortedList.slice(0, displayCount).forEach(traj => {
      const item = document.createElement('div');
      item.className = 'note-item';
      
      const info = document.createElement('div');
      info.className = 'note-info';
      
      const title = document.createElement('div');
      title.className = 'note-title';
      title.style.display = 'flex';
      title.style.alignItems = 'center';
      title.style.flexWrap = 'wrap';

      const titleText = document.createElement('span');
      // 兼容旧数据
      let displayName = traj.name || '';
      if (displayName.includes('（题目ID：')) {
        displayName = displayName.split('（')[0].trim();
      }
      titleText.textContent = displayName;
      titleText.style.marginRight = '8px';
      title.appendChild(titleText);

      // Append Task ID badge if available
      const taskIds = traj.taskIds || (traj.taskId ? [traj.taskId] : []);
      if (taskIds.length > 0) {
        const badge = document.createElement('span');
        badge.textContent = `题目ID: ${taskIds[0]}`;
        badge.style.fontSize = '10px';
        badge.style.backgroundColor = 'rgba(107, 78, 255, 0.1)';
        badge.style.color = '#6B4EFF';
        badge.style.padding = '2px 8px';
        badge.style.borderRadius = '12px';
        badge.style.fontWeight = '600';
        badge.style.whiteSpace = 'nowrap';
        title.appendChild(badge);
      }
      
      const meta = document.createElement('div');
      meta.className = 'note-meta';
      meta.textContent = `${traj.events.length} 个事件 • ${traj.date} ${traj.startTime || ''}`.trim();

      info.appendChild(title);
      info.appendChild(meta);

      // Add Delete Button
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width:20px;height:20px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>';
      deleteBtn.style.cssText = 'background:none; border:none; color:#EF4444; padding:6px; cursor:pointer; border-radius:6px; transition:opacity 0.2s, background 0.2s; opacity:0; flex-shrink:0;';
      
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showDeleteConfirmModal('确定要删除这个轨迹文件吗？删除后将无法恢复。', () => {
          const userKey = getUserKey('trajectories');
          const legacyKey = 'savedTrajectories';
          chrome.storage.local.get([userKey, legacyKey], (result) => {
            let savedUser = result[userKey] || [];
            let savedLegacy = result[legacyKey] || [];
            
            savedUser = savedUser.filter(t => t.id !== traj.id);
            savedLegacy = savedLegacy.filter(t => t.id !== traj.id);
            
            const updates = {};
            updates[userKey] = savedUser;
            updates[legacyKey] = savedLegacy;
            
            chrome.storage.local.set(updates, () => {
              const mergedMap = new Map();
              savedLegacy.forEach(item => mergedMap.set(item.id, item));
              savedUser.forEach(item => mergedMap.set(item.id, item));
              const mergedList = Array.from(mergedMap.values());
              mergedList.sort((a, b) => b.id - a.id);
              renderTrajectories(mergedList);
            });
          });
        });
      });

      item.style.display = 'flex';
      item.style.alignItems = 'center';
      item.style.justifyContent = 'space-between';
      item.style.cursor = 'pointer';

      item.appendChild(info);
      item.appendChild(deleteBtn);
      
      // Add click listener to open details
      item.addEventListener('click', () => {
        openTrajectoryDetails(traj);
      });

      trajNotesList.appendChild(item);
    });
  };

  const openTrajectoryDetails = (traj) => {
    currentActiveTrajectory = traj;
    detailTitle.textContent = traj.name;
    eventTimeline.innerHTML = ''; // clear
    
    // Set event count
    const trajDetailEventCount = document.getElementById('trajDetailEventCount');
    if (trajDetailEventCount) {
      trajDetailEventCount.textContent = traj.events ? traj.events.length : '0';
    }

    // Populate details view task ids
    const trajDetailTaskIds = document.getElementById('trajDetailTaskIds');
    if (trajDetailTaskIds) {
      if (traj.taskIds && traj.taskIds.length > 0) {
        trajDetailTaskIds.innerHTML = traj.taskIds.map(id => `<div style="margin-bottom:2px;">${id}</div>`).join('');
      } else if (traj.taskId) {
        trajDetailTaskIds.textContent = traj.taskId;
      } else {
        trajDetailTaskIds.textContent = '--';
      }
    }
    
    // Filter container logic
    const filterContainer = document.getElementById('trajFilterContainer');
    if (filterContainer) {
      filterContainer.innerHTML = '';
      
      // Extract unique task IDs from events
      const uniqueTaskIds = new Set();
      if (traj.events && traj.events.length > 0) {
        traj.events.forEach(e => {
          if (e.taskId) uniqueTaskIds.add(e.taskId);
        });
      }
      
      // Only show filters if there are task IDs
      if (uniqueTaskIds.size > 0) {
        filterContainer.style.display = 'flex';
        
        // Add "All" pill
        const allPill = document.createElement('div');
        allPill.className = 'traj-filter-pill active';
        allPill.textContent = '全部';
        allPill.onclick = () => renderFilteredEvents(traj.events, null, allPill);
        filterContainer.appendChild(allPill);
        
        // Add individual task ID pills
        Array.from(uniqueTaskIds).forEach((id, index) => {
          const pill = document.createElement('div');
          pill.className = 'traj-filter-pill';
          pill.textContent = `题目ID ${index + 1}`;
          pill.title = id; // Show full ID on hover
          pill.onclick = () => renderFilteredEvents(traj.events, id, pill);
          filterContainer.appendChild(pill);
        });
      } else {
        filterContainer.style.display = 'none';
      }
    }
    
    // Initial render of all events
    renderFilteredEvents(traj.events, null, filterContainer ? filterContainer.firstElementChild : null);

    detailOverlay.classList.add('open');
  };

  const renderFilteredEvents = (events, filterTaskId, activePillElement) => {
    // Update active pill styling
    if (activePillElement) {
      const container = activePillElement.parentElement;
      if (container) {
        Array.from(container.children).forEach(child => child.classList.remove('active'));
      }
      activePillElement.classList.add('active');
    }
    
    eventTimeline.innerHTML = '';
    
    let filteredEvents = events || [];
    if (filterTaskId) {
      filteredEvents = filteredEvents.filter(e => e.taskId === filterTaskId);
    }
    
    // Update event count for the filtered view
    const trajDetailEventCount = document.getElementById('trajDetailEventCount');
    if (trajDetailEventCount) {
      trajDetailEventCount.textContent = filteredEvents.length;
    }
    
    if (filteredEvents.length === 0) {
      eventTimeline.innerHTML = '<div style="color:#666; text-align:center; padding: 20px;">此分类下未记录任何事件。</div>';
    } else {
      filteredEvents.forEach((event, index) => {
        eventTimeline.appendChild(createEventCard(event, index));
      });
    }
  };

  const createEventCard = (event, index) => {
    const card = document.createElement('div');
    card.className = 'event-card';

    // Format Time
    const date = new Date(event.timestamp);
    const timeString = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}.${date.getMilliseconds()}`;

    // Determine Badge and Content
    let badgeClass = '';
    let badgeText = '';
    let detailsHtml = '';

    if (event.category === 'DOM_ACTION') {
      badgeClass = 'badge-dom';
      badgeText = event.type.toUpperCase(); // CLICK or INPUT
      
      detailsHtml += `<div class="detail-row"><span class="detail-label">元素</span><span class="detail-value highlight">&lt;${event.tagName}&gt;</span></div>`;
      
      if (event.contextText || event.value) {
        const text = event.contextText || event.value;
        detailsHtml += `<div class="detail-row"><span class="detail-label">内容</span><span class="detail-value">"${text}"</span></div>`;
      }
      
      detailsHtml += `<div class="detail-row"><span class="detail-label">选择器</span><span class="detail-value">${event.selector}</span></div>`;
      
      if (event.boundingBox) {
         detailsHtml += `<div class="detail-row"><span class="detail-label">坐标</span><span class="detail-value">x: ${Math.round(event.boundingBox.x)}, y: ${Math.round(event.boundingBox.y)}</span></div>`;
      }
      
      if (event.taskId) {
        detailsHtml += `<div class="detail-row"><span class="detail-label">题目ID</span><span class="detail-value">${event.taskId}</span></div>`;
      }

    } else if (event.category === 'NETWORK_REQUEST') {
      badgeClass = 'badge-net-req';
      badgeText = `请求: ${event.method}`;
      
      detailsHtml += `<div class="detail-row"><span class="detail-label">URL</span><span class="detail-value highlight">${event.url}</span></div>`;
      detailsHtml += `<div class="detail-row"><span class="detail-label">请求 ID</span><span class="detail-value">${event.requestId}</span></div>`;

    } else if (event.category === 'NETWORK_RESPONSE') {
      badgeClass = 'badge-net-res';
      badgeText = `响应: ${event.statusCode}`;
      
      detailsHtml += `<div class="detail-row"><span class="detail-label">URL</span><span class="detail-value highlight">${event.url}</span></div>`;
      detailsHtml += `<div class="detail-row"><span class="detail-label">请求 ID</span><span class="detail-value">${event.requestId}</span></div>`;
    } else {
      badgeClass = 'badge-dom';
      badgeText = '未知';
    }

    card.innerHTML = `
      <div class="event-header">
        <span class="event-badge ${badgeClass}">${index + 1}. ${badgeText}</span>
        <span class="event-time">${timeString}</span>
      </div>
      <div class="event-details">
        ${detailsHtml}
      </div>
    `;

    return card;
  };

  const downloadTrajectory = (traj) => {
    const data = JSON.stringify(traj.events, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `turing_${traj.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  updateUI();

  let mediaRecorder = null;
  let recordedChunks = [];
  let recordStartTime = null;

  function requireAuth() {
    if (!currentUser) {
      if (authModal) {
        authModal.classList.add('show');
      }
      return false;
    }
    return true;
  }

  async function startRealMediaRecording(taskId, questionId) {
    if (!requireAuth()) return false;
    
    try {
      // 请求录制屏幕或标签页 (纯录屏)
      const constraints = {
        video: { 
          displaySurface: 'monitor' 
        },
        audio: false,
        systemAudio: 'exclude'
      };

      const displayStream = await navigator.mediaDevices.getDisplayMedia(constraints);
      
      mediaRecorder = new MediaRecorder(displayStream, { mimeType: 'video/webm' });
      recordedChunks = [];
      recordStartTime = new Date().toLocaleTimeString();
      
      // Associate context
      mediaRecorder.associatedQuestionId = questionId;
      mediaRecorder.associatedTaskId = taskId;
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunks.push(e.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        // 停止所有屏幕轨道
        displayStream.getTracks().forEach(track => track.stop());
        
        // 生成视频 Blob
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        
        // 存入 IndexedDB 以便持久化读取
        const videoId = `vid_${Date.now()}`;
        try {
          await saveVideoBlob(videoId, blob);
        } catch(err) {
          console.error('保存视频到 IndexedDB 失败:', err);
        }
        
        // 通知后台更新状态并保存文件信息
        // 使用 mediaRecorder 上附加的 ID（因为退出/提交时 currentActiveQuestion 会被同步置空）
        const finalQuestionId = mediaRecorder.associatedQuestionId || (currentActiveQuestion ? currentActiveQuestion.id : null);
        const finalTaskId = mediaRecorder.associatedTaskId || currentScrapedContext.taskId;
        
        if (chrome.runtime && chrome.runtime.sendMessage) {
          // 获取当前录制的轨迹数据
          chrome.runtime.sendMessage({ action: 'getTrajectoryEvents' }, (response) => {
            chrome.runtime.sendMessage({ 
              action: 'stopMediaRecording',
              blobUrl: videoId, // 传递 ID 而不是易失的 Blob URL
              startTime: recordStartTime,
              associatedQuestionId: finalQuestionId,
              associatedTaskId: finalTaskId,
              durationMs: masterRecordingSeconds * 1000,
              hasTraj: !!document.getElementById('chkRecordTrajectory')?.checked,
              trajectoryEvents: mediaRecorder.associatedEvents || response?.events || []
            }, () => {
              if (window._pendingFinishStop) {
                window._pendingFinishStop();
                window._pendingFinishStop = null;
              } else {
                updateUI();
              }
            });
          });
        }
      };
      
      // 如果用户通过 Chrome 原生浮窗点击了“停止共享”
      displayStream.getVideoTracks()[0].onended = () => {
        // We only want to trigger the "accidentally stopped" alert if the user is STILL in the question
        // AND the recorder was actually active (meaning we didn't just stop it programmatically via the Back button).
        const isDoingQuestion = document.getElementById('ctQuestionDetailOverlay')?.classList.contains('open');
        const wasActive = mediaRecorder && mediaRecorder.state !== 'inactive';
        
        if (wasActive) {
          mediaRecorder.stop();
        }
        
        // If it was active and they are in the question, they clicked the native stop button.
        if (isDoingQuestion && wasActive) {
          showCustomAlert('屏幕录制已被意外终止。为了保证评测数据完整性，请重新进入任务！', () => {
            const ctQDetailBackBtn = document.getElementById('ctQDetailBackBtn');
            if (ctQDetailBackBtn) {
              ctQDetailBackBtn.click();
            }
          });
        }
      };
      
      mediaRecorder.start();
      
      // 通知后台已开始录制以更新 UI
      if (chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ action: 'startMediaRecording' }, () => {
          updateUI();
        });
      }
      return true;
    } catch (err) {
      console.error('启动录屏失败或用户取消授权:', err);
      // 如果是用户主动取消 (NotAllowedError/Permission denied)，不需要弹窗报错，直接静默失败或恢复 UI 即可
      if (err.name === 'NotAllowedError' || err.message.includes('Permission denied')) {
        console.log('用户取消了屏幕共享授权');
      } else {
        showCustomAlert('录屏失败: ' + err.message);
      }
      
      // 确保UI状态恢复到未录制状态
      if (chrome.runtime && chrome.runtime.sendMessage) {
         chrome.runtime.sendMessage({ action: 'stopMediaRecording', discard: true }, () => {
           updateUI();
         });
      }
      return false;
    }
  }

  if (recordMediaBtn) {
    recordMediaBtn.addEventListener('click', async () => {
      const taskName = document.querySelector('.task-card h3')?.textContent || "豆包 vs Deepseek";
      const questionId = currentActiveQuestion ? currentActiveQuestion.id : null;
      const started = await startRealMediaRecording(taskName, questionId);
      if (started && typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({
          action: 'startMasterRecording',
          recordScreen: true,
          recordTraj: true, // Assuming default to true here if started from button
          taskId: taskName,
          questionId: questionId
        }, () => {
          chrome.runtime.sendMessage({ action: 'startTrajRecording' }, () => {
            updateUI();
          });
        });
      }
    });
  }

  if (stopMediaBtn) {
    stopMediaBtn.addEventListener('click', () => {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ action: 'getState' }, (state) => {
          if (state && state.isMasterRecording) {
            const btnStopMasterRecord = document.getElementById('btnStopMasterRecord');
            if (btnStopMasterRecord) {
              window.overrideStopToast = '已完成录屏，可到录制列表查看';
              btnStopMasterRecord.click();
              return;
            }
          }
          // Fallback
          const exitingQuestionId = currentActiveQuestion ? currentActiveQuestion.id : null;
          if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.associatedQuestionId = exitingQuestionId;
            mediaRecorder.stop();
          } else {
            chrome.runtime.sendMessage({ 
              action: 'stopMediaRecording',
              associatedQuestionId: exitingQuestionId,
              discard: true
            }, () => {
              updateUI();
            });
          }
        });
      }
    });
  }

  if (recordTrajBtn) {
    recordTrajBtn.addEventListener('click', () => {
      if (!requireAuth()) return;
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        const taskName = document.querySelector('.task-card h3')?.textContent || "豆包 vs Deepseek";
        const questionId = currentActiveQuestion ? currentActiveQuestion.id : null;
        chrome.runtime.sendMessage({
          action: 'startMasterRecording',
          recordScreen: false,
          recordTraj: true,
          taskId: taskName,
          questionId: questionId
        }, () => {
          chrome.runtime.sendMessage({ action: 'startTrajRecording' }, () => {
            updateUI();
          });
        });
      }
    });
  }

  if (stopTrajBtn) {
    stopTrajBtn.addEventListener('click', () => {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ action: 'getState' }, (state) => {
          if (state && state.isMasterRecording) {
            const btnStopMasterRecord = document.getElementById('btnStopMasterRecord');
            if (btnStopMasterRecord) {
              window.overrideStopToast = '已完成轨迹录制，可到录制列表查看';
              btnStopMasterRecord.click();
              return;
            }
          }
          // Fallback
          const taskName = document.querySelector('.task-card h3')?.textContent || "豆包 vs Deepseek";
          chrome.runtime.sendMessage({ 
            action: 'stopTrajRecording',
            associatedQuestionId: currentActiveQuestion ? currentActiveQuestion.id : null,
            associatedTaskId: taskName
          }, () => {
            updateUI();
          });
        });
      }
    });
  }

  // Listen for updates from background to update count live
  let lastProcessedContinueMsgId = null;

  // New Recording Master State
  let masterRecordingTimer = null;
  let masterRecordingSeconds = 0;
  let currentScrapedContext = { taskId: null, questionId: null };

  const manualTaskInput = document.getElementById('manualTaskInput');
  const manualQuestionInput = document.getElementById('manualQuestionInput');
  const autoDetectStatus = document.getElementById('autoDetectStatus');

  // We no longer need the toggle state logic, the inputs are always visible
  
  const updateTimerUI = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    const th = document.getElementById('timerHours');
    const tm = document.getElementById('timerMinutes');
    const ts = document.getElementById('timerSeconds');
    
    if (th) th.textContent = h.toString().padStart(2, '0');
    if (tm) tm.textContent = m.toString().padStart(2, '0');
    if (ts) ts.textContent = s.toString().padStart(2, '0');
  };

  const updateMasterRecordingUI = (state) => {
    const prepState = document.getElementById('recordingPrepState');
    const activeState = document.getElementById('recordingActiveState');
    
    if (state.isMasterRecording) {
      if (prepState) prepState.style.display = 'none';
      if (activeState) activeState.style.display = 'block';
      
      const activeTaskTag = document.getElementById('activeTaskTag');
      const activeQuestionTag = document.getElementById('activeQuestionTag');
      if (activeTaskTag) activeTaskTag.textContent = `Task: ${state.currentTask || '未知'}`;
      if (activeQuestionTag) activeQuestionTag.textContent = `Question: ${state.currentQuestion || '未知'}`;
      
      const btnPauseResumeMasterRecord = document.getElementById('btnPauseResumeMasterRecord');
      const pauseIcon = document.getElementById('pauseIcon');
      const pauseResumeText = document.getElementById('pauseResumeText');
      const recordingActiveDot = document.getElementById('recordingActiveDot');
      const recordingActiveText = document.getElementById('recordingActiveText');

      let isRecordingPaused = state.isMasterPaused || false;
      const timerDigits = document.querySelectorAll('.timer-digits');
      
      if (btnPauseResumeMasterRecord) {
        btnPauseResumeMasterRecord.setAttribute('data-paused', isRecordingPaused ? 'true' : 'false');
      }

      if (isRecordingPaused) {
        if (masterRecordingTimer) {
          clearInterval(masterRecordingTimer);
          masterRecordingTimer = null;
        }
        if (pauseIcon) pauseIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>`;
        if (pauseResumeText) pauseResumeText.textContent = '继续录制';
        if (recordingActiveDot) {
          recordingActiveDot.style.animation = 'none';
          recordingActiveDot.style.backgroundColor = '#F59E0B';
        }
        if (recordingActiveText) {
          recordingActiveText.textContent = '已暂停';
          recordingActiveText.style.color = '#F59E0B';
        }
        timerDigits.forEach(el => el.style.color = '#F59E0B');
      } else {
        // Start or resume timer
        if (!masterRecordingTimer) {
          masterRecordingSeconds = state.recordingSeconds || 0;
          updateTimerUI(masterRecordingSeconds);
          masterRecordingTimer = setInterval(() => {
            masterRecordingSeconds++;
            updateTimerUI(masterRecordingSeconds);
          }, 1000);
        }
        if (pauseIcon) pauseIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>`;
        if (pauseResumeText) pauseResumeText.textContent = '暂停录制';
        if (recordingActiveDot) {
          recordingActiveDot.style.animation = 'pulse-green 2s infinite';
          recordingActiveDot.style.backgroundColor = '#16a34a';
        }
        if (recordingActiveText) {
          recordingActiveText.textContent = '录制中';
          recordingActiveText.style.color = '#16a34a';
        }
        timerDigits.forEach(el => el.style.color = '#16a34a');
      }

    } else {
      if (prepState) prepState.style.display = 'block';
      if (activeState) activeState.style.display = 'none';
      
      if (masterRecordingTimer) {
        clearInterval(masterRecordingTimer);
        masterRecordingTimer = null;
      }
      masterRecordingSeconds = 0;
      updateTimerUI(0);
    }
  };

  // Add listeners for master recording buttons
  const btnStartMasterRecord = document.getElementById('btnStartMasterRecord');
  const btnStopMasterRecord = document.getElementById('btnStopMasterRecord');
  const btnPauseResumeMasterRecord = document.getElementById('btnPauseResumeMasterRecord');

  if (btnStartMasterRecord) {
    btnStartMasterRecord.addEventListener('click', async () => {
      if (!requireAuth()) return;
      
      const recordScreen = document.getElementById('chkRecordScreen')?.checked;
      const recordTraj = document.getElementById('chkRecordTrajectory')?.checked;
      
      const taskId = manualTaskInput?.value.trim() || currentScrapedContext.taskId || '';
      const questionId = manualQuestionInput?.value.trim() || currentScrapedContext.questionId || '';
      
      let hasError = false;
      if (!taskId) {
        if (manualTaskInput) {
          manualTaskInput.style.borderColor = '#EF4444';
          manualTaskInput.style.boxShadow = '0 0 0 1px rgba(239, 68, 68, 0.2)';
        }
        hasError = true;
      } else if (manualTaskInput) {
        manualTaskInput.style.borderColor = 'var(--border-color)';
        manualTaskInput.style.boxShadow = 'none';
      }

      if (!questionId) {
        if (manualQuestionInput) {
          manualQuestionInput.style.borderColor = '#EF4444';
          manualQuestionInput.style.boxShadow = '0 0 0 1px rgba(239, 68, 68, 0.2)';
        }
        hasError = true;
      } else if (manualQuestionInput) {
        manualQuestionInput.style.borderColor = 'var(--border-color)';
        manualQuestionInput.style.boxShadow = 'none';
      }

      if (hasError) {
        showToast('请先输入或等待自动识别 Task ID 和 Question ID', 3000, true);
        return;
      }
      
      let screenStarted = false;
      if (recordScreen) {
        screenStarted = await startRealMediaRecording(taskId, questionId);
        if (!screenStarted) return; // Abort if screen recording failed/cancelled
      }

      if (chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ 
          action: 'startMasterRecording',
          recordScreen,
          recordTraj,
          taskId,
          questionId
        }, () => {
          if (recordTraj) {
            chrome.runtime.sendMessage({ action: 'startTrajRecording' });
          }
          updateUI();
        });
      }
    });
  }

  if (btnPauseResumeMasterRecord) {
    btnPauseResumeMasterRecord.addEventListener('click', () => {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        const isPaused = btnPauseResumeMasterRecord.getAttribute('data-paused') === 'true';
        if (!isPaused) {
          chrome.runtime.sendMessage({ action: 'pauseMasterRecording' }, () => {
            if (mediaRecorder && mediaRecorder.state === 'recording') {
              mediaRecorder.pause();
            }
            updateUI();
          });
        } else {
          chrome.runtime.sendMessage({ action: 'resumeMasterRecording' }, () => {
            if (mediaRecorder && mediaRecorder.state === 'paused') {
              mediaRecorder.resume();
            }
            updateUI();
          });
        }
      }
    });
  }

  if (btnStopMasterRecord) {
    btnStopMasterRecord.addEventListener('click', () => {
      const isMediaActive = mediaRecorder && mediaRecorder.state !== 'inactive';
      
      const finishStop = () => {
        if (chrome.runtime && chrome.runtime.sendMessage) {
          chrome.runtime.sendMessage({ action: 'stopTrajRecording' });
          chrome.runtime.sendMessage({ action: 'stopMasterRecording' }, () => {
            const toastMsg = window.overrideStopToast || '已完成录制，可到录制列表查看';
            const duration = window.overrideStopToast ? 4000 : 3000;
            showToast(toastMsg, duration, false);
            window.overrideStopToast = null; // reset
            window.justFinishedRecording = true;
            updateUI();
            if (typeof activateMasterTab === 'function') {
              activateMasterTab('history');
            }
          });
        }
      };

      if (isMediaActive) {
        window._pendingFinishStop = finishStop;
        mediaRecorder.stop(); // This will trigger onstop which sends stopMediaRecording
      } else {
        // Only recording trajectory or time, need to generate a file manually
        const recordTraj = document.getElementById('chkRecordTrajectory')?.checked;
        if (chrome.runtime && chrome.runtime.sendMessage) {
          chrome.runtime.sendMessage({ action: 'getState' }, (state) => {
            const finalTaskId = state?.currentTask || currentScrapedContext.taskId || '';
            const finalQuestionId = state?.currentQuestion || currentScrapedContext.questionId || '';
            
            chrome.runtime.sendMessage({ action: 'getTrajectoryEvents' }, (response) => {
              let startT = new Date(Date.now() - masterRecordingSeconds * 1000).toLocaleTimeString();
              chrome.runtime.sendMessage({ 
                action: 'stopMediaRecording',
                blobUrl: null,
                startTime: startT,
                associatedQuestionId: finalQuestionId,
                associatedTaskId: finalTaskId,
                durationMs: masterRecordingSeconds * 1000,
                hasTraj: !!recordTraj,
                trajectoryEvents: response?.events || []
              }, () => {
                finishStop();
              });
            });
          });
        } else {
          finishStop();
        }
      }
    });
  }

  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'STATE_UPDATED') {
        updateUI();
      } else if (message.type === 'CONTINUE_CHAT') {
        // Leaving for backward compatibility
        if (message.messageId) {
          if (message.messageId === lastProcessedContinueMsgId) return;
          lastProcessedContinueMsgId = message.messageId;
        }
      } else if (message.action === 'userMismatchAlert') {
        showMismatchAlertModal(message.webUser, message.pluginUser);
      }
    });
  }

  // Mismatch Alert UI Logic
  const mismatchAlertModal = document.getElementById('mismatchAlertModal');
  const mismatchWebPhone = document.getElementById('mismatchWebPhone');
  const mismatchPluginPhone = document.getElementById('mismatchPluginPhone');
  const mismatchLogoutBtn = document.getElementById('mismatchLogoutBtn');
  
  // Custom Alert UI Logic
  const customAlertModal = document.getElementById('customAlertModal');
  const customAlertMessage = document.getElementById('customAlertMessage');
  const customAlertOkBtn = document.getElementById('customAlertOkBtn');
  
  let currentAlertCallback = null;

  function showCustomAlert(message, callback = null) {
    if (!customAlertModal || !customAlertMessage) return;
    customAlertMessage.textContent = message;
    currentAlertCallback = callback;
    customAlertModal.style.display = 'flex';
    customAlertModal.classList.add('show');
  }
  
  // Lightweight Toast Notification
  function showToast(message, duration = 3000, isError = false) {
    let toast = document.getElementById('ctToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'ctToast';
      document.body.appendChild(toast);
    }
    
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(-20px);
      background: ${isError ? '#EF4444' : 'rgba(0, 0, 0, 0.8)'};
      color: white;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 13px;
      z-index: 9999;
      opacity: 0;
      transition: all 0.3s ease;
      pointer-events: none;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      white-space: nowrap;
    `;
    
    toast.textContent = message;
    // Trigger reflow to ensure transition works
    void toast.offsetWidth;
    
    toast.style.transform = 'translateX(-50%) translateY(0)';
    toast.style.opacity = '1';
    
    if (toast.timeoutId) clearTimeout(toast.timeoutId);
    toast.timeoutId = setTimeout(() => {
      toast.style.transform = 'translateX(-50%) translateY(-20px)';
      toast.style.opacity = '0';
    }, typeof duration === 'number' ? duration : 3000);
  }
  
  if (customAlertOkBtn) {
    customAlertOkBtn.addEventListener('click', () => {
      customAlertModal.classList.remove('show');
      setTimeout(() => {
        customAlertModal.style.display = 'none';
        if (currentAlertCallback) {
          currentAlertCallback();
          currentAlertCallback = null;
        }
      }, 300);
    });
  }

  function showMismatchAlertModal(webUser, pluginUser) {
    if (!mismatchAlertModal) return;
    
    if (mismatchWebPhone) mismatchWebPhone.textContent = webUser.phone || '未知';
    if (mismatchPluginPhone) mismatchPluginPhone.textContent = pluginUser.phone || '未知';
    
    mismatchAlertModal.style.display = 'flex';
    mismatchAlertModal.classList.add('show');
  }

  if (mismatchLogoutBtn) {
    mismatchLogoutBtn.addEventListener('click', async () => {
      // Execute logout
      try {
        const { error } = await supabase.auth.signOut();
        if (error) console.error('Error logging out of Supabase:', error.message);
      } catch (err) {
        console.error('Supabase logout failed:', err);
      }
      
      chrome.storage.local.remove(['taUser', 'pendingUserMismatchAlert', 'mismatchWebUser'], () => {
        currentUser = null;
        updateAuthUI();
        mismatchAlertModal.classList.remove('show');
        setTimeout(() => mismatchAlertModal.style.display = 'none', 300);
        
        // Open login modal so they can re-login
        if (authModal) {
          authModal.style.display = 'flex';
          setTimeout(() => authModal.classList.add('show'), 10);
        }
      });
    });
  }


  // --- Auth UI Logic ---
  const userAvatarBtn = document.getElementById('userAvatarBtn');
  const userProfilePopover = document.getElementById('userProfilePopover');
  const popoverAvatar = document.getElementById('popoverAvatar');
  const popoverText = document.getElementById('popoverText');
  const openLoginModalBtn = document.getElementById('openLoginModalBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const authModal = document.getElementById('authModal');
  const closeAuthModalBtn = document.getElementById('closeAuthModalBtn');
  const authSubmitBtn = document.getElementById('authSubmitBtn');
  const authIdentifier = document.getElementById('authIdentifier');
  const authPassword = document.getElementById('authPassword');
  const authErrorMsg = document.getElementById('authErrorMsg');
  const authBtnText = document.getElementById('authBtnText');
  const authSpinner = document.getElementById('authSpinner');
  const feedbackBtn = document.getElementById('feedbackBtn');
  const feedbackModal = document.getElementById('feedbackModal');
  const closeFeedbackModalBtn = document.getElementById('closeFeedbackModalBtn');
  const feedbackSubmitBtn = document.getElementById('feedbackSubmitBtn');
  const feedbackContent = document.getElementById('feedbackContent');
  const feedbackErrorMsg = document.getElementById('feedbackErrorMsg');
  const feedbackSuccessMsg = document.getElementById('feedbackSuccessMsg');
  const feedbackBtnText = document.getElementById('feedbackBtnText');
  const feedbackSpinner = document.getElementById('feedbackSpinner');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeToggleText = document.getElementById('themeToggleText');
  const themeToggleIcon = document.getElementById('themeToggleIcon');
  const popoverHeader = document.getElementById('popoverHeader');
  const popoverFooter = document.getElementById('popoverFooter');

  let isDarkMode = false;

  // Initialize hover states properly
  const applyHoverEffects = (btn) => {
    btn.addEventListener('mouseover', () => {
      btn.style.background = isDarkMode ? 'var(--text-main)' : 'var(--btn-secondary-bg)';
    });
    btn.addEventListener('mouseout', () => {
      btn.style.background = 'transparent';
    });
  };

  // --- Custom Delete Confirm Modal Logic ---
  const deleteConfirmModal = document.getElementById('deleteConfirmModal');
  const deleteConfirmMessage = document.getElementById('deleteConfirmMessage');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

  let pendingDeleteCallback = null;

  function showDeleteConfirmModal(message, callback) {
    if (deleteConfirmMessage) {
      deleteConfirmMessage.textContent = message;
    }
    pendingDeleteCallback = callback;
    if (deleteConfirmModal) {
      deleteConfirmModal.style.display = 'flex';
      requestAnimationFrame(() => deleteConfirmModal.classList.add('show'));
    }
  }

  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener('click', () => {
      pendingDeleteCallback = null;
      if (deleteConfirmModal) {
        deleteConfirmModal.classList.remove('show');
        setTimeout(() => deleteConfirmModal.style.display = 'none', 300);
      }
    });
  }

  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', () => {
      if (pendingDeleteCallback) pendingDeleteCallback();
      pendingDeleteCallback = null;
      if (deleteConfirmModal) {
        deleteConfirmModal.classList.remove('show');
        setTimeout(() => deleteConfirmModal.style.display = 'none', 300);
      }
    });
  }

  // Add collapsible card logic for Record view
  const setupCollapsibleCard = (headerId, contentId, chevronId) => {
    const header = document.getElementById(headerId);
    const content = document.getElementById(contentId);
    const chevron = document.getElementById(chevronId);
    
    if (header && content && chevron) {
      header.addEventListener('click', () => {
        const isCollapsed = content.style.display === 'none';
        if (isCollapsed) {
          content.style.display = 'block';
          chevron.style.transform = 'rotate(0deg)';
        } else {
          content.style.display = 'none';
          chevron.style.transform = 'rotate(180deg)';
        }
      });
    }
  };

  setupCollapsibleCard('mediaCardHeader', 'mediaCardContent', 'mediaChevron');
  setupCollapsibleCard('trajCardHeader', 'trajCardContent', 'trajChevron');

  if (themeToggleBtn) applyHoverEffects(themeToggleBtn);
  if (feedbackBtn) applyHoverEffects(feedbackBtn);

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['taUser', 'taTheme', 'pendingUserMismatchAlert', 'mismatchWebUser'], (result) => {
      if (result.taUser) {
        currentUser = result.taUser;
        loadQuestionsState(() => {
          updateAuthUI();
          renderCrowdtestQuestions();
        });
      } else {
        updateAuthUI();
        renderCrowdtestQuestions();
      }
      
      // Load chat history after we know the current user
      loadChatHistoryIndex();
      
      if (result.taTheme === 'dark') {
        isDarkMode = true;
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
        if (themeToggleText && themeToggleIcon) {
          themeToggleText.textContent = '浅色主题';
          themeToggleIcon.innerHTML = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>`;
        }
      } else if (result.taTheme === 'light') {
        isDarkMode = false;
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
      }

      if (result.pendingUserMismatchAlert) {
        // If we missed the message, we can still show it based on the saved web user
        if (result.mismatchWebUser && currentUser) {
          showMismatchAlertModal(result.mismatchWebUser, currentUser);
        } else {
          // Fallback if we didn't save the web user info
          showMismatchAlertModal({phone: '未知'}, currentUser || {phone: '未知'});
        }
      }
    });
  }

  const userAvatars = [
    // 1: Purple Gradient with star
    `<svg viewBox="0 0 24 24" style="width:100%;height:100%;border-radius:50%;"><defs><linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#8B5CF6" /><stop offset="100%" stop-color="#C4B5FD" /></linearGradient></defs><rect width="24" height="24" fill="url(#grad1)"/><path d="M12 4l2.5 6.5 7 .5-5.5 4.5 2 7-6-4-6 4 2-7-5.5-4.5 7-.5z" fill="#fff" transform="scale(0.6) translate(8, 8)"/></svg>`,
    // 2: Blue Gradient with moon
    `<svg viewBox="0 0 24 24" style="width:100%;height:100%;border-radius:50%;"><defs><linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#3B82F6" /><stop offset="100%" stop-color="#93C5FD" /></linearGradient></defs><rect width="24" height="24" fill="url(#grad2)"/><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="#fff" transform="scale(0.7) translate(5, 5)"/></svg>`,
    // 3: Pink Gradient with heart
    `<svg viewBox="0 0 24 24" style="width:100%;height:100%;border-radius:50%;"><defs><linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#EC4899" /><stop offset="100%" stop-color="#F9A8D4" /></linearGradient></defs><rect width="24" height="24" fill="url(#grad3)"/><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#fff" transform="scale(0.6) translate(8, 8)"/></svg>`,
    // 4: Green Gradient with leaf
    `<svg viewBox="0 0 24 24" style="width:100%;height:100%;border-radius:50%;"><defs><linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#10B981" /><stop offset="100%" stop-color="#6EE7B7" /></linearGradient></defs><rect width="24" height="24" fill="url(#grad4)"/><path d="M17 8C8 10 5.5 16 5.5 16s1.5-4.5 6-5.5c-1 3.5 1.5 6 1.5 6s1.5-3 0-6.5c3-1.5 4-2 4-2z" fill="#fff" transform="scale(0.8) translate(3, 3)"/></svg>`,
    // 5: Orange Gradient with sun
    `<svg viewBox="0 0 24 24" style="width:100%;height:100%;border-radius:50%;"><defs><linearGradient id="grad5" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#F59E0B" /><stop offset="100%" stop-color="#FCD34D" /></linearGradient></defs><rect width="24" height="24" fill="url(#grad5)"/><circle cx="12" cy="12" r="5" fill="#fff"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="#fff" stroke-width="2" stroke-linecap="round" transform="scale(0.8) translate(3, 3)"/></svg>`,
    // 6: Red Gradient with fire
    `<svg viewBox="0 0 24 24" style="width:100%;height:100%;border-radius:50%;"><defs><linearGradient id="grad6" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#EF4444" /><stop offset="100%" stop-color="#FCA5A5" /></linearGradient></defs><rect width="24" height="24" fill="url(#grad6)"/><path d="M12 2c0 0-5 4.5-5 10a5 5 0 0010 0c0-5.5-5-10-5-10zm0 13a2.5 2.5 0 01-2.5-2.5c0-1.5 2.5-4.5 2.5-4.5s2.5 3 2.5 4.5A2.5 2.5 0 0112 15z" fill="#fff" transform="scale(0.8) translate(3, 3)"/></svg>`,
    // 7: Teal Gradient with diamond
    `<svg viewBox="0 0 24 24" style="width:100%;height:100%;border-radius:50%;"><defs><linearGradient id="grad7" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#14B8A6" /><stop offset="100%" stop-color="#99F6E4" /></linearGradient></defs><rect width="24" height="24" fill="url(#grad7)"/><path d="M12 2L2 12l10 10 10-10L12 2zm0 17L5 12l7-7 7 7-7 7z" fill="#fff" transform="scale(0.7) translate(5, 5)"/></svg>`,
    // 8: Indigo Gradient with cloud
    `<svg viewBox="0 0 24 24" style="width:100%;height:100%;border-radius:50%;"><defs><linearGradient id="grad8" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#6366F1" /><stop offset="100%" stop-color="#A5B4FC" /></linearGradient></defs><rect width="24" height="24" fill="url(#grad8)"/><path d="M17.5 19c2.48 0 4.5-2.02 4.5-4.5 0-2.43-1.92-4.41-4.33-4.49A7.002 7.002 0 004 10.5c0 3.87 3.13 7 7 7v1.5c-4.69 0-8.5-3.81-8.5-8.5A8.502 8.502 0 0117.2 6c2.8 0 5.2 1.94 5.75 4.57 2.3.43 4.05 2.45 4.05 4.93 0 2.76-2.24 5-5 5h-4.5z" fill="#fff" transform="scale(0.8) translate(3, 3)"/></svg>`,
    // 9: Yellow Gradient with lightning
    `<svg viewBox="0 0 24 24" style="width:100%;height:100%;border-radius:50%;"><defs><linearGradient id="grad9" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#EAB308" /><stop offset="100%" stop-color="#FDE047" /></linearGradient></defs><rect width="24" height="24" fill="url(#grad9)"/><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#fff" transform="scale(0.7) translate(5, 5)"/></svg>`,
    // 10: Rose Gradient with crown
    `<svg viewBox="0 0 24 24" style="width:100%;height:100%;border-radius:50%;"><defs><linearGradient id="grad10" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#F43F5E" /><stop offset="100%" stop-color="#FDA4AF" /></linearGradient></defs><rect width="24" height="24" fill="url(#grad10)"/><path d="M5 16h14v2H5zm14-9l-3 4-4-5-4 5-3-4v7h14V7z" fill="#fff" transform="scale(0.8) translate(3, 3)"/></svg>`
  ];

  function getAvatarForUser(displayId) {
    let hash = 0;
    for (let i = 0; i < displayId.length; i++) {
      hash = displayId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % userAvatars.length;
    return userAvatars[index];
  }

  function updateAuthUI() {
    if (currentUser) {
      let displayId = currentUser.email || currentUser.phone || 'U';
      
      const avatarSvg = getAvatarForUser(displayId);
      
      userAvatarBtn.innerHTML = avatarSvg;
      userAvatarBtn.style.backgroundColor = 'transparent';
      userAvatarBtn.style.color = 'inherit';
      userAvatarBtn.style.border = 'none';
      userAvatarBtn.style.padding = '0';
      
      popoverAvatar.innerHTML = avatarSvg;
      popoverAvatar.style.backgroundColor = 'transparent';
      popoverAvatar.style.color = 'inherit';
      popoverText.textContent = displayId;
      
      openLoginModalBtn.style.display = 'none';
      logoutBtn.style.display = 'block';
    } else {
      const defaultAvatarSvg = `<svg viewBox="0 0 24 24" style="width: 100%; height: 100%;"><circle cx="12" cy="12" r="12" fill="#6B4EFF"/><path fill="#ffffff" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`;
      const popoverAvatarSvg = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>`;
      
      userAvatarBtn.innerHTML = defaultAvatarSvg;
      userAvatarBtn.style.backgroundColor = 'transparent';
      userAvatarBtn.style.color = 'inherit';
      userAvatarBtn.style.border = 'none';
      userAvatarBtn.style.padding = '0';
      
      popoverAvatar.innerHTML = popoverAvatarSvg;
      popoverAvatar.style.backgroundColor = 'var(--dropdown-active)'; 
      popoverAvatar.style.color = '#6B4EFF';
      popoverText.textContent = '登录以开始使用';
      
      openLoginModalBtn.style.display = 'block';
      logoutBtn.style.display = 'none';
    }
  }

  userAvatarBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (userProfilePopover.classList.contains('show')) {
      userProfilePopover.style.opacity = '0';
      userProfilePopover.style.transform = 'translateX(10px)';
      setTimeout(() => {
        userProfilePopover.classList.remove('show');
        userProfilePopover.style.display = 'none';
      }, 200);
    } else {
      userProfilePopover.style.display = 'flex';
      void userProfilePopover.offsetWidth; // trigger reflow
      userProfilePopover.classList.add('show');
      userProfilePopover.style.opacity = '1';
      userProfilePopover.style.transform = 'translateX(0)';
    }
  });

  document.addEventListener('click', (e) => {
    if (userProfilePopover && userProfilePopover.classList.contains('show') && !userProfilePopover.contains(e.target) && !userAvatarBtn.contains(e.target)) {
      userProfilePopover.style.opacity = '0';
      userProfilePopover.style.transform = 'translateX(10px)';
      setTimeout(() => {
        userProfilePopover.classList.remove('show');
        userProfilePopover.style.display = 'none';
      }, 200);
    }
  });

  openLoginModalBtn.addEventListener('click', () => {
    userProfilePopover.style.opacity = '0';
    userProfilePopover.style.transform = 'translateX(10px)';
    setTimeout(() => {
      userProfilePopover.classList.remove('show');
      userProfilePopover.style.display = 'none';
    }, 200);
    authModal.classList.add('show');
  });

  closeAuthModalBtn.addEventListener('click', () => {
    authModal.classList.remove('show');
  });

  logoutBtn.addEventListener('click', () => {
    currentUser = null;
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.remove(['taUser']);
    }
    updateAuthUI();
    userProfilePopover.style.opacity = '0';
    userProfilePopover.style.transform = 'translateX(10px)';
    setTimeout(() => {
      userProfilePopover.classList.remove('show');
      userProfilePopover.style.display = 'none';
    }, 200);
  });

  if (feedbackBtn && feedbackModal) {
    feedbackBtn.addEventListener('click', () => {
      userProfilePopover.style.opacity = '0';
      userProfilePopover.style.transform = 'translateX(10px)';
      setTimeout(() => {
        userProfilePopover.classList.remove('show');
        userProfilePopover.style.display = 'none';
      }, 200);

      if (!currentUser) {
        authModal.classList.add('show');
        return;
      }
      
      feedbackContent.value = '';
      feedbackErrorMsg.style.display = 'none';
      feedbackSuccessMsg.style.display = 'none';
      feedbackModal.classList.add('show');
    });
  }

  if (closeFeedbackModalBtn && feedbackModal) {
    closeFeedbackModalBtn.addEventListener('click', () => {
      feedbackModal.classList.remove('show');
    });
  }

  if (feedbackSubmitBtn) {
    feedbackSubmitBtn.addEventListener('click', async () => {
      const content = feedbackContent.value.trim();
      if (!content) {
        feedbackErrorMsg.textContent = '请输入反馈内容';
        feedbackErrorMsg.style.display = 'block';
        return;
      }

      feedbackErrorMsg.style.display = 'none';
      feedbackBtnText.textContent = '提交中...';
      feedbackSpinner.style.display = 'block';
      feedbackSubmitBtn.disabled = true;
      feedbackSubmitBtn.style.opacity = '0.7';

      try {
        let displayId = 'Guest';
        if (currentUser) {
          displayId = currentUser.email || currentUser.phone || currentUser.id || 'UnknownUser';
        }

        const { error } = await supabase.db.insert('user_feedback', {
          user_id: displayId,
          content: content,
          version: '0.1.26',
          created_at: new Date().toISOString()
        }, currentUser.token);

        if (error || error?.message) {
          throw new Error('提交失败: ' + (error.message || JSON.stringify(error)));
        }

        feedbackSuccessMsg.style.display = 'block';
        feedbackContent.value = '';
        
        setTimeout(() => {
          feedbackModal.classList.remove('show');
          feedbackSuccessMsg.style.display = 'none';
        }, 1500);

      } catch (err) {
        feedbackErrorMsg.textContent = err.message;
        feedbackErrorMsg.style.display = 'block';
      } finally {
        feedbackBtnText.textContent = '提交反馈';
        feedbackSpinner.style.display = 'none';
        feedbackSubmitBtn.disabled = false;
        feedbackSubmitBtn.style.opacity = '1';
      }
    });
  }

  if (themeToggleBtn && themeToggleText && themeToggleIcon) {
    themeToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      isDarkMode = !isDarkMode;
      
      if (isDarkMode) {
        // Toggle to dark mode look
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
        themeToggleText.textContent = '浅色主题';
        themeToggleIcon.innerHTML = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>`;
      } else {
        // Toggle to light mode look
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
        themeToggleText.textContent = '深色主题';
        themeToggleIcon.innerHTML = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>`;
      }
      
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ taTheme: isDarkMode ? 'dark' : 'light' });
      }
    });
  }

  authSubmitBtn.addEventListener('click', async () => {
    const identifier = authIdentifier.value.trim();
    const password = authPassword.value;
    
    if (!identifier || !password) {
      authErrorMsg.textContent = '请输入账号和密码';
      authErrorMsg.style.display = 'block';
      return;
    }
    
    authErrorMsg.style.display = 'none';
    authBtnText.textContent = '处理中...';
    authSpinner.style.display = 'block';
    authSubmitBtn.disabled = true;
    authSubmitBtn.style.opacity = '0.7';
    
    try {
      // 默认先尝试登录
      let res = await supabase.auth.signIn(identifier, password);
      
      const getErrorMsg = (r) => r.error_description || r.error?.message || r.msg || r.message || (typeof r.error === 'string' ? r.error : null);

      if (getErrorMsg(res) === 'Invalid login credentials') {
        // 如果密码错误或账号不存在，自动尝试注册
        const signUpRes = await supabase.auth.signUp(identifier, password);
        const signUpErr = getErrorMsg(signUpRes);
        
        if (signUpErr) {
          if (signUpErr.includes('already registered')) {
            throw new Error('密码错误，请重试');
          }
          throw new Error('注册失败: ' + signUpErr);
        }
        
        // Supabase v1 注册接口（即使关闭了 Confirm Email），有时候不返回 access_token
        // 因此，我们需要用刚才注册的账号密码，强制再“登录”一次来获取 token！
        const finalSignInRes = await supabase.auth.signIn(identifier, password);
        const finalSignInErr = getErrorMsg(finalSignInRes);
        
        if (finalSignInErr) {
          throw new Error('注册成功但登录失败: ' + finalSignInErr);
        }
        res = finalSignInRes;
        
      } else if (getErrorMsg(res)) {
        throw new Error('登录失败: ' + getErrorMsg(res));
      }
      
      // 成功登录或注册
      const userObj = res.user || res;
      
      // 如果没有拿到 token，说明 Supabase 返回了意料之外的数据
      if (!res.access_token) {
        throw new Error('异常响应: ' + JSON.stringify(res).substring(0, 100));
      }
      
      currentUser = {
        id: userObj.id,
        email: userObj.email,
        phone: userObj.phone,
        token: res.access_token
      };
      
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ taUser: currentUser }, () => {
          // Check for mismatch immediately after login
          chrome.storage.local.get(['latestWebUser'], (result) => {
            const webUser = result.latestWebUser;
            
            let pluginPhone = '';
            if (currentUser.phone) {
              // Supabase sometimes includes the country code like "+8613800000000"
              pluginPhone = currentUser.phone.replace(/^\+86/, '');
            } else if (currentUser.email && /^1[3-9]\d{9}$/.test(currentUser.email)) {
               pluginPhone = currentUser.email;
            }
            
            if (webUser && webUser.phone && pluginPhone) {
              if (webUser.phone !== pluginPhone) {
                console.warn('Turing Arena Probe: Mismatch detected immediately after login!');
                chrome.storage.local.set({ 
                  pendingUserMismatchAlert: true,
                  mismatchWebUser: webUser 
                });
                showMismatchAlertModal(webUser, { ...currentUser, phone: pluginPhone });
              }
            }
          });
        });
      }
      
      // Set states before rendering
      loadQuestionsState(() => {
        updateAuthUI();
        authModal.classList.remove('show');
        authIdentifier.value = '';
        authPassword.value = '';
      });
      
    } catch (err) {
      authErrorMsg.textContent = err.message;
      authErrorMsg.style.display = 'block';
    } finally {
      authBtnText.textContent = '登录 / 注册';
      authSpinner.style.display = 'none';
      authSubmitBtn.disabled = false;
      authSubmitBtn.style.opacity = '1';
    }
  });

  // --- Crowdtest Navigation Logic ---
  const ctQuestionListOverlay = document.getElementById('ctQuestionListOverlay');
  const ctQuestionDetailOverlay = document.getElementById('ctQuestionDetailOverlay');
  const ctQListBackBtn = document.getElementById('ctQListBackBtn');
  const ctQDetailBackBtn = document.getElementById('ctQDetailBackBtn');
  const enterTaskBtn = document.getElementById('enterTaskBtn');
  const claimBtns = document.querySelectorAll('.ct-claim-btn');
  const scoreBtns = document.querySelectorAll('.ct-score-btn');
  const submitEvalBtn = document.getElementById('ctSubmitEvalBtn');

  // Open Task -> Question List
  if (enterTaskBtn) {
    enterTaskBtn.addEventListener('click', () => {
      renderCrowdtestQuestions();
      ctQuestionListOverlay.classList.add('open');
    });
  }

  // Back from Question List -> Task List
  if (ctQListBackBtn) {
    ctQListBackBtn.addEventListener('click', () => {
      ctQuestionListOverlay.classList.remove('open');
    });
  }

  // Back from Question Detail -> Question List
  if (ctQDetailBackBtn) {
    ctQDetailBackBtn.addEventListener('click', () => {
      ctQuestionDetailOverlay.classList.remove('open');
      
      // Auto-save current progress (links and annotations are already in storage, just save links to question object if needed)
      if (currentActiveQuestion) {
        const doubaoLinkInput = document.getElementById('doubaoLinkInput');
        const deepseekLinkInput = document.getElementById('deepseekLinkInput');
        
        currentActiveQuestion.savedDoubaoLink = doubaoLinkInput ? doubaoLinkInput.value : '';
        currentActiveQuestion.savedDeepseekLink = deepseekLinkInput ? deepseekLinkInput.value : '';
        currentActiveQuestion.savedAnnotations = [...currentAnnotations];
        
        // Mark as in_progress if not already
        if (currentActiveQuestion.status !== 'submitted') {
          currentActiveQuestion.status = 'in_progress';
        }
        
        persistQuestionsState();
      }
      
      // We shouldn't check on exit since they might be looking at a blank page, 
      // instead we check when they ENTER the detail page.
      // Removed checkConsistencyWithPage() from here.
      
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.remove('activeCrowdtestQuestion');
      }
      
      // Stop recording when exiting the question
      if (chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ action: 'getState' }, (state) => {
          if (state && state.isMasterRecording) {
            const btnStopMasterRecord = document.getElementById('btnStopMasterRecord');
            if (btnStopMasterRecord) {
              window.overrideStopToast = '已自动停止录制，可在录制菜单中查看具体的录制文件';
              btnStopMasterRecord.click();
            }
          }
        });
      }
      
      // Reset scores when leaving
      scoreBtns.forEach(b => b.classList.remove('selected'));
      
      currentActiveQuestion = null;
    });
  }

  // Score Selection Logic
  scoreBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Find the parent group (the 1-5 buttons container)
      const group = e.target.closest('div');
      // Remove 'selected' from all buttons in this specific group
      const siblings = group.querySelectorAll('.ct-score-btn');
      siblings.forEach(sib => {
        if (sib.classList) {
          sib.classList.remove('selected');
        }
      });
      // Add 'selected' to the clicked button
      e.target.classList.add('selected');
    });
  });

  // Submit Evaluation
  if (submitEvalBtn) {
    submitEvalBtn.addEventListener('click', () => {
      // Validate Global Rating (GSB + Reason)
      const globalGsbVote = document.querySelector('input[name="global_gsb_vote"]:checked');
      const globalGsbReason = document.getElementById('globalGsbReason');
      
      if (!globalGsbVote) {
        showToast('请在“整体评分”模块中选择综合对比结果！');
        return;
      }
      
      if (!globalGsbReason || globalGsbReason.value.trim().length === 0) {
        showToast('请在“整体评分”模块中填写评分理由！');
        if (globalGsbReason) globalGsbReason.focus();
        return;
      }

      // Validate Product Collection Links
      const doubaoLinkInput = document.getElementById('doubaoLinkInput');
      const deepseekLinkInput = document.getElementById('deepseekLinkInput');
      
      const doubaoLink = doubaoLinkInput ? doubaoLinkInput.value.trim() : '';
      const deepseekLink = deepseekLinkInput ? deepseekLinkInput.value.trim() : '';
      
      if (!doubaoLink || !deepseekLink) {
        showCustomAlert('请完整填写豆包和 Deepseek 的产物收集对话链接后再提交！');
        return;
      }
      
      if (!doubaoLink.includes('doubao.com')) {
        showCustomAlert('豆包对话链接格式不正确，请确保它是一个包含 doubao.com 的有效链接。');
        return;
      }
      
      if (!deepseekLink.includes('deepseek.com')) {
        showCustomAlert('Deepseek 对话链接格式不正确，请确保它是一个包含 deepseek.com 的有效链接。');
        return;
      }

      // Update state
      if (currentActiveQuestion) {
        currentActiveQuestion.status = 'submitted';
        currentActiveQuestion.savedDoubaoLink = doubaoLink;
        currentActiveQuestion.savedDeepseekLink = deepseekLink;
        currentActiveQuestion.savedAnnotations = [...currentAnnotations];
        persistQuestionsState();
        renderCrowdtestQuestions();
      }
      
      // Show success and close
      submitEvalBtn.textContent = '提交成功 ✓';
      
      setTimeout(() => {
        ctQuestionDetailOverlay.classList.remove('open');
        if (typeof chrome !== 'undefined' && chrome.storage) {
          chrome.storage.local.remove('activeCrowdtestQuestion');
        }
        submitEvalBtn.textContent = '提交评测';
        
        resetRounds();
        
        // Stop recording when submitting the question
        if (chrome.runtime && chrome.runtime.sendMessage) {
          chrome.runtime.sendMessage({ action: 'getState' }, (state) => {
            if (state && state.isMasterRecording) {
              const btnStopMasterRecord = document.getElementById('btnStopMasterRecord');
              if (btnStopMasterRecord) {
                window.overrideStopToast = '已自动停止录制，可在录制菜单中查看具体的录制文件';
                btnStopMasterRecord.click();
              }
            }
          });
        }
        
        currentActiveQuestion = null;
      }, 1000);
    });
  }

  // --- Annotations Logic ---
  let currentAnnotations = [];
  let currentRoundCount = 1;

  function checkConsistencyWithPage(targetSite) {
    if (!currentActiveQuestion) return;
    
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || tabs.length === 0) return;
        const activeTab = tabs[0];
        if (!activeTab || !activeTab.url) return; // Add null check for url
        
        const isDoubao = activeTab.url.includes('doubao.com');
        const isDeepseek = activeTab.url.includes('deepseek.com');
        
        let detectedSite = targetSite;
        if (!detectedSite) {
          if (isDoubao) detectedSite = 'doubao';
          else if (isDeepseek) detectedSite = 'deepseek';
        }

        // If targetSite is provided, we check if we are on that site
        if (targetSite === 'doubao' && !isDoubao) {
          alert('请先前往豆包页面进行对话。');
          window.open('https://www.doubao.com/', '_blank');
          return;
        }
        if (targetSite === 'deepseek' && !isDeepseek) {
          alert('请先前往Deepseek页面进行对话。');
          window.open('https://chat.deepseek.com/', '_blank');
          return;
        }

        // Default behavior if targetSite is not provided (auto check)
        if (!targetSite && !isDoubao && !isDeepseek) return;
        
        chrome.tabs.sendMessage(activeTab.id, { action: 'scanFullChatHistory' }, (response) => {
          if (chrome.runtime.lastError || !response || !response.history) {
             if (targetSite) alert('未能获取到对话记录，请确保页面已加载并包含对话。');
             return;
          }
          
          const pageHistory = response.history;
          if (pageHistory.length === 0) {
            if (targetSite) alert('当前页面没有任何用户发送的对话内容。');
            return;
          }
          
          const normalizeStr = (str) => (str || '').replace(/[\s\n\r\u00A0\u200B]+/g, '').trim();
          
          // Condition 1: First prompt must match the question title
          const expectedFirstPrompt = normalizeStr(currentActiveQuestion.title);
          const actualFirstPrompt = normalizeStr(pageHistory[0]);
          
          // Use includes because page format might have extra wrappers
          if (!actualFirstPrompt.includes(expectedFirstPrompt) && !expectedFirstPrompt.includes(actualFirstPrompt)) {
             if (targetSite) {
               alert('第一轮Prompt不匹配！\n期望：' + currentActiveQuestion.title + '\n实际：' + pageHistory[0]);
             }
             // Not the same chat, ignore for auto check
             return;
          }
          
          // Condition 2 & 3: Check if subsequent rounds match
          let isConsistent = true;
          let savedPrompts = [];
          if (currentActiveQuestion.savedPrompts) {
            if (Array.isArray(currentActiveQuestion.savedPrompts)) {
              savedPrompts = currentActiveQuestion.savedPrompts;
            } else if (detectedSite) {
              savedPrompts = currentActiveQuestion.savedPrompts[detectedSite] || [];
            }
          }
          
          // We expect pageHistory length to be (1 + savedPrompts.length) where savedPrompts are non-empty
          const validSavedPrompts = savedPrompts.filter(p => p.trim() !== '');
          
          if (pageHistory.length - 1 !== validSavedPrompts.length) {
            isConsistent = false;
          } else {
            for (let i = 0; i < validSavedPrompts.length; i++) {
              const expectedP = normalizeStr(validSavedPrompts[i]);
              const actualP = normalizeStr(pageHistory[i + 1]);
              if (!actualP.includes(expectedP) && !expectedP.includes(actualP)) {
                isConsistent = false;
                break;
              }
            }
          }
          
          const alertEl = document.getElementById('ctInconsistencyAlert');
          if (!isConsistent) {
             if (alertEl) {
               alertEl.style.display = 'block';
               
               // Bind Sync Button
               const syncBtn = document.getElementById('ctSyncPromptBtn');
               if (syncBtn) {
                 syncBtn.onclick = () => {
                    // Overwrite with page history
                    const newSavedPrompts = [];
                    for (let i = 1; i < pageHistory.length; i++) {
                      newSavedPrompts.push(pageHistory[i]);
                    }
                    
                    if (!currentActiveQuestion.savedPrompts || Array.isArray(currentActiveQuestion.savedPrompts)) {
                      currentActiveQuestion.savedPrompts = { doubao: [], deepseek: [] };
                    }
                    if (detectedSite) {
                      currentActiveQuestion.savedPrompts[detectedSite] = newSavedPrompts;
                    }
                    
                    // Round count should be max of doubao and deepseek lengths
                    const dLen = (currentActiveQuestion.savedPrompts.doubao || []).length;
                    const dsLen = (currentActiveQuestion.savedPrompts.deepseek || []).length;
                    currentRoundCount = Math.max(pageHistory.length, dLen + 1, dsLen + 1); 
                    
                    persistQuestionsState();
                    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                      chrome.storage.local.set({ currentRoundCount });
                    }
                    renderAnnotations();
                    
                    alertEl.style.display = 'none';
                    if (targetSite) alert('同步成功！插件评测页面的Prompt已覆盖为当前网页的对话历史。');
                 };
               }
               
               // Bind Dismiss Button
               const dismissBtn = document.getElementById('ctDismissAlertBtn');
               if (dismissBtn) {
                 dismissBtn.onclick = () => {
                   alertEl.style.display = 'none';
                 };
               }
             }
          } else {
             if (alertEl) alertEl.style.display = 'none';
             if (targetSite) alert('当前页面的Prompt与插件记录完全一致。');
          }
        });
      });
    }
  }

  function renderAnnotations() {
    const roundsContainerDoubao = document.getElementById('ctRoundsContainer-doubao');
    const roundsContainerDeepseek = document.getElementById('ctRoundsContainer-deepseek');
    if (!roundsContainerDoubao || !roundsContainerDeepseek) return;
    
    roundsContainerDoubao.innerHTML = '';
    roundsContainerDeepseek.innerHTML = '';
    
    // Calculate round lengths based on state or fall back to currentRoundCount
    let doubaoRounds = currentRoundCount;
    let deepseekRounds = currentRoundCount;
    if (currentActiveQuestion && currentActiveQuestion.savedPrompts) {
      if (!Array.isArray(currentActiveQuestion.savedPrompts)) {
        if (currentActiveQuestion.savedPrompts.doubao) {
          doubaoRounds = Math.max(1, currentActiveQuestion.savedPrompts.doubao.length);
        }
        if (currentActiveQuestion.savedPrompts.deepseek) {
          deepseekRounds = Math.max(1, currentActiveQuestion.savedPrompts.deepseek.length);
        }
      }
    }
    
    const maxRoundsToRender = Math.max(doubaoRounds, deepseekRounds);
    for (let round = 1; round <= maxRoundsToRender; round++) {
      // Helper to generate round HTML for a specific model
      const generateRoundHtml = (modelName, modelColor, modelKey, emptyText) => {
        let promptText = '';
        if (currentActiveQuestion && currentActiveQuestion.savedPrompts) {
          if (Array.isArray(currentActiveQuestion.savedPrompts)) {
            promptText = currentActiveQuestion.savedPrompts[round - 1] || '';
          } else if (currentActiveQuestion.savedPrompts[modelKey]) {
            promptText = currentActiveQuestion.savedPrompts[modelKey][round - 1] || '';
          }
        }

        return `
        <div class="evaluation-round" data-round="${round}" style="border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; background-color: var(--sidebar-bg); position: relative;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h4 style="margin: 0; font-size: 14px; font-weight: 600; color: var(--text-main); display: flex; align-items: center; gap: 6px;">
              <span style="display: flex; align-items: center; justify-content: center; width: 20px; height: 20px; background: var(--primary-color); color: white; border-radius: 50%; font-size: 12px;">${round}</span>
              第 ${round} 轮对话
            </h4>
            <button class="btn-delete-round custom-tooltip" data-model="${modelKey}" data-round="${round}" data-tooltip="删除此轮" style="background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 4px; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
          
          <div style="font-size: 13px; font-weight: 600; color: var(--text-main); margin-bottom: 8px;">用户 Prompt</div>
          ${round === 1 
            ? `<div style="background: var(--chat-user-bg); border-radius: 8px; margin-bottom: 16px; position: relative;">
                <div id="ctDetailPromptText${modelKey === 'deepseek' ? 'Deepseek' : ''}" style="padding: 12px; font-size: 13px; color: var(--text-main); line-height: 1.5; padding-right: 40px;">
                  ${currentActiveQuestion ? currentActiveQuestion.title : '--'}
                </div>
                <button id="ctCopyPromptBtn${modelKey === 'deepseek' ? 'Deepseek' : ''}" class="custom-tooltip" data-tooltip="复制" style="position: absolute; top: 8px; right: 8px; background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 4px; border-radius: 4px;">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                </button>
              </div>`
            : `<div style="margin-bottom: 16px;">
                <textarea class="round-prompt-input" data-model="${modelKey}" data-round="${round}" placeholder="请粘贴您本轮追加的 Prompt..." style="width: 100%; min-height: 60px; padding: 12px; border: 1px dashed var(--border-color); border-radius: 8px; font-size: 13px; resize: vertical; font-family: inherit; box-sizing: border-box; background-color: var(--chat-user-bg); color: var(--text-main); line-height: 1.5;">${promptText}</textarea>
              </div>`
          }

          <div style="font-size: 13px; font-weight: 600; color: var(--text-main); margin-bottom: 8px;">大模型回复批注</div>
          <div style="margin-bottom: 16px;">
            <div style="font-size: 12px; font-weight: 600; color: var(--text-main); margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
              <span style="width: 4px; height: 10px; background: ${modelColor}; border-radius: 2px;"></span>
              ${modelName}
            </div>
            <div style="border: 1px solid var(--border-color); border-radius: 6px; overflow: hidden; background: var(--bg-color);">
              <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
                <thead style="background: var(--sidebar-bg); border-bottom: 1px solid var(--border-color);">
                  <tr>
                    <th style="padding: 6px 10px; font-weight: 600; color: var(--text-muted); width: 40px; border-right: 1px solid var(--border-color);">序号</th>
                    <th style="padding: 6px 10px; font-weight: 600; color: var(--text-muted); width: 35%; border-right: 1px solid var(--border-color);">被划取文本</th>
                    <th style="padding: 6px 10px; font-weight: 600; color: var(--text-muted); width: 40%; border-right: 1px solid var(--border-color);">批注</th>
                    <th style="padding: 6px 10px; font-weight: 600; color: var(--text-muted); width: 40px; text-align: center;">操作</th>
                  </tr>
                </thead>
                <tbody class="ct-${modelKey}-tbody" data-round="${round}">
                </tbody>
              </table>
              <div class="ct-${modelKey}-empty" data-round="${round}" style="padding: 12px; text-align: center; color: var(--text-muted); font-size: 12px;">${emptyText}</div>
            </div>
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="font-size: 13px; font-weight: 600; color: var(--text-main);">模型综合评价 (0-10分)</div>
            <div style="font-size: 12px; font-weight: 600; color: var(--primary-color); background: var(--chat-user-bg); padding: 2px 8px; border-radius: 12px; display: none;" class="ct-eval-avg-score" data-model="${modelKey}" data-round="${round}">平均分: --</div>
          </div>
          <div style="border: 1px solid var(--border-color); border-radius: 6px; background: var(--bg-color); padding: 12px;">
            <div style="margin-bottom: 12px; display: flex; flex-wrap: wrap; gap: 8px;" class="ct-eval-dims-container" data-model="${modelKey}" data-round="${round}">
              <!-- Dimension tags will be rendered here -->
            </div>
            <div class="ct-eval-scores-container" data-model="${modelKey}" data-round="${round}" style="display: flex; flex-direction: column; gap: 12px;">
              <!-- Score sliders will be rendered here -->
            </div>
          </div>
          
          <button class="btn-insert-round-between" data-model="${modelKey}" data-round="${round}" style="position: absolute; bottom: -12px; left: 50%; transform: translateX(-50%); z-index: 10; background: var(--bg-color); border: 1px dashed var(--border-color); color: var(--text-muted); font-size: 11px; padding: 2px 10px; border-radius: 12px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.borderColor='var(--primary-color)'; this.style.color='var(--primary-color)';" onmouseout="this.style.borderColor='var(--border-color)'; this.style.color='var(--text-muted)';">+ 在此后插入一轮</button>
        </div>
      `;
      };

      if (round <= doubaoRounds) {
        roundsContainerDoubao.insertAdjacentHTML('beforeend', generateRoundHtml('豆包', 'var(--primary-color)', 'doubao', '暂无豆包批注记录', round));
      }
      
      if (round <= deepseekRounds) {
        roundsContainerDeepseek.insertAdjacentHTML('beforeend', generateRoundHtml('Deepseek', '#2563EB', 'deepseek', '暂无 Deepseek 批注记录', round));
      }

      // Bind copy btn for round 1 (Doubao)
      if (round === 1) {
        const ctCopyPromptBtn = roundsContainerDoubao.querySelector('#ctCopyPromptBtn');
        const ctDetailPromptText = roundsContainerDoubao.querySelector('#ctDetailPromptText');
        if (ctCopyPromptBtn && ctDetailPromptText) {
          ctCopyPromptBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(ctDetailPromptText.textContent.trim()).then(() => {
              const originalTooltip = ctCopyPromptBtn.getAttribute('data-tooltip');
              ctCopyPromptBtn.setAttribute('data-tooltip', '已复制!');
              ctCopyPromptBtn.style.color = 'var(--primary-color)';
              setTimeout(() => {
                ctCopyPromptBtn.setAttribute('data-tooltip', originalTooltip);
                ctCopyPromptBtn.style.color = 'var(--text-muted)';
              }, 2000);
            });
          });
        }
        
        // Bind copy btn for round 1 (Deepseek)
        const ctCopyPromptBtnDeepseek = roundsContainerDeepseek.querySelector('#ctCopyPromptBtnDeepseek');
        const ctDetailPromptTextDeepseek = roundsContainerDeepseek.querySelector('#ctDetailPromptTextDeepseek');
        if (ctCopyPromptBtnDeepseek && ctDetailPromptTextDeepseek) {
          ctCopyPromptBtnDeepseek.addEventListener('click', () => {
            navigator.clipboard.writeText(ctDetailPromptTextDeepseek.textContent.trim()).then(() => {
              const originalTooltip = ctCopyPromptBtnDeepseek.getAttribute('data-tooltip');
              ctCopyPromptBtnDeepseek.setAttribute('data-tooltip', '已复制!');
              ctCopyPromptBtnDeepseek.style.color = 'var(--primary-color)';
              setTimeout(() => {
                ctCopyPromptBtnDeepseek.setAttribute('data-tooltip', originalTooltip);
                ctCopyPromptBtnDeepseek.style.color = 'var(--text-muted)';
              }, 2000);
            });
          });
        }
      }
    }
    
    // Bind textarea blur to save custom prompts
    document.querySelectorAll('.round-prompt-input').forEach(textarea => {
      textarea.addEventListener('blur', (e) => {
        const round = parseInt(e.target.getAttribute('data-round'), 10);
        const modelKey = e.target.getAttribute('data-model') || 'doubao';
        if (currentActiveQuestion) {
          if (!currentActiveQuestion.savedPrompts) {
            currentActiveQuestion.savedPrompts = { doubao: [], deepseek: [] };
          } else if (Array.isArray(currentActiveQuestion.savedPrompts)) {
            currentActiveQuestion.savedPrompts = { doubao: [...currentActiveQuestion.savedPrompts], deepseek: [...currentActiveQuestion.savedPrompts] };
          }
          if (!currentActiveQuestion.savedPrompts[modelKey]) currentActiveQuestion.savedPrompts[modelKey] = [];
          currentActiveQuestion.savedPrompts[modelKey][round - 1] = e.target.value.trim();
          persistQuestionsState();
        }
      });
    });

    // Render annotations into respective round tables
    const renderTableRows = (tbody, msg, source, round) => {
      if (!tbody || !msg) return;
      tbody.innerHTML = '';
      
      // Filter by source and round (if annotation has no round, assume it's round 1)
      const sourceAnnotations = currentAnnotations.filter(a => {
        const matchSource = (a.source || 'doubao') === source;
        const annRound = a.round || 1; 
        return matchSource && annRound === round;
      });
      
      if (sourceAnnotations.length === 0) {
        msg.style.display = 'block';
        tbody.parentElement.style.display = 'none';
        return;
      }
      
      msg.style.display = 'none';
      tbody.parentElement.style.display = 'table';
      
      sourceAnnotations.forEach((item, displayIndex) => {
        const originalIndex = currentAnnotations.indexOf(item);
        
        const tr = document.createElement('tr');
        if (item.id) tr.id = `annotation-row-${item.id}`;
        tr.style.borderBottom = '1px solid var(--border-color)';
        tr.style.background = displayIndex % 2 === 0 ? 'var(--bg-color)' : 'var(--sidebar-bg)';
        
        const safeText = item.selectedText ? item.selectedText.replace(/"/g, '&quot;') : '';
        
        let typeBadge = '';
        if (item.contentType === 'thought') {
          typeBadge = `<span style="display: inline-block; padding: 2px 6px; margin-bottom: 4px; font-size: 10px; background: #F3E8FF; color: #7E22CE; border-radius: 4px; font-weight: 600;">思考过程</span><br/>`;
        } else if (item.contentType === 'reply') {
          typeBadge = `<span style="display: inline-block; padding: 2px 6px; margin-bottom: 4px; font-size: 10px; background: #E0F2FE; color: #6B21A8; border-radius: 4px; font-weight: 600;">模型回复</span><br/>`;
        }

        // Generate round options based on currentRoundCount
        let roundOptions = '<option value="" disabled selected>移动至...</option>';
        for (let i = 1; i <= currentRoundCount; i++) {
          if (i === (item.round || 1)) continue;
          roundOptions += `<option value="${i}">第 ${i} 轮</option>`;
        }
        
        tr.innerHTML = `
          <td style="padding: 10px 12px; color: var(--text-main); border-right: 1px solid var(--border-color); text-align: center;">${displayIndex + 1}</td>
          <td style="padding: 10px 12px; color: var(--text-main); border-right: 1px solid var(--border-color); word-break: break-all;">
            ${typeBadge}
            <div class="locate-annotation-text" data-id="${item.id || ''}" data-text="${safeText}" data-source="${source}" style="display: -webkit-box; -webkit-line-clamp: 3; line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; color: var(--primary-color); cursor: pointer; text-decoration: underline; text-underline-offset: 2px;" title="点击在网页中定位：${safeText}">${item.selectedText}</div>
          </td>
          <td style="padding: 10px 12px; color: var(--text-main); border-right: 1px solid var(--border-color); word-break: break-all;">
            <div style="display: -webkit-box; -webkit-line-clamp: 3; line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;" title="${item.annotation}">${item.annotation}</div>
          </td>
          <td style="padding: 10px 12px; text-align: center;">
            <div class="move-round-wrapper" style="margin-bottom: 8px;">
              <button class="show-move-select-btn" data-index="${originalIndex}" style="background: none; border: none; color: #3B82F6; cursor: pointer; padding: 4px 8px; border-radius: 4px; transition: background 0.2s; font-size: 13px; font-weight: 500;">移动</button>
              <select class="change-round-select" data-index="${originalIndex}" style="display: none; font-size: 11px; padding: 4px; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-color); color: var(--text-main); cursor: pointer; width: 100%; outline: none;">
                ${roundOptions}
              </select>
            </div>
            <button class="delete-annotation-btn" data-index="${originalIndex}" style="background: none; border: none; color: #EF4444; cursor: pointer; padding: 4px 8px; border-radius: 4px; transition: background 0.2s; font-size: 13px;">删除</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    };

    for (let round = 1; round <= currentRoundCount; round++) {
      const doubaoTbody = roundsContainerDoubao.querySelector(`.ct-doubao-tbody[data-round="${round}"]`);
      const doubaoMsg = roundsContainerDoubao.querySelector(`.ct-doubao-empty[data-round="${round}"]`);
      const deepseekTbody = roundsContainerDeepseek.querySelector(`.ct-deepseek-tbody[data-round="${round}"]`);
      const deepseekMsg = roundsContainerDeepseek.querySelector(`.ct-deepseek-empty[data-round="${round}"]`);
      
      renderTableRows(doubaoTbody, doubaoMsg, 'doubao', round);
      renderTableRows(deepseekTbody, deepseekMsg, 'deepseek', round);
    }

    // Bind locate annotations
    document.querySelectorAll('.locate-annotation-text').forEach(el => {
      el.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const text = e.currentTarget.getAttribute('data-text');
        const source = e.currentTarget.getAttribute('data-source');
        const targetDomain = source === 'doubao' ? 'doubao.com' : 'deepseek.com';
        
        console.log('Turing Arena Probe: Locating annotation', id, text, 'in', targetDomain);
        
        // Find all tabs matching the target domain
        chrome.tabs.query({url: `*://*.${targetDomain}/*`}, (tabs) => {
          if (tabs && tabs.length > 0) {
            // Prioritize the active tab if it's one of them, otherwise use the first one found
            let targetTab = tabs.find(t => t.active) || tabs[0];
            
            // Bring the tab and its window to front
            chrome.windows.update(targetTab.windowId, {focused: true});
            chrome.tabs.update(targetTab.id, {active: true});
            
            chrome.tabs.sendMessage(targetTab.id, {
              action: 'locateAnnotation',
              id: id,
              text: text
            }).then(response => {
              if (!response || !response.success) {
                showToast(`无法在网页中定位该文本。它可能已被覆盖或页面未完全加载。`);
              }
            }).catch(err => {
              showToast(`无法连接到 ${source === 'doubao' ? '豆包' : 'Deepseek'} 网页。请刷新页面后重试。`);
            });
          } else {
            showToast(`未找到打开的 ${source === 'doubao' ? '豆包' : 'Deepseek'} 网页。请先打开并进入对话页面。`);
          }
        });
      });
    });

      // Handle Insert Round Between
      const insertBtns = document.querySelectorAll('.btn-insert-round-between');
      insertBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const insertAfterRound = parseInt(e.currentTarget.getAttribute('data-round'), 10);
          const modelKey = e.currentTarget.getAttribute('data-model') || 'doubao';
          
          chrome.storage.local.get(['currentRoundCount', 'activeCrowdtestQuestion', 'currentAnnotations'], (res) => {
            const oldCount = res.currentRoundCount || 1;
            const newCount = oldCount + 1;
            
            // 1. Shift savedPrompts down by 1 starting from insertAfterRound
            let savedPrompts = { doubao: [], deepseek: [] };
            if (res.activeCrowdtestQuestion && res.activeCrowdtestQuestion.savedPrompts) {
              if (Array.isArray(res.activeCrowdtestQuestion.savedPrompts)) {
                savedPrompts.doubao = [...res.activeCrowdtestQuestion.savedPrompts];
                savedPrompts.deepseek = [...res.activeCrowdtestQuestion.savedPrompts];
              } else {
                savedPrompts.doubao = res.activeCrowdtestQuestion.savedPrompts.doubao ? [...res.activeCrowdtestQuestion.savedPrompts.doubao] : [];
                savedPrompts.deepseek = res.activeCrowdtestQuestion.savedPrompts.deepseek ? [...res.activeCrowdtestQuestion.savedPrompts.deepseek] : [];
              }
            }
            
            // Insert empty string at the correct position for the specific model
            if (modelKey === 'doubao') {
              savedPrompts.doubao.splice(insertAfterRound, 0, "");
            } else if (modelKey === 'deepseek') {
              savedPrompts.deepseek.splice(insertAfterRound, 0, "");
            }
            
            // Shift evaluations down by 1
            let evaluations = res.activeCrowdtestQuestion && res.activeCrowdtestQuestion.evaluations ? { ...res.activeCrowdtestQuestion.evaluations } : { doubao: {}, deepseek: {} };
            if (evaluations[modelKey]) {
              const newModelEvals = {};
              for (const key in evaluations[modelKey]) {
                const r = parseInt(key, 10);
                if (r > insertAfterRound) {
                  newModelEvals[r + 1] = evaluations[modelKey][key];
                } else {
                  newModelEvals[r] = evaluations[modelKey][key];
                }
              }
              evaluations[modelKey] = newModelEvals;
            }

            if (res.activeCrowdtestQuestion) {
              res.activeCrowdtestQuestion.savedPrompts = savedPrompts;
              res.activeCrowdtestQuestion.evaluations = evaluations;
              currentActiveQuestion = res.activeCrowdtestQuestion;
            }
            
            // 2. Shift annotations down by 1 if their round > insertAfterRound (only for the targeted model)
            let annotations = res.currentAnnotations || [];
            annotations = annotations.map(ann => {
              const annSource = ann.source || 'doubao';
              if (annSource === modelKey && ann.round > insertAfterRound) {
                return { ...ann, round: ann.round + 1 };
              }
              return ann;
            });
            
            // Calculate actual max round to sync currentRoundCount if needed globally
            const maxRound = Math.max(
              savedPrompts.doubao.length,
              savedPrompts.deepseek.length,
              oldCount
            );
            
            // Save everything and re-render
            chrome.storage.local.set({
              currentRoundCount: maxRound,
              activeCrowdtestQuestion: res.activeCrowdtestQuestion,
              currentAnnotations: annotations
            }, () => {
              currentRoundCount = maxRound;
              currentAnnotations = annotations;
              persistQuestionsState();
              renderAnnotations();
              
              // Scroll to the newly inserted round
              setTimeout(() => {
                const newRoundEl = document.querySelector(`.evaluation-round[data-round="${insertAfterRound + 1}"]`);
                if (newRoundEl) {
                  newRoundEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  newRoundEl.style.transition = 'box-shadow 0.3s';
                  newRoundEl.style.boxShadow = '0 0 0 2px var(--primary-color)';
                  setTimeout(() => {
                    newRoundEl.style.boxShadow = 'none';
                  }, 1500);
                }
              }, 100);
            });
          });
        });
      });

      // Handle Delete Round
      const deleteRoundBtns = document.querySelectorAll('.btn-delete-round');
      deleteRoundBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const roundToDelete = parseInt(e.currentTarget.getAttribute('data-round'), 10);
          const modelKey = e.currentTarget.getAttribute('data-model') || 'doubao';
          
          if (confirm(`确定要删除第 ${roundToDelete} 轮对话吗？此操作不可逆。`)) {
            if (confirm(`再次确认：删除后该轮的用户 Prompt、批注和综合评价将全部清空且无法恢复！是否继续？`)) {
              chrome.storage.local.get(['currentRoundCount', 'activeCrowdtestQuestion', 'currentAnnotations'], (res) => {
                const oldCount = res.currentRoundCount || 1;
                
                // 1. Shift savedPrompts up by 1
                let savedPrompts = { doubao: [], deepseek: [] };
                if (res.activeCrowdtestQuestion && res.activeCrowdtestQuestion.savedPrompts) {
                  if (Array.isArray(res.activeCrowdtestQuestion.savedPrompts)) {
                    savedPrompts.doubao = [...res.activeCrowdtestQuestion.savedPrompts];
                    savedPrompts.deepseek = [...res.activeCrowdtestQuestion.savedPrompts];
                  } else {
                    savedPrompts.doubao = res.activeCrowdtestQuestion.savedPrompts.doubao ? [...res.activeCrowdtestQuestion.savedPrompts.doubao] : [];
                    savedPrompts.deepseek = res.activeCrowdtestQuestion.savedPrompts.deepseek ? [...res.activeCrowdtestQuestion.savedPrompts.deepseek] : [];
                  }
                }
                
                // Remove the specific round
                if (savedPrompts[modelKey]) {
                  savedPrompts[modelKey].splice(roundToDelete - 1, 1);
                }
                
                // 2. Shift evaluations up by 1
                let evaluations = res.activeCrowdtestQuestion && res.activeCrowdtestQuestion.evaluations ? { ...res.activeCrowdtestQuestion.evaluations } : { doubao: {}, deepseek: {} };
                if (evaluations[modelKey]) {
                  const newModelEvals = {};
                  for (const key in evaluations[modelKey]) {
                    const r = parseInt(key, 10);
                    if (r === roundToDelete) continue; // Skip the deleted round
                    if (r > roundToDelete) {
                      newModelEvals[r - 1] = evaluations[modelKey][key];
                    } else {
                      newModelEvals[r] = evaluations[modelKey][key];
                    }
                  }
                  evaluations[modelKey] = newModelEvals;
                }

                if (res.activeCrowdtestQuestion) {
                  res.activeCrowdtestQuestion.savedPrompts = savedPrompts;
                  res.activeCrowdtestQuestion.evaluations = evaluations;
                  currentActiveQuestion = res.activeCrowdtestQuestion;
                }
                
                // 3. Remove annotations for this round and shift others up
                let annotations = res.currentAnnotations || [];
                annotations = annotations.filter(ann => {
                  const annSource = ann.source || 'doubao';
                  if (annSource === modelKey && ann.round === roundToDelete) {
                    return false; // Remove
                  }
                  return true;
                }).map(ann => {
                  const annSource = ann.source || 'doubao';
                  if (annSource === modelKey && ann.round > roundToDelete) {
                    return { ...ann, round: ann.round - 1 };
                  }
                  return ann;
                });
                
                // Calculate actual max round
                const maxRound = Math.max(
                  savedPrompts.doubao.length,
                  savedPrompts.deepseek.length,
                  1
                );
                
                // Save everything and re-render
                chrome.storage.local.set({
                  currentRoundCount: maxRound,
                  activeCrowdtestQuestion: res.activeCrowdtestQuestion,
                  currentAnnotations: annotations
                }, () => {
                  currentRoundCount = maxRound;
                  currentAnnotations = annotations;
                  persistQuestionsState();
                  renderAnnotations();
                });
              });
            }
          }
        });
        
        btn.addEventListener('mouseover', (e) => {
          e.currentTarget.style.color = '#EF4444';
          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
        });
        btn.addEventListener('mouseout', (e) => {
          e.currentTarget.style.color = 'var(--text-muted)';
          e.currentTarget.style.background = 'none';
        });
      });

    // Render and bind evaluation modules
    renderEvaluations();

    // Bind delete buttons
    document.querySelectorAll('.delete-annotation-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
        const itemToDelete = currentAnnotations[idx];
        
        currentAnnotations.splice(idx, 1);
        chrome.storage.local.set({ currentAnnotations });
        renderAnnotations();
        
        // Notify content script to remove highlight if possible
        if (itemToDelete && itemToDelete.id) {
          const targetDomain = itemToDelete.source === 'doubao' ? 'doubao.com' : 'deepseek.com';
          chrome.tabs.query({url: `*://*.${targetDomain}/*`}, (tabs) => {
            if (tabs && tabs.length > 0) {
              tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, {
                  action: 'removeHighlight',
                  id: itemToDelete.id
                }).catch(() => {});
              });
            }
          });
        }
      });
      btn.addEventListener('mouseover', (e) => {
        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
      });
      btn.addEventListener('mouseout', (e) => {
        e.currentTarget.style.background = 'none';
      });
    });

    document.querySelectorAll('.show-move-select-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const wrapper = e.currentTarget.closest('.move-round-wrapper');
        const select = wrapper.querySelector('.change-round-select');
        
        e.currentTarget.style.display = 'none';
        select.style.display = 'inline-block';
        
        // Use timeout to ensure it's rendered before focusing
        setTimeout(() => select.focus(), 0);
      });
      btn.addEventListener('mouseover', (e) => {
        e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
      });
      btn.addEventListener('mouseout', (e) => {
        e.currentTarget.style.background = 'none';
      });
    });

    // Bind change round select
    document.querySelectorAll('.change-round-select').forEach(select => {
      select.addEventListener('blur', (e) => {
        const wrapper = e.currentTarget.closest('.move-round-wrapper');
        const btn = wrapper.querySelector('.show-move-select-btn');
        e.currentTarget.style.display = 'none';
        btn.style.display = 'inline-block';
        e.currentTarget.value = ""; // Reset to placeholder
      });

      select.addEventListener('change', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
        const newRound = parseInt(e.currentTarget.value, 10);
        if (!newRound) return;
        
        if (currentAnnotations[idx]) {
          currentAnnotations[idx].round = newRound;
          
          if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({ currentAnnotations });
            // Since we are modifying the data, onChanged should fire and re-render
            // but for instant feedback:
            renderAnnotations();
          }
        }
      });
    });
    
    // Render TOC
    if (taskOverlay && taskOverlay.classList.contains('open')) {
      renderToc();
    }
  }

  // Helper: Calculate Global Averages
  function calculateGlobalAverages() {
    if (!currentActiveQuestion || !currentActiveQuestion.evaluations) return;
    
    const evals = currentActiveQuestion.evaluations;
    let doubaoTotal = 0;
    let doubaoCount = 0;
    let deepseekTotal = 0;
    let deepseekCount = 0;

    // Doubao
    if (evals.doubao) {
      Object.values(evals.doubao).forEach(roundData => {
        const dims = Object.keys(roundData);
        if (dims.length > 0) {
          const roundAvg = dims.reduce((sum, dim) => sum + roundData[dim], 0) / dims.length;
          doubaoTotal += roundAvg;
          doubaoCount++;
        }
      });
    }

    // Deepseek
    if (evals.deepseek) {
      Object.values(evals.deepseek).forEach(roundData => {
        const dims = Object.keys(roundData);
        if (dims.length > 0) {
          const roundAvg = dims.reduce((sum, dim) => sum + roundData[dim], 0) / dims.length;
          deepseekTotal += roundAvg;
          deepseekCount++;
        }
      });
    }

    const doubaoGlobalAvg = doubaoCount > 0 ? (doubaoTotal / doubaoCount).toFixed(1) : '0.0';
    const deepseekGlobalAvg = deepseekCount > 0 ? (deepseekTotal / deepseekCount).toFixed(1) : '0.0';

    const doubaoScoreEl = document.getElementById('doubaoGlobalAvgScore');
    const deepseekScoreEl = document.getElementById('deepseekGlobalAvgScore');

    if (doubaoScoreEl) doubaoScoreEl.innerText = doubaoGlobalAvg;
    if (deepseekScoreEl) deepseekScoreEl.innerText = deepseekGlobalAvg;
  }

  // Render Table of Contents (TOC)
  function renderToc() {
    const tocContainer = document.getElementById('ctTocContainer');
    const tocList = document.getElementById('ctTocList');
    const taskOverlay = document.getElementById('ctQuestionDetailOverlay');
    if (!tocContainer || !tocList || !taskOverlay || !taskOverlay.classList.contains('open')) {
      if (tocContainer) tocContainer.style.display = 'none';
      return;
    }
    
    tocContainer.style.display = 'flex';
    
    // Determine active tab
    const isDeepseekActive = document.querySelector('.ct-model-tab[data-target="deepseek"]')?.classList.contains('active');
    const targetModel = isDeepseekActive ? 'deepseek' : 'doubao';
    const containerId = isDeepseekActive ? 'ctRoundsContainer-deepseek' : 'ctRoundsContainer-doubao';
    
    // Calculate rounds for the active model
    let modelRounds = 1;
    if (currentActiveQuestion && currentActiveQuestion.savedPrompts) {
      const arr = currentActiveQuestion.savedPrompts[targetModel];
      if (arr && Array.isArray(arr)) {
        modelRounds = Math.max(arr.length, 1);
      }
    }
    
    tocList.innerHTML = '';
    
    // Helper to add TOC items
    const addTocItem = (label, targetElementId, isSubItem = false) => {
      const li = document.createElement('li');
      li.style.padding = isSubItem ? '6px 12px 6px 24px' : '8px 12px';
      li.style.cursor = 'pointer';
      li.style.borderBottom = '1px solid var(--border-color)';
      li.style.transition = 'background-color 0.2s';
      li.style.fontSize = isSubItem ? '11px' : '12px';
      li.style.fontWeight = isSubItem ? '400' : '500';
      li.innerText = label;
      
      li.addEventListener('mouseover', () => {
        li.style.backgroundColor = 'var(--bg-color)';
        li.style.color = 'var(--primary-color)';
      });
      li.addEventListener('mouseout', () => {
        li.style.backgroundColor = 'transparent';
        li.style.color = 'var(--text-muted)';
      });
      
      li.addEventListener('click', () => {
        if (targetElementId) {
          const el = document.getElementById(targetElementId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            const oldColor = el.style.color;
            el.style.transition = 'color 0.5s ease';
            el.style.color = 'var(--primary-color)';
            setTimeout(() => el.style.color = oldColor || '', 1500);
          }
        }
      });
      
      tocList.appendChild(li);
    };

    // 1. 题目
    addTocItem('题目', 'ctModuleTask');
    
    // 2. 与模型对话
    addTocItem('与模型对话', 'ctModuleChat');
    
    // 2.x Model Rounds
    for (let i = 1; i <= modelRounds; i++) {
      const li = document.createElement('li');
      li.style.padding = '6px 12px 6px 24px';
      li.style.cursor = 'pointer';
      li.style.borderBottom = '1px solid var(--border-color)';
      li.style.transition = 'background-color 0.2s';
      li.style.fontSize = '11px';
      li.innerText = `第 ${i} 轮`;
      
      li.addEventListener('mouseover', () => {
        li.style.backgroundColor = 'var(--bg-color)';
        li.style.color = 'var(--primary-color)';
      });
      li.addEventListener('mouseout', () => {
        li.style.backgroundColor = 'transparent';
        li.style.color = 'var(--text-muted)';
      });
      
      li.addEventListener('click', () => {
        const container = document.getElementById(containerId);
        if (container) {
          const roundEl = container.querySelector(`.evaluation-round[data-round="${i}"]`);
          if (roundEl) {
            roundEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Brief highlight effect on the round container
            const oldBorder = roundEl.style.borderColor;
            const oldBoxShadow = roundEl.style.boxShadow;
            roundEl.style.transition = 'all 0.5s ease';
            roundEl.style.borderColor = 'var(--primary-color)';
            roundEl.style.boxShadow = '0 0 0 2px rgba(99, 102, 241, 0.2)';
            setTimeout(() => {
              roundEl.style.borderColor = oldBorder || 'var(--border-color)';
              roundEl.style.boxShadow = oldBoxShadow || 'none';
            }, 1500);
          }
        }
      });
      tocList.appendChild(li);
    }
    
    // 3. 整体评分
    addTocItem('整体评分', 'ctModuleRating');
    
    // 4. 产物收集
    addTocItem('产物收集', 'ctModuleCollection');
  }

  const AVAILABLE_EVAL_DIMS = ['准确性', '完整性', '逻辑性', '语言表达', '安全合规'];

  function renderEvaluations() {
    if (!currentActiveQuestion) return;
    
    if (!currentActiveQuestion.evaluations) {
      currentActiveQuestion.evaluations = { doubao: {}, deepseek: {} };
    }
    
    const evals = currentActiveQuestion.evaluations;

    // Render Dimensions and Scores for each model and round
    ['doubao', 'deepseek'].forEach(modelKey => {
      if (!evals[modelKey]) evals[modelKey] = {};
      
      const dimsContainers = document.querySelectorAll(`.ct-eval-dims-container[data-model="${modelKey}"]`);
      dimsContainers.forEach(container => {
        const round = parseInt(container.getAttribute('data-round'), 10);
        const roundEvals = evals[modelKey][round] || {};
        
        // Render Chips
        container.innerHTML = AVAILABLE_EVAL_DIMS.map(dim => {
          const isSelected = Object.prototype.hasOwnProperty.call(roundEvals, dim);
          const colorStyles = isSelected 
            ? `border: 1px solid var(--primary-color); background: var(--primary-color); color: #fff;` 
            : `border: 1px solid var(--border-color); background: transparent; color: var(--text-muted);`;
          return `<span class="ct-eval-dim-chip" data-model="${modelKey}" data-round="${round}" data-dim="${dim}" style="padding: 4px 10px; font-size: 12px; border-radius: 12px; cursor: pointer; transition: all 0.2s; ${colorStyles}">${dim}</span>`;
        }).join('');
        
        // Render Score Sliders
        const scoresContainer = document.querySelector(`.ct-eval-scores-container[data-model="${modelKey}"][data-round="${round}"]`);
        const avgScoreEl = document.querySelector(`.ct-eval-avg-score[data-model="${modelKey}"][data-round="${round}"]`);
        
        if (scoresContainer) {
          const activeDims = Object.keys(roundEvals).filter(dim => AVAILABLE_EVAL_DIMS.includes(dim));
          if (activeDims.length === 0) {
            scoresContainer.innerHTML = `<div style="color: var(--text-muted); font-size: 12px; font-style: italic;">请先选择上方的评价维度...</div>`;
            if (avgScoreEl) avgScoreEl.style.display = 'none';
          } else {
            // Calculate initial average
            const totalScore = activeDims.reduce((sum, dim) => sum + roundEvals[dim], 0);
            const avgScore = (totalScore / activeDims.length).toFixed(1);
            if (avgScoreEl) {
              avgScoreEl.style.display = 'block';
              avgScoreEl.innerText = `平均分: ${avgScore}`;
            }

            scoresContainer.innerHTML = activeDims.map(dim => {
              const score = roundEvals[dim];
              return `
                <div style="display: flex; align-items: center; gap: 12px; font-size: 12px; color: var(--text-main);">
                  <div style="width: 60px; font-weight: 500;">${dim}</div>
                  <input type="range" class="ct-eval-score-slider" data-model="${modelKey}" data-round="${round}" data-dim="${dim}" min="0" max="10" step="1" value="${score}" style="flex: 1; accent-color: var(--primary-color);">
                  <div style="width: 24px; text-align: right; font-weight: 600; color: var(--primary-color);">${score}</div>
                </div>
              `;
            }).join('');
          }
        }
      });
    });
    
    // Bind Chip Click Events
    document.querySelectorAll('.ct-eval-dim-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        const modelKey = e.currentTarget.getAttribute('data-model');
        const round = parseInt(e.currentTarget.getAttribute('data-round'), 10);
        const dim = e.currentTarget.getAttribute('data-dim');
        
        if (!currentActiveQuestion.evaluations[modelKey][round]) {
          currentActiveQuestion.evaluations[modelKey][round] = {};
        }
        
        if (Object.prototype.hasOwnProperty.call(currentActiveQuestion.evaluations[modelKey][round], dim)) {
          // Deselect: remove from object
          delete currentActiveQuestion.evaluations[modelKey][round][dim];
        } else {
          // Select: default to 5
          currentActiveQuestion.evaluations[modelKey][round][dim] = 5;
        }
        
        persistQuestionsState();
        renderEvaluations(); // Re-render just the evaluation section
      });
    });
    
    // Bind Slider Input Events (Real-time update)
    document.querySelectorAll('.ct-eval-score-slider').forEach(slider => {
      slider.addEventListener('input', (e) => {
        const val = e.target.value;
        e.target.nextElementSibling.innerText = val;
        
        // Real-time average update
        const modelKey = e.target.getAttribute('data-model');
        const round = parseInt(e.target.getAttribute('data-round'), 10);
        
        const container = document.querySelector(`.ct-eval-scores-container[data-model="${modelKey}"][data-round="${round}"]`);
        if (container) {
          const sliders = container.querySelectorAll('.ct-eval-score-slider');
          let total = 0;
          let count = 0;
          sliders.forEach(s => {
            total += parseInt(s.value, 10);
            count++;
          });
          const avgEl = document.querySelector(`.ct-eval-avg-score[data-model="${modelKey}"][data-round="${round}"]`);
          if (avgEl && count > 0) {
            avgEl.innerText = `平均分: ${(total / count).toFixed(1)}`;
          }
        }
      });
      
      slider.addEventListener('change', (e) => {
        const modelKey = e.target.getAttribute('data-model');
        const round = parseInt(e.target.getAttribute('data-round'), 10);
        const dim = e.target.getAttribute('data-dim');
        const val = parseInt(e.target.value, 10);
        
        currentActiveQuestion.evaluations[modelKey][round][dim] = val;
        persistQuestionsState();
        calculateGlobalAverages();
      });
    });

    calculateGlobalAverages();
  }

  // Load existing annotations from storage when sidebar opens
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['currentAnnotations', 'currentRoundCount'], (result) => {
      if (result.currentAnnotations) {
        currentAnnotations = result.currentAnnotations;
      }
      if (result.currentRoundCount) {
        currentRoundCount = result.currentRoundCount;
      }
      renderAnnotations();
    });
  }

  // Listen for annotations changes from storage
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    let pendingScrollToId = null;
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'local') {
        let shouldRender = false;
        
        if (changes.lastAddedAnnotationId && changes.lastAddedAnnotationId.newValue) {
          pendingScrollToId = changes.lastAddedAnnotationId.newValue;
          chrome.storage.local.remove('lastAddedAnnotationId');
        }

        if (changes.activeCrowdtestQuestion) {
          const newQ = changes.activeCrowdtestQuestion.newValue;
          if (newQ && currentActiveQuestion && newQ.id === currentActiveQuestion.id) {
            const oldPromptsStr = JSON.stringify(currentActiveQuestion.savedPrompts || []);
            const newPromptsStr = JSON.stringify(newQ.savedPrompts || []);
            if (oldPromptsStr !== newPromptsStr) {
              currentActiveQuestion.savedPrompts = newQ.savedPrompts;
              shouldRender = true;
            }
          }
        }
        if (changes.currentAnnotations) {
          currentAnnotations = changes.currentAnnotations.newValue || [];
          shouldRender = true;
          if (currentActiveQuestion) {
            currentActiveQuestion.savedAnnotations = [...currentAnnotations];
            persistQuestionsState();
          }
        }
        if (changes.currentRoundCount) {
          currentRoundCount = changes.currentRoundCount.newValue || 1;
          shouldRender = true;
          // Removing the sync logic that forced doubao and deepseek array lengths to match currentRoundCount
          // because we want them to grow independently when capturing autoSyncPrompt.
        }
        if (shouldRender) {
          renderAnnotations();
        }

        if (changes.lastAutoSyncedPrompt && changes.lastAutoSyncedPrompt.newValue) {
          const syncInfo = changes.lastAutoSyncedPrompt.newValue;
          chrome.storage.local.remove('lastAutoSyncedPrompt');
          
          setTimeout(() => {
            // Ensure correct tab is active
            const targetTabBtn = document.querySelector(`.ct-model-tab[data-target="${syncInfo.source}"]`);
            if (targetTabBtn && !targetTabBtn.classList.contains('active')) {
              targetTabBtn.click();
            }
            
            setTimeout(() => {
              // The container for the model
              const containerId = syncInfo.source === 'deepseek' ? 'ctDeepseekContent' : 'ctDoubaoContent';
              const container = document.getElementById(containerId);
              if (container) {
                const roundEl = container.querySelector(`.evaluation-round[data-round="${syncInfo.round}"]`);
                if (roundEl) {
                  roundEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  
                  const promptBox = roundEl.querySelector('.user-prompt-input') || roundEl.querySelector('[id^="ctDetailPromptText"]');
                  if (promptBox) {
                    const oldBg = promptBox.style.backgroundColor;
                    promptBox.style.transition = 'background-color 0.5s ease';
                    promptBox.style.backgroundColor = '#FEF08A';
                    setTimeout(() => {
                      promptBox.style.backgroundColor = oldBg || '';
                    }, 1500);
                  }
                }
              }
            }, 100);
          }, 300); // Wait for render
        }
        
        if (pendingScrollToId) {
          const idToScroll = pendingScrollToId;
          
          setTimeout(() => {
            const row = document.getElementById(`annotation-row-${idToScroll}`);
            if (row) {
              pendingScrollToId = null; // Clear it only if we found it
              
              // First make sure the correct tab is active!
              const modelKey = row.closest('.ct-tab-content')?.id === 'ct-tab-deepseek' ? 'deepseek' : 'doubao';
              const targetTabBtn = document.querySelector(`.ct-model-tab[data-target="${modelKey}"]`);
              if (targetTabBtn && !targetTabBtn.classList.contains('active')) {
                targetTabBtn.click();
              }
              
              setTimeout(() => {
                row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                const oldBg = row.style.backgroundColor;
                row.style.transition = 'background-color 0.5s ease';
                row.style.backgroundColor = '#FEF08A';
                setTimeout(() => {
                  row.style.backgroundColor = oldBg || '';
                }, 1500);
              }, 100); // wait for tab switch
            } else {
              setTimeout(() => {
                if (pendingScrollToId === idToScroll) {
                  pendingScrollToId = null;
                }
              }, 2000);
            }
          }, 300); // wait for DOM to update
        }
      }
    });
  }

    // Bind Add Round Button
    const ctAddRoundBtn = document.getElementById('ctAddRoundBtn');
    if (ctAddRoundBtn) {
      // Remove old listener by replacing clone
      const newBtn = ctAddRoundBtn.cloneNode(true);
      ctAddRoundBtn.parentNode.replaceChild(newBtn, ctAddRoundBtn);
      
      newBtn.addEventListener('click', () => {
        // Find which tab is currently active to only add round to that model
        const isDeepseekActive = document.getElementById('ctDeepseekContent').style.display === 'block';
        const modelKey = isDeepseekActive ? 'deepseek' : 'doubao';
        
        if (currentActiveQuestion) {
          if (!currentActiveQuestion.savedPrompts) {
            currentActiveQuestion.savedPrompts = { doubao: [], deepseek: [] };
          } else if (Array.isArray(currentActiveQuestion.savedPrompts)) {
            currentActiveQuestion.savedPrompts = { doubao: [...currentActiveQuestion.savedPrompts], deepseek: [...currentActiveQuestion.savedPrompts] };
          }
          if (!currentActiveQuestion.savedPrompts[modelKey]) currentActiveQuestion.savedPrompts[modelKey] = [];
          
          // Initialize an empty prompt for the new round
          currentActiveQuestion.savedPrompts[modelKey].push('');
          
          // Keep currentRoundCount as max of the two for global reference if needed,
          // though rendering should rely on array lengths.
          currentRoundCount = Math.max(
            (currentActiveQuestion.savedPrompts.doubao || []).length,
            (currentActiveQuestion.savedPrompts.deepseek || []).length,
            1
          );
          
          persistQuestionsState();
        }
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ currentRoundCount });
        }
        renderAnnotations();
      });
    }

  // Reset annotations and product collection inputs when opening a question
  const originalOpenQuestionDetail = openQuestionDetail;
  openQuestionDetail = function(index, btn) {
    const question = mockQuestions[index];
    
    // Restore or clear annotations based on saved state
    if (question && question.savedAnnotations) {
      currentAnnotations = [...question.savedAnnotations];
    } else {
      currentAnnotations = [];
    }

    // Determine current round count based on saved state
    if (question && question.savedPrompts) {
      if (Array.isArray(question.savedPrompts) && question.savedPrompts.length > 0) {
        currentRoundCount = question.savedPrompts.length;
      } else if (question.savedPrompts.doubao || question.savedPrompts.deepseek) {
        const dLen = (question.savedPrompts.doubao || []).length;
        const dsLen = (question.savedPrompts.deepseek || []).length;
        currentRoundCount = Math.max(dLen, dsLen, 1);
      } else {
        currentRoundCount = 1;
      }
    } else {
      currentRoundCount = 1;
    }
    
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ currentAnnotations: currentAnnotations, currentRoundCount: currentRoundCount });
    }
    renderAnnotations();
    
    const doubaoLinkInput = document.getElementById('doubaoLinkInput');
    const deepseekLinkInput = document.getElementById('deepseekLinkInput');
    
    // Restore or clear links based on saved state
    if (doubaoLinkInput) {
      doubaoLinkInput.value = (question && question.savedDoubaoLink) ? question.savedDoubaoLink : '';
    }
    if (deepseekLinkInput) {
      deepseekLinkInput.value = (question && question.savedDeepseekLink) ? question.savedDeepseekLink : '';
    }
    
    originalOpenQuestionDetail(index, btn);
    
    // Update global task prompt title and bind copy
    const ctGlobalTaskPromptText = document.getElementById('ctGlobalTaskPromptText');
    const ctCopyGlobalTaskPromptBtn = document.getElementById('ctCopyGlobalTaskPromptBtn');
    if (ctGlobalTaskPromptText && question) {
      ctGlobalTaskPromptText.textContent = question.title || '--';
    }
    
    if (ctCopyGlobalTaskPromptBtn && ctGlobalTaskPromptText) {
      // Remove old listeners to avoid multiple bindings
      const newBtn = ctCopyGlobalTaskPromptBtn.cloneNode(true);
      ctCopyGlobalTaskPromptBtn.parentNode.replaceChild(newBtn, ctCopyGlobalTaskPromptBtn);
      
      newBtn.addEventListener('click', async () => {
        const textToCopy = ctGlobalTaskPromptText.textContent.trim();
        if (!textToCopy || textToCopy === '--') return;
        
        try {
          await navigator.clipboard.writeText(textToCopy);
          const originalTooltip = newBtn.getAttribute('data-tooltip');
          newBtn.setAttribute('data-tooltip', '已复制!');
          newBtn.style.color = 'var(--primary-color)';
          setTimeout(() => {
            newBtn.setAttribute('data-tooltip', originalTooltip);
            newBtn.style.color = 'var(--text-muted)';
          }, 2000);
        } catch (err) {
          console.error('Failed to copy', err);
        }
      });
    }
  };

  // External Model Links & Prompt Copy
  const ctOpenDoubaoBtn = document.getElementById('ctOpenDoubaoBtn');
  const ctOpenDeepseekBtn = document.getElementById('ctOpenDeepseekBtn');
  const ctCopyPromptBtn = document.getElementById('ctCopyPromptBtn');
  const ctDetailPromptText = document.getElementById('ctDetailPromptText');
  
  if (ctCopyPromptBtn && ctDetailPromptText) {
    ctCopyPromptBtn.addEventListener('click', async () => {
      const textToCopy = ctDetailPromptText.textContent.trim();
      if (!textToCopy || textToCopy === '--') return;
      
      try {
        await navigator.clipboard.writeText(textToCopy);
        const originalHtml = ctCopyPromptBtn.innerHTML;
        ctCopyPromptBtn.innerHTML = '<svg fill="none" stroke="#10B981" viewBox="0 0 24 24" style="width: 16px; height: 16px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
        ctCopyPromptBtn.setAttribute('data-tooltip', '已复制!');
        
        setTimeout(() => {
          ctCopyPromptBtn.innerHTML = originalHtml;
          ctCopyPromptBtn.setAttribute('data-tooltip', '复制');
        }, 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
        alert('复制失败，请手动复制。');
      }
    });
  }

  if (ctOpenDoubaoBtn) {
    ctOpenDoubaoBtn.addEventListener('click', () => {
      window.open('https://www.doubao.com/', '_blank');
    });
  }
  
  if (ctOpenDeepseekBtn) {
    ctOpenDeepseekBtn.addEventListener('click', () => {
      window.open('https://chat.deepseek.com/', '_blank');
    });
  }

  // 隐藏初始加载动画
  if (initialLoader) {
    // 因为首次加载白屏时间较长，我们需要保证动效出现后至少停留一会儿
    // 而不是被极快的初始化瞬间消灭掉
    setTimeout(() => {
      initialLoader.style.opacity = '0';
      const mainAppContainer = document.getElementById('mainAppContainer');
      if (mainAppContainer) {
        mainAppContainer.style.opacity = '1';
        mainAppContainer.style.pointerEvents = 'auto';
      }
      setTimeout(() => {
        initialLoader.style.display = 'none';
      }, 300);
    }, 600); // 强行保留 600ms 的最小展示时间
  }
});
