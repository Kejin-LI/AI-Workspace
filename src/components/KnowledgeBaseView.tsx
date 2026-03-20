import React, { useState } from 'react';
import { BookOpen, Folder, FileText, Search, Plus, MoreHorizontal, Globe, Lock, Trash2, Edit2, Share2, Upload, Flame } from 'lucide-react';
import { cn } from '../lib/utils';

export interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  updatedAt: string;
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
      { id: 'pd1', name: '2026大模型评测指南.pdf', type: 'PDF', size: '2.4 MB', updatedAt: '2026-03-15' },
      { id: 'pd2', name: '错题集整理.xlsx', type: 'XLSX', size: '1.1 MB', updatedAt: '2026-03-10' },
      { id: 'pd3', name: '提示词优化技巧.md', type: 'MD', size: '45 KB', updatedAt: '2026-03-05' }
    ]
  },
  {
    id: 'pf2',
    name: '法律合规资料',
    isPublic: false,
    docCount: 2,
    docs: [
      { id: 'pd4', name: '数据安全法要点.docx', type: 'DOCX', size: '512 KB', updatedAt: '2026-02-28' },
      { id: 'pd5', name: '合同审核清单.pdf', type: 'PDF', size: '1.8 MB', updatedAt: '2026-02-20' }
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
      { id: 'pubd1', name: '大语言模型安全评测基准V2.pdf', type: 'PDF', size: '4.2 MB', updatedAt: '2026-03-01' },
      { id: 'pubd2', name: '医疗实体抽取共识.pdf', type: 'PDF', size: '3.1 MB', updatedAt: '2026-02-15' },
      { id: 'pubd3', name: '金融情感分析规范.docx', type: 'DOCX', size: '890 KB', updatedAt: '2026-02-10' },
      { id: 'pubd4', name: '代码生成评估指标.md', type: 'MD', size: '120 KB', updatedAt: '2026-01-25' },
      { id: 'pubd5', name: '多轮对话测试集样例.xlsx', type: 'XLSX', size: '2.5 MB', updatedAt: '2026-01-20' }
    ]
  },
  {
    id: 'pub2',
    name: '优秀经验分享精选',
    isPublic: true,
    docCount: 2,
    savedCount: 856,
    docs: [
      { id: 'pubd6', name: '如何构建高质量CoT.pdf', type: 'PDF', size: '1.5 MB', updatedAt: '2026-03-18' },
      { id: 'pubd7', name: '模糊语义标注案例解析.pdf', type: 'PDF', size: '2.1 MB', updatedAt: '2026-03-12' }
    ]
  }
];

interface KnowledgeBaseViewProps {
  type: 'personal' | 'public';
}

export function KnowledgeBaseView({ type }: KnowledgeBaseViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

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

  return (
    <div className="flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4 w-full max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索文件夹或文档..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          {type === 'personal' && (
            <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm shrink-0">
              <Plus className="w-4 h-4" />
              新建文件夹
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        {selectedFolderId && selectedFolder ? (
          // Document List View
          <div className="flex flex-col h-full animate-in fade-in duration-300">
            {/* Folder Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedFolderId(null)}
                  className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors mr-1"
                >
                  <Folder className="w-5 h-5 text-blue-500 fill-blue-500/20" />
                </button>
                <span className="text-gray-400">/</span>
                <h2 className="text-lg font-bold text-gray-900">{selectedFolder.name}</h2>
                {selectedFolder.isPublic ? (
                  <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 bg-blue-50 text-blue-600 rounded">
                    <Globe className="w-3 h-3" /> 公开
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                    <Lock className="w-3 h-3" /> 私有
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                {type === 'personal' && (
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                    <Upload className="w-4 h-4" />
                    上传文档
                  </button>
                )}
                {type === 'public' && (
                  <button 
                    onClick={() => alert('已将整个知识库保存至个人中心！')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    保存到我的知识库
                  </button>
                )}
                <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Documents Table */}
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-medium text-gray-500">
                    <th className="px-6 py-3 font-medium">文档名称</th>
                    <th className="px-6 py-3 font-medium w-32">类型</th>
                    <th className="px-6 py-3 font-medium w-32">大小</th>
                    <th className="px-6 py-3 font-medium w-40">最后更新</th>
                    <th className="px-6 py-3 font-medium w-24 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {selectedFolder.docs.map((doc) => (
                    <tr key={doc.id} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors group cursor-pointer">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{doc.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded">
                          {doc.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{doc.size}</td>
                      <td className="px-6 py-4 text-gray-500">{doc.updatedAt}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {type === 'personal' && (
                            <>
                              <button className="p-1.5 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50" title="编辑">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50" title="删除">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {type === 'public' && (
                            <button className="p-1.5 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50" title="保存到我的知识库">
                              <Plus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {selectedFolder.docs.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <FileText className="w-12 h-12 mb-3 text-gray-300" />
                  <p>此文件夹为空</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Folder Grid View
          <div className="p-6 overflow-y-auto h-full animate-in fade-in duration-300">
            {filteredFolders.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFolders.map((folder) => (
                  <div 
                    key={folder.id}
                    onClick={() => setSelectedFolderId(folder.id)}
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