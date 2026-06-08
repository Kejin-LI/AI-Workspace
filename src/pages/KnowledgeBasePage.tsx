import React, { useState, useEffect, useRef } from 'react';
import { KnowledgeBaseView } from '../components/KnowledgeBaseView';
import { BookOpen, Globe, Search, Plus, UserPlus, X, Users, Check, Link as LinkIcon, Settings, Copy, HelpCircle, ChevronDown, ChevronLeft } from 'lucide-react';
import { createPortal } from 'react-dom';
import { cn } from '../lib/utils';
import { useSearchParams, useLocation, useOutletContext } from 'react-router-dom';
import { useHeaderActions } from '../contexts/HeaderActionsContext';

const DEFAULT_CREATOR = { email: '李珂瑾', dept: '', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop', role: 'owner' };
const DEFAULT_MEMBERS = [DEFAULT_CREATOR];

export function KnowledgeBasePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const spaceName = location.state?.spaceName;
  const spaceId = searchParams.get('spaceId');

  const [currentFolderName, setCurrentFolderName] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showViewersModal, setShowViewersModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [roleDropdownConfig, setRoleDropdownConfig] = useState<{ email: string, top: number, right: number, role: string } | null>(null);
  const { setActions, setTitle } = useHeaderActions();
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const { setIsSidebarCollapsed } = useOutletContext<{ setIsSidebarCollapsed: (val: boolean) => void }>();

  // Auto-collapse sidebar when entering a folder
  useEffect(() => {
    if (currentFolderName) {
      setIsSidebarCollapsed(true);
    }
  }, [currentFolderName, setIsSidebarCollapsed]);

  const [spaceMembers, setSpaceMembers] = useState<Record<string, typeof DEFAULT_MEMBERS>>({
    'default': [
      DEFAULT_CREATOR,
      { email: '张伟', dept: '', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop', role: 'editor' },
      { email: '王芳', dept: '', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', role: 'viewer' },
      { email: '刘洋', dept: '', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop', role: 'viewer' },
      { email: '陈静', dept: '', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', role: 'viewer' },
    ]
  });

  const currentSpaceId = spaceId || 'default';
  const currentMembers = spaceMembers[currentSpaceId] || DEFAULT_MEMBERS;

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    setSpaceMembers(prev => ({
      ...prev,
      [currentSpaceId]: [
        ...(prev[currentSpaceId] || DEFAULT_MEMBERS),
        { 
          email: inviteEmail.trim(), 
          dept: '',
          avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=100&h=100&fit=crop`,
          role: 'viewer'
        }
      ]
    }));
    setInviteEmail('');
  };

  const handleRoleChange = (email: string, newRole: string) => {
    setSpaceMembers(prev => ({
      ...prev,
      [currentSpaceId]: (prev[currentSpaceId] || DEFAULT_MEMBERS).map(m => 
        m.email === email ? { ...m, role: newRole } : m
      )
    }));
    setRoleDropdownConfig(null);
  };

  const handleRemoveMember = (email: string) => {
    setSpaceMembers(prev => ({
      ...prev,
      [currentSpaceId]: (prev[currentSpaceId] || DEFAULT_MEMBERS).filter(m => m.email !== email)
    }));
    setRoleDropdownConfig(null);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if ((event.target as Element).closest('.role-dropdown-portal')) return;

      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowInviteModal(false);
        setShowViewersModal(false);
        setRoleDropdownConfig(null);
      } else {
        // Only close dropdown if clicking elsewhere in the modal
        const isDropdownTrigger = (event.target as Element).closest('.role-dropdown-trigger');
        if (!isDropdownTrigger) {
          setRoleDropdownConfig(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setActions(
      <>
        <div className="relative flex items-center gap-4" ref={shareMenuRef}>
          {/* Display members in the header too! */}
          <div className="flex items-center -space-x-2">
          {currentMembers.slice(0, 3).map((member, i) => (
            <div key={i} className="relative shrink-0 group">
              <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-gray-100">
                <img src={member.avatar} alt={member.email} className="w-full h-full object-cover" title={member.email} />
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
          ))}
          {currentMembers.length > 3 && (
            <div className="relative shrink-0">
              <button 
                onClick={() => {
                  setShowViewersModal(!showViewersModal);
                  setShowInviteModal(false);
                }}
                className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 text-gray-500 text-xs font-medium flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                +{currentMembers.length - 3}
              </button>
            </div>
          )}
        </div>
        
        {currentSpaceId !== 'default' && (
          <button
            onClick={() => {
              setShowInviteModal(!showInviteModal);
              setShowViewersModal(false);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Users className="w-4 h-4" />
            分享
          </button>
        )}

        {/* Viewers Popover */}
        {showViewersModal && (
          <div className="absolute right-0 top-full mt-2 w-[280px] bg-white rounded-xl shadow-xl border border-gray-100 flex flex-col animate-in fade-in zoom-in-95 duration-200 z-[100]">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <span className="font-bold text-gray-900 text-base">当前浏览者</span>
              <button 
                onClick={() => setShowViewersModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 max-h-[300px] overflow-y-auto">
              {currentMembers.map((member, i) => (
                <div key={i} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="relative shrink-0 group">
                    <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-gray-100">
                      <img src={member.avatar} alt={member.email} className="w-full h-full object-cover" title={member.email} />
                    </div>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[14px] font-medium text-gray-900 truncate" title={member.email}>{member.email}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Share Popover */}
        {showInviteModal && currentSpaceId !== 'default' && (
          <div className="absolute right-0 top-full mt-2 w-[360px] bg-white rounded-xl shadow-xl border border-gray-100 flex flex-col animate-in fade-in zoom-in-95 duration-200 z-[100]">
            <div className="p-4 border-b border-gray-100 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-gray-900 font-bold text-base">
                  分享知识空间
                  <HelpCircle className="w-4 h-4 text-gray-400" />
                </div>
                <button 
                  onClick={() => setShowInviteModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] font-bold text-gray-700">邀请协作者</span>
                </div>

                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                  <input 
                    type="email" 
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleInvite();
                    }}
                    placeholder="搜索用户邮箱"
                    className="flex-1 px-3 py-2 text-[13px] text-gray-900 focus:outline-none placeholder:text-gray-400 min-w-0"
                  />
                </div>
              </div>

              <div>
                <span className="text-[13px] font-bold text-gray-700 block mb-2">所有可访问此文档的用户</span>
                <div className="flex flex-col max-h-[240px] overflow-y-auto">
                  {currentMembers.map((member, i) => (
                    <div key={i} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg group transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={member.avatar} alt={member.email} className="w-10 h-10 rounded-full object-cover bg-gray-100 shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[14px] font-medium text-gray-900 truncate" title={member.email}>{member.email}</span>
                            {member.role === 'owner' && (
                              <span className="text-[11px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                                所有者
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-4 relative">
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (roleDropdownConfig?.email === member.email) {
                              setRoleDropdownConfig(null);
                            } else {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setRoleDropdownConfig({
                                email: member.email,
                                role: member.role,
                                top: rect.bottom + 4,
                                right: window.innerWidth - rect.right,
                              });
                            }
                          }}
                          className={cn(
                            "role-dropdown-trigger flex items-center justify-between w-[76px] gap-1 text-[14px] font-medium transition-colors rounded px-1.5 py-1 -mr-1.5",
                            member.role === 'owner' ? "text-gray-500 cursor-default" : "text-blue-600 hover:bg-blue-50 cursor-pointer"
                          )}
                          disabled={member.role === 'owner'}
                        >
                          <span>{member.role === 'owner' ? '可管理' : member.role === 'editor' ? '可编辑' : '可阅读'}</span>
                          <ChevronDown className={cn("w-4 h-4 shrink-0", member.role === 'owner' && "opacity-0")} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-b-xl flex items-center gap-2">
              <button 
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <LinkIcon className="w-3.5 h-3.5 text-gray-500" />}
                {isCopied ? '已复制' : '复制链接'}
              </button>
            </div>
          </div>
        )}
        </div>

        {roleDropdownConfig && createPortal(
          <div 
            className="role-dropdown-portal fixed w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-[9999] animate-in fade-in zoom-in-95"
            style={{ top: roleDropdownConfig.top, right: roleDropdownConfig.right }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3 py-2 text-gray-400 cursor-not-allowed">
              <div className="text-[14px] font-medium mb-0.5">可管理</div>
              <div className="text-[12px]">可以编辑、分享内容和修改权限设置</div>
            </div>
            <button 
              onClick={() => handleRoleChange(roleDropdownConfig.email, 'editor')}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between group/item"
            >
              <span className="text-[14px] text-gray-700 font-medium group-hover/item:text-blue-600">可编辑</span>
              {roleDropdownConfig.role === 'editor' && <Check className="w-4 h-4 text-blue-600" />}
            </button>
            <button 
              onClick={() => handleRoleChange(roleDropdownConfig.email, 'viewer')}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between group/item"
            >
              <span className="text-[14px] text-blue-600 font-medium">可阅读</span>
              {roleDropdownConfig.role === 'viewer' && <Check className="w-4 h-4 text-blue-600" />}
            </button>
            <div className="h-px bg-gray-100 my-1 mx-3"></div>
            <button 
              onClick={() => handleRemoveMember(roleDropdownConfig.email)}
              className="w-full px-3 py-2 text-left hover:bg-red-50 text-[14px] text-red-500 font-medium"
            >
              移除
            </button>
          </div>,
          document.body
        )}
      </>
    );

    return () => setActions(null);
  }, [currentMembers, showInviteModal, showViewersModal, inviteEmail, isCopied, roleDropdownConfig, currentSpaceId]);

  // Determine the display title
  const displayTitle = currentFolderName || spaceName || '共享资源空间';
  const isDefaultSpace = currentSpaceId === 'default';
  const [activeDomain, setActiveDomain] = useState('全部');

  useEffect(() => {
    setTitle(
      <>
        <span 
          className={cn("transition-colors", currentFolderName ? "hover:text-gray-900 cursor-pointer text-gray-500" : "text-gray-900 font-medium")}
          onClick={() => {
            if (currentFolderName) {
              setSearchParams(prev => {
                prev.delete('folderId');
                return prev;
              });
              setCurrentFolderName(null);
            }
          }}
        >
          {spaceName || '共享资源空间'}
        </span>
        {currentFolderName && (
          <>
            <span className="mx-2 text-gray-400">/</span>
            <span className="font-medium text-gray-900">{currentFolderName}</span>
          </>
        )}
      </>
    );
    return () => setTitle(null);
  }, [spaceName, currentFolderName, setTitle, setSearchParams]);

  return (
    <div className="h-full flex flex-col p-6 w-full">
      {!currentFolderName && (
        <div className="flex flex-col mb-8 gap-4">
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-6">
              <div className="relative w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="搜索文件夹或文档..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                />
              </div>
              <button 
                onClick={() => setShowCreateFolderModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-black transition-all shadow-sm hover:shadow-md active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4" />
                新建文件夹
              </button>
            </div>
          </div>

          {/* Domain Filter - Only show in default public space root */}
          {isDefaultSpace && (
            <div className="flex items-center gap-2 mt-2 overflow-x-auto pb-2 scrollbar-hide">
              {['全部', 'AIDP', '法律', '商业', '医疗'].map((domain) => (
                <button
                  key={domain}
                  onClick={() => setActiveDomain(domain)}
                  className={cn(
                    "px-5 py-2 rounded-full text-sm font-medium transition-all shrink-0 border",
                    activeDomain === domain 
                      ? "bg-black text-white border-black" 
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  )}
                >
                  {domain}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        <KnowledgeBaseView 
          type="personal"
          onFolderChange={setCurrentFolderName} 
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          showCreateFolderModal={showCreateFolderModal}
          setShowCreateFolderModal={setShowCreateFolderModal}
          activeDomain={activeDomain}
        />
      </div>
    </div>
  );
}