import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { cn } from '../lib/utils';

export function DashboardLayout() {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
          "flex-1 text-sm flex flex-col relative",
          location.pathname.includes('/expert/sandbox') ? "p-0 overflow-hidden" : "p-6 overflow-y-auto"
        )}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
