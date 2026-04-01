import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { ExpertCopilotSidebar } from '../components/ExpertCopilotSidebar';
import { cn } from '../lib/utils';
import { Lightbulb, ChevronRight } from 'lucide-react';

export function DashboardLayout() {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isExpertSidebarOpen, setIsExpertSidebarOpen] = useState(false);

  // Auto-collapse sidebar when entering sandbox/chat
  useEffect(() => {
    if (location.pathname.includes('/expert/sandbox')) {
      setIsSidebarCollapsed(true);
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground flex">
      {/* 在自由模式/擂台模式/对比模式/圆桌讨论（新对话）和非沙盒页面显示 Sidebar，任务答题页面隐藏 Sidebar */}
      {(!location.pathname.includes('/expert/sandbox') || location.state?.mode === 'free' || location.state?.mode === 'arena' || location.state?.mode === 'compare' || location.state?.mode === 'roundtable') && (
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
        />
      )}
      <div className={cn(
        "flex-1 flex flex-col min-w-0 transition-all duration-300 h-screen",
        (location.pathname.includes('/expert/sandbox') && location.state?.mode !== 'free' && location.state?.mode !== 'arena' && location.state?.mode !== 'compare' && location.state?.mode !== 'roundtable')
          ? "pl-0"
          : isSidebarCollapsed ? "pl-20" : "pl-64"
      )}>
        <Header />
        <main className={cn(
          "flex-1 text-sm flex flex-row relative",
          "p-0 overflow-hidden" // Main container should always be flex and handle its own overflow if it has sidebar
        )}>
          <div className={cn("flex-1 h-full overflow-y-auto relative", location.pathname.includes('/expert/sandbox') ? "" : "p-6")}>
            <Outlet />
          </div>
          {(location.pathname.includes('/expert/workbench') || (location.pathname.includes('/expert/sandbox') && location.state?.mode !== 'roundtable')) && (
            <div 
              className={cn(
                "relative shrink-0 h-full z-20 transition-all duration-300 ease-in-out",
                isExpertSidebarOpen ? "w-[300px]" : "w-0"
              )}
            >
              <div 
                className={cn(
                  "absolute top-0 h-full w-[300px] bg-white border-l border-gray-200 transition-all duration-300 ease-in-out shadow-[-4px_0_12px_rgba(0,0,0,0.02)] flex flex-col",
                  isExpertSidebarOpen ? "right-0 translate-x-0" : "right-0 translate-x-full"
                )}
              >
                {/* 悬浮打开/关闭按钮 */}
                <button
                  onClick={() => setIsExpertSidebarOpen(!isExpertSidebarOpen)}
                  className={cn(
                    "absolute top-24 -translate-y-1/2 bg-white border border-gray-200 flex items-center justify-center transition-all duration-300 ease-in-out z-30 group cursor-pointer overflow-hidden",
                    isExpertSidebarOpen 
                      ? "-left-8 w-8 h-12 rounded-l-xl border-r-0 hover:bg-gray-50 text-gray-400 hover:text-gray-600 shadow-[-2px_0_8px_rgba(0,0,0,0.04)]" 
                      : "-left-10 w-10 h-24 rounded-l-xl border-r-0 text-amber-500 hover:text-amber-600 shadow-[-4px_0_12px_rgba(245,158,11,0.15)] hover:shadow-[-6px_0_16px_rgba(245,158,11,0.2)] hover:-left-12 hover:w-12"
                  )}
                  title={isExpertSidebarOpen ? "收起" : "打开灵感情报局"}
                >
                  {!isExpertSidebarOpen && (
                    <div className="absolute inset-0 bg-gradient-to-l from-amber-50 to-amber-50/20 opacity-100 group-hover:from-amber-100 transition-colors" />
                  )}
                  {isExpertSidebarOpen ? (
                    <ChevronRight className="w-5 h-5 relative z-10" />
                  ) : (
                    <div className="relative z-10 flex flex-col items-center justify-center gap-1.5 w-full h-full">
                      <Lightbulb className="w-5 h-5 animate-pulse drop-shadow-md group-hover:scale-110 transition-transform text-amber-500" />
                      <span className="text-[12px] font-bold text-amber-600/90 [writing-mode:vertical-rl] tracking-[0.2em] group-hover:text-amber-600 transition-colors">灵感</span>
                      <div className="absolute inset-0 bg-amber-400 blur-[12px] opacity-30 animate-pulse pointer-events-none" />
                    </div>
                  )}
                </button>
                
                <div className="h-full w-full overflow-hidden flex flex-col">
                  <ExpertCopilotSidebar />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
