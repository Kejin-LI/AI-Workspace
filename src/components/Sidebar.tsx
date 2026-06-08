import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Plus,
  ShoppingBag,
  MessageSquare,
  MessagesSquare,
  User,
  PanelLeftClose,
  BarChart2,
  ChevronLeft,
  ChevronRight,
  History,
  ExternalLink,
  MoreHorizontal,
  BookOpen,
  Settings,
  Database,
  Archive,
  Globe,
  Moon,
  Sun,
  HelpCircle,
  RefreshCw,
  LogOut,
  Gift,
  Star,
  Rocket,
  Bell,
  Sprout,
  X,
  Bot,
  Zap,
  Sparkles,
  Folder,
  Lightbulb,
  Pin,
  Edit2,
  Trash2,
  Cpu,
  GraduationCap,
  CreditCard,
  Search
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useHeaderActions } from '../contexts/HeaderActionsContext';

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export function Sidebar({ isCollapsed, toggleSidebar }: SidebarProps) {
  const location = useLocation();
  const { customSpaces, setCustomSpaces } = useHeaderActions();
  const [historyItems, setHistoryItems] = useState<string[]>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark-theme'));
  const [showEarnPointsMenu, setShowEarnPointsMenu] = useState(false);
  const [showSeedModal, setShowSeedModal] = useState(false);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [pinnedSpaces, setPinnedSpaces] = useState<string[]>(['proj_demo1', 'proj_demo2']);
  const [activeSpaceMenu, setActiveSpaceMenu] = useState<{ id: string, top: number, right: number } | null>(null);
  const [editingSpaceId, setEditingSpaceId] = useState<string | null>(null);
  const [editingSpaceName, setEditingSpaceName] = useState('');
  const [showAllSpacesModal, setShowAllSpacesModal] = useState(false);
  const [spaceSearchQuery, setSpaceSearchQuery] = useState('');
  const navigate = useNavigate();

  const toggleTheme = () => {
    const nextTheme = !isDarkMode;
    setIsDarkMode(nextTheme);
    if (nextTheme) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  };

  // Listen for new chat messages from local storage or custom event
  useEffect(() => {
    const updateHistory = () => {
      try {
        const storedHistory = localStorage.getItem('chatHistory');
        if (storedHistory) {
          const parsed = JSON.parse(storedHistory);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setHistoryItems(parsed.slice(0, 5));
          }
        }
      } catch (e) {
        console.error('Failed to parse chat history', e);
      }
    };

    updateHistory();

    // Custom event to update history immediately when a new chat starts
    window.addEventListener('chatHistoryUpdated', updateHistory);
    return () => window.removeEventListener('chatHistoryUpdated', updateHistory);
  }, [location.pathname]);

  // Close user menu and space menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showUserMenu && !target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
      
      if (activeSpaceMenu && !target.closest('.space-menu-dropdown')) {
        setActiveSpaceMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu, activeSpaceMenu]);

  const sidebarItemsTop = [
    { icon: ShoppingBag, label: '任务大厅', path: '/expert', end: true },
  ];

  const sidebarItemsCreation = [
    { icon: Bot, label: '专家分身', path: '/expert/community', search: '?tab=avatars' },
    { icon: Zap, label: '技能商店', path: '/expert/community', search: '?tab=skills' },
  ];

  const sidebarItemsProject = [
    { icon: BookOpen, label: '共享资源空间', path: '/expert/knowledge' },
  ];

  const sidebarItemsBottom = [
    // Removed profile menu item as it's now integrated in the bottom user area
  ];

  const renderNavItem = (item: any) => {
    const fullPath = item.search ? `${item.path}${item.search}` : item.path;
    
    let isActive = false;
    if (item.path === '/expert/knowledge' && !item.search) {
      // 共享资源空间 (Shared Space) should only be active if there's no spaceId parameter
      isActive = location.pathname === item.path && (!location.search || !location.search.includes('spaceId='));
    } else {
      isActive = location.pathname === item.path && (!item.search || location.search === item.search || (!location.search && item.search === '?tab=avatars'));
    }
    
    return (
      <NavLink
        key={fullPath}
        to={fullPath}
        end={item.end}
        className={cn(
          "flex items-center rounded-xl transition-all duration-200 group relative",
          isActive 
            ? "bg-gray-100/80 text-slate-900 font-semibold" 
            : "text-slate-800 hover:bg-gray-50 hover:text-slate-900",
          isCollapsed ? "justify-center w-10 h-10 mx-auto" : "px-3 py-2 text-[14px]"
        )}
      >
        <item.icon className={cn("w-5 h-5 flex-shrink-0 transition-colors", isActive ? "text-slate-900" : "text-slate-600 group-hover:text-slate-900", !isCollapsed && "mr-3")} strokeWidth={isActive ? 2.5 : 2} />
        {!isCollapsed && <span className="tracking-wide whitespace-nowrap">{item.label}</span>}
        {isCollapsed && (
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-[12px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-[100] shadow-lg flex items-center">
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45 rounded-sm"></div>
            <span className="relative z-10">{item.label}</span>
          </div>
        )}
      </NavLink>
    );
  };

  const renderCustomSpace = (space: {id: string, name: string}) => {
    const isPinned = pinnedSpaces.includes(space.id);
    const searchParams = new URLSearchParams(location.search);
    const isActive = location.pathname === '/expert/knowledge' && searchParams.get('spaceId') === space.id;
    
    const SpaceIcon = Folder;

    return (
      <div key={space.id} className={cn(
        "relative flex items-center rounded-xl transition-all duration-200 group",
        isActive 
          ? "bg-gray-100/80 text-slate-900 font-semibold" 
          : "text-slate-800 hover:bg-gray-50 hover:text-slate-900",
        isCollapsed ? "hidden" : "px-3 py-1.5 text-[14px]"
      )}>
        <NavLink
          to={`/expert/knowledge?spaceId=${space.id}`}
          state={{ spaceName: space.name }}
          className="flex items-center flex-1 min-w-0"
        >
          <SpaceIcon 
            className={cn("w-5 h-5 flex-shrink-0 transition-colors mr-3", isActive ? "text-slate-900" : "text-slate-600 group-hover:text-slate-900")} 
            strokeWidth={isActive ? 2.5 : 2} 
          />
          {!isCollapsed && (
            <div className="flex-1 min-w-0 flex items-center justify-between">
              {editingSpaceId === space.id ? (
                <input
                  type="text"
                  value={editingSpaceName}
                  onChange={e => setEditingSpaceName(e.target.value)}
                  onBlur={() => {
                    if (editingSpaceName.trim()) {
                      setCustomSpaces(prev => prev.map(s => s.id === space.id ? { ...s, name: editingSpaceName.trim() } : s));
                    }
                    setEditingSpaceId(null);
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      if (editingSpaceName.trim()) {
                        setCustomSpaces(prev => prev.map(s => s.id === space.id ? { ...s, name: editingSpaceName.trim() } : s));
                      }
                      setEditingSpaceId(null);
                    } else if (e.key === 'Escape') {
                      setEditingSpaceId(null);
                    }
                  }}
                  autoFocus
                  className="w-full bg-white border border-blue-500 rounded px-2 py-0.5 text-[14px] text-gray-900 outline-none"
                  onClick={e => e.preventDefault()}
                />
              ) : (
                <span className="tracking-wide truncate" title={space.name}>{space.name}</span>
              )}
            </div>
          )}
        </NavLink>
        
        {!isCollapsed && editingSpaceId !== space.id && (
          <div className={cn(
            "flex items-center gap-1 shrink-0 ml-2",
            activeSpaceMenu?.id === space.id ? "z-50" : ""
          )}>
            {isPinned && <Pin className="w-3.5 h-3.5 text-gray-400 fill-gray-400 rotate-45" />}
            <div className="relative">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (activeSpaceMenu?.id === space.id) {
                    setActiveSpaceMenu(null);
                  } else {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setActiveSpaceMenu({
                      id: space.id,
                      top: rect.bottom + 4,
                      right: window.innerWidth - rect.right,
                    });
                  }
                }}
                className={cn(
                  "p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors space-menu-dropdown",
                  activeSpaceMenu?.id === space.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              
              {activeSpaceMenu?.id === space.id && createPortal(
                <div 
                  className="fixed w-32 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-[9999] space-menu-dropdown"
                  style={{ top: activeSpaceMenu.top, right: activeSpaceMenu.right }}
                >
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (isPinned) {
                        setPinnedSpaces(prev => prev.filter(id => id !== space.id));
                      } else {
                        setPinnedSpaces(prev => [...prev, space.id]);
                      }
                      setActiveSpaceMenu(null);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Pin className="w-3.5 h-3.5" />
                    {isPinned ? '取消固定' : '固定'}
                  </button>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setEditingSpaceId(space.id);
                      setEditingSpaceName(space.name);
                      setActiveSpaceMenu(null);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    编辑
                  </button>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCustomSpaces(prev => prev.filter(s => s.id !== space.id));
                      if (isPinned) setPinnedSpaces(prev => prev.filter(id => id !== space.id));
                      setActiveSpaceMenu(null);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    删除
                  </button>
                </div>,
                document.body
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={cn(
      "bg-[#FDFBF7] h-screen fixed left-0 top-0 z-[60] flex flex-col border-r border-gray-100/50 shadow-[2px_0_24px_rgba(0,0,0,0.01)] transition-all duration-300",
      isCollapsed ? "w-20" : "w-64"
    )}>
      {/* Logo Area */}
      <div className={cn("h-20 flex items-center", isCollapsed ? "justify-center px-0" : "px-6")}>
          <NavLink to="/" className="flex items-center group/logo hover:opacity-90 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-transparent flex items-center justify-center shrink-0 relative overflow-hidden group-hover/logo:scale-[1.05] group-hover/logo:rotate-3 transition-all duration-300">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F9A8D4" /> {/* pink-300 */}
                    <stop offset="100%" stopColor="#C084FC" /> {/* purple-400 */}
                  </linearGradient>
                </defs>
                <path d="M12 2L2 20h20L12 2z" stroke="url(#logoGradient)" strokeWidth="3" strokeLinejoin="round"/>
                <circle cx="12" cy="14" r="4" fill="url(#logoGradient)"/>
              </svg>
            </div>
          {!isCollapsed && (
            <div className="flex flex-col ml-3 justify-center overflow-hidden">
              <span className="text-xl font-bold text-slate-900 tracking-tight leading-none whitespace-nowrap">TuringArena</span>
            </div>
          )}
        </NavLink>
      </div>

      {/* Collapse Toggle */}
      {toggleSidebar && (
        <button 
          onClick={toggleSidebar}
          className={cn(
            "absolute -right-3 top-1/2 -translate-y-1/2 bg-[#F5F5FA] border border-white/50 rounded-full w-6 h-12 flex items-center justify-center shadow-sm text-gray-400 hover:text-gray-600 transition-all z-50",
            isCollapsed && "rotate-180"
          )}
        >
          <ChevronLeft className="w-3.5 h-3.5" strokeWidth={3} />
        </button>
      )}

      {/* New Chat Button */}
      <div className={cn("mb-8 mt-2 space-y-3", isCollapsed ? "px-2" : "px-6")}>
        <NavLink 
          to="/expert/unified-chat" 
          className={cn(
            "w-full bg-black hover:bg-slate-800 text-white font-medium rounded-full shadow-lg shadow-black/5 flex items-center transition-all transform hover:scale-[1.02] active:scale-[0.98]",
            isCollapsed ? "h-12 w-12 justify-center p-0 mx-auto group relative" : "h-11 px-4 gap-2"
          )}
          onClick={() => {
            // Force a reload if we're already on the unified chat page to reset state
            if (location.pathname === '/expert/unified-chat') {
              window.location.reload();
            }
          }}
        >
          <Plus className={cn("w-5 h-5 text-white", isCollapsed ? "mx-auto" : "")} strokeWidth={2.5} />
          {!isCollapsed && <span className="tracking-wide text-[15px] font-medium">新对话</span>}
          {isCollapsed && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-[12px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-[100] shadow-lg flex items-center">
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45 rounded-sm"></div>
              <span className="relative z-10">新对话</span>
            </div>
          )}
        </NavLink>
      </div>

      {/* Navigation Groups */}
      <div className={cn("flex-1 pb-4 flex flex-col", isCollapsed ? "px-2 overflow-visible" : "px-3 overflow-y-auto")}>
        <div className="space-y-0.5 mb-6">
          {sidebarItemsTop.map(renderNavItem)}
        </div>

        <div className="space-y-0.5 mb-6">
          {!isCollapsed && (
            <div className="px-3 mb-1.5 flex items-center text-[12px] font-bold text-gray-400 uppercase tracking-wider">创造广场</div>
          )}
          {sidebarItemsCreation.map(renderNavItem)}
        </div>

        <div className="space-y-0.5 mb-6 relative">
          {!isCollapsed && (
            <div className="px-3 mb-1.5 flex items-center justify-between text-[12px] font-bold text-gray-400 uppercase tracking-wider group">
              <div className="flex items-center">知识空间</div>
              <button 
                className="p-1 hover:bg-gray-100 hover:text-gray-700 rounded transition-all"
                title="新建项目"
                onClick={() => {
                  setNewProjectName('');
                  setShowCreateProjectModal(true);
                }}
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={3} />
              </button>
            </div>
          )}
          {sidebarItemsProject.map(renderNavItem)}
          
          {/* Render custom spaces */}
          {customSpaces
            .sort((a, b) => {
              const aPinned = pinnedSpaces.includes(a.id);
              const bPinned = pinnedSpaces.includes(b.id);
              if (aPinned && !bPinned) return -1;
              if (!aPinned && bPinned) return 1;
              return 0;
            })
            .slice(0, 3)
            .map(renderCustomSpace)}

          {customSpaces.length > 3 && !isCollapsed && (
            <button 
              onClick={() => setShowAllSpacesModal(true)}
              className="w-full flex items-center rounded-xl transition-all duration-200 group text-gray-500 hover:bg-gray-50 hover:text-slate-900 px-3 py-1.5 text-[14px]"
            >
              <div className="w-5 h-5 flex items-center justify-center shrink-0 mr-3">
                <MoreHorizontal className="w-4 h-4" />
              </div>
              <span className="tracking-wide">更多</span>
            </button>
          )}
        </div>

        <div className="space-y-0.5 mt-auto">
          {sidebarItemsBottom.map(renderNavItem)}
        </div>
      </div>

      {/* User Profile Area */}
      <div className={cn("px-4 mb-3", isCollapsed && "px-2")}>
        <button 
          onClick={() => setShowSeedModal(true)}
          className={cn(
            "w-full flex items-center gap-3 rounded-xl border border-indigo-100/50 bg-gradient-to-br from-[#EEF2FF] via-[#F5F3FF] to-[#FFF1F2] hover:from-[#E0E7FF] hover:via-[#EDE9FE] hover:to-[#FFE4E6] transition-all shadow-sm group",
            isCollapsed ? "justify-center p-2.5 relative" : "px-3 py-2.5"
          )}
        >
          <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm border border-indigo-50 group-hover:scale-105 transition-transform">
            <Sprout className="w-3.5 h-3.5 text-indigo-700" />
          </div>
          {!isCollapsed && (
            <>
              <div className="flex flex-col items-start text-left flex-1">
                <span className="text-[14px] font-bold leading-none text-[#1e1b4b]">Seed 共建者计划</span>
                <span className="text-[12px] text-[#6366f1] mt-1 line-clamp-1 font-medium">招募引流享专属福利</span>
              </div>
              <div className="text-[11px] font-bold text-[#6366f1] bg-white px-2 py-1 rounded shadow-sm border border-indigo-100 group-hover:bg-indigo-50 transition-colors shrink-0">
                查看
              </div>
            </>
          )}
          {isCollapsed && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-[12px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-[100] shadow-lg flex items-center">
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45 rounded-sm"></div>
              <span className="relative z-10">Seed 共建者计划</span>
            </div>
          )}
        </button>
      </div>

      <div className={cn("p-4 border-t border-gray-100 relative user-menu-container z-50", isCollapsed ? "flex justify-center" : "w-full")}>
        
        {/* User Menu Popover */}
        {showUserMenu && (
          <div className={cn(
            "absolute bottom-[calc(100%+8px)] w-[280px] bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-gray-100 z-[100] animate-in fade-in zoom-in-95 duration-200",
            isCollapsed ? "left-14" : "left-4"
          )}>
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" alt="User" className="w-full h-full object-cover" />
                </div>
                <span className="text-sm font-semibold text-slate-900 flex items-center gap-1">Kejin <span className="text-[13px]">🐬</span></span>
              </div>
            </div>

            {/* Version & Gift Box */}
            <div className="p-3">
              <div className="bg-gradient-to-br from-[#F5F7FF] to-[#F0F5FF] rounded-xl p-3 border border-blue-50/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <Gift className="w-4 h-4 text-red-500" />
                    <span className="text-[13px] font-bold text-gray-900">{isClaimed ? '今日礼包已到账' : '今日礼包'}</span>
                  </div>
                  {isClaimed ? (
                    <span className="text-[14px] font-bold text-teal-600">+100</span>
                  ) : (
                    <button 
                      onClick={() => setIsClaimed(true)}
                      className="text-[12px] text-gray-600 flex items-center gap-0.5 hover:text-gray-900 transition-colors"
                    >
                      立即领取 <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-gray-500 mb-3">
                  {isClaimed ? (
                    <span>签到满 <span className="font-medium text-gray-700">7</span> 天，<span className="text-[#D4AF37]">1000</span> 积分等你拿</span>
                  ) : (
                    '每日免费领取 100 Credits'
                  )}
                </p>
                
                <div className="flex justify-between items-center mb-3">
                  {[1, 2, 3, 4, 5, 6].map(day => (
                    <div key={day} className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-[12px] border",
                      day === 1 
                        ? (isClaimed ? "border-teal-500 bg-white text-teal-500 font-medium" : "border-teal-400 bg-teal-50 text-teal-600 font-medium")
                        : "border-gray-200 bg-white text-gray-600"
                    )}>
                      {day === 1 && isClaimed ? (
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      ) : day}
                    </div>
                  ))}
                  <div className="w-6 h-6 rounded-full bg-[#F3E8D6] border border-[#E6D5B8] flex items-center justify-center">
                    <span className="text-[#D4AF37] text-[10px]">💎</span>
                  </div>
                </div>
                <div className="text-[12px] text-gray-600">
                  距离大奖还差 <span className="font-bold text-gray-900">6</span> 天
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-1 border-b border-gray-100">
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEarnPointsMenu(!showEarnPointsMenu);
                  }}
                  className="w-full flex items-center justify-between px-5 py-2.5 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-[13px] text-gray-700">赚积分</span>
                  <div className="flex items-center gap-1 text-gray-900">
                    <span className="text-[11px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">赚积分</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                </button>
                
                {/* Earn Points Dropdown Menu (Popup inside popup) */}
                {showEarnPointsMenu && (
                  <div className="absolute right-[-420px] bottom-[-40px] w-[420px] bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-[60] animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-3 border-b border-gray-50 mb-2 shrink-0">
                      <h3 className="font-bold text-gray-900 text-base">做任务，赚积分</h3>
                      <p className="text-[13px] text-gray-500 mt-1">完成以下任务可获得丰厚积分奖励</p>
                    </div>
                    
                    <div className="max-h-[360px] overflow-y-auto custom-scrollbar px-2 space-y-1 text-left relative z-10 overscroll-contain">
                      {/* Task 1 */}
                      <div className="p-3 hover:bg-gray-50 rounded-xl transition-colors flex items-start gap-3 group">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                          <Star className="w-5 h-5 text-blue-600 fill-blue-600/20" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-[14px] font-bold text-gray-900">参与挑战任务</h4>
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2" />
                                <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                              </svg>
                              +2000
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <p 
                              className="text-[13px] text-gray-500 truncate mr-2"
                              title="发现适合您专业技能的高价值AI挑战"
                            >
                              发现适合您专业技能的高价值AI挑战
                            </p>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowEarnPointsMenu(false);
                                setShowUserMenu(false);
                                navigate('/expert');
                              }}
                              className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors shrink-0"
                            >
                              开始
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Task 2 */}
                      <div className="p-3 hover:bg-gray-50 rounded-xl transition-colors flex items-start gap-3 group">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-[14px] font-bold text-gray-900">完善个人信息</h4>
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2" />
                                <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                              </svg>
                              +1000
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <p 
                              className="text-[13px] text-gray-500 truncate mr-2"
                              title="让更多科学家认识你"
                            >
                              让更多科学家认识你
                            </p>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowEarnPointsMenu(false);
                                setShowUserMenu(false);
                                navigate('/expert/profile', { state: { activeTab: '身份与背书', scrollTo: 'resume-archive' } });
                              }}
                              className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors shrink-0"
                            >
                              开始
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Task 3 */}
                      <div className="p-3 hover:bg-gray-50 rounded-xl transition-colors flex items-start gap-3 group">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                          <BookOpen className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-[14px] font-bold text-gray-900">导入文献到知识库</h4>
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2" />
                                <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                              </svg>
                              +500
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <p 
                              className="text-[13px] text-gray-500 truncate mr-2"
                              title="建立个人科研知识库"
                            >
                              建立个人科研知识库
                            </p>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowEarnPointsMenu(false);
                                setShowUserMenu(false);
                                navigate('/expert/profile', { state: { activeTab: '内容与知识库', scrollTo: 'personal-knowledge-base' } });
                              }}
                              className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors shrink-0"
                            >
                              开始
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Task 4 */}
                      <div className="p-3 hover:bg-gray-50 rounded-xl transition-colors flex items-start gap-3 group">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                          <Rocket className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-[14px] font-bold text-gray-900">用专业版模式提问</h4>
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2" />
                                <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                              </svg>
                              +200
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <p 
                              className="text-[13px] text-gray-500 truncate mr-2"
                              title="提供更精确、分析深入的学术回答"
                            >
                              提供更精确、分析深入的学术回答
                            </p>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowEarnPointsMenu(false);
                                setShowUserMenu(false);
                                navigate('/expert/workbench', { state: { initialMode: 'pro' } });
                              }}
                              className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors shrink-0"
                            >
                              开始
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Task 5 */}
                      <div className="p-3 hover:bg-gray-50 rounded-xl transition-colors flex items-start gap-3 group">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                          <Bell className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-[14px] font-bold text-gray-900">发布经验到专家社区</h4>
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2" />
                                <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                              </svg>
                              +200
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <p 
                              className="text-[13px] text-gray-500 truncate mr-2"
                              title="获取领域研究热点与情报"
                            >
                              获取领域研究热点与情报
                            </p>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowEarnPointsMenu(false);
                                setShowUserMenu(false);
                                navigate('/expert/community', { state: { activeTab: 'discuss' } });
                              }}
                              className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors shrink-0"
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
              <button className="w-full flex items-center justify-between px-5 py-2.5 hover:bg-gray-50 transition-colors">
                <span className="text-[13px] text-gray-700">积分余额</span>
                <div className="flex items-center gap-1 text-gray-900">
                  <span className="text-[13px] font-medium">{isClaimed ? '12,550' : '12,450'}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </div>
              </button>
            </div>

            <div className="py-2 border-b border-gray-100 space-y-0.5">
              <button className="w-full flex items-center justify-between px-5 py-2 hover:bg-gray-50 transition-colors">
                <span className="text-[13px] text-gray-700">语言</span>
                <div className="flex items-center gap-1 text-gray-600">
                  <span className="text-[13px]">中文</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </div>
              </button>
              <button 
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-5 py-2 hover:bg-gray-50 transition-colors"
              >
                <span className="text-[13px] text-gray-700">{isDarkMode ? '浅色主题' : '深色主题'}</span>
                {isDarkMode ? <Sun className="w-3.5 h-3.5 text-gray-500" /> : <Moon className="w-3.5 h-3.5 text-gray-500" />}
              </button>
              <button 
                onClick={() => window.open(`${import.meta.env.BASE_URL}feedback`, 'Feedback', 'width=800,height=800')}
                className="w-full flex items-center justify-between px-5 py-2 hover:bg-gray-50 transition-colors"
              >
                <span className="text-[13px] text-gray-700">帮助与反馈</span>
              </button>
              <button className="w-full flex items-center justify-between px-5 py-2 hover:bg-gray-50 transition-colors">
                <span className="text-[13px] text-gray-700">检查更新</span>
              </button>
            </div>

            <div className="p-2">
              <button className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[13px] font-medium rounded-lg transition-colors">
                退出登录
              </button>
            </div>
          </div>
        )}

        <div className="flex w-full items-center gap-1">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={cn(
            "flex items-center flex-1 rounded-xl transition-all duration-200 hover:bg-gray-100",
            isCollapsed ? "justify-center p-2 group relative" : "px-3 py-2 gap-3"
          )}>
            <div className="w-10 h-10 rounded-full shrink-0 relative">
              <img 
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" 
                alt="User" 
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col items-start flex-1 overflow-hidden">
                <span className="text-sm font-semibold text-slate-900 truncate w-full text-left flex items-center gap-1">李珂瑾 <span className="text-[13px]">🐬</span></span>
              </div>
            )}
            {isCollapsed && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-[12px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-[100] shadow-lg flex items-center">
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45 rounded-sm"></div>
                <span className="relative z-10">个人菜单</span>
              </div>
            )}
          </button>
          
          {!isCollapsed && (
            <button 
              onClick={() => navigate('/expert/profile')}
              className="p-2.5 text-gray-400 hover:text-slate-900 hover:bg-gray-100 rounded-xl transition-all shrink-0 group"
              title="个人中心"
            >
              <User className="w-5 h-5 transition-transform group-hover:scale-110" strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      {/* All Spaces Modal */}
      {showAllSpacesModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowAllSpacesModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-gray-900">所有知识空间</h2>
              <button onClick={() => setShowAllSpacesModal(false)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 border-b border-gray-50 bg-gray-50/50">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="搜索知识空间..." 
                  value={spaceSearchQuery}
                  onChange={e => setSpaceSearchQuery(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {customSpaces
                .filter(space => space.name.toLowerCase().includes(spaceSearchQuery.toLowerCase()))
                .map(space => {
                  let SpaceIcon = Folder;
                  let iconColor = "text-gray-400";
                  let bgColor = "bg-gray-100";
                  if (space.id === 'proj_demo1') { SpaceIcon = Cpu; iconColor = "text-emerald-500"; bgColor = "bg-emerald-50"; }
                  else if (space.id === 'proj_demo2') { SpaceIcon = GraduationCap; iconColor = "text-orange-500"; bgColor = "bg-orange-50"; }
                  else if (space.id === 'proj_111') { SpaceIcon = CreditCard; iconColor = "text-blue-500"; bgColor = "bg-blue-50"; }

                  return (
                    <div 
                      key={space.id}
                      onClick={() => {
                        navigate(`/expert/knowledge?spaceId=${space.id}`, { state: { spaceName: space.name } });
                        setShowAllSpacesModal(false);
                      }}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors group"
                    >
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", bgColor)}>
                        <SpaceIcon className={cn("w-5 h-5", iconColor)} />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-[14px] font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">{space.name}</span>
                        <span className="text-[12px] text-gray-500 mt-0.5">1 member</span>
                      </div>
                    </div>
                  );
              })}
              {customSpaces.filter(space => space.name.toLowerCase().includes(spaceSearchQuery.toLowerCase())).length === 0 && (
                <div className="py-8 text-center text-gray-500 text-sm">
                  没有找到相关的知识空间
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Seed Event Modal */}
      {showSeedModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
              <div className="relative h-32 bg-gradient-to-br from-[#EEF2FF] via-[#F5F3FF] to-[#FFF1F2] p-6 flex items-end transition-colors">
                <button onClick={() => setShowSeedModal(false)} className="absolute top-4 right-4 text-indigo-400 hover:text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-full p-1.5 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              <div className="text-left w-full">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-[#1e1b4b]">
                  <Sprout className="w-6 h-6 text-indigo-700" />
                  Seed 共建者计划
                </h2>
                <p className="text-[#6366f1] mt-1 text-sm font-medium">全网通缉最强“找茬”专家！</p>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <p className="text-[15px] text-gray-700 leading-relaxed">
                大模型们都在吹牛说自己超越了人类？是时候给它们上点强度了！
              </p>
              <div className="space-y-4">
                <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100/50">
                  <h3 className="font-bold text-blue-900 mb-1 flex items-center gap-1.5">
                    <span className="text-lg">🎯</span> 你的任务：疯狂刁难 AI
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    把你行业里最刁钻、最硬核的业务难题砸过来！参与定制化标注与极限评测，用你的专业知识把那些自称 SOTA 的大模型按在地上摩擦。
                  </p>
                </div>
                <div className="bg-purple-50/50 rounded-xl p-4 border border-purple-100/50">
                  <h3 className="font-bold text-purple-900 mb-1 flex items-center gap-1.5">
                    <span className="text-lg">💎</span> 我们想要什么？
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    本计划与 <span className="font-bold text-purple-700">豆包、Trae、Aime、Coze、Mira</span> 等主流 AI 工作台深度合作。我们需要收集您在这些平台处理业务难题时的真实操作轨迹与思路数据。您只需像平常一样使用这些平台，大模型会在后台默默学习，与您一起喂养出下一代更聪明的 AI。
                  </p>
                </div>
                <div className="bg-orange-50/50 rounded-xl p-4 border border-orange-100/50">
                  <h3 className="font-bold text-orange-900 mb-1 flex items-center gap-1.5">
                    <span className="text-lg">💰</span> 你能得到什么？
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    丰厚到让你心动的现金悬赏、平台专属认证徽章、以及“调教顶级 AI”的无上快感！
                  </p>
                </div>
              </div>
              <div className="pt-2">
                <button 
                  onClick={() => setShowSeedModal(false)}
                  className="w-full py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-[15px] shadow-lg shadow-gray-900/20 transition-transform active:scale-[0.98]"
                >
                  接下这份通缉令 🚀
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Create Project Modal */}
      {showCreateProjectModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">新建空间</h2>
              <button 
                onClick={() => setShowCreateProjectModal(false)} 
                className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full p-1.5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-gray-50 rounded-xl p-4 flex gap-3 text-[13px] text-gray-600 leading-relaxed border border-gray-100">
                <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">什么是知识空间？</h3>
                  <p>这是一个强大的AI知识库管理空间，支持多文档聊天和搜索。无论是独立工作还是团队协作，这里都能帮助你高效收集、处理和分享信息，实现流畅的工作流程。</p>
                </div>
              </div>
              
              <div>
                <label className="block text-[14px] font-bold text-gray-900 mb-2">
                  为你的空间命名 <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  autoFocus
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newProjectName.trim()) {
                    const newSpaceId = `proj_${Date.now()}`;
                    setCustomSpaces(prev => [...prev, {
                      id: newSpaceId,
                      name: newProjectName.trim()
                    }]);
                    setShowCreateProjectModal(false);
                    // navigate to the new space
                    navigate(`/expert/knowledge?spaceId=${newSpaceId}`, { state: { spaceName: newProjectName.trim() } });
                  }
                  }}
                  placeholder="如：产品发布"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm placeholder:text-gray-400"
                />
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50/50 flex justify-end gap-3 border-t border-gray-100">
              <button 
                onClick={() => setShowCreateProjectModal(false)}
                className="px-5 py-2.5 text-[14px] font-medium text-gray-600 hover:bg-white hover:shadow-sm rounded-xl border border-transparent hover:border-gray-200 transition-all"
              >
                取消
              </button>
              <button 
                disabled={!newProjectName.trim()}
                onClick={() => {
                  const newSpaceId = `proj_${Date.now()}`;
                  setCustomSpaces(prev => [...prev, {
                    id: newSpaceId,
                    name: newProjectName.trim()
                  }]);
                  setShowCreateProjectModal(false);
                  navigate(`/expert/knowledge?spaceId=${newSpaceId}`, { state: { spaceName: newProjectName.trim() } });
                }}
                className={cn(
                  "px-5 py-2.5 text-[14px] font-medium rounded-xl transition-all shadow-sm",
                  newProjectName.trim() 
                    ? "bg-gray-900 text-white hover:bg-black hover:shadow-md active:scale-95" 
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                )}
              >创建</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </aside>
  );
}
