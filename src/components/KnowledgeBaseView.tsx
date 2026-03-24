import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Folder, 
  FileText, 
  Search, 
  Plus, 
  MoreHorizontal, 
  Globe, 
  Lock, 
  Trash2, 
  Edit2, 
  Share2, 
  Upload, 
  Flame,
  ChevronLeft,
  MessageSquare,
  Sparkles,
  Zap,
  LayoutGrid,
  List as ListIcon
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

export interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  updatedAt: string;
  summary?: string;
  tags?: string[];
}

export interface FolderData {
  id: string;
  name: string;
  isPublic: boolean;
  docCount: number;
  docs: Document[];
  savedCount?: number;
}

export const mockPersonalFolders: FolderData[] = [
  {
    id: 'pf1',
    name: '我的大模型评测笔记',
    isPublic: false,
    docCount: 3,
    docs: [
      { id: 'pd1', name: '2026大模型评测指南.pdf', type: 'PDF', size: '2.4 MB', updatedAt: '2026-03-15', summary: '涵盖了2026年最新的大模型安全、能力与价值观评测基准，重点介绍了HLE和多模态评测框架。', tags: ['评测指南', '安全', 'HLE'] },
      { id: 'pd2', name: '错题集整理.xlsx', type: 'XLSX', size: '1.1 MB', updatedAt: '2026-03-10', summary: '收录了过去一个月在模型标注和对抗训练中遇到的高频错题及专家解析。', tags: ['错题集', '数据标注'] },
      { id: 'pd3', name: '提示词优化技巧.md', type: 'MD', size: '45 KB', updatedAt: '2026-03-05', summary: '基于CoT和Few-shot原理的进阶提示词工程实战技巧总结。', tags: ['Prompt', 'CoT'] }
    ]
  },
  {
    id: 'pf2',
    name: '法律合规资料',
    isPublic: false,
    docCount: 2,
    docs: [
      { id: 'pd4', name: '数据安全法要点.docx', type: 'DOCX', size: '512 KB', updatedAt: '2026-02-28', summary: '《数据安全法》核心要点解读，主要针对AI训练数据使用的合规要求。', tags: ['合规', '数据安全'] },
      { id: 'pd5', name: '合同审核清单.pdf', type: 'PDF', size: '1.8 MB', updatedAt: '2026-02-20', summary: '商业合同审查的标准化Checklist，包含常见法律风险点提示。', tags: ['法律', '合同'] }
    ]
  }
];

export const mockPublicFolders: FolderData[] = [
  {
    id: 'pub1',
    name: '官方评测标准库',
    isPublic: true,
    docCount: 5,
    savedCount: 1245,
    docs: [
      { id: 'pubd1', name: '大语言模型安全评测基准V2.pdf', type: 'PDF', size: '4.2 MB', updatedAt: '2026-03-01', summary: '官方发布的最新版LLM安全评测标准，包含越狱攻击、价值观对齐等测试维度。', tags: ['安全', '基准测试'] },
      { id: 'pubd2', name: '医疗实体抽取共识.pdf', type: 'PDF', size: '3.1 MB', updatedAt: '2026-02-15', summary: '多位三甲医院专家联合制定的医疗病历实体抽取规范。', tags: ['医疗', 'NER'] },
      { id: 'pubd3', name: '金融情感分析规范.docx', type: 'DOCX', size: '890 KB', updatedAt: '2026-02-10', summary: '针对金融研报、新闻的情感倾向分析标注规范细则。', tags: ['金融', '情感分析'] },
      { id: 'pubd4', name: '代码生成评估指标.md', type: 'MD', size: '120 KB', updatedAt: '2026-01-25', summary: 'HumanEval和MBPP之外的新一代代码生成评估指标说明。', tags: ['代码生成', '评估'] },
      { id: 'pubd5', name: '多轮对话测试集样例.xlsx', type: 'XLSX', size: '2.5 MB', updatedAt: '2026-01-20', summary: '包含500个高质量多轮对话的评测用例集。', tags: ['多轮对话', '测试集'] }
    ]
  },
  {
    id: 'pub2',
    name: '优秀经验分享精选',
    isPublic: true,
    docCount: 2,
    savedCount: 856,
    docs: [
      { id: 'pubd6', name: '如何构建高质量CoT.pdf', type: 'PDF', size: '1.5 MB', updatedAt: '2026-03-18', summary: '社区专家分享的关于如何撰写高质量思维链(Chain of Thought)的实战经验。', tags: ['CoT', '经验分享'] },
      { id: 'pubd7', name: '模糊语义标注案例解析.pdf', type: 'PDF', size: '2.1 MB', updatedAt: '2026-03-12', summary: '针对难以界定的模糊语义，提供的具体标注案例与边界判断依据。', tags: ['语义标注', '案例分析'] }
    ]
  }
];

interface KnowledgeBaseViewProps {
  type: 'personal' | 'public';
}

export function KnowledgeBaseView({ type }: KnowledgeBaseViewProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use URL param as source of truth for selectedFolderId
  const selectedFolderId = searchParams.get('folderId');
  const setSelectedFolderId = (id: string | null) => {
    setSearchParams(prev => {
      if (id) {
        prev.set('folderId', id);
        prev.set('type', type); // ensure type is preserved
      } else {
        prev.delete('folderId');
      }
      return prev;
    });
  };

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: '您好！我已经阅读了当前文件夹中的所有文档。您可以向我提问，或者让我为您总结文档内容。' }
  ]);

  const activeFolders = type === 'personal' ? mockPersonalFolders : mockPublicFolders;
  
  const filteredFolders = activeFolders.map(folder => {
    if (!searchQuery) return folder;
    
    const folderMatch = folder.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchedDocs = folder.docs.filter(doc => doc.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (folderMatch || matchedDocs.length > 0) {
      return {
        ...folder,
        docs: folderMatch ? folder.docs : matchedDocs
      };
    }
    return null;
  }).filter(Boolean) as FolderData[];

  const selectedFolder = activeFolders.find(f => f.id === selectedFolderId);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    setChatHistory(prev => [...prev, { role: 'user', content: chatInput }]);
    const input = chatInput;
    setChatInput('');
    
    // Mock AI response
    setTimeout(() => {
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: `关于"${input}"，基于当前知识库的分析如下...\n\n(这是一个演示回答，在实际接入后端后将返回真实的大模型分析结果)` 
      }]);
    }, 1000);
  };

  const handleFolderClick = (folderId: string) => {
    // Navigate to notebook page in a new tab, taking base URL into account
    const baseUrl = import.meta.env.BASE_URL;
    const path = `${baseUrl}notebook/${folderId}`.replace(/\/\//g, '/');
    window.open(path, '_blank');
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Search Header - Only show when no folder is selected */}
      {!selectedFolderId && (
        <div className="flex items-center justify-between mb-6 shrink-0 px-2">
          <div className="flex items-center gap-4 w-full max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜索文件夹或文档..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              />
            </div>
            {type === 'personal' && (
              <button className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm shrink-0">
                <Plus className="w-4 h-4" />
                新建知识库
              </button>
            )}
          </div>
        </div>
      )}

      <div className={cn(
        "flex-1 transition-all duration-300",
        selectedFolderId ? "h-full" : "bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
      )}>
        {selectedFolderId && selectedFolder ? (
          // NotebookLM Style Split View
          <div className="flex h-full gap-4 animate-in fade-in duration-300">
            {/* Left Panel: Sources */}
            <div className="w-1/3 min-w-[320px] max-w-[400px] flex flex-col bg-gray-50/50 rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setSelectedFolderId(null)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors -ml-2"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="flex flex-col">
                    <h2 className="text-base font-bold text-gray-900 leading-tight">{selectedFolder.name}</h2>
                    <span className="text-[11px] text-gray-500">{selectedFolder.docCount} 个信息源</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-lg">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={cn("p-1.5 rounded-md transition-colors", viewMode === 'grid' ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700")}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={cn("p-1.5 rounded-md transition-colors", viewMode === 'list' ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700")}
                  >
                    <ListIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {selectedFolder.docs.map((doc) => (
                  <div key={doc.id} className={cn(
                    "bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-all cursor-pointer group",
                    viewMode === 'grid' ? "p-4" : "p-3 flex items-center gap-3"
                  )}>
                    <div className={cn("flex items-start gap-3", viewMode === 'grid' ? "mb-3" : "flex-1 min-w-0")}>
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">
                          {doc.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded">
                            {doc.type}
                          </span>
                          <span className="text-[11px] text-gray-400">{doc.size}</span>
                        </div>
                      </div>
                    </div>
                    
                    {viewMode === 'grid' && doc.summary && (
                      <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed bg-gray-50/50 p-2.5 rounded-lg">
                        {doc.summary}
                      </p>
                    )}
                    
                    {viewMode === 'grid' && doc.tags && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {doc.tags.map(tag => (
                          <span key={tag} className="text-[10px] px-2 py-1 bg-blue-50 text-blue-600 rounded-md">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                
                <button className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-sm font-medium text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  添加信息源
                </button>
              </div>
            </div>

            {/* Right Panel: Studio / Chat */}
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden relative">
              {/* Top Summary Bar */}
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-purple-50/50 flex items-start justify-between shrink-0">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    全局洞察
                  </h3>
                  <p className="text-xs text-gray-600 mt-1.5 max-w-2xl leading-relaxed">
                    这份知识库主要涵盖了 <strong>{selectedFolder.docs.length}</strong> 份关于 {selectedFolder.name.replace('我的', '').replace('资料', '')} 的文档。您可以直接向我提问，或者让我为您生成文档摘要、对比分析。
                  </p>
                </div>
                <button className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5 shadow-sm">
                  <FileText className="w-3.5 h-3.5" />
                  生成全局播客
                </button>
              </div>

              {/* Chat History */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {chatHistory.map((msg, idx) => (
                  <div key={idx} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[80%] rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed",
                      msg.role === 'user' 
                        ? "bg-blue-600 text-white rounded-tr-sm" 
                        : "bg-gray-50 text-gray-800 rounded-tl-sm border border-gray-100"
                    )}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                
                {/* Suggested Questions (only show if history is just the welcome message) */}
                {chatHistory.length === 1 && (
                  <div className="mt-8">
                    <p className="text-xs font-medium text-gray-400 mb-3 ml-1 uppercase tracking-wider">启发问题</p>
                    <div className="flex flex-wrap gap-2">
                      {['总结这些文档的核心观点', '找出文档中提到的安全风险', '帮我整理一份复习大纲'].map(q => (
                        <button 
                          key={q}
                          onClick={() => setChatInput(q)}
                          className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors shadow-sm"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                <form onSubmit={handleChatSubmit} className="relative flex items-center">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={`基于这 ${selectedFolder.docCount} 份文档提问...`}
                    className="w-full pl-4 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all focus:bg-white"
                  />
                  <button 
                    type="submit"
                    disabled={!chatInput.trim()}
                    className="absolute right-2 p-2 bg-black text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Zap className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          // Original Folder Grid View
          <div className="p-6 overflow-y-auto h-full animate-in fade-in duration-300">
            {filteredFolders.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFolders.map((folder) => (
                  <div
                    key={folder.id}
                    onClick={() => handleFolderClick(folder.id)}
                    className="group border border-gray-100 rounded-xl p-5 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer bg-white flex flex-col h-40 relative"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-blue-50 rounded-xl group-hover:scale-110 transition-transform">
                        <Folder className="w-8 h-8 text-blue-500 fill-blue-500/20" />
                      </div>
                      {folder.isPublic && folder.savedCount && (
                        <div className="absolute top-4 right-4 flex items-center gap-1 text-xs text-orange-500 bg-orange-50/80 px-2 py-1 rounded-full font-medium border border-orange-100/50">
                          <Flame className="w-3.5 h-3.5 fill-orange-500" />
                          <span>{folder.savedCount}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-auto">
                      <h3 className="font-bold text-gray-900 truncate mb-2 group-hover:text-blue-600 transition-colors">
                        {folder.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500 whitespace-nowrap">
                        <span className="truncate">{folder.docCount} 个文档</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0"></span>
                        <span className="flex items-center gap-1 shrink-0">
                          {folder.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                          {folder.isPublic ? '公开' : '私有'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Folder className="w-16 h-16 mb-4 text-gray-200" />
                <p className="text-lg font-medium text-gray-900 mb-1">未找到相关文件夹</p>
                <p className="text-sm">尝试更换搜索词或新建文件夹</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}