import React, { useState } from 'react';
import { X, Download, ShieldCheck, Check, Copy, ExternalLink, PlayCircle, Layers } from 'lucide-react';

interface PluginDetailModalProps {
  plugin: any;
  onClose: () => void;
}

export function PluginDetailModal({ plugin, onClose }: PluginDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'install'>('overview');
  const [copied, setCopied] = useState(false);

  const handleCopyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const PluginIcon = plugin.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[85vh] min-h-[600px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="flex items-start justify-between p-6 md:p-8 border-b border-gray-100 bg-white/80 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center gap-5">
            <div className={`w-16 h-16 rounded-2xl ${plugin.bgColor} flex items-center justify-center shadow-sm border ${plugin.borderColor} shrink-0`}>
              {PluginIcon ? <PluginIcon className={`w-8 h-8 ${plugin.color}`} /> : '🧩'}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-extrabold text-gray-900">{plugin.title}</h2>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-md">{plugin.version || 'v1.0.0'}</span>
                <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-[11px] font-bold rounded-md border border-blue-200/50">
                  <ShieldCheck className="w-3 h-3" />
                  官方认证
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1.5 text-[13px] text-gray-500 font-medium">
                <span>{plugin.author || '@官方'}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <span>{plugin.type || '数据采集插件'}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>支持 {plugin.relatedTasksCount || 0} 个专属任务</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-col flex-1 overflow-hidden bg-gray-50/30">
          {/* Tabs */}
          <div className="flex items-center gap-8 px-8 border-b border-gray-100 bg-white">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`py-4 text-[15px] font-bold border-b-2 transition-colors relative ${
                activeTab === 'overview' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              能力介绍
            </button>
            <button 
              onClick={() => setActiveTab('install')}
              className={`py-4 text-[15px] font-bold border-b-2 transition-colors relative flex items-center gap-1.5 ${
                activeTab === 'install' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              安装指引说明
            </button>
          </div>

          <div className="flex-1 overflow-hidden relative">
            {/* Tab 1: Overview */}
            {activeTab === 'overview' && (
              <div className="absolute inset-0 overflow-y-auto p-8">
                <div className="max-w-3xl mx-auto space-y-10">
                  <section>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">插件简介</h3>
                    <p className="text-gray-600 leading-relaxed text-[15px]">{plugin.description}</p>
                  </section>
                  
                  <section>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      🎯 采集能力范围
                    </h3>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                      <ul className="space-y-4 text-sm text-gray-600">
                        <li className="flex items-start gap-3">
                          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-500 shrink-0">
                            <Check className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 mb-1">无感静默采集</div>
                            <div className="text-gray-500">在后台静默运行，不干扰用户的正常工作流和操作习惯。</div>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="p-1.5 rounded-lg bg-purple-50 text-purple-500 shrink-0">
                            <Check className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 mb-1">高精度轨迹还原</div>
                            <div className="text-gray-500">精确记录点击、滚动、输入、拖拽等原子级交互事件。</div>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="p-1.5 rounded-lg bg-green-50 text-green-500 shrink-0">
                            <Check className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 mb-1">严格隐私脱敏</div>
                            <div className="text-gray-500">本地自动过滤密码、个人身份信息 (PII) 等敏感数据，确保合规。</div>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      🎥 运行演示
                    </h3>
                    <div className="w-full aspect-video bg-gray-900 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden group cursor-pointer">
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white relative z-10 group-hover:scale-110 transition-transform">
                        <PlayCircle className="w-8 h-8" />
                      </div>
                      <div className="absolute bottom-4 left-4 text-white font-medium text-sm z-10 opacity-80">
                        {plugin.title} 操作演示视频 (1:24)
                      </div>
                    </div>
                  </section>

                </div>
              </div>
            )}

            {/* Tab 2: Install Guide */}
            {activeTab === 'install' && (
              <div className="absolute inset-0 overflow-y-auto p-8 bg-white">
                <div className="max-w-3xl mx-auto space-y-10 pb-10">
                  
                  {plugin.type === 'Trae 插件' && (
                    <section>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[15px] font-bold text-gray-900 flex items-center gap-2">
                          方式一：命令行极速安装
                        </h3>
                      </div>
                      
                      <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50/50">
                        <div className="p-5">
                          <p className="text-[13px] text-gray-500 mb-4">
                            在 Trae 的集成终端中运行以下命令，即可一键安装并激活该插件：
                          </p>
                          
                          <div className="bg-gray-100/80 rounded-lg overflow-hidden border border-gray-200/50">
                            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200/50">
                              <span className="text-xs font-bold text-gray-700">{"{ }"} Trae Terminal</span>
                              <button onClick={() => handleCopyCommand(`trae ext install ${plugin.id}`)} className="text-gray-400 hover:text-gray-900 p-1">
                                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                            <div className="p-4 overflow-x-auto">
                              <code className="text-[13px] text-gray-800 font-mono select-all leading-relaxed">
                                trae ext install {plugin.id}
                              </code>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
                  )}

                  {plugin.type === 'Chrome 插件' && (
                    <section>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[15px] font-bold text-gray-900 flex items-center gap-2">
                          前往 Chrome 网上应用店安装
                        </h3>
                      </div>
                      <button className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-xl transition-colors border border-blue-200">
                        <ExternalLink className="w-4 h-4" />
                        在 Chrome Web Store 中打开
                      </button>
                      <p className="text-xs text-gray-400 text-center mt-3">或者下载离线 .crx 包进行开发者模式安装</p>
                    </section>
                  )}

                  {plugin.type === 'Figma 插件' && (
                    <section>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[15px] font-bold text-gray-900 flex items-center gap-2">
                          前往 Figma Community 安装
                        </h3>
                      </div>
                      <button className="w-full flex items-center justify-center gap-2 py-3.5 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-colors shadow-md">
                        <ExternalLink className="w-4 h-4" />
                        在 Figma 社区中打开并试用
                      </button>
                    </section>
                  )}

                  <section>
                    <div className="flex items-center justify-between mb-4 mt-8 pt-8 border-t border-gray-100">
                      <h3 className="text-[15px] font-bold text-gray-900 flex items-center gap-2">
                        通用方式：下载离线安装包
                      </h3>
                    </div>
                    <button className="w-full flex items-center justify-center gap-2 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-colors border border-gray-200">
                      <Download className="w-4 h-4" />
                      下载 {plugin.title} 最新安装包 (.zip)
                    </button>
                  </section>

                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
