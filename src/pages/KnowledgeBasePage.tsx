import React, { useState, useEffect } from 'react';
import { KnowledgeBaseView } from '../components/KnowledgeBaseView';
import { BookOpen, Globe } from 'lucide-react';
import { cn } from '../lib/utils';
import { useSearchParams } from 'react-router-dom';

export function KnowledgeBasePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialType = (searchParams.get('type') as 'personal' | 'public') || 'personal';
  const [activeTab, setActiveTab] = useState<'personal' | 'public'>(initialType);

  useEffect(() => {
    const type = searchParams.get('type') as 'personal' | 'public';
    if (type && type !== activeTab) {
      setActiveTab(type);
    }
  }, [searchParams]);

  const handleTabChange = (type: 'personal' | 'public') => {
    setActiveTab(type);
    setSearchParams(prev => {
      prev.set('type', type);
      prev.delete('folderId'); // clear folder when switching tabs
      return prev;
    });
  };

  return (
    <div className="h-full flex flex-col p-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">知识库</h1>
          <p className="text-gray-500 mt-1">管理您的专属知识库与团队共享资源</p>
        </div>
        
        {/* Modern Segmented Control */}
        <div className="flex items-center p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => handleTabChange('personal')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
              activeTab === 'personal'
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50/50"
            )}
          >
            <BookOpen className="w-4 h-4" />
            我的知识库
          </button>
          <button
            onClick={() => handleTabChange('public')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
              activeTab === 'public'
                ? "bg-white text-orange-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50/50"
            )}
          >
            <Globe className="w-4 h-4" />
            公共资源库
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <KnowledgeBaseView type={activeTab} />
      </div>
    </div>
  );
}