import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { 
  Menu, Plus, BarChart2, Share2, Settings, MoreHorizontal, 
  ExternalLink, Sparkles, MessageSquare, Filter, FileText, 
  Play, Music, MonitorPlay, FileVideo, BrainCircuit, 
  FileBarChart, Library, FileSpreadsheet, Zap, Paperclip, 
  Mic, ArrowRight, ChevronLeft, ChevronRight, Search, LayoutPanelLeft,
  X, Globe, Upload, Link as LinkIcon, Cloud, Clipboard
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';

export function NotebookPage() {
  const { folderId } = useParams();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isSourcesOpen, setIsSourcesOpen] = useState(true);
  const [isStudioOpen, setIsStudioOpen] = useState(true);
  const [showAddSourcesModal, setShowAddSourcesModal] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />
      
      <main className={cn(
        "flex-1 flex flex-col min-w-0 transition-all duration-300",
        isSidebarCollapsed ? "pl-20" : "pl-64"
      )}>
        <Header />

        <section className="flex-1 flex overflow-hidden p-4 gap-4 relative">
          {/* Left Column: Sources */}
          <aside className={cn(
            "bg-white rounded-2xl border border-gray-200 flex flex-col overflow-hidden shrink-0 shadow-sm transition-all duration-300",
            isSourcesOpen ? "w-[320px]" : "w-14"
          )}>
            <header className="px-4 py-4 border-b border-gray-100 flex items-center justify-between shrink-0 h-14">
              {isSourcesOpen ? (
                <h2 className="text-sm font-medium text-gray-500">知识库来源</h2>
              ) : (
                <div className="flex-1" />
              )}
              <button 
                onClick={() => setIsSourcesOpen(!isSourcesOpen)}
                className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
              >
                <LayoutPanelLeft className="w-4 h-4 text-gray-500" />
              </button>
            </header>
            
            {isSourcesOpen && (
              <section className="p-4 overflow-y-auto flex-1 flex flex-col gap-5 custom-scrollbar">
                {/* Add sources button */}
                <button 
                  onClick={() => setShowAddSourcesModal(true)}
                  className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full text-sm font-medium text-gray-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  添加来源
                </button>

                {/* Search */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Search className="w-4 h-4 text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="搜索网络获取新来源" 
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-600">全选所有来源</span>
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                </div>

                <ul className="flex flex-col gap-3">
                  <li className="flex items-start gap-3 group">
                    <div className="w-5 h-5 rounded bg-black flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5">S</div>
                    <p className="text-sm text-gray-800 line-clamp-2 flex-1">MIT华人校友力压Scale AI，创建AI标注公司五年零融资...</p>
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1 shrink-0" />
                  </li>

                  <li className="flex items-start gap-3 group">
                    <div className="w-5 h-5 rounded bg-orange-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5">S</div>
                    <p className="text-sm text-gray-800 line-clamp-2 flex-1">Surge AI Customer Reviews & References - FeaturedCu...</p>
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1 shrink-0" />
                  </li>

                  <li className="flex items-start gap-3 group">
                    <div className="w-5 h-5 rounded bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5">S</div>
                    <p className="text-sm text-gray-800 line-clamp-2 flex-1">Surge AI: The Ultimate Guide for AI Practitioners</p>
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1 shrink-0" />
                  </li>

                  <li className="flex items-start gap-3 group bg-red-50/50 p-2 -mx-2 rounded-lg">
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-[10px] font-bold shrink-0 mt-0.5">Kr</div>
                    <p className="text-sm text-red-900 truncate flex-1 mt-0.5">https://m.36kr.com/p/3588973287506440</p>
                    <div className="w-4 h-4 rounded-full border border-red-300 flex items-center justify-center text-[10px] text-red-500 mt-0.5 shrink-0">i</div>
                  </li>
                  
                  <li className="flex items-start gap-3 group">
                    <div className="w-5 h-5 rounded bg-blue-100 flex items-center justify-center text-blue-600 text-[10px] font-bold shrink-0 mt-0.5">知</div>
                    <p className="text-sm text-gray-800 line-clamp-2 flex-1">第17页 - NLP 新纪元2022-11-30: 人类语言通天塔正式建成</p>
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1 shrink-0" />
                  </li>
                </ul>
              </section>
            )}
          </aside>

          {/* Center Column: Chat */}
          <section className="flex-1 bg-white rounded-2xl border border-gray-200 flex flex-col overflow-hidden shadow-sm min-w-[320px] transition-all duration-300">
            <header className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0 h-14">
              <h2 className="text-sm font-medium text-gray-500">对话</h2>
              <section className="flex items-center gap-1">
                <button className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-500">
                  <Filter className="w-4 h-4" />
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-500">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </section>
            </header>

            <article className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
              <section className="flex flex-col gap-4 max-w-3xl mx-auto w-full mt-4">
                <div className="flex flex-col gap-2">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-2">
                    <span className="text-2xl">📁</span>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">未命名笔记本</h1>
                  <span className="text-xs text-gray-400">10 个来源</span>
                </div>

                <p className="text-gray-800 leading-relaxed text-[15px] mt-4">
                  这些来源共同探讨了数据标注、大型语言模型 (LLM) 以及提示工程在人工智能领域的关键作用与发展态势。Surge AI 作为行业领先的平台，通过由顶尖工程师组成的团队提供高质量的数据标注与人类反馈强化学习 (RLHF) 服务，展现了极高的商业效率。与此同时，专家详细分析了 ChatGPT 开启的"人机交互范式转移"，强调了从以模型为中心向以数据为中心转变的科研趋势。文本还提供了实用的提示词技巧，指导开发者如何通过具体指令和逻辑引导来提升 AI 的输出质量。此外，资料深入探讨了 AI 在自动化代理、在线服务及行业洗牌中的应用潜力，同时也冷静分析了模型在逻辑常识和细节编造方面的局限性。总之，这些资料描绘了一个由高质量数据驱动、以大模型为核心的新型 AI 生态蓝图。
                </p>
                
                <section className="flex items-center gap-2 mt-2">
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 transition-colors border border-gray-200">
                    <Paperclip className="w-3.5 h-3.5" />
                    保存至笔记
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" /></svg>
                  </button>
                </section>
              </section>

              <section className="flex flex-col gap-3 max-w-3xl mx-auto w-full mt-6">
                <button className="text-left px-5 py-3.5 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-2xl text-[14px] text-gray-700 transition-colors shadow-sm w-fit">
                  Surge AI 为何能以极低人均成本超越竞争对手？
                </button>
                <button className="text-left px-5 py-3.5 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-2xl text-[14px] text-gray-700 transition-colors shadow-sm w-fit">
                  数据标注公司如何成为 AI 浪潮中的"卖铲人"？
                </button>
                <button className="text-left px-5 py-3.5 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-2xl text-[14px] text-gray-700 transition-colors shadow-sm w-fit">
                  华人精英在这一波全球 AI 创业潮中扮演了什么角色？
                </button>
              </section>
            </article>

            <footer className="p-4 bg-white shrink-0 max-w-3xl mx-auto w-full mb-2">
              <form className="relative flex items-center bg-gray-50 border border-gray-200 rounded-full px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                <input 
                  type="text" 
                  placeholder="开始输入..." 
                  className="flex-1 bg-transparent text-[15px] text-gray-900 focus:outline-none placeholder:text-gray-400"
                />
                <section className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 mr-1"></span>
                  <span className="text-xs text-gray-400 mr-2 hidden sm:inline">9 个来源</span>
                  <button type="button" className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 rounded-full transition-colors">
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </section>
              </form>
              <div className="text-center mt-3">
                <span className="text-[10px] text-gray-400">NotebookLM 的回答可能不准确，请仔细核对。</span>
              </div>
            </footer>
          </section>

        {/* Right Column: Studio */}
          <aside className={cn(
            "bg-white rounded-2xl border border-gray-200 flex flex-col overflow-hidden shrink-0 shadow-sm relative transition-all duration-300",
            isStudioOpen ? "w-[320px]" : "w-14"
          )}>
            <header className="px-4 py-4 border-b border-gray-100 flex items-center justify-between shrink-0 h-14">
              {isStudioOpen ? (
                <h2 className="text-sm font-medium text-gray-500">工作室 (Studio)</h2>
              ) : (
                <div className="flex-1" />
              )}
              <button 
                onClick={() => setIsStudioOpen(!isStudioOpen)}
                className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-500"
              >
                <LayoutPanelLeft className="w-4 h-4 rotate-180" />
              </button>
            </header>

            {isStudioOpen && (
              <>
                <section className="p-4 overflow-y-auto flex-1 flex flex-col gap-6 custom-scrollbar pb-24">
                  <section className="grid grid-cols-2 gap-2">
                    <button className="flex items-center gap-2 p-3 bg-blue-50/50 hover:bg-blue-50 border border-blue-100 rounded-xl transition-colors text-left group">
                      <Music className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="text-[11px] font-semibold text-gray-900 group-hover:text-blue-700 truncate">音频概览</span>
                      <ChevronRight className="w-3 h-3 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <button className="flex items-center gap-2 p-3 bg-green-50/50 hover:bg-green-50 border border-green-100 rounded-xl transition-colors text-left group">
                      <MonitorPlay className="w-4 h-4 text-green-500 shrink-0" />
                      <span className="text-[11px] font-semibold text-gray-900 group-hover:text-green-700 truncate">幻灯片</span>
                      <ChevronRight className="w-3 h-3 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <button className="flex items-center gap-2 p-3 bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100 rounded-xl transition-colors text-left group">
                      <FileVideo className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="text-[11px] font-semibold text-gray-900 group-hover:text-emerald-700 truncate">视频概览</span>
                      <ChevronRight className="w-3 h-3 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <button className="flex items-center gap-2 p-3 bg-purple-50/50 hover:bg-purple-50 border border-purple-100 rounded-xl transition-colors text-left group">
                      <BrainCircuit className="w-4 h-4 text-purple-500 shrink-0" />
                      <span className="text-[11px] font-semibold text-gray-900 group-hover:text-purple-700 truncate">思维导图</span>
                      <ChevronRight className="w-3 h-3 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <button className="flex items-center gap-2 p-3 bg-yellow-50/50 hover:bg-yellow-50 border border-yellow-100 rounded-xl transition-colors text-left group">
                      <FileBarChart className="w-4 h-4 text-yellow-500 shrink-0" />
                      <span className="text-[11px] font-semibold text-gray-900 group-hover:text-yellow-700 truncate">报告</span>
                      <ChevronRight className="w-3 h-3 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <button className="flex items-center gap-2 p-3 bg-red-50/50 hover:bg-red-50 border border-red-100 rounded-xl transition-colors text-left group">
                      <Library className="w-4 h-4 text-red-500 shrink-0" />
                      <span className="text-[11px] font-semibold text-gray-900 group-hover:text-red-700 truncate">闪卡</span>
                      <ChevronRight className="w-3 h-3 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <button className="flex items-center gap-2 p-3 bg-cyan-50/50 hover:bg-cyan-50 border border-cyan-100 rounded-xl transition-colors text-left group">
                      <FileText className="w-4 h-4 text-cyan-500 shrink-0" />
                      <span className="text-[11px] font-semibold text-gray-900 group-hover:text-cyan-700 truncate">测验</span>
                      <ChevronRight className="w-3 h-3 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <button className="flex items-center gap-2 p-3 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100 rounded-xl transition-colors text-left group">
                      <FileSpreadsheet className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span className="text-[11px] font-semibold text-gray-900 group-hover:text-indigo-700 truncate">数据表</span>
                      <ChevronRight className="w-3 h-3 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </section>

                  <section className="flex flex-col items-center justify-center text-center mt-8 gap-3 px-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-blue-500" />
                    </div>
                    <h3 className="text-sm font-semibold text-blue-600">工作室输出将保存在这里。</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">添加来源后，点击创建音频概览、学习指南、思维导图及更多内容！</p>
                  </section>
                </section>
                
                <footer className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none">
                  <button className="pointer-events-auto flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors shadow-lg">
                    添加笔记
                  </button>
                </footer>
              </>
            )}
          </aside>
      </section>
      
      {/* Floating help button */}
      <button className="fixed bottom-6 right-6 p-3 bg-white text-gray-600 border border-gray-200 rounded-full hover:bg-gray-50 shadow-sm transition-colors z-10">
        <MessageSquare className="w-5 h-5" />
      </button>

      <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #e5e7eb;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #d1d5db;
          }
        `}</style>
      </main>

      {/* Add Sources Modal */}
      {showAddSourcesModal && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-[800px] overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="absolute right-4 top-4 z-10">
              <button 
                onClick={() => setShowAddSourcesModal(false)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="pt-12 pb-8 px-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-purple-50/50 to-green-50/50 opacity-50"></div>
              <h2 className="text-[28px] font-bold text-gray-900 leading-tight relative z-10">
                从你的文档创建音频与视频概览
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-green-500">your documents</span>
              </h2>
            </div>

            <div className="px-12 pb-12 flex flex-col gap-6 relative z-10">
              {/* Search Box */}
              <div className="relative group flex items-center bg-white border border-gray-200 rounded-2xl focus-within:ring-4 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all shadow-sm p-1.5">
                <div className="flex items-center gap-2 pl-3 pr-2 shrink-0">
                  <Search className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    <Globe className="w-3.5 h-3.5" />
                    网页
                    <ChevronRight className="w-3 h-3 rotate-90" />
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    <Zap className="w-3.5 h-3.5" />
                    快速研究
                    <ChevronRight className="w-3 h-3 rotate-90" />
                  </button>
                </div>
                
                <input 
                  type="text" 
                  placeholder="搜索网络获取新来源" 
                  className="flex-1 bg-transparent text-[15px] focus:outline-none min-w-0 py-2.5 px-2"
                />

                <button className="w-9 h-9 shrink-0 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors mr-1">
                  <ArrowRight className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-200 rounded-[24px] p-10 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-colors">
                <h3 className="text-xl font-medium text-gray-700 mb-2">或拖放你的文件</h3>
                <p className="text-sm text-gray-500 mb-8">
                  PDF、图片、文档、音频，<a href="#" className="underline hover:text-gray-700">更多类型</a>
                </p>

                <div className="flex flex-wrap justify-center gap-3">
                  <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors shadow-sm">
                    <Upload className="w-4 h-4" />
                    上传文件
                  </button>
                  <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors shadow-sm">
                    <LinkIcon className="w-4 h-4" />
                    <span className="w-4 h-4 bg-red-600 rounded flex items-center justify-center text-white text-[10px]">▶</span>
                    网站
                  </button>
                  <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors shadow-sm">
                    <Cloud className="w-4 h-4" />
                    云端硬盘
                  </button>
                  <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors shadow-sm">
                    <Clipboard className="w-4 h-4" />
                    已复制的文本
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="flex items-center gap-4 mt-2">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="w-[3%] h-full bg-blue-600 rounded-full"></div>
                </div>
                <span className="text-xs font-medium text-gray-400 shrink-0">9 / 300</span>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
