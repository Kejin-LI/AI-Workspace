import { HelpCircle, LayoutGrid, Coins, ChevronLeft, Clock, MessageSquare, Link as LinkIcon, X, Camera, Share, Check, Upload, Star, Rocket, Bell, User, BookOpen } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useHeaderActions } from '../contexts/HeaderActionsContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../lib/utils';

import { mockFeed } from '../pages/Community';

export function Header() {
  const { t } = useLanguage();
  const { actions } = useHeaderActions();
  const location = useLocation();
  const navigate = useNavigate();
  const [elapsedTime, setElapsedTime] = useState(0);

  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showEarnPointsMenu, setShowEarnPointsMenu] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpTitle, setHelpTitle] = useState('');
  const [helpContent, setHelpContent] = useState('');
  const [helpCategory, setHelpCategory] = useState<'经验分享' | '求助讨论'>('求助讨论');
  const [helpDomain, setHelpDomain] = useState('全部');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const earnPointsMenuRef = useRef<HTMLDivElement>(null);

  const domains = ['全部', '泛领域', '自然科学', '经济金融', '教育科研', '医疗健康', '法律', '哲学与社会科学', '软件与AI', '文学', '工程技术', '其他'];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
      if (earnPointsMenuRef.current && !earnPointsMenuRef.current.contains(event.target as Node)) {
        setShowEarnPointsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyLink = () => {
    // Generate a unique ID for this session (in a real app, this would be saved to DB first)
    const uniqueId = Math.random().toString(36).substring(2, 15);
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/share/${uniqueId}`;
    
    navigator.clipboard.writeText(shareUrl).then(() => {
      setIsCopied(true);
      // Keep menu open to show success state, close after delay
      setTimeout(() => {
        setIsCopied(false);
        setShowShareMenu(false);
      }, 2000);
    });
  };

  const handleHelpSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowHelpModal(false);
      
      // Create new post
      const newPost = {
        id: Date.now(),
        category: helpCategory,
        tags: [helpDomain],
        title: helpTitle,
        snippet: helpContent,
        author: '当前用户',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
        views: '0',
        image: null
      };
      
      // Add to global mock data for this session
      mockFeed.unshift(newPost);
      
      // Dispatch event for UserProfile to update
      window.dispatchEvent(new CustomEvent('new-community-post', { detail: newPost }));
      
      setHelpTitle('');
      setHelpContent('');
      setHelpCategory('求助讨论');
      setHelpDomain('全部');
      navigate('/expert/community'); // Redirect to community to see the post
    }, 1000);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (location.pathname.includes('/expert/sandbox')) {
      // Reset timer when entering sandbox
      setElapsedTime(0);
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => clearInterval(interval);
  }, [location.pathname]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getPageTitle = () => {
    const path = location.pathname;
    
    // Requester Routes
    if (path.includes('/requester/projects')) return t.requester.sidebar.projects.title;
    if (path.includes('/requester/tasks')) return typeof t.requester.sidebar.tasks === 'string' ? t.requester.sidebar.tasks : '任务管理';
    if (path.includes('/requester/reports')) return t.requester.sidebar.analytics;
    if (path.includes('/requester/settings')) return t.requester.sidebar.settings;
    
    // Expert Routes
    if (path.includes('/expert/workbench')) return t.expert.sidebar.workspace;
    if (path.includes('/expert/leaderboard')) return '模型榜单';
    if (path.includes('/expert/labeling')) return t.expert.sidebar.labeling;
    if (path.includes('/expert/community')) return t.expert.sidebar.community;
    if (path.includes('/expert/challenges')) return t.expert.sidebar.challenges;
    if (path.includes('/expert/profile')) return '个人中心';
    if (path.includes('/expert/sandbox')) return t.expert.sandbox.guidedMode;
    if (path.includes('/expert/hall')) return t.expert.sidebar.hall;
    if (path === '/expert' || path === '/expert/') return t.expert.sidebar.hall;

    return t.requester.sidebar.kickoff;
  };

  return (
    <header className={cn(
      "h-16 flex items-center justify-between px-8 bg-transparent z-20 relative",
      location.pathname.includes('/expert/sandbox') ? "bg-white border-b border-gray-100 sticky top-0" : ""
    )}>
      {/* Breadcrumbs - Left Side */}
      <div className="flex items-center text-sm text-gray-500">
        {location.pathname.includes('/expert/sandbox') ? (
           <div className="flex items-center gap-2">
             <button 
               onClick={() => {
                 if (location.state?.mode === 'free' || location.state?.mode === 'arena' || location.state?.mode === 'compare') {
                   navigate('/expert/workbench');
                 } else {
                   // Keep the task state when returning, and make sure we use the ID to persist the state
                   const passedTask = location.state?.task || location.state?.passedTask;
                   // Just navigate back to the main layout with the 'my' tab activated
                   // The TaskHall component will read from localStorage anyway
                   navigate('/expert', { state: { activeTab: 'my' } });
                 }
               }}
               className="p-1 hover:bg-gray-100 rounded-full transition-colors"
             >
               <ChevronLeft className="w-5 h-5 text-gray-600" />
             </button>
             <span className="font-bold text-lg text-gray-900">
               {location.state?.mode === 'free' 
                 ? (location.state?.prompt?.substring(0, 15) + (location.state?.prompt?.length > 15 ? '...' : '') || '经典模式')
                 : location.state?.mode === 'arena'
                   ? (location.state?.prompt?.substring(0, 15) + (location.state?.prompt?.length > 15 ? '...' : '') || '擂台模式')
                   : location.state?.mode === 'compare'
                     ? (location.state?.prompt?.substring(0, 15) + (location.state?.prompt?.length > 15 ? '...' : '') || '对比模式')
                     : (location.state?.task?.title || '生物HLE评测集构建')
               }
             </span>
           </div>
        ) : (
           <>
             <span className="hover:text-gray-900 cursor-pointer">TuringArena</span>
             <span className="mx-2">/</span>
             <span className="font-medium text-gray-900">{getPageTitle()}</span>
           </>
        )}
      </div>

      {/* Actions - Right Side */}
      <div className="flex items-center gap-4">
        {actions}
        
        {/* User Stats & Profile (Expert only) */}
        {location.pathname.startsWith('/expert') && (
          <div className="flex items-center gap-4">
            {location.pathname.includes('/expert/sandbox') && location.state?.mode !== 'free' && location.state?.mode !== 'arena' && location.state?.mode !== 'compare' ? (
              <div className="flex items-center bg-white rounded-full px-4 py-1.5 h-9 shadow-sm border border-gray-100">
                <Clock className="w-4 h-4 text-gray-500 mr-2" />
                <span className="font-mono font-medium text-gray-900">{formatTime(elapsedTime)}</span>
              </div>
            ) : (
              <>
                {location.pathname.includes('/expert/sandbox') && (location.state?.mode === 'free' || location.state?.mode === 'arena' || location.state?.mode === 'compare') && (
                  <div className="relative" ref={shareMenuRef}>
                    <button 
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-gray-100 text-gray-700 transition-colors border border-transparent hover:border-gray-200"
                    >
                      <Share className="w-4 h-4" />
                      <span className="text-sm font-medium">分享</span>
                    </button>

                    {showShareMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                        <button
                          onClick={() => {
                            setShowShareMenu(false);
                            setShowHelpModal(true);
                          }}
                          className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
                        >
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-blue-500 shrink-0" />
                            <span>分享至社区讨论</span>
                          </div>
                          <span className="flex items-center gap-1 text-[10px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded shrink-0 ml-2">
                            <Coins className="w-3 h-3" />
                            赢积分
                          </span>
                        </button>
                        <button
                          onClick={handleCopyLink}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                        >
                          {isCopied ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <LinkIcon className="w-4 h-4 text-gray-400" />
                          )}
                          {isCopied ? '链接已复制' : '复制分享链接'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
                <div className="relative" ref={earnPointsMenuRef}>
                  <div 
                    onClick={() => setShowEarnPointsMenu(!showEarnPointsMenu)}
                    className="flex items-center bg-white rounded-full pl-1.5 pr-1.5 py-1 h-9 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-inner mr-2">
                      <Coins className="w-3.5 h-3.5 text-yellow-900" />
                    </div>
                    <span className="font-bold text-slate-900 text-sm mr-3 font-mono">12,450</span>
                    <div className="bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full text-xs font-bold group-hover:bg-purple-600 group-hover:text-white transition-colors">赚积分</div>
                  </div>
                  
                  {/* Earn Points Dropdown Menu */}
                  {showEarnPointsMenu && (
                    <div className="absolute right-0 mt-2 w-[420px] bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                      <div className="px-4 py-2 border-b border-gray-50 mb-2">
                        <h3 className="font-bold text-gray-900 text-sm">做任务，赚积分</h3>
                        <p className="text-xs text-gray-500 mt-1">完成以下任务可获得丰厚积分奖励</p>
                      </div>
                      
                      <div className="max-h-[60vh] overflow-y-auto custom-scrollbar px-2 space-y-1">
                        {/* Task 1 */}
                        <div className="p-2 hover:bg-gray-50 rounded-lg transition-colors flex items-start gap-3 group">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                            <Star className="w-4 h-4 text-blue-600 fill-blue-600/20" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm font-bold text-gray-900">参与挑战任务</h4>
                              <span className="flex items-center text-xs font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                                <Coins className="w-3 h-3 mr-0.5" />+2000
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <p 
                                className="text-xs text-gray-500 truncate mr-2"
                                title="发现适合您专业技能的高价值AI挑战"
                              >
                                发现适合您专业技能的高价值AI挑战
                              </p>
                              <button 
                                onClick={() => {
                                  setShowEarnPointsMenu(false);
                                  navigate('/expert');
                                }}
                                className="px-4 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold hover:bg-blue-100 transition-colors shrink-0"
                              >
                                开始
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Task 2 */}
                        <div className="p-2 hover:bg-gray-50 rounded-lg transition-colors flex items-start gap-3 group">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                            <User className="w-4 h-4 text-blue-600 fill-blue-600/20" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm font-bold text-gray-900">完善个人信息</h4>
                              <span className="flex items-center text-xs font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                                <Coins className="w-3 h-3 mr-0.5" />+1000
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <p 
                                className="text-xs text-gray-500 truncate mr-2"
                                title="让更多科学家认识你"
                              >
                                让更多科学家认识你
                              </p>
                              <button 
                                onClick={() => {
                                  setShowEarnPointsMenu(false);
                                  navigate('/expert/profile', { state: { activeTab: '身份与背书', scrollTo: 'resume-archive' } });
                                }}
                                className="px-4 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold hover:bg-blue-100 transition-colors shrink-0"
                              >
                                开始
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Task 3 */}
                        <div className="p-2 hover:bg-gray-50 rounded-lg transition-colors flex items-start gap-3 group">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                            <BookOpen className="w-4 h-4 text-blue-600 fill-blue-600/20" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm font-bold text-gray-900">导入文献到知识库</h4>
                              <span className="flex items-center text-xs font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                                <Coins className="w-3 h-3 mr-0.5" />+500
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <p 
                                className="text-xs text-gray-500 truncate mr-2"
                                title="建立个人科研知识库"
                              >
                                建立个人科研知识库
                              </p>
                              <button 
                                onClick={() => {
                                  setShowEarnPointsMenu(false);
                                  navigate('/expert/profile', { state: { activeTab: '内容与知识库', scrollTo: 'personal-knowledge-base' } });
                                }}
                                className="px-4 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold hover:bg-blue-100 transition-colors shrink-0"
                              >
                                开始
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Task 4 */}
                        <div className="p-2 hover:bg-gray-50 rounded-lg transition-colors flex items-start gap-3 group">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                            <Rocket className="w-4 h-4 text-blue-600 fill-blue-600/20" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm font-bold text-gray-900">用专业版模式提问</h4>
                              <span className="flex items-center text-xs font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                                <Coins className="w-3 h-3 mr-0.5" />+200
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <p 
                                className="text-xs text-gray-500 truncate mr-2"
                                title="提供更精确、分析深入的学术回答"
                              >
                                提供更精确、分析深入的学术回答
                              </p>
                              <button 
                                onClick={() => {
                                  setShowEarnPointsMenu(false);
                                  navigate('/expert/workbench', { state: { initialMode: 'pro' } });
                                }}
                                className="px-4 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold hover:bg-blue-100 transition-colors shrink-0"
                              >
                                开始
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Task 5 */}
                        <div className="p-2 hover:bg-gray-50 rounded-lg transition-colors flex items-start gap-3 group">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                            <Bell className="w-4 h-4 text-blue-600 fill-blue-600/20" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm font-bold text-gray-900">发布经验到专家社区</h4>
                              <span className="flex items-center text-xs font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                                <Coins className="w-3 h-3 mr-0.5" />+200
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <p 
                                className="text-xs text-gray-500 truncate mr-2"
                                title="获取领域研究热点与情报"
                              >
                                获取领域研究热点与情报
                              </p>
                              <button 
                                onClick={() => {
                                  setShowEarnPointsMenu(false);
                                  navigate('/expert/community', { state: { activeTab: 'discuss' } });
                                }}
                                className="px-4 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold hover:bg-blue-100 transition-colors shrink-0"
                              >
                                开始
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
            
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 p-[2px] cursor-pointer hover:scale-105 transition-transform shadow-sm">
              <img 
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" 
                alt="User" 
                className="w-full h-full rounded-full border-2 border-white object-cover"
              />
            </div>
          </div>
        )}
      </div>

      {/* Share to Community Modal */}
      {showHelpModal && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <div className="flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900">分享至社区讨论</h3>
                  <span className="text-xs text-orange-500 font-medium mt-0.5">💡 成功分享并获得有效互动，可获得丰厚积分奖励！</span>
                </div>
              </div>
              <button 
                onClick={() => setShowHelpModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-6">
                {/* Auto-filled context info */}
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                  <div className="text-xs font-bold text-blue-800 mb-3 uppercase tracking-wider">分享内容预览 (已脱敏)</div>
                  <div className="grid grid-cols-1 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">模式：</span>
                      <span className="font-medium text-gray-900 ml-2">
                        {location.state?.mode === 'arena' ? '擂台模式' : '经典模式'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">对话记录：</span>
                      <span className="font-medium text-gray-900 ml-2">包含当前 Prompt 与模型回答截图</span>
                    </div>
                  </div>
                </div>

                {/* Question Input */}
                <div className="space-y-4">
                  {/* Category and Domain Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        帖子类型 <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setHelpCategory('求助讨论')}
                          className={cn(
                            "flex-1 py-2 text-sm font-medium rounded-lg border transition-colors",
                            helpCategory === '求助讨论' 
                              ? "bg-blue-50 border-blue-200 text-blue-700" 
                              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                          )}
                        >
                          求助讨论
                        </button>
                        <button
                          onClick={() => setHelpCategory('经验分享')}
                          className={cn(
                            "flex-1 py-2 text-sm font-medium rounded-lg border transition-colors",
                            helpCategory === '经验分享' 
                              ? "bg-blue-50 border-blue-200 text-blue-700" 
                              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                          )}
                        >
                          经验分享
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        学科领域 <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={helpDomain}
                        onChange={(e) => setHelpDomain(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-gray-800 text-sm transition-all"
                      >
                        {domains.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      讨论主题 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={helpTitle}
                      onChange={(e) => setHelpTitle(e.target.value)}
                      placeholder="一句话描述你想探讨的核心问题（如：关于这段代码的逻辑漏洞）"
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-gray-800 text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      详细描述 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={helpContent}
                      onChange={(e) => setHelpContent(e.target.value)}
                      placeholder="详细描述你想探讨的问题，例如：这个模型的回答是否存在逻辑漏洞？或者你有什么更好的Prompt建议？"
                      className="w-full h-32 p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none text-gray-800 text-sm leading-relaxed transition-all"
                    ></textarea>
                  </div>
                </div>

                {/* Local File Upload */}
                <div>
                  <div className="flex items-baseline justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      补充附件 <span className="text-gray-400 font-normal text-xs">(非必传)</span>
                    </label>
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded flex items-center gap-1">
                      ⚠️ 请确保上传的文件已隐去客户隐私等敏感信息
                    </span>
                  </div>
                  <label className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center gap-3 bg-gray-50 hover:bg-gray-100 hover:border-blue-300 transition-colors cursor-pointer group">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <Upload className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900 mb-1">点击上传或将文件拖拽至此处</div>
                      <div className="text-xs text-gray-500">支持 PDF, Word, Excel, 图片等格式，最大 10MB</div>
                    </div>
                    <input type="file" className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50">
              <button 
                onClick={() => setShowHelpModal(false)}
                className="px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button 
                onClick={handleHelpSubmit}
                disabled={!helpTitle.trim() || !helpContent.trim() || isSubmitting}
                className={cn(
                  "px-5 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2",
                  !helpTitle.trim() || !helpContent.trim() || isSubmitting 
                    ? "bg-blue-300 cursor-not-allowed" 
                    : "bg-blue-600 hover:bg-blue-700 shadow-sm"
                )}
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    发布中...
                  </>
                ) : (
                  '发布至社区'
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
