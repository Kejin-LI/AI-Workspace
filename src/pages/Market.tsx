import React, { useState } from 'react';
import { Search, Filter, ShoppingCart, Star, TrendingUp, Clock, FileText, CheckCircle, Briefcase, Zap, User, ArrowRight, DollarSign, Award, Feather, Shield, Scale, Stethoscope, PenTool } from 'lucide-react';
import { cn } from '../lib/utils';

// New data matching the screenshot
const BOUNTY_TASKS = [
  {
    id: 1,
    title: "企业合同风险标注",
    description: "识别1000份采购合同中的潜在法律风险，需要具备专业法律背景。",
    price: "$2.5",
    unit: "/ 条",
    tags: [
      { name: "法律", color: "bg-blue-100 text-blue-700" },
      { name: "文本标注", color: "bg-gray-100 text-gray-600" }
    ],
    features: [
      { icon: Scale, text: "法律学位" },
      { icon: CheckCircle, text: "准确率 > 95%" },
      { icon: Shield, text: "通过'合同法考核'" }
    ],
    deadline: "3天后截止",
    participants: 124,
    royalty: true, // Non-zero sum game feature
    attribution: false
  },
  {
    id: 2,
    title: "临床实体抽取",
    description: "从去标识化的临床病历中攫取关键实体（症状、药物、检查）。",
    price: "$4.0",
    unit: "/ 例",
    tags: [
      { name: "医疗", color: "bg-green-100 text-green-700" },
      { name: "信息提取", color: "bg-gray-100 text-gray-600" }
    ],
    features: [
      { icon: Stethoscope, text: "医学/药学学位" },
      { icon: CheckCircle, text: "准确率 > 98%" }
    ],
    deadline: "5天后截止",
    participants: 45,
    royalty: false,
    attribution: true // Non-zero sum game feature
  },
  {
    id: 3,
    title: "科幻故事续写",
    description: "根据给定的提示续写2000字的科幻故事。需要极高的创造力。",
    price: "$50",
    unit: "/ 千字",
    tags: [
      { name: "文学", color: "bg-purple-100 text-purple-700" },
      { name: "创意写作", color: "bg-gray-100 text-gray-600" }
    ],
    features: [
      { icon: Star, text: "评分 > 4.5" }
    ],
    deadline: "7天后截止",
    participants: 890,
    royalty: true,
    attribution: true
  }
];

const MY_TASKS = [
  {
    id: 101,
    title: "高中数学几何题解题逻辑链",
    status: "审核中",
    statusColor: "text-yellow-600 bg-yellow-50",
    earnings: "¥350",
    progress: 100,
    date: "2024-05-20"
  },
  {
    id: 102,
    title: "小红书爆款文案生成 Prompt V3",
    status: "已结算",
    statusColor: "text-green-600 bg-green-50",
    earnings: "¥1,200",
    progress: 100,
    date: "2024-05-15"
  },
  {
    id: 103,
    title: "金融财报深度分析思维链 (CoT)",
    status: "进行中",
    statusColor: "text-blue-600 bg-blue-50",
    earnings: "待定",
    progress: 45,
    date: "2024-05-22"
  }
];

export function Market() {
  const [activeTab, setActiveTab] = useState<'square' | 'mine'>('square');

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 pt-8 px-4 sm:px-6 lg:px-8">
      
      {/* Dark Banner Section */}
      <div className="bg-[#1E1B4B] rounded-2xl p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-16 -mb-16"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-green-400 mb-4 tracking-wider uppercase border border-white/10">
              <Zap className="w-3 h-3" />
              领域专家 WORKSPACE
            </div>
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">任务大厅</h1>
            <p className="text-gray-400 text-lg font-light">
              发现适合您专业技能的高价值挑战。
            </p>
          </div>

          <div className="w-full md:w-auto relative">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-white transition-colors" />
              <input
                type="text"
                placeholder="搜索任务、技能关键词..."
                className="w-full md:w-80 pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 outline-none focus:bg-white/10 focus:border-white/20 transition-all"
              />
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 cursor-pointer hover:text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setActiveTab('square')}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all",
            activeTab === 'square' 
              ? "bg-white text-gray-900 shadow-sm border border-gray-200" 
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          )}
        >
          <div className="w-2 h-2 rounded-full bg-black"></div>
          公共广场
        </button>
        <button
          onClick={() => setActiveTab('mine')}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all",
            activeTab === 'mine' 
              ? "bg-white text-gray-900 shadow-sm border border-gray-200" 
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          )}
        >
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          我的任务
        </button>
      </div>

      {activeTab === 'square' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
          {BOUNTY_TASKS.map(task => (
            <div key={task.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-gray-200 transition-all duration-300 group cursor-pointer relative overflow-hidden">
              {/* Top Row: Tags & Price */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-2">
                  {task.tags.map((tag, idx) => (
                    <span key={idx} className={cn("text-[10px] font-bold px-2.5 py-1 rounded-md", tag.color)}>
                      {tag.name}
                    </span>
                  ))}
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-gray-900">{task.price}</span>
                  <span className="text-xs text-gray-400 font-medium ml-1">{task.unit}</span>
                </div>
              </div>

              {/* Content */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {task.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                  {task.description}
                </p>
              </div>

              {/* Features/Requirements */}
              <div className="flex flex-wrap gap-2 mb-6">
                {task.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full text-xs text-gray-600 font-medium">
                    <feature.icon className="w-3.5 h-3.5 text-gray-400" />
                    {feature.text}
                  </div>
                ))}
              </div>

              {/* Non-zero sum game badges (Integrated into the design) */}
              {(task.royalty || task.attribution) && (
                <div className="flex flex-wrap gap-2 mb-6 border-t border-dashed border-gray-100 pt-3">
                    {task.royalty && (
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-100 px-3 py-1.5 rounded-full text-xs text-orange-700 font-bold shadow-sm" title="包含模型分红权益">
                        <TrendingUp className="w-3.5 h-3.5 text-orange-600" />
                        模型分红
                    </div>
                    )}
                    {task.attribution && (
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 px-3 py-1.5 rounded-full text-xs text-indigo-700 font-bold shadow-sm" title="保留署名权">
                        <Feather className="w-3.5 h-3.5 text-indigo-600" />
                        署名权
                    </div>
                    )}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {task.deadline}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    {task.participants} 人已报名
                  </span>
                </div>
                <button className="bg-black text-white text-xs font-bold px-5 py-2.5 rounded-full hover:bg-gray-800 transition-all flex items-center gap-1">
                  立即参与
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
             <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
               <h3 className="font-semibold text-gray-900">我的任务列表</h3>
               <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">查看全部</button>
             </div>
             {MY_TASKS.map((task, i) => (
               <div key={task.id} className={cn(
                 "p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 transition-colors group cursor-pointer",
                 i !== MY_TASKS.length - 1 && "border-b border-gray-100"
               )}>
                 <div className="flex items-start gap-4 mb-4 sm:mb-0">
                   <div className={cn(
                     "w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 transition-transform group-hover:scale-105",
                     task.progress === 100 ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                   )}>
                     {task.progress === 100 ? <CheckCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                   </div>
                   <div>
                     <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-blue-600 transition-colors">{task.title}</h3>
                     <div className="flex items-center gap-3 text-sm text-gray-500">
                       <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {task.date}</span>
                       <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium border", task.statusColor.replace('bg-', 'border-').replace('text-', 'bg-opacity-10 bg-'))}>
                         {task.status}
                       </span>
                     </div>
                   </div>
                 </div>
                 <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pl-16 sm:pl-0">
                   <div className="text-right">
                     <div className="text-xl font-bold text-gray-900">{task.earnings}</div>
                     <div className="text-xs text-gray-500">预估收益</div>
                   </div>
                   <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-colors">
                     <ArrowRight className="w-4 h-4" />
                   </div>
                 </div>
               </div>
             ))}
           </div>
        </div>
      )}
    </div>
  );
}
