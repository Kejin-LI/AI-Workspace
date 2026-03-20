import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  FileText, 
  Table, 
  Bot, 
  Maximize2,
  Save,
  ArrowLeft,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { cn } from '../lib/utils';
import { X, Camera } from 'lucide-react';

export function Labeling() {
  const location = useLocation();
  const prompt = location.state?.prompt || "无初始任务";
  const [activeTab, setActiveTab] = useState('editor');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpContent, setHelpContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleHelpSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowHelpModal(false);
      setHelpContent('');
      // In a real app, we'd save this to Supabase here
      alert('求助帖已发布至社区！');
    }, 1000);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Sandbox Toolbar */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs font-medium">金融分析</span>
              <h2 className="text-sm font-semibold text-gray-800">Q3 财报深度分析 - TechCorp Inc.</h2>
            </div>
            <p className="text-xs text-gray-400 mt-0.5 max-w-md truncate">任务目标：基于左侧财报PDF，提取关键财务指标并撰写风险评估报告。</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            自动保存于 14:23
          </div>
          <button 
            onClick={() => setShowHelpModal(true)}
            className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            求助社区
          </button>
          <button className="px-4 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200">
            保存草稿
          </button>
          <button className="px-4 py-1.5 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-lg transition-colors shadow-sm">
            提交成果
          </button>
        </div>
      </div>

      {/* Main Workspace Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Source Material (Simulation) */}
        <div className="w-1/2 border-r border-gray-200 bg-gray-50/50 flex flex-col">
          <div className="bg-white border-b border-gray-100 px-4 py-2 flex items-center justify-between shadow-sm z-10">
            <span className="text-xs font-medium text-gray-500 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" />
              参考资料: TechCorp_Q3_2023.pdf
            </span>
            <button className="text-gray-400 hover:text-gray-600">
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <div className="flex-1 p-8 overflow-y-auto bg-gray-100/50">
            <div className="bg-white shadow-soft border border-gray-200 min-h-[800px] p-10 max-w-3xl mx-auto rounded-sm">
              <div className="mb-8 border-b-2 border-black pb-4">
                <h1 className="text-3xl font-serif font-bold mb-2">TechCorp Inc.</h1>
                <p className="text-sm text-gray-500 uppercase tracking-widest">Quarterly Report • Q3 2023</p>
              </div>
              
              <div className="space-y-6 font-serif text-gray-800 leading-relaxed">
                <section>
                  <h2 className="text-lg font-bold mb-3 text-black">管理层讨论与分析</h2>
                  <p className="mb-4">
                    2023年第三季度的总收入为124亿美元，同比增长15%。这一增长主要得益于云服务部门的强劲表现，该部门同比增长28%。
                    尽管全球经济环境充满挑战，但我们在核心业务领域的持续投入已初见成效。
                  </p>
                </section>

                <div className="my-8 p-6 bg-blue-50/50 border border-blue-100 rounded-xl">
                  <h3 className="text-sm font-bold text-blue-900 mb-4 uppercase tracking-wide">关键财务摘要</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs text-blue-600 mb-1">总收入</p>
                      <p className="text-2xl font-bold text-blue-900">$12.4 B</p>
                      <p className="text-xs text-green-600 mt-1">↑ 15% YoY</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 mb-1">净利润</p>
                      <p className="text-2xl font-bold text-blue-900">$3.1 B</p>
                      <p className="text-xs text-green-600 mt-1">↑ 18% YoY</p>
                    </div>
                  </div>
                </div>

                <section>
                  <h2 className="text-lg font-bold mb-3 text-black">风险因素</h2>
                  <p>
                    收入成本增加了10%，达到48亿美元，主要是由于支持云增长的基础设施成本增加。
                    运营费用为49亿美元，增长12%，主要是由于对人工智能技术的研发投入增加。
                    我们将密切关注供应链波动对硬件交付的影响。
                  </p>
                </section>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Creation/Work Area */}
        <div className="w-1/2 flex flex-col bg-white relative">
          {/* Editor Tabs */}
          <div className="flex border-b border-gray-100 px-2">
            <button 
              className={cn(
                "px-6 py-3 text-sm font-medium border-b-2 transition-all",
                activeTab === 'editor' ? "border-black text-black" : "border-transparent text-gray-400 hover:text-gray-600"
              )}
              onClick={() => setActiveTab('editor')}
            >
              分析报告编辑器
            </button>
            <button 
              className={cn(
                "px-6 py-3 text-sm font-medium border-b-2 transition-all",
                activeTab === 'spreadsheet' ? "border-black text-black" : "border-transparent text-gray-400 hover:text-gray-600"
              )}
              onClick={() => setActiveTab('spreadsheet')}
            >
              数据底表
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-8 overflow-y-auto">
            {activeTab === 'editor' ? (
              <div className="max-w-2xl mx-auto space-y-8">
                {/* AI Insight Card */}
                <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-xl p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-purple-900">AI 洞察建议</h4>
                      <p className="text-sm text-purple-700/80 mt-1 leading-relaxed">
                        检测到文中提到“基础设施成本增加 10%”。建议重点分析该成本与云服务收入增长（28%）的边际效益关系，这可能是评估其盈利可持续性的关键。
                      </p>
                      <div className="mt-3 flex gap-3">
                        <button className="text-xs font-medium text-purple-700 hover:text-purple-900 bg-purple-100/50 px-3 py-1.5 rounded-md transition-colors">
                          一键插入分析
                        </button>
                        <button className="text-xs text-gray-400 hover:text-gray-600 py-1.5">忽略</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">执行摘要</label>
                    <textarea 
                      className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 outline-none resize-none text-gray-800 placeholder-gray-400 text-sm leading-relaxed transition-all focus:bg-white"
                      placeholder="请总结报告的核心发现..."
                      defaultValue="TechCorp 在 Q3 展现了强劲的财务韧性，营收同比增长 15%，主要由云服务板块（+28%）驱动。尽管在 AI 研发上的投入导致运营费用上升，但运营利润率仍逆势提升了 200 个基点。"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">风险评估</label>
                    <textarea 
                      className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 outline-none resize-none text-gray-800 placeholder-gray-400 text-sm leading-relaxed transition-all focus:bg-white"
                      placeholder="请列出潜在的风险因素..."
                    ></textarea>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <Table className="w-16 h-16 mb-4 opacity-10" />
                <p>电子表格组件占位符</p>
                <button className="mt-4 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors">
                  加载数据
                </button>
              </div>
            )}
          </div>

          {/* Floating Copilot */}
          <div className="absolute bottom-6 right-6">
            <button className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-full shadow-lg hover:scale-105 transition-all group">
              <Bot className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span className="font-medium">AI 助手</span>
            </button>
          </div>
        </div>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">发起求助</h3>
              </div>
              <button 
                onClick={() => setShowHelpModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-6">
                {/* Auto-filled context info */}
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                  <div className="text-xs font-bold text-blue-800 mb-3 uppercase tracking-wider">当前任务上下文 (已脱敏)</div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">领域：</span>
                      <span className="font-medium text-gray-900 ml-2">金融分析</span>
                    </div>
                    <div>
                      <span className="text-gray-500">难度：</span>
                      <span className="font-medium text-gray-900 ml-2">高 (Level 4)</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">任务类型：</span>
                      <span className="font-medium text-gray-900 ml-2">信息抽取与风险评估</span>
                    </div>
                  </div>
                </div>

                {/* Screenshot Attachment Mock */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">附件</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex items-center gap-4 bg-gray-50">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Camera className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">工作区截图 (已自动生成)</div>
                      <div className="text-xs text-gray-500 mt-1">包含左侧财报区域及当前编辑内容</div>
                    </div>
                    <button className="ml-auto text-xs text-blue-600 hover:text-blue-700 font-medium">
                      重新截图
                    </button>
                  </div>
                </div>

                {/* Question Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    你遇到了什么问题？ <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={helpContent}
                    onChange={(e) => setHelpContent(e.target.value)}
                    placeholder="详细描述你在标注/分析过程中遇到的疑惑，例如：如何界定这段话中的风险程度？"
                    className="w-full h-32 p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none text-gray-800 text-sm leading-relaxed transition-all"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50">
              <button 
                onClick={() => setShowHelpModal(false)}
                className="px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button 
                onClick={handleHelpSubmit}
                disabled={!helpContent.trim() || isSubmitting}
                className={cn(
                  "px-5 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2",
                  !helpContent.trim() || isSubmitting 
                    ? "bg-blue-300 cursor-not-allowed" 
                    : "bg-blue-600 hover:bg-blue-700 shadow-sm"
                )}
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    发布中...
                  </>
                ) : (
                  '发布求助'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
