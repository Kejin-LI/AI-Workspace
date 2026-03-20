import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { Briefcase, MessageSquare, PieChart, Settings, LogOut, PanelLeftClose, PanelLeftOpen, ListTodo } from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useLanguage } from '../contexts/LanguageContext';
import { HeaderActionsProvider } from '../contexts/HeaderActionsContext';

export function RequesterLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { t } = useLanguage();

  return (
    <HeaderActionsProvider>
      <div className="h-screen bg-background font-sans text-foreground flex selection:bg-lab-yellow selection:text-black overflow-hidden">
        {/* Simplified Sidebar for Requester */}
        <aside 
          className={cn(
            "bg-white h-full z-30 flex flex-col border-r border-gray-100 transition-all duration-300 shadow-[2px_0_24px_rgba(0,0,0,0.02)] flex-shrink-0",
            isCollapsed ? "w-20" : "w-64"
          )}
        >
          {/* ... Sidebar Content (unchanged) ... */}
          <div className={cn(
            "h-20 flex items-center relative transition-all duration-300",
            isCollapsed ? "justify-center px-0" : "px-6 justify-between"
          )}>
            {/* Logo Section */}
            {!isCollapsed ? (
              <Link to="/" className="flex items-center overflow-hidden hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-display font-bold text-lg mr-3 shadow-lg shadow-black/20">
                  TA
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-display font-bold text-black tracking-tight leading-none">{t.common.appName}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1">{t.requester.sidebar.role}</span>
                </div>
              </Link>
            ) : (
               // Collapsed State
               <Link 
                 to="/"
                 className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-display font-bold text-lg cursor-pointer shadow-lg shadow-black/20 hover:scale-105 transition-transform" 
                 onClick={() => setIsCollapsed(false)} 
                 title="Back to Home"
               >
                  TA
               </Link>
            )}
  
            {/* Toggle Button */}
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={cn(
                "p-2 text-gray-400 hover:text-black hover:bg-gray-50 rounded-full transition-all",
                isCollapsed ? "hidden" : "ml-2"
              )}
              title={isCollapsed ? "Expand" : "Collapse"}
            >
              {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>
            
            {/* Floating Toggle */}
            {isCollapsed && (
              <button
                 onClick={() => setIsCollapsed(false)}
                 className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-black hover:scale-110 shadow-lab transition-all z-50"
                 title="Expand"
              >
                <PanelLeftOpen className="w-3 h-3" />
              </button>
            )}
          </div>
  
          <div className="flex-1 py-8 px-4 space-y-2">
            <NavItem to="/requester" icon={MessageSquare} label={t.requester.sidebar.kickoff} end collapsed={isCollapsed} color="text-lab-purple" />
            <NavItem to="/requester/projects" icon={Briefcase} label={t.requester.sidebar.projects.title} collapsed={isCollapsed} color="text-lab-blue" />
            <NavItem to="/requester/tasks" icon={ListTodo} label={typeof t.requester.sidebar.tasks === 'string' ? t.requester.sidebar.tasks : '任务管理'} collapsed={isCollapsed} color="text-orange-500" />
            <NavItem to="/requester/reports" icon={PieChart} label={t.requester.sidebar.analytics} collapsed={isCollapsed} color="text-lab-green" />
            <NavItem to="/requester/settings" icon={Settings} label={t.requester.sidebar.settings} collapsed={isCollapsed} color="text-gray-500" />
          </div>
  
          <div className="p-4 border-t border-gray-50 flex flex-col gap-2">
            <button 
              className={cn(
                "flex items-center text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors w-full px-3 py-3 rounded-xl",
                isCollapsed ? "justify-center" : ""
              )}
              title={isCollapsed ? t.common.logout : ""}
            >
              <LogOut className={cn("w-5 h-5", isCollapsed ? "" : "mr-3")} />
              {!isCollapsed && t.common.logout}
            </button>
          </div>
        </aside>
  
        <div 
          className={cn(
            "flex-1 flex flex-col min-w-0 transition-all duration-300 bg-[#FAFAFA] h-full",
          )}
        >
          <Header />
          <main className="flex-1 p-6 md:p-10 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </HeaderActionsProvider>
  );
}

function NavItem({ to, icon: Icon, label, end, collapsed, color }: { to: string; icon: any; label: string; end?: boolean; collapsed: boolean; color?: string }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "flex items-center px-3 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 group relative overflow-hidden",
          isActive 
            ? "bg-black text-white shadow-lg shadow-black/10" 
            : "text-gray-500 hover:bg-gray-50 hover:text-black",
          collapsed ? "justify-center px-2" : ""
        )
      }
      title={collapsed ? label : ""}
    >
      {({ isActive }) => (
        <>
          <Icon className={cn("w-5 h-5 flex-shrink-0 transition-colors", collapsed ? "" : "mr-3", isActive ? "text-lab-yellow" : color)} />
          {!collapsed && <span className="whitespace-nowrap font-display tracking-wide">{label}</span>}
        </>
      )}
    </NavLink>
  );
}
