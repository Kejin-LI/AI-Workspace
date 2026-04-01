import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Plus,
  ShoppingBag,
  MessageSquare,
  MessagesSquare,
  User,
  PanelLeftClose,
  BarChart2,
  ChevronLeft,
  History,
  ExternalLink,
  MoreHorizontal,
  BookOpen
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export function Sidebar({ isCollapsed, toggleSidebar }: SidebarProps) {
  const location = useLocation();
  const [historyItems, setHistoryItems] = useState<string[]>([]);

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

  const sidebarItems = [
    { icon: ShoppingBag, label: '任务大厅', path: '/expert', end: true },
    { icon: MessagesSquare, label: '专家社区', path: '/expert/community' },
    { icon: BookOpen, label: '知识库', path: '/expert/knowledge' },
    { icon: User, label: '个人中心', path: '/expert/profile' },
  ];

  return (
    <aside className={cn(
      "bg-[#FDFBF7] h-screen fixed left-0 top-0 z-30 flex flex-col border-r border-gray-100/50 shadow-[2px_0_24px_rgba(0,0,0,0.01)] transition-all duration-300",
      isCollapsed ? "w-20" : "w-64"
    )}>
      {/* Logo Area */}
      <div className={cn("h-20 flex items-center", isCollapsed ? "justify-center px-0" : "px-6")}>
          <NavLink to="/" className="flex items-center group/logo hover:opacity-90 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shadow-lg shadow-black/20 shrink-0 relative overflow-hidden group-hover/logo:scale-[1.05] group-hover/logo:rotate-3 transition-all duration-300">
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L4 18H20L12 4Z" stroke="white" strokeWidth="2.5" strokeLinejoin="round"/>
                <circle cx="12" cy="13" r="3.5" fill="#3B82F6"/>
              </svg>
            </div>
          {!isCollapsed && (
            <div className="flex flex-col ml-3 overflow-hidden">
              <span className="text-xl font-bold text-slate-900 tracking-tight leading-none whitespace-nowrap">TuringArena</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1 whitespace-nowrap">领域专家</span>
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
      <div className={cn("mb-8 mt-2", isCollapsed ? "px-2" : "px-6")}>
        <NavLink 
          to="/expert/workbench" 
          end
          className={cn(
            "w-full bg-black hover:bg-slate-800 text-white font-medium rounded-full shadow-lg shadow-black/5 flex items-center transition-all transform hover:scale-[1.02] active:scale-[0.98]",
            isCollapsed ? "h-12 w-12 justify-center p-0 mx-auto" : "h-11 px-4 gap-2"
          )}
          title={isCollapsed ? "新对话" : ''}
        >
          <Plus className="w-5 h-5 text-white" strokeWidth={2.5} />
          {!isCollapsed && <span className="tracking-wide text-[15px] font-medium">新对话</span>}
        </NavLink>
      </div>

      {/* Navigation Groups */}
      <div className={cn("flex-1 overflow-y-auto space-y-1 pb-4 flex flex-col", isCollapsed ? "px-2" : "px-4")}>
        <div>
          {sidebarItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-xl transition-all duration-200 group relative mb-1",
                  isActive 
                    ? "bg-gray-100/80 text-slate-900 font-semibold" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-slate-900",
                  isCollapsed ? "justify-center w-12 h-12 mx-auto" : "px-4 py-3 text-[15px]"
                )
              }
              title={isCollapsed ? item.label : ''}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn("w-5 h-5 flex-shrink-0 transition-colors", isActive ? "text-slate-900" : "text-gray-400 group-hover:text-gray-600", !isCollapsed && "mr-3")} strokeWidth={isActive ? 2.5 : 2} />
                  {!isCollapsed && <span className="tracking-wide whitespace-nowrap">{item.label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* History Section */}
        {!isCollapsed && historyItems.length > 0 && (
          <div className="pt-8 pb-4 mt-auto">
            <div className="flex items-center justify-between px-2 mb-4 group cursor-pointer">
              <div className="flex items-center gap-2 text-slate-700">
                <History className="w-5 h-5" strokeWidth={2} />
                <span className="font-bold text-[15px]">历史对话</span>
              </div>
              <MoreHorizontal className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            
            <div className="space-y-1 relative before:absolute before:left-4 before:top-0 before:bottom-0 before:w-px before:bg-gray-200/60">
              {/* History Items */}
              {historyItems.map((text, idx) => (
                <div 
                  key={idx}
                  className="group relative flex items-center pl-8 pr-2 py-2.5 text-[14px] text-slate-600 hover:bg-gray-50/80 rounded-r-xl cursor-pointer transition-colors"
                  title={text}
                >
                  <span className="truncate pr-4">{text.length > 8 ? `${text.substring(0, 8)}...` : text}</span>
                  <div className="absolute left-[15px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-gray-300 opacity-0 group-hover:opacity-100 group-hover:bg-blue-400 transition-all" />
                </div>
              ))}
              
              {/* View All */}
              <div className="pl-8 pt-4 pb-2">
                <button className="flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 transition-colors font-medium">
                  查看全部
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
