import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bot, User, Send, Settings2, Users, Plus, Eye, EyeOff, Hash, Search, AtSign, Sparkles, Globe, Cpu, LineChart, Scale, ArrowRight, X, Settings, Briefcase, BadgeInfo, Paperclip, Stethoscope, ShieldAlert, Database, FileText, Users2, UploadCloud, ArrowLeft, Check, AlertCircle, ChevronDown, ChevronRight, Folder, HelpCircle, ThumbsUp, ThumbsDown, Copy, MoreHorizontal, PanelRight, Activity, RotateCw, Maximize2, ChevronLeft, MessageSquare, PlusCircle, Target, BookOpen, History, ExternalLink, Link as LinkIcon, Zap, Brain, Atom, Ghost, SplitSquareHorizontal, Loader2, CheckCircle2, Compass } from 'lucide-react';
import { useHeaderActions } from '../contexts/HeaderActionsContext';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { callDoubaoProxy } from '../lib/doubaoProxy';

// Remove dummy data and define interface
interface HistoryItem {
  id: string;
  title: string;
  preview: string;
  time: string;
  type: string;
  isPinned: boolean;
  messages?: any[];
  active_models?: any[];
  chat_mode?: string;
  created_at?: string;
  updated_at?: string;
}

interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  reasoningContent?: string;
  modelId?: string;
  modelName?: string;
  type?: 'text' | 'questionnaire' | 'workflow' | 'stage_divider' | 'stage_summary' | string;
  kbs?: string[];
  skills?: string[];
  files?: string[];
  mentions?: string[];
  quote?: { text: string; modelName: string };
}

interface ModelConfig {
  id: string;
  name: string;
  avatar: string;
  role?: string;
  skills?: string[];
  nickname?: string;
  knowledgeBases?: string[];
  digitalTwins?: string[];
  localFiles?: string[];
  disabled?: boolean;
}

const LoadingDots = () => (
  <div className="flex items-center gap-1 px-1 py-1.5">
    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
  </div>
);

const dummyKBs = ['2023公司财报合集', '前端组件库内部文档', '劳动法及相关案例库', '医学诊疗指南2024版'];
const dummyTwins = ['张三 (资深前端架构师)', '李四 (红圈所高级合伙人)', '王医生 (协和肿瘤科主任)'];

const twinData: Record<string, { role: string; knowledgeBases: string[]; skills: string[] }> = {
  '张三 (资深前端架构师)': {
    role: '你是一个拥有10年经验的资深前端架构师，精通 React、Vue 和前端工程化。你的回答应该专业、深入，并常常提供代码示例和架构设计思路。',
    knowledgeBases: ['前端组件库内部文档'],
    skills: ['联网搜索']
  },
  '李四 (红圈所高级合伙人)': {
    role: '你是一位在国内顶尖红圈所工作的高级合伙人律师，精通公司法、合同法和商事争议解决。你的回答必须严谨、合规，并在必要时提示法律风险。',
    knowledgeBases: ['劳动法及相关案例库', '2023公司财报合集'],
    skills: ['联网搜索']
  },
  '王医生 (协和肿瘤科主任)': {
    role: '你是一位协和医院的肿瘤科主任医师，拥有丰富的临床经验。你的回答应该基于最新的医学指南，客观、专业，同时对患者保持同理心。',
    knowledgeBases: ['医学诊疗指南2024版'],
    skills: []
  }
};

const getWorkflowData = (scenarioText?: string) => {
  switch (scenarioText) {
    case '模拟法庭辩论':
      return [
        { title: '庭前准备', desc: '法官：宣布开庭，核对当事人及诉讼权利', speakers: ['主审法官'] },
        { title: '宣布焦点', desc: '法官：归纳案件争议焦点，双方确认', speakers: ['主审法官', '原告律师', '被告律师'] },
        { title: '举证质证', desc: '原告/被告：轮流出示证据并互相质证', speakers: ['原告律师', '被告律师'] },
        { title: '自由辩论', desc: '原告/被告：围绕焦点自由交锋，指出对方漏洞', speakers: ['原告律师', '被告律师'] },
        { title: '法庭宣判', desc: '法官：总结案情，出具最终裁判结果', speakers: ['主审法官'] }
      ];
    case '医疗多学科会诊(MDT)':
      return [
        { title: '病例汇总', desc: '主治医师：陈述患者基本情况及当前难点', speakers: ['主治医师'] },
        { title: '影像分析', desc: '放射科专家：解读关键影像学指征', speakers: ['放射科专家'] },
        { title: '独立意见', desc: '各科专家：基于本专业视角给出初步诊断', speakers: ['肿瘤科专家', '心血管专家'] },
        { title: '综合会诊', desc: '全体专家：交叉讨论，权衡各种治疗方案利弊', speakers: ['主治医师', '肿瘤科专家', '心血管专家'] },
        { title: '方案输出', desc: '主治医师：总结会诊意见，输出最终治疗方案', speakers: ['主治医师'] }
      ];
    case '投资评审会(IC)':
      return [
        { title: '项目陈述', desc: '项目经理：简述BP核心亮点与投资逻辑', speakers: ['项目经理'] },
        { title: '风控审查', desc: '风控官：排查财务模型与合规风险', speakers: ['风控官'] },
        { title: '市场评估', desc: '投资人：分析行业天花板与竞品威胁', speakers: ['行业专家', '投资人'] },
        { title: '交叉盘问', desc: '全体委员：针对核心风险点进行自由提问', speakers: ['投资人', '风控官', '行业专家'] },
        { title: '投资决策', desc: 'IC委员：投票表决并给出最终投资决议', speakers: ['投资人'] }
      ];
    case '安全攻防演练':
      return [
        { title: '威胁注入', desc: '红队：执行渗透测试与模拟攻击', speakers: ['红队攻击者'] },
        { title: '应急响应', desc: '蓝队：发现安全告警并初步遏制', speakers: ['蓝队防守者'] },
        { title: '攻击利用', desc: '红队：尝试提权与横向移动', speakers: ['红队攻击者'] },
        { title: '漏洞复盘', desc: '蓝队：溯源分析攻击路径与漏洞修补', speakers: ['蓝队防守者'] },
        { title: '加固输出', desc: '全体：输出完整的安全演练与加固报告', speakers: ['安全架构师'] }
      ];
    default:
      return [
        { title: '需求输入', desc: '用户：提供初始背景信息与核心目标', speakers: ['All'] },
        { title: '信息收集', desc: 'AI助手：检索相关资料与内部知识库', speakers: ['All'] },
        { title: '初步方案', desc: 'AI助手：输出第一版草案或分析结果', speakers: ['All'] },
        { title: '多轮迭代', desc: '双方：针对草案提出修改意见并持续优化', speakers: ['All'] },
        { title: '结果交付', desc: 'AI助手：生成最终产物文件', speakers: ['All'] }
      ];
  }
};

const getQuestionnaireData = (scenarioText?: string) => {
  switch (scenarioText) {
    case '模拟法庭辩论':
      return {
        question: "1. 请选择法庭辩论的争议焦点方向：",
        options: ['是否构成根本违约', '违约金金额是否过高', '不可抗力免责条款是否适用', '间接损失的计算标准及依据']
      };
    case '医疗多学科会诊(MDT)':
      return {
        question: "1. 请选择首选的诊疗推进方向：",
        options: ['穿刺活检以明确病理分型', '全外显子基因检测寻找靶点', '保守治疗并密切观察疗效', '立刻进行外科手术介入']
      };
    case '投资评审会(IC)':
      return {
        question: "1. 请选择本项目的核心探讨风险点：",
        options: ['目标市场天花板较低', '创始团队缺乏商业化经验', '竞品具有压倒性资金优势', '核心技术存在产权争议']
      };
    case '安全攻防演练':
      return {
        question: "1. 蓝军下一步的应急响应重点是：",
        options: ['封堵异常IP并隔离主机', '修复Web漏洞并重启服务', '分析攻击溯源路径及后门', '切断外网并恢复备份数据']
      };
    default:
      return {
        question: "1. 你们的业务/品牌方向是什么？",
        options: ['科技/SaaS/软件产品', '电商/消费品/零售', '教育/培训/知识付费', '金融/投资理财']
      };
  }
};

interface ModelConfigModalProps {
  configuringModel: ModelConfig;
  setConfiguringModel: React.Dispatch<React.SetStateAction<ModelConfig | null>>;
  updateModelConfig: (id: string, updates: Partial<ModelConfig>) => void;
  isAnonymous?: boolean;
  activeModels: ModelConfig[];
  setActiveModels: React.Dispatch<React.SetStateAction<ModelConfig[]>>;
  availableModels: ModelConfig[];
}

const ModelConfigModal = ({ configuringModel, setConfiguringModel, updateModelConfig, isAnonymous, activeModels, setActiveModels, availableModels }: ModelConfigModalProps) => {
  const [activeView, setActiveView] = useState<'main' | 'kb' | 'twin'>('main');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isDropdownOpen && !target.closest('.model-dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileNames = Array.from(e.target.files).map(f => f.name);
      const currentFiles = configuringModel.localFiles || [];
      updateModelConfig(configuringModel.id, { localFiles: [...currentFiles, ...fileNames] });
    }
  };

  const toggleItem = (field: 'knowledgeBases' | 'digitalTwins', item: string) => {
    const currentList = configuringModel[field] || [];
    const newList = currentList.includes(item) ? currentList.filter(i => i !== item) : [...currentList, item];
    updateModelConfig(configuringModel.id, { [field]: newList });
  };

  return (
    <div className="fixed inset-0 bg-black/20 z-[100] flex items-center justify-center backdrop-blur-sm p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            {activeView !== 'main' && (
              <button onClick={() => setActiveView('main')} className="p-1 -ml-2 mr-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className={`w-3 h-3 rounded-full ${configuringModel.avatar}`}></div>
            <h3 className="font-semibold text-gray-900">
              {activeView === 'main' ? `配置 ${isAnonymous ? '匿名模型' : (configuringModel.nickname ? `${configuringModel.nickname} (${configuringModel.name})` : configuringModel.name)}` : 
               activeView === 'kb' ? '选择个人知识库' : '选择专家数字分身'}
            </h3>
          </div>
          <button onClick={() => {
            if (activeView !== 'main') setActiveView('main');
            else setConfiguringModel(null);
          }} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-5 flex-1 min-h-0">
          {activeView === 'main' && (
            <>
              <div className="relative z-[60]">
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-gray-400" />
                  基础模型
                </label>
                <div className="relative model-dropdown-container">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full px-3 py-2 flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all cursor-pointer text-gray-900 font-medium"
                  >
                    <span>{configuringModel.name}</span>
                    <svg className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute z-[100] w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg py-1">
                      {availableModels.map(model => {
                        const inUse = activeModels.some(m => m.id === model.id && m.id !== configuringModel.id);
                        const isDisabled = model.disabled || inUse;
                        return (
                          <div 
                            key={model.id}
                            className={`group relative px-3 py-2.5 text-sm flex items-center justify-between transition-colors ${
                              isDisabled ? 'text-gray-400 cursor-not-allowed bg-gray-50/50' : 'text-gray-700 hover:bg-blue-50 cursor-pointer'
                            }`}
                            onClick={() => {
                              if (!isDisabled) {
                                const newActiveModels = activeModels.map(m => 
                                  m.id === configuringModel.id 
                                    ? { ...model, role: configuringModel.role, nickname: configuringModel.nickname, skills: configuringModel.skills, knowledgeBases: configuringModel.knowledgeBases, localFiles: configuringModel.localFiles, digitalTwins: configuringModel.digitalTwins } 
                                    : m
                                );
                                setActiveModels(newActiveModels);
                                setConfiguringModel(newActiveModels.find(m => m.id === model.id) || null);
                                setIsDropdownOpen(false);
                              }
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <span>{model.name}</span>
                              {inUse && <span className="text-[11px] text-gray-400 bg-gray-100 px-1.5 rounded">(已在群聊中)</span>}
                            </div>
                            {configuringModel.id === model.id && <Check className="w-4 h-4 text-blue-600" />}
                            
                            {/* Hover Tooltip for disabled model */}
                            {model.disabled && !inUse && (
                              <div className="absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+4px)] px-3 py-2 bg-gray-900 text-white text-[12px] font-medium rounded-lg w-max max-w-[200px] text-center opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-[9999] shadow-xl flex flex-col items-center">
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45 rounded-sm"></div>
                                <span className="relative z-10 leading-relaxed">当前大模型暂未开放，如有需求请联系：<br/>likejin2019@gmail.com</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="relative z-40">
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <BadgeInfo className="w-4 h-4 text-gray-400" />
                  群聊昵称
                </label>
                <input 
                  type="text"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                  placeholder={`例如：原告律师 (当前: ${isAnonymous ? '匿名模型' : configuringModel.name})`}
                  value={configuringModel.nickname || ''}
                  maxLength={10}
                  onChange={(e) => updateModelConfig(configuringModel.id, { nickname: e.target.value })}
                />
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-gray-400" />
                    角色设定 (System Prompt)
                  </label>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setActiveView('twin')} className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded-md transition-colors">
                      <Users2 className="w-3.5 h-3.5" />
                      {configuringModel.digitalTwins && configuringModel.digitalTwins.length > 0 
                        ? configuringModel.digitalTwins[0] 
                        : '引入专家分身'}
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <textarea 
                    className="w-full h-24 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 resize-none transition-all text-gray-900"
                    placeholder="例如：你是一个资深的金融分析师，请用严谨的数据来支持你的观点..."
                    value={configuringModel.role || ''}
                    onChange={(e) => updateModelConfig(configuringModel.id, { role: e.target.value })}
                  ></textarea>
                </div>
              </div>
              
              <div className="relative z-30">
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  外挂技能
                </label>
                
                {/* Skills Area */}
                <div className="flex flex-wrap gap-2">
                  {['联网搜索'].map(skill => {
                    const hasSkill = configuringModel.skills?.includes(skill);
                    return (
                      <button 
                        key={skill}
                        onClick={() => {
                          const currentSkills = configuringModel.skills || [];
                          const newSkills = hasSkill 
                            ? currentSkills.filter(s => s !== skill)
                            : [...currentSkills, skill];
                          updateModelConfig(configuringModel.id, { skills: newSkills });
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          hasSkill 
                            ? 'bg-blue-50 border-blue-200 text-blue-700' 
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="relative z-20">
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-gray-400" />
                  知识库
                </label>
                {/* Data Sources Area */}
                <div className="grid grid-cols-1 gap-2">
                    
                    {/* KB Section */}
                    <div>
                      <button onClick={() => setActiveView('kb')} className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors group">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center">
                            <Database className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">关联个人知识库</span>
                        </div>
                        <Plus className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                      </button>
                      {configuringModel.knowledgeBases && configuringModel.knowledgeBases.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2 px-1">
                          {configuringModel.knowledgeBases.map(kb => (
                            <span key={kb} className="inline-flex items-center gap-1 text-[12px] font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-md">
                              <Database className="w-3 h-3" /> {kb}
                              <button onClick={() => toggleItem('knowledgeBases', kb)} className="hover:text-blue-900 ml-1"><X className="w-3 h-3" /></button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Local File Upload Section */}
                    <div>
                      <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-2 text-gray-500">
                          <UploadCloud className="w-4 h-4" />
                          <span className="text-sm font-medium">上传本地参考资料 (PDF/Doc)</span>
                        </div>
                      </button>
                      <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                      {configuringModel.localFiles && configuringModel.localFiles.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2 px-1">
                          {configuringModel.localFiles.map(file => (
                            <span key={file} className="inline-flex items-center gap-1 text-[12px] font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2 py-1 rounded-md">
                              <FileText className="w-3 h-3" /> {file}
                              <button onClick={() => {
                                updateModelConfig(configuringModel.id, { localFiles: configuringModel.localFiles!.filter(f => f !== file) });
                              }} className="hover:text-slate-800 ml-1"><X className="w-3 h-3" /></button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
              </div>
            </>
          )}

          {activeView === 'kb' && (
            <div className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-200 pb-4">
              <p className="text-sm text-gray-500 mb-4">请选择要挂载给该模型的个人知识库：</p>
              {dummyKBs.map(kb => {
                const isSelected = configuringModel.knowledgeBases?.includes(kb);
                return (
                  <button 
                    key={kb} 
                    onClick={() => toggleItem('knowledgeBases', kb)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${isSelected ? 'border-blue-500 bg-blue-50/50 shadow-sm' : 'border-gray-200 hover:border-blue-300 bg-white'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Database className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                      <span className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>{kb}</span>
                    </div>
                    {isSelected && <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
                  </button>
                )
              })}
            </div>
          )}

          {activeView === 'twin' && (
            <div className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-200 pb-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">请选择要引入的专家数字分身（包含预设的专业知识和人设）：</p>
                <button 
                  onClick={() => {
                    setConfiguringModel(null);
                    navigate('/expert/community', { state: { activeTab: 'avatars' } });
                  }}
                  className="text-[13px] text-blue-600 hover:text-blue-700 font-medium shrink-0 flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors"
                >
                  去专家社区发现更多 <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              {dummyTwins.map(twin => {
                const isSelected = configuringModel.digitalTwins?.includes(twin);
                return (
                  <button 
                    key={twin} 
                    onClick={() => {
                      if (isSelected) {
                        updateModelConfig(configuringModel.id, { digitalTwins: [] });
                      } else {
                        const twinInfo = twinData[twin];
                        const newKBs = Array.from(new Set([...(configuringModel.knowledgeBases || []), ...(twinInfo?.knowledgeBases || [])]));
                        const newSkills = Array.from(new Set([...(configuringModel.skills || []), ...(twinInfo?.skills || [])]));
                        
                        updateModelConfig(configuringModel.id, { 
                          digitalTwins: [twin],
                          role: twinInfo?.role || '',
                          knowledgeBases: newKBs,
                          skills: newSkills
                        });
                      }
                      setActiveView('main');
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${isSelected ? 'border-purple-500 bg-purple-50/50 shadow-sm' : 'border-gray-200 hover:border-purple-300 bg-white'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Users2 className={`w-5 h-5 ${isSelected ? 'text-purple-600' : 'text-gray-400'}`} />
                      <span className={`text-sm font-medium ${isSelected ? 'text-purple-900' : 'text-gray-700'}`}>{twin}</span>
                    </div>
                    {isSelected && <div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {activeView === 'main' && (
          <div className="p-4 border-t border-gray-100 bg-gray-50/50 shrink-0 flex justify-end">
            <button 
              onClick={() => setConfiguringModel(null)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
            >完成配置</button>
          </div>
        )}
      </div>
    </div>
  );
};

const suggestions = [
  { 
    icon: Scale, 
    text: '模拟法庭辩论', 
    prompt: '请分析这起商业合同违约案。原告律师请指出对方违约事实并提出赔偿，被告律师请进行无责辩护，法官请在双方陈述后做出裁决。案情细节如下：',
    models: [
      { name: 'GPT-4o', nickname: '原告律师', role: '你是一位言辞犀利、逻辑严密的原告律师。', avatar: 'bg-green-500', skills: ['联网搜索'] },
      { name: 'Claude 3.5', nickname: '被告律师', role: '你是一位擅长钻研法律漏洞、沉着冷静的被告律师。', avatar: 'bg-orange-500', skills: [] },
      { name: 'Llama 3', nickname: '主审法官', role: '你是一位秉公执法、不偏不倚的法官。请总结双方观点并给出最终判决。', avatar: 'bg-blue-500', skills: [] }
    ],
    examples: [
      '一互联网公司高管离职后创办竞品公司，原公司以违反竞业协议为由起诉，要求赔偿500万元。',
      '某供应商延迟交货导致采购方生产线停工3天，采购方索赔直接及间接损失。',
      '消费者在某餐厅就餐时滑倒受伤，餐厅主张已设置提示牌，双方对责任划分产生争议。'
    ]
  },
  { 
    icon: Stethoscope, 
    text: '医疗多学科会诊(MDT)', 
    prompt: '这是一份复杂的患者病历报告。请各科室专家发表会诊意见，并给出一个综合治疗方案。病历摘要：',
    models: [
      { name: 'GPT-4o', nickname: '主治医师', role: '你是经验丰富的主治医师，负责统筹患者的整体治疗方案。', avatar: 'bg-blue-500', skills: [] },
      { name: 'Claude 3.5', nickname: '放射科专家', role: '你是顶级的放射科专家，负责解读CT、MRI等影像学资料。', avatar: 'bg-pink-500', skills: [] },
      { name: 'Llama 3', nickname: '肿瘤科专家', role: '你是顶级的肿瘤科医生，优先考虑如何控制肿瘤扩散。', avatar: 'bg-green-500', skills: ['医学文献库'] },
      { name: 'Gemini Pro', nickname: '心血管专家', role: '你是心血管权威，极其关注患者的心肺承受能力，对激进的肿瘤治疗持谨慎态度。', avatar: 'bg-orange-500', skills: [] }
    ],
    examples: [
      '65岁男性，伴有心衰和早期肺部肿瘤，近期出现呼吸困难加重。',
      '40岁女性，确诊乳腺癌伴有轻度肾功能不全，需制定化疗方案。',
      '70岁糖尿病患者，突发急性胆囊炎，需评估手术风险。'
    ]
  },
  { 
    icon: Briefcase, 
    text: '投资评审会(IC)', 
    prompt: '这是一家初创公司的 BP 摘要。请进行模拟 IC 评审。摘要如下：',
    models: [
      { name: 'GPT-4o', nickname: '项目经理', role: '你是积极推进该项目的投资经理，负责向IC委员会阐述项目亮点。', avatar: 'bg-blue-500', skills: [] },
      { name: 'Claude 3.5', nickname: '投资人', role: '你是一个看重爆发性增长和宏大叙事的早期投资人，对风险容忍度高。', avatar: 'bg-green-500', skills: ['联网搜索'] },
      { name: 'Llama 3', nickname: '风控官', role: '你是一个极其严苛的风控官，只看重财务健康、合规性和落地可行性。', avatar: 'bg-orange-500', skills: ['企业财报知识库', '计算器'] },
      { name: 'Gemini Pro', nickname: '行业专家', role: '你是该领域的资深行业专家，对技术发展趋势和竞品格局了如指掌。', avatar: 'bg-pink-500', skills: [] }
    ],
    examples: [
      '一家研发通用人形机器人的初创公司，估值 10 亿美金，目前尚无量产产品。',
      '一家基于大模型的 AI 法律助手产品，MRR 达到 10 万美金，但面临巨头竞争。',
      '一家新型固态电池研发企业，声称能量密度提升 50%，需资金建厂。'
    ]
  },
  { 
    icon: ShieldAlert, 
    text: '安全攻防演练', 
    prompt: '请针对以下场景进行红蓝队攻防演练。场景描述：',
    models: [
      { name: 'GPT-4o', nickname: '红队攻击者', role: '你是一流的渗透测试工程师（红队），你的任务是找出所有可能的攻击路径和漏洞。', avatar: 'bg-red-500', skills: ['代码运行沙盒'] },
      { name: 'Claude 3.5', nickname: '蓝队防守者', role: '你是企业安全防护专家（蓝队），你的任务是修补红队指出的漏洞，并发现攻击留下的痕迹。', avatar: 'bg-blue-500', skills: [] },
      { name: 'Llama 3', nickname: '安全架构师', role: '你是资深安全架构师，负责在演练结束后总结问题，输出整体加固方案。', avatar: 'bg-purple-500', skills: [] }
    ],
    examples: [
      '一段包含潜在 SQL 注入和 XSS 风险的 Node.js 登录逻辑代码。',
      '公司内网的一个旧版 OA 系统，未开启多因素认证，且存在已知的反序列化漏洞。',
      '暴露在公网的一个 S3 存储桶配置错误，允许匿名读取部分日志文件。'
    ]
  }
];

export function UnifiedChat() {
  const { setTitle, setActions, isRightPanelOpen, setIsRightPanelOpen } = useHeaderActions();
  const [activeRightTab, setActiveRightTab] = useState<'artifacts' | 'trajectory' | 'preview' | 'references'>('artifacts');
  const [addedRefs, setAddedRefs] = useState<Record<string, boolean>>({});
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [currentWorkflowStep, setCurrentWorkflowStep] = useState(0);
  const [isWorkflowActive, setIsWorkflowActive] = useState(false);
  const [isCollaborative, setIsCollaborative] = useState(() => {
    const saved = localStorage.getItem('chat_isCollaborative');
    return saved ? JSON.parse(saved) : false;
  });
  const [activeModels, setActiveModels] = useState<ModelConfig[]>(() => {
    const saved = localStorage.getItem('chat_activeModels');
    return saved ? JSON.parse(saved) : [{ id: 'm1', name: 'Doubao-Seed-2.0-pro', avatar: 'bg-red-500', skills: [] }];
  });
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('chat_messages');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState(() => {
    const saved = localStorage.getItem('chat_input');
    return saved || '';
  });
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showLandingAtDropdown, setShowLandingAtDropdown] = useState(false);
  const [showChatAtDropdown, setShowChatAtDropdown] = useState(false);
  const [configuringModel, setConfiguringModel] = useState<ModelConfig | null>(null);
  const [activeModelDropdown, setActiveModelDropdown] = useState<string | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<typeof suggestions[0] | null>(() => {
    const saved = localStorage.getItem('chat_selectedScenario');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Find the full scenario object from suggestions to restore the icon component
        return suggestions.find(s => s.text === parsed.text) || parsed;
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [chatMode, setChatMode] = useState<'fast' | 'think' | 'collaborative'>(() => {
    const saved = localStorage.getItem('chat_chatMode');
    return saved ? JSON.parse(saved) : 'fast';
  });
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(() => {
    const saved = localStorage.getItem('chat_isWebSearchEnabled');
    return saved ? JSON.parse(saved) : false;
  });
  
  const LOADING_STATE_TEXT = '（模型正在回复中）';
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [showSingleModelDropdown, setShowSingleModelDropdown] = useState(false);
  const modeDropdownRef = useRef<HTMLDivElement>(null);
  const singleModelDropdownRef = useRef<HTMLDivElement>(null);
  
  // AbortController ref to cancel ongoing requests
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Available models mapping
  const AVAILABLE_MODELS = [
    { id: 'doubao-seed', name: 'Doubao-Seed-2.0-pro', avatar: 'bg-red-500', disabled: false },
    { id: 'gpt4o', name: 'GPT-4o', avatar: 'bg-green-500', disabled: true },
    { id: 'claude35', name: 'Claude 3.5 Sonnet', avatar: 'bg-purple-500', disabled: true },
    { id: 'gemini15', name: 'Gemini 1.5 Pro', avatar: 'bg-blue-500', disabled: true },
    { id: 'llama3', name: 'Llama 3 70B', avatar: 'bg-orange-500', disabled: true },
    { id: 'doubao', name: '豆包 Doubao-pro-128k', avatar: 'bg-red-500', disabled: true },
    { id: 'qwen', name: '通义千问 Qwen-Max', avatar: 'bg-pink-500', disabled: true },
    { id: 'moonshot', name: '月之暗面 Kimi', avatar: 'bg-yellow-500', disabled: true },
  ];
  
  const [selectedKBs, setSelectedKBs] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [globalFiles, setGlobalFiles] = useState<string[]>([]);
  
  const [selectionPopover, setSelectionPopover] = useState<{show: boolean, x: number, y: number, text: string, modelName: string} | null>(null);
  const [quote, setQuote] = useState<{text: string, modelName: string, type: 'refute' | 'supplement'} | null>(null);
  // Handle reset event from Header
  useEffect(() => {
    const handleReset = () => {
      setMessages([]);
      setInput('');
      setSelectedScenario(null);
      setIsWorkflowActive(false);
      setCurrentWorkflowStep(0);
      setIsCollaborative(false);
      setChatMode('fast');
      setIsWebSearchEnabled(false);
      // Keep only one default model when resetting
      setActiveModels([
        { id: 'm1', name: 'Doubao-Seed-2.0-pro', avatar: 'bg-red-500', skills: [] },
      ]);
      localStorage.removeItem('chat_messages');
      localStorage.removeItem('chat_input');
      localStorage.removeItem('chat_selectedScenario');
      localStorage.removeItem('chat_isCollaborative');
      localStorage.removeItem('chat_chatMode');
      localStorage.removeItem('chat_isWebSearchEnabled');
      localStorage.removeItem('chat_activeModels');
    };
    
    window.addEventListener('reset-unified-chat', handleReset);
    return () => window.removeEventListener('reset-unified-chat', handleReset);
  }, []);

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('chat_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('chat_input', input);
  }, [input]);

  useEffect(() => {
    localStorage.setItem('chat_selectedScenario', JSON.stringify(selectedScenario));
  }, [selectedScenario]);

  useEffect(() => {
    localStorage.setItem('chat_isCollaborative', JSON.stringify(isCollaborative));
  }, [isCollaborative]);

  useEffect(() => {
    localStorage.setItem('chat_chatMode', JSON.stringify(chatMode));
  }, [chatMode]);

  useEffect(() => {
    localStorage.setItem('chat_isWebSearchEnabled', JSON.stringify(isWebSearchEnabled));
  }, [isWebSearchEnabled]);

  useEffect(() => {
    localStorage.setItem('chat_activeModels', JSON.stringify(activeModels));
  }, [activeModels]);

  const [showFailPointsFor, setShowFailPointsFor] = useState<string | null>(null);
  
  const [isRefSelectionMode, setIsRefSelectionMode] = useState(false);
  const [selectedRefs, setSelectedRefs] = useState<string[]>([]);
  const [groupVotes, setGroupVotes] = useState<Record<string, { selection?: string, reason?: string, submitted?: boolean | 'hiding' | 'hidden' }>>({});

  const chatEndRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const globalFileInputRef = useRef<HTMLInputElement>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [historyTab, setHistoryTab] = useState<'all' | 'pinned'>('all');
  const [historySearch, setHistorySearch] = useState('');
  const [activeHistoryMenu, setActiveHistoryMenu] = useState<string | null>(null);
  const [historyMenuCoords, setHistoryMenuCoords] = useState<{x: number, y: number, showAbove: boolean} | null>(null);
  const [editingHistoryId, setEditingHistoryId] = useState<string | null>(null);
  const [editingHistoryTitle, setEditingHistoryTitle] = useState('');

  const [shareModalState, setShareModalState] = useState<{isOpen: boolean, url: string, copied: boolean}>({
    isOpen: false,
    url: '',
    copied: false
  });

  const [activeKbDropdown, setActiveKbDropdown] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Fallback for clipboard API in iframe/preview environments
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // Fallback using textarea
      const textArea = document.createElement("textarea");
      textArea.value = text;
      // Avoid scrolling to bottom
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
      } catch (err) {
        document.body.removeChild(textArea);
        return false;
      }
    }
  };

  // Handle URL query parameters for loading a specific session (even if unauthenticated for public view)
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sessionIdToLoad = params.get('session_id');
    
    if (sessionIdToLoad) {
      // First check if it's already in our fetched history
      if (historyItems.length > 0) {
        const itemToLoad = historyItems.find(i => i.id === sessionIdToLoad);
        if (itemToLoad && currentSessionId !== sessionIdToLoad) {
          handleLoadSession(itemToLoad);
          window.history.replaceState({}, document.title, window.location.pathname);
          return;
        }
      }
      
      // If not in history (might be a public link or history not loaded yet), fetch directly
      const fetchSpecificSession = async () => {
        if (currentSessionId === sessionIdToLoad) return;
        
        const { data, error } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('id', sessionIdToLoad)
          .single();
          
        if (!error && data) {
          const itemToLoad: HistoryItem = {
            id: data.id,
            title: data.title || '新对话',
            preview: data.preview || '',
            time: '共享会话',
            type: data.type || 'chat',
            isPinned: data.is_pinned || false,
            messages: data.messages,
            active_models: data.active_models,
            chat_mode: data.chat_mode,
            created_at: data.created_at,
            updated_at: data.updated_at
          };
          handleLoadSession(itemToLoad);
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      };
      
      fetchSpecificSession();
    }
  }, [location.search, historyItems, currentSessionId]);

  useEffect(() => {
    // If navigating from Community "Create Skill" or similar, ensure right panel is closed
    const state = location.state as any;
    if (state?.prefillText || state?.prefillSkill) {
      setIsRightPanelOpen(false);
    }
    
    if (state?.prefillText) {
      setInput(state.prefillText);
    }
    if (state?.prefillSkill) {
      setSelectedSkills(prev => {
        if (!prev.includes(state.prefillSkill)) {
          return [...prev, state.prefillSkill];
        }
        return prev;
      });
    }
    // Clean up state so it doesn't trigger again on refresh
    if (state?.prefillText || state?.prefillSkill) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state, setIsRightPanelOpen]);

  // Add fetch history effect
  useEffect(() => {
    const fetchHistory = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('updated_at', { ascending: false });
        
      if (!error && data) {
        const formatted = data.map(item => {
          // Simple time formatting
          const date = new Date(item.updated_at);
          const today = new Date();
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          
          let timeGroup = '上周';
          if (date.toDateString() === today.toDateString()) {
            timeGroup = '今天';
          } else if (date.toDateString() === yesterday.toDateString()) {
            timeGroup = '昨天';
          }
          
          return {
            id: item.id,
            title: item.title || '新对话',
            preview: item.preview || '',
            time: timeGroup,
            type: item.type || 'chat',
            isPinned: item.is_pinned || false,
            messages: item.messages,
            active_models: item.active_models,
            chat_mode: item.chat_mode,
            created_at: item.created_at,
            updated_at: item.updated_at
          };
        });
        setHistoryItems(formatted);
      }
    };
    fetchHistory();
  }, []);

  const filteredHistory = historyItems.filter(item => {
    const matchTab = historyTab === 'all' || (historyTab === 'pinned' && item.isPinned);
    const matchSearch = item.title.toLowerCase().includes(historySearch.toLowerCase()) || item.preview.toLowerCase().includes(historySearch.toLowerCase());
    return matchTab && matchSearch;
  });

  const handleHistoryAction = async (action: 'pin' | 'rename' | 'delete' | 'clearAll', itemId?: string, newTitle?: string) => {
    if (action === 'clearAll') {
      await supabase.from('chat_sessions').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
      setHistoryItems([]);
      return;
    }

    if (!itemId) return;

    if (action === 'delete') {
      await supabase.from('chat_sessions').delete().eq('id', itemId);
      setHistoryItems(prev => prev.filter(i => i.id !== itemId));
      if (currentSessionId === itemId) {
        setMessages([]);
        setCurrentSessionId(null);
      }
    } else if (action === 'pin') {
      const item = historyItems.find(i => i.id === itemId);
      if (item) {
        const newPinnedStatus = !item.isPinned;
        await supabase.from('chat_sessions').update({ is_pinned: newPinnedStatus }).eq('id', itemId);
        setHistoryItems(prev => prev.map(i => i.id === itemId ? { ...i, isPinned: newPinnedStatus } : i));
      }
    } else if (action === 'rename' && newTitle) {
      await supabase.from('chat_sessions').update({ title: newTitle }).eq('id', itemId);
      setHistoryItems(prev => prev.map(i => i.id === itemId ? { ...i, title: newTitle } : i));
    }
  };

  const handleLoadSession = (item: HistoryItem) => {
    // Restore session data
    setMessages(item.messages || []);
    
    if (item.active_models && item.active_models.length > 0) {
      setActiveModels(item.active_models);
    } else {
      setActiveModels([{ id: 'm1', name: 'Doubao-Seed-2.0-pro', avatar: 'bg-red-500', skills: [] }]);
    }

    const restoredMode = (item.chat_mode as 'fast' | 'think' | 'collaborative') || 'fast';
    setChatMode(restoredMode);
    setIsCollaborative(restoredMode === 'collaborative');
    
    setCurrentSessionId(item.id);
    
    // Clear current inputs
    setInput('');
    setSelectedScenario(null);
    setShowHistoryModal(false);
  };

  const handleGlobalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileNames = Array.from(e.target.files).map(f => f.name);
      setGlobalFiles(prev => [...prev, ...fileNames]);
    }
  };

  const handleTextSelection = (e: React.MouseEvent, modelName: string) => {
    setTimeout(() => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();
      
      if (text && text.length > 0) {
        const range = selection?.getRangeAt(0);
        const rect = range?.getBoundingClientRect();
        
        if (rect) {
          setSelectionPopover({
            show: true,
            x: rect.left + rect.width / 2,
            y: rect.bottom,
            text,
            modelName
          });
        }
      } else {
        setSelectionPopover(null);
      }
    }, 10);
  };

  const handleQuoteAction = (type: 'refute' | 'supplement') => {
    if (!selectionPopover) return;
    setQuote({
      text: selectionPopover.text,
      modelName: selectionPopover.modelName,
      type
    });
    
    const prefix = `@${selectionPopover.modelName} `;
    const actionText = type === 'refute' ? '针对你的观点，我认为 ' : '针对你的观点，我补充 ';
    
    setInput(prev => {
      const prefixText = prev.trim() ? prev + '\n' : prev;
      return prefixText + prefix + actionText;
    });
    
    setSelectionPopover(null);
    window.getSelection()?.removeAllRanges();
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#selection-popover')) {
        if (window.getSelection()?.isCollapsed) {
          setSelectionPopover(null);
        }
      }
      
      // Handle mode dropdown click outside
      if (showModeDropdown && modeDropdownRef.current && !modeDropdownRef.current.contains(target)) {
        setShowModeDropdown(false);
      }
      
      // Handle single model dropdown click outside
      if (showSingleModelDropdown && singleModelDropdownRef.current && !singleModelDropdownRef.current.contains(target)) {
        setShowSingleModelDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [showModeDropdown, showSingleModelDropdown]);

  const sharedInputClasses = "w-full max-h-32 min-h-[44px] p-0 m-0 border-0 outline-none resize-none bg-transparent text-[15px] leading-relaxed font-sans tracking-normal whitespace-pre-wrap break-words overflow-hidden text-left align-top";

  const renderHighlightedInput = () => {
    const modelNames = activeModels.map(m => m.nickname || m.name).filter(Boolean);
    if (!input) {
      if (chatMode === 'collaborative') {
        return <span className="text-gray-400">输入指令，或 @某个模型让它单独作答...</span>;
      } else {
        return <span className="text-gray-400">给 {activeModels[0]?.nickname || activeModels[0]?.name || '模型'} 发送消息...</span>;
      }
    }
    if (modelNames.length === 0) return <span className="text-slate-700">{input}</span>;
    
    // Sort by length descending to match longest names first
    modelNames.sort((a, b) => b.length - a.length);
    const escapedNames = modelNames.map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`(@(?:${escapedNames.join('|')}))`);
    
    const getColorClasses = (colorClass: string) => {
      if (isAnonymous) return 'bg-gray-100 text-gray-600';
      if (colorClass.includes('green')) return 'bg-green-50 text-green-600';
      if (colorClass.includes('blue')) return 'bg-blue-50 text-blue-600';
      if (colorClass.includes('orange')) return 'bg-orange-50 text-orange-600';
      if (colorClass.includes('purple')) return 'bg-purple-50 text-purple-600';
      if (colorClass.includes('pink')) return 'bg-pink-50 text-pink-600';
      if (colorClass.includes('red')) return 'bg-red-50 text-red-600';
      if (colorClass.includes('yellow')) return 'bg-yellow-50 text-yellow-600';
      return 'bg-blue-50 text-blue-600'; // fallback
    };

    const parts = input.split(regex);
    return parts.map((part, i) => {
      const matchedModelName = modelNames.find(name => `@${name}` === part);
      if (matchedModelName) {
        const model = activeModels.find(m => (m.nickname || m.name) === matchedModelName);
        const colorClasses = model ? getColorClasses(model.avatar) : 'bg-blue-50 text-blue-600';
        return (
          <span key={i} className={`${colorClasses} rounded-md`} style={{ padding: '2px 4px', margin: '0 -4px' }}>
            {part}
          </span>
        );
      }
      if (i === parts.length - 1 && part.endsWith('\n')) {
        return <span key={i} className="text-slate-700">{part}<br/></span>;
      }
      return <span key={i} className="text-slate-700">{part}</span>;
    });
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (highlightRef.current) {
      highlightRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const handleReferenceClick = (e: React.MouseEvent, refId: string) => {
    e.stopPropagation();
    setIsRightPanelOpen(true);
    setActiveRightTab('references');
    
    setTimeout(() => {
      const el = document.getElementById(`ref-${refId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('bg-blue-50/50', 'transition-colors', 'duration-500');
        setTimeout(() => {
          el.classList.remove('bg-blue-50/50');
        }, 2000);
      }
    }, 100); // Give sidebar time to render
  };

  const [showReasoningMap, setShowReasoningMap] = useState<Record<string, boolean>>({});

  const toggleReasoning = (msgId: string, currentState: boolean) => {
    setShowReasoningMap(prev => ({
      ...prev,
      [msgId]: !currentState
    }));
  };

  const renderMessageContentWithRefs = (content: string, reasoningContent?: string, msgId?: string, showRecommendations: boolean = true) => {
    if (content === LOADING_STATE_TEXT && !reasoningContent) {
      return <LoadingDots />;
    }
    
    const isThinking = content === LOADING_STATE_TEXT;
    const isExpanded = msgId && showReasoningMap[msgId] !== undefined ? showReasoningMap[msgId] : isThinking;
    
    // Extract recommended questions if present
    let displayContent = content;
    let recommendedQuestions: string[] = [];

    // 1) 优先匹配标准的 <recommended_questions> 标签（与 prompt 约定一致）
    const taggedMatch = displayContent.match(/<recommended_questions>[\s\S]*?(\[[\s\S]*?\])[\s\S]*?<\/recommended_questions>/);
    if (taggedMatch) {
      try {
        recommendedQuestions = JSON.parse(taggedMatch[1]);
        displayContent = displayContent.replace(taggedMatch[0], '').trim();
      } catch (e) {
        console.error('Failed to parse recommended questions (tagged):', e);
      }
    } else {
      // 2) Fallback：模型偶尔会丢标签，只输出文末裸 JSON 数组，兜底解析
      const trailingArrayMatch = displayContent.match(/(\[\s*"[^"\n][\s\S]*?"\s*\])\s*$/);
      if (trailingArrayMatch) {
        try {
          const parsed = JSON.parse(trailingArrayMatch[1]);
          if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(item => typeof item === 'string')) {
            recommendedQuestions = parsed.slice(0, 5);
            displayContent = displayContent.slice(0, trailingArrayMatch.index).trimEnd();
          }
        } catch (e) {
          // 不是合法 JSON，忽略
        }
      }
    }
    
    const parts = displayContent.split(/\[(\d+)\]/g);
    const renderedContent = parts.map((part, i) => {
      if (i % 2 === 1) { // It's a reference number
        return (
          <span 
            key={i} 
            onClick={(e) => handleReferenceClick(e, part)}
            className="inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-md bg-gray-100/80 text-[10px] font-medium text-gray-500 hover:bg-gray-200 cursor-pointer mx-0.5 align-middle -translate-y-[1px] transition-colors"
          >
            {part}
          </span>
        );
      }
      
      // Parse Markdown formatting manually since we want to keep React node compatibility
      if (part.includes('**') || part.includes('#')) {
        // Split by lines to handle headers
        const lines = part.split('\n');
        return (
          <span key={i} className="flex flex-col gap-1">
            {lines.map((line, lineIdx) => {
              if (!line) return <br key={lineIdx} />;
              
              // Handle headers
              let isHeader = false;
              let headerLevel = 0;
              let lineContent = line;
              
              const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
              if (headerMatch) {
                isHeader = true;
                headerLevel = headerMatch[1].length;
                lineContent = headerMatch[2];
              }

              // Handle bold text
              const subParts = lineContent.split(/(\*\*.*?\*\*)/g);
              const formattedLine = subParts.map((subPart, j) => {
                if (subPart.startsWith('**') && subPart.endsWith('**')) {
                  return <strong key={j} className="font-semibold text-gray-900">{subPart.slice(2, -2)}</strong>;
                }
                return <span key={j}>{subPart}</span>;
              });

              if (isHeader) {
                const headerClasses = [
                  'text-2xl font-bold mt-4 mb-2 text-gray-900', // h1
                  'text-xl font-bold mt-3 mb-2 text-gray-900',  // h2
                  'text-lg font-bold mt-2 mb-1 text-gray-900',  // h3
                  'text-base font-bold mt-2 mb-1 text-gray-900',// h4
                  'text-sm font-bold mt-1 mb-1 text-gray-900',  // h5
                  'text-sm font-bold mt-1 mb-1 text-gray-500'   // h6
                ][headerLevel - 1];
                return <span key={lineIdx} className={`block ${headerClasses}`}>{formattedLine}</span>;
              }

              return <span key={lineIdx} className="block">{formattedLine}</span>;
            })}
          </span>
        );
      }
      
      if (part.includes('\n')) {
        return <span key={i} className="text-slate-700" dangerouslySetInnerHTML={{ __html: part.replace(/\n/g, '<br/>') }} />;
      }
      
      return <span key={i}>{part}</span>;
    });

    return (
      <div className="flex flex-col gap-4">
        {reasoningContent && (
          <div className="mb-2 w-full">
            <button
              onClick={() => msgId && toggleReasoning(msgId, isExpanded)}
              className="flex items-center gap-1.5 text-[13px] font-medium text-gray-500 hover:text-gray-700 transition-colors py-1"
            >
              {isThinking ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              {isThinking ? '思考中' : '已完成思考'}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
            <div 
              className={cn(
                "overflow-hidden transition-all duration-300 origin-top",
                isExpanded ? "max-h-[5000px] opacity-100 mt-2" : "max-h-0 opacity-0"
              )}
            >
              <div className="border-l-[3px] border-gray-200 pl-4 py-1 text-[14px] leading-relaxed text-gray-500 whitespace-pre-wrap font-mono">
                {reasoningContent.trimStart()}
              </div>
            </div>
          </div>
        )}
        {(content !== LOADING_STATE_TEXT && content.trim() !== '') ? <div>{renderedContent}</div> : (reasoningContent ? null : <LoadingDots />)}
        {showRecommendations && recommendedQuestions.length > 0 && (
          <div className="flex flex-col gap-2 mt-3">
            {recommendedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="group/rec flex items-center justify-between text-left w-fit max-w-full pl-4 pr-3 py-2.5 bg-gradient-to-r from-pink-50/60 to-violet-50/60 hover:from-pink-50 hover:to-violet-50 text-gray-700 hover:text-gray-900 text-[14px] rounded-2xl transition-all border border-pink-100/60 hover:border-violet-200 hover:shadow-[0_2px_8px_rgba(192,132,252,0.12)]"
              >
                <span className="truncate pr-3">{q}</span>
                <ArrowRight className="w-4 h-4 text-violet-300 shrink-0 transition-all group-hover/rec:text-violet-500 group-hover/rec:translate-x-0.5" />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    setActions(
      <div className="flex items-center gap-2 relative">
        <button 
          onClick={() => setShowHistoryModal(!showHistoryModal)}
          className={`p-2 rounded-lg transition-colors ${showHistoryModal ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
          title="历史聊天记录"
        >
          <History className="w-5 h-5" />
        </button>
        {showHistoryModal && (
          <div className="absolute top-full right-0 mt-2 w-[340px] bg-white rounded-2xl shadow-xl border border-gray-100 z-50 flex flex-col max-h-[600px] animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 pb-2">
              <h3 className="text-lg font-bold text-gray-900">聊天历史</h3>
              <button 
                onClick={() => setShowHistoryModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Tabs & Delete All */}
            <div className="flex items-center justify-between px-4 mb-2">
              <div className="flex items-center gap-4 border-b border-gray-100 w-full">
                <button 
                  onClick={() => setHistoryTab('all')}
                  className={`pb-2 text-[14px] font-bold relative ${historyTab === 'all' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  所有
                  {historyTab === 'all' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-t-full"></div>}
                </button>
                <button 
                  onClick={() => setHistoryTab('pinned')}
                  className={`pb-2 text-[14px] font-bold relative ${historyTab === 'pinned' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  我的收藏
                  {historyTab === 'pinned' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-t-full"></div>}
                </button>
                <button 
                  onClick={() => handleHistoryAction('clearAll')}
                  className="ml-auto mb-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="清空全部">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="px-4 mb-2">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="搜索" 
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-xl py-2 pl-9 pr-4 text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-visible overflow-x-hidden p-2 max-h-[450px] overflow-auto">
              {['今天', '昨天', '前天', '上周'].map(timeGroup => {
                const groupItems = filteredHistory.filter(i => i.time === timeGroup);
                if (groupItems.length === 0) return null;
                return (
                  <div key={timeGroup} className="mb-4 last:mb-0">
                    <div className="px-3 py-1.5 text-[12px] font-medium text-gray-400">{timeGroup}</div>
                    <div className="space-y-0.5">
                      {groupItems.map(item => (
                        <div 
                          key={item.id} 
                          onClick={() => handleLoadSession(item)}
                          className={`group relative p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors ${activeHistoryMenu === item.id ? 'z-[9999]' : 'z-0'} ${currentSessionId === item.id ? 'bg-blue-50/50' : ''}`}
                          onMouseLeave={() => setActiveHistoryMenu(null)}
                        >
                          <div className="pr-6">
                            {editingHistoryId === item.id ? (
                              <div className="mb-1" onClick={e => e.stopPropagation()}>
                                <input 
                                  type="text" 
                                  autoFocus
                                  value={editingHistoryTitle}
                                  onChange={e => setEditingHistoryTitle(e.target.value)}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                      handleHistoryAction('rename', item.id, editingHistoryTitle || item.title);
                                      setEditingHistoryId(null);
                                    } else if (e.key === 'Escape') {
                                      setEditingHistoryId(null);
                                    }
                                  }}
                                  onBlur={() => {
                                    handleHistoryAction('rename', item.id, editingHistoryTitle || item.title);
                                    setEditingHistoryId(null);
                                  }}
                                  className="w-full bg-white border border-blue-400 rounded px-2 py-0.5 text-[14px] font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                />
                              </div>
                            ) : (
                              <h4 className="text-[14px] font-bold text-gray-900 mb-1 line-clamp-1">{item.title}</h4>
                            )}
                            <p className="text-[12px] text-gray-500 line-clamp-1">{item.preview}</p>
                          </div>
                          
                          <div className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center transition-opacity bg-gradient-to-l from-gray-50 via-gray-50 to-transparent pl-4 py-1 ${activeHistoryMenu === item.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                            <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleHistoryAction('pin', item.id);
                                }}
                                className={`p-1.5 rounded-lg transition-colors ${item.isPinned ? 'text-orange-500' : 'text-gray-400 hover:text-orange-500 hover:bg-gray-100'}`}
                              >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill={item.isPinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                            </button>
                            <div className="relative">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (activeHistoryMenu === item.id) {
                                    setActiveHistoryMenu(null);
                                    setHistoryMenuCoords(null);
                                  } else {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const spaceBelow = window.innerHeight - rect.bottom;
                                    const menuHeight = 240; // Approximate height of the menu
                                    const showAbove = spaceBelow < menuHeight;
                                    
                                    setActiveHistoryMenu(item.id);
                                    setHistoryMenuCoords({ 
                                      x: rect.right, 
                                      y: showAbove ? rect.top : rect.bottom,
                                      showAbove
                                    });
                                  }
                                }}
                                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors relative z-[60]"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                              
                              {/* Use React Portal to escape all clipping containers */}
                              {activeHistoryMenu === item.id && historyMenuCoords && createPortal(
                                <>
                                  <div className="fixed inset-0 z-[9998]" onClick={(e) => { e.stopPropagation(); setActiveHistoryMenu(null); setHistoryMenuCoords(null); }}></div>
                                  <div 
                                    className="fixed w-36 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-gray-100 py-1.5 z-[9999]" 
                                    style={{ 
                                      top: historyMenuCoords.showAbove ? (historyMenuCoords.y - 240) : (historyMenuCoords.y + 4), 
                                      left: historyMenuCoords.x - 144 
                                    }}
                                  >
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(`${window.location.pathname}?session_id=${item.id}`, '_blank');
                                      setActiveHistoryMenu(null);
                                      setHistoryMenuCoords(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors text-left"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5 text-gray-400" /> 在新标签页打开
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const url = `${window.location.origin}${window.location.pathname}?session_id=${item.id}`;

                                      copyToClipboard(url).then((success) => {
                                        if (success) {
                                          setShareModalState({ isOpen: true, url, copied: true });
                                          setTimeout(() => {
                                            setShareModalState(prev => ({ ...prev, copied: false }));
                                          }, 2000);
                                        } else {
                                          setShareModalState({ isOpen: true, url, copied: false });
                                        }
                                      });
                                      
                                      setActiveHistoryMenu(null);
                                      setHistoryMenuCoords(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors text-left"
                                  >
                                    <LinkIcon className="w-3.5 h-3.5 text-gray-400" /> 复制链接
                                  </button>
                                  <div className="my-1 border-t border-gray-100"></div>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingHistoryId(item.id);
                                      setEditingHistoryTitle(item.title);
                                      setActiveHistoryMenu(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors text-left"
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> 重命名
                                  </button>
                                  <div className="my-1 border-t border-gray-100"></div>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleHistoryAction('delete', item.id);
                                      setActiveHistoryMenu(null);
                                      setHistoryMenuCoords(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-red-600 hover:bg-red-50 transition-colors text-left font-medium"
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg> 删除
                                  </button>
                                  </div>
                                </>,
                                document.body
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {filteredHistory.length === 0 && (
                <div className="py-12 text-center text-gray-400 text-sm">
                  没有找到匹配的历史记录
                </div>
              )}
            </div>
          </div>
        )}
        {messages.length > 0 && (
          <button 
            onClick={() => setIsRightPanelOpen(prev => !prev)}
            className={`p-2 rounded-lg transition-colors ${isRightPanelOpen ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
            title={isRightPanelOpen ? "收起侧边栏" : "展开侧边栏"}
          >
            <PanelRight className="w-5 h-5" />
          </button>
        )}
      </div>
    );
    return () => setActions(null);
  }, [setActions, isRightPanelOpen, setIsRightPanelOpen, messages.length, showHistoryModal, historyTab, historySearch, activeHistoryMenu, historyItems]);

  // Handle save to supabase whenever messages change
  useEffect(() => {
    const saveSession = async () => {
      if (messages.length === 0) return;
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const title = messages[0].content.substring(0, 100) || '新对话';
      // Find the last assistant message for preview, or use the first user message
      const lastModelMsg = [...messages].reverse().find(m => m.role === 'model');
      const preview = lastModelMsg 
        ? lastModelMsg.content.substring(0, 100) 
        : messages[0].content.substring(0, 100);

      if (currentSessionId) {
        // Update existing
        await supabase
          .from('chat_sessions')
          .update({
            title,
            preview,
            messages,
            active_models: activeModels,
            chat_mode: chatMode
          })
          .eq('id', currentSessionId);
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('chat_sessions')
          .insert([{
            user_id: session.user.id,
            title,
            preview,
            messages,
            active_models: activeModels,
            chat_mode: chatMode
          }])
          .select()
          .single();
          
        if (!error && data) {
          setCurrentSessionId(data.id);
        }
      }
    };
    
    // Use a small debounce to prevent too many writes while streaming
    const timer = setTimeout(() => {
      saveSession();
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [messages, activeModels, chatMode, currentSessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      const firstMessage = messages[0].content;
      const promptText = selectedScenario ? `${selectedScenario.text}：${firstMessage}` : firstMessage;
      // Increase length limit so CSS truncate can handle responsive shrinking
      const truncatedTitle = promptText.length > 100 ? promptText.substring(0, 100) + '...' : promptText;
      setTitle(truncatedTitle);
    } else {
      setTitle(null);
    }
    
    return () => setTitle(null);
  }, [messages, selectedScenario, setTitle]);

  const addModel = (modelName: string, color: string) => {
    if (!activeModels.find(m => m.name === modelName)) {
      const newModels = [...activeModels, { id: `m${Date.now()}`, name: modelName, avatar: color }];
      setActiveModels(newModels);
      if (newModels.length > 1 && !isCollaborative) {
        setIsCollaborative(true);
      }
    }
    setShowModelDropdown(false);
  };

  const removeModel = (id: string) => {
    if (activeModels.length > 1) {
      setActiveModels(activeModels.filter(m => m.id !== id));
    }
  };

  const updateModelConfig = (id: string, updates: Partial<ModelConfig>) => {
    setActiveModels(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    setConfiguringModel(prev => prev?.id === id ? { ...prev, ...updates } : prev);
  };

  const handleSend = (text: string = input, action?: 'start_workflow' | 'next_step') => {
    if (!text.trim() && !action) return;
    
    // Abort any ongoing requests if user sends a new message
    if (abortControllerRef.current) {
      // Abort without logging the error when the user explicitly triggers a new send
      abortControllerRef.current.abort('USER_INITIATED_NEW_MESSAGE');
      abortControllerRef.current = null;
    }
    
    let newMessages = [...messages];

    if (text.trim()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: text,
        kbs: selectedKBs.length > 0 ? [...selectedKBs] : undefined,
        skills: selectedSkills.length > 0 ? [...selectedSkills] : undefined,
        files: globalFiles.length > 0 ? [...globalFiles] : undefined,
        mentions: text.match(/@([^\s]+)/g)?.map(m => m.substring(1)) || undefined,
        quote: quote ? { text: quote.text, modelName: quote.modelName } : undefined
      };
      newMessages = [...newMessages, userMessage];
      setMessages(newMessages);
    }
    
    setInput('');
    setSelectedKBs([]);
    setSelectedSkills([]);
    setGlobalFiles([]);
    setQuote(null);
    
    // Explicitly trigger a save when the first message is sent
    if (newMessages.length === 1) {
      const saveInitialSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        
        const title = text.substring(0, 100) || '新对话';
        const preview = text.substring(0, 100);
        
        const { data, error } = await supabase
          .from('chat_sessions')
          .insert([{
            user_id: session.user.id,
            title,
            preview,
            messages: newMessages,
            active_models: activeModels,
            chat_mode: chatMode
          }])
          .select()
          .single();
          
        if (!error && data) {
          setCurrentSessionId(data.id);
          // Prepend the new session to the history list immediately
          setHistoryItems(prev => [{
            id: data.id,
            title: data.title,
            preview: data.preview,
            time: '今天',
            type: data.type,
            isPinned: data.is_pinned,
            messages: data.messages,
            active_models: data.active_models,
            chat_mode: data.chat_mode,
            created_at: data.created_at,
            updated_at: data.updated_at
          }, ...prev]);
        }
      };
      saveInitialSession();
    }
    
    if (messages.length === 0 && isCollaborative) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now().toString() + 1,
          role: 'system',
          content: '',
          type: 'workflow',
          modelName: '流程向导'
        }]);
      }, 500);
    } else if (action === 'start_workflow' || action === 'next_step') {
      const steps = getWorkflowData(selectedScenario?.text);
      const stepIndex = action === 'start_workflow' ? 0 : currentWorkflowStep + 1;
      setCurrentWorkflowStep(stepIndex);
      setIsWorkflowActive(true);
      const stepData = steps[stepIndex];

      if (!stepData) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: `msg_end_${Date.now()}`,
            role: 'system',
            modelName: '流程向导',
            content: `整个【${selectedScenario?.text || '讨论'}】流程已结束。您可以继续自由提问。`
          }]);
        }, 500);
        setIsWorkflowActive(false);
        return;
      }

      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `msg_div_${Date.now()}`,
          role: 'system',
          type: 'stage_divider',
          content: `第 ${stepIndex + 1} 步：${stepData.title}`
        }]);
        
        setTimeout(() => {
          const targetSpeakers = stepData.speakers;
          const modelsToSpeak = activeModels.filter(m => targetSpeakers.includes('All') || targetSpeakers.includes(m.nickname || m.name));
          
          if (modelsToSpeak.length === 0) {
            // Fallback if no matching models found for this step
            setTimeout(() => {
              setMessages(prev => [...prev, {
                id: `msg_sum_${Date.now()}`,
                role: 'system',
                type: 'stage_summary',
                modelName: '流程向导',
                content: `【${stepData.title}】环节各方发言已完毕。您可以补充观点、反驳对方，或确认无误后进入下一环节。`
              }]);
            }, 1000);
            return;
          }

          modelsToSpeak.forEach((model, index) => {
            setTimeout(() => {
              setMessages(prev => [...prev, {
                id: `msg_resp_${Date.now()}_${model.id}`,
                role: 'model',
                modelId: model.id,
                modelName: model.name,
                content: `【${stepData.title}】阶段发言：\n这是 ${model.nickname || model.name} 的回答。根据目前的案情与流程要求，我认为这涉及到几个关键因素[1]。首先，我们需要考虑到不同条件下的变量影响[2]。其次，长期观察表明，特定的策略能够显著提升整体效果[3]。此外，部分案例也反映出潜在的风险[4]。`
              }]);

              if (index === modelsToSpeak.length - 1) {
                setTimeout(() => {
                  setMessages(prev => [...prev, {
                    id: `msg_sum_${Date.now()}`,
                    role: 'system',
                    type: 'stage_summary',
                    modelName: '流程向导',
                    content: `【${stepData.title}】环节各方发言已完毕。您可以补充观点、反驳对方，或确认无误后进入下一环节。`
                  }]);
                }, 1500);
              }
            }, index * 1500);
          });
        }, 1000);
      }, 500);
    } else {
      // Simulate normal model responses
      const mentions = text.match(/@([^\s]+)/g)?.map(m => m.substring(1)) || [];
      let modelsToReply = activeModels;
      
      if (!isCollaborative && mentions.length > 0) {
        modelsToReply = activeModels.filter(m => mentions.includes(m.nickname || m.name));
        // If no matching models found from mentions, default to all models or handle differently?
        // Requirements say: "如果用户专门@了大模型，那只会有被@的大模型会回复"
        // If they mentioned something else, maybe no models reply? But usually we just filter.
        if (modelsToReply.length === 0) {
           modelsToReply = activeModels;
        }
      }

      setTimeout(() => {
        modelsToReply.forEach((model, index) => {
          setTimeout(async () => {
            // Add a loading message first
            const loadingMsgId = `msg_loading_${Date.now()}_${model.id}`;
            setMessages(prev => [...prev, {
              id: loadingMsgId,
              role: 'model',
              modelId: model.id,
              modelName: model.name,
              content: LOADING_STATE_TEXT // Or some loading indicator
            }]);

            let finalContent = chatMode === 'collaborative' 
              ? `这是 ${isAnonymous ? '匿名模型' : (model.nickname || model.name)} 的回答。关于“${text}”，我认为这涉及到几个关键因素[1]。首先，我们需要考虑到不同条件下的变量影响[2]。其次，长期观察表明，特定的策略能够显著提升整体效果[3]。此外，部分案例也反映出潜在的风险[4]。`
              : `关于“${text}”，我认为这涉及到几个关键因素[1]。首先，我们需要考虑到不同条件下的变量影响[2]。其次，长期观察表明，特定的策略能够显著提升整体效果[3]。此外，部分案例也反映出潜在的风险[4]。`;

            console.log('--- Debug Info ---');
            console.log('Model Name:', model.name);
            console.log('Chat Mode:', chatMode);
            console.log('Condition 1 (model.name.includes("Doubao-Seed-2.0-pro") || chatMode === "think"):', model.name.includes('Doubao-Seed-2.0-pro') || chatMode === 'think');

            // Real API Call for Doubao-Seed-2.0-pro or think mode (via Supabase Edge Function proxy)
            if (model.name.includes('Doubao-Seed-2.0-pro') || chatMode === 'think') {
              try {
                // Initialize AbortController
                abortControllerRef.current = new AbortController();
                const signal = abortControllerRef.current.signal;

                {
                  // Construct input for Responses API
                  const apiInput = [
                    { 
                      role: 'system', 
                      content: [
                        {
                          type: "input_text",
                          text: (model.role || '你是一个有用的AI助手。') + '\n\n【你的能力说明】\n1. 你支持联网搜索功能。如果用户询问实时信息或你不知道的信息，你可以提示用户"请在输入框左下角的模式切换菜单中开启「联网搜索」功能，开启后我即可为您查询最新信息"。\n2. 你支持多模态文档处理。如果用户询问你是否支持上传文件，请明确告知用户："我支持处理图片、视频、音频及文档等多种格式的文件（单文件最大30MB）。您可以通过输入框左侧的 📎 (附件) 按钮上传文件发给我"。' + '\n\n【格式硬性要求】\n你的回复必须严格分为两部分：\n（1）正文：自然回答用户的问题，可以在结尾反问一句以引导对话。\n（2）推荐问题：必须紧跟正文之后输出，且必须使用 <recommended_questions> 标签包裹一个 JSON 字符串数组，包含 3 个简短的推荐问题。\n\n严格示例格式（务必原样照抄标签，不可省略）：\n<recommended_questions>\n["问题1", "问题2", "问题3"]\n</recommended_questions>\n\n严禁只输出裸 JSON 数组而不带标签，否则前端无法识别。' + (chatMode === 'think' ? '\n请注意，由于当前处于思考模式，你必须在正式回复前进行深度思考，并将思考过程严格包裹在 <think> 和 </think> 标签中输出。推荐问题必须放在 </think> 标签之后的正式回复中。' : '\n请直接给出最终的正式回复，绝对不要输出任何思考、分析或解释过程，也不要使用 <think> 标签。')
                        }
                      ]
                    },
                    // Append previous chat history
                    ...messages.filter(m => m.role !== 'system' && m.type !== 'stage_divider' && m.type !== 'stage_summary' && m.type !== 'workflow').map(m => ({
                      role: m.role === 'model' ? 'assistant' : m.role,
                      content: [
                        {
                          type: "input_text",
                          text: m.content
                        }
                      ]
                    })),
                    { 
                      role: 'user', 
                      content: [
                        {
                          type: "input_text",
                          text: chatMode === 'think' 
                            ? `${text}\n\n(系统提示：当前处于思考模式，请务必先输出 <think> 标签进行深度思考，然后再输出正式回复。)` 
                            : chatMode === 'fast' 
                              ? `${text}\n\n(系统提示：快速模式，请用最精简的语言直接给出答案，不输出任何思考过程，正文不超过150字，然后追加推荐问题标签。)` 
                              : text
                        }
                      ]
                    }
                  ];

                  const response = await callDoubaoProxy({
                    input: apiInput,
                    stream: true,
                    tools: (isWebSearchEnabled || model.skills?.includes('联网搜索')) ? [{ type: "web_search" }] : undefined,
                    reasoning: chatMode === 'fast' ? { type: 'disabled' } : { type: 'enabled', effort: 'high' },
                    signal,
                  });
                  
                  if (response.ok && response.body) {
                    const reader = response.body.getReader();
                    const decoder = new TextDecoder('utf-8');
                    let done = false;
                    let rawContent = '';
                    let rawReasoning = '';

                    while (!done) {
                      const { value, done: readerDone } = await reader.read();
                      done = readerDone;
                      if (value) {
                        const chunk = decoder.decode(value, { stream: true });
                        const lines = chunk.split('\n');
                        for (const line of lines) {
                          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                            try {
                              const data = JSON.parse(line.slice(6));
                              // Ignore reasoning_content entirely in fast mode
                              
                              let reasoningDelta = '';
                              let delta = '';

                              // Handle Responses API event structure
                              if (data.type === 'response.output_text.delta') {
                                delta = data.delta;
                              } else if (data.type === 'response.output_reasoning.delta') {
                                reasoningDelta = data.delta;
                              }

                              // CRITICAL FIX: The new Responses API sends the reasoning text under `data.delta` directly 
                              // inside the `response.output_reasoning.delta` event type.
                              // Previously we missed setting `parsedReasoning` properly in the loop.

                              if (chatMode === 'fast') {
                                reasoningDelta = ''; // 理论上 disabled 后不再有此数据，此处作为双保险
                              }

                              if (reasoningDelta) {
                                rawReasoning += reasoningDelta;
                              }
                              
                              if (delta) {
                                rawContent += delta;
                              }

                              if (reasoningDelta || delta) {
                                let parsedReasoning = rawReasoning;
                                let parsedContent = rawContent;

                                // Always parse out <think> tags. 
                                // In fast mode, we just discard the reasoning part so it never shows up.
                                if (rawContent.includes('<think>')) {
                                  const parts = rawContent.split('<think>');
                                  parsedContent = parts[0];
                                  const remainder = parts.slice(1).join('<think>');
                                  if (remainder.includes('</think>')) {
                                    const endParts = remainder.split('</think>');
                                    if (chatMode !== 'fast') {
                                      parsedReasoning += (parsedReasoning ? '\n' : '') + endParts[0];
                                    }
                                    parsedContent += endParts.slice(1).join('</think>');
                                  } else {
                                    if (chatMode !== 'fast') {
                                      parsedReasoning += (parsedReasoning ? '\n' : '') + remainder;
                                    }
                                  }
                                }

                                setMessages(prev => prev.map(msg => 
                                  msg.id === loadingMsgId ? { 
                                    ...msg, 
                                    content: parsedContent.trim() ? parsedContent : LOADING_STATE_TEXT,
                                    reasoningContent: parsedReasoning || undefined
                                  } : msg
                                ));
                              }
                            } catch (e) {
                              // Ignore parse errors for incomplete chunks
                            }
                          }
                        }
                      }
                    }
                  } else {
                    console.error('API Error:', response.statusText);
                    finalContent = `调用大模型接口失败 (${response.status})，请检查 Edge Function 配置或网络。`;
                    setMessages(prev => prev.map(msg => 
                      msg.id === loadingMsgId ? { ...msg, content: finalContent } : msg
                    ));
                  }
                }
              } catch (error: any) {
                if (error.name === 'AbortError' || error === 'USER_INITIATED_NEW_MESSAGE') {
                  // Mute the abort message in the console if it was intentionally triggered by the user
                  if (error !== 'USER_INITIATED_NEW_MESSAGE') {
                    console.log('Fetch aborted for', model.name);
                  }
                  // Optional: Append a marker to show it was interrupted
                  setMessages(prev => prev.map(msg => 
                    msg.id === loadingMsgId && msg.content === LOADING_STATE_TEXT ? { ...msg, content: '（回复已中断）' } : msg
                  ));
                } else {
                  console.error('Fetch error:', error);
                  finalContent = '请求大模型服务时发生网络错误。';
                  setMessages(prev => prev.map(msg => 
                    msg.id === loadingMsgId ? { ...msg, content: finalContent } : msg
                  ));
                }
              }
            } else {
              // Update the message with dummy content for other models
              setMessages(prev => prev.map(msg => 
                msg.id === loadingMsgId ? { ...msg, content: finalContent } : msg
              ));
            }

            if (isWorkflowActive && index === modelsToReply.length - 1) {
              setTimeout(() => {
                const steps = getWorkflowData(selectedScenario?.text);
                const stepData = steps[currentWorkflowStep];
                if (stepData) {
                  setMessages(prev => [...prev, {
                    id: `msg_sum_supplement_${Date.now()}`,
                    role: 'system',
                    type: 'stage_summary',
                    modelName: '流程向导',
                    content: `【${stepData.title}】环节各方补充发言已完毕。您可以继续补充观点，或确认无误后进入下一环节。`
                  }]);
                }
              }, 1500);
            }
          }, index * 50);
        });
      }, 0);
    }
  };

  const handleScenarioClick = (scenario: typeof suggestions[0]) => {
    if (selectedScenario?.text === scenario.text) {
      // Toggle off if already selected
      setSelectedScenario(null);
      setInput('');
      setIsCollaborative(false);
      setChatMode('fast');
      setActiveModels([{ id: 'm1', name: 'Doubao-Seed-2.0-pro', avatar: 'bg-red-500', skills: [] }]);
      return;
    }

    setSelectedScenario(scenario);
    // Set group mode to collaborative
    setIsCollaborative(true);
    setChatMode('collaborative');
    setIsAnonymous(false);
    
    // Configure models based on scenario
    const newModels = scenario.models.map((m, idx) => ({
      id: `m_${Date.now()}_${idx}`,
      name: m.name,
      nickname: m.nickname,
      role: m.role,
      avatar: m.avatar,
      skills: m.skills
    }));
    
    // Ensure the single model dropdown defaults to a valid model if user switches back to single mode
    if (newModels.length > 0 && newModels[0].name !== 'Doubao-Seed-2.0-pro') {
        const availableModel = AVAILABLE_MODELS.find(m => !m.disabled) || AVAILABLE_MODELS[0];
        newModels[0].name = availableModel.name;
        newModels[0].avatar = availableModel.avatar;
    }
    
    setActiveModels(newModels);
    
    // Set prompt
    setInput(scenario.prompt + '\n\n');
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handleExampleClick = (example: string) => {
    if (!selectedScenario) return;
    setInput(selectedScenario.prompt + '\n\n' + example);
  };

  const ModelDropdown = ({ buttonContent, className = "" }: { buttonContent: React.ReactNode, className?: string }) => (
    <div className="relative inline-block">
      <button 
        onClick={() => setShowModelDropdown(!showModelDropdown)}
        className={className}
      >
        {buttonContent}
      </button>
      {showModelDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowModelDropdown(false)}></div>
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 lg:absolute lg:left-0 lg:bottom-full lg:mb-2 lg:-translate-x-0 w-48 bg-white rounded-xl shadow-lg border border-gray-100 p-2 z-50">
            <div className="text-xs font-semibold text-gray-400 px-3 pb-2 pt-1 uppercase tracking-wider">可选模型</div>
            <button onClick={() => addModel('Claude 3.5', 'bg-orange-500')} className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg text-[14px] text-slate-700 flex items-center gap-2 transition-colors">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div> Claude 3.5
            </button>
            <button onClick={() => addModel('Llama 3', 'bg-blue-500')} className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg text-[14px] text-slate-700 flex items-center gap-2 transition-colors">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div> Llama 3
            </button>
            <button onClick={() => addModel('Gemini 1.5', 'bg-purple-500')} className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg text-[14px] text-slate-700 flex items-center gap-2 transition-colors">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div> Gemini 1.5
            </button>
          </div>
        </>
      )}
    </div>
  );

  const AtDropdown = ({ onSelect, onClose, positionClass }: { onSelect: (item: string, type: 'kb'|'skill') => void, onClose: () => void, positionClass: string }) => {
    const [tab, setTab] = useState<'all' | 'file' | 'skill'>('all');
    const [search, setSearch] = useState('');
    const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({ '默认收藏夹': true });
    
    const kbFolders = [
      {
        name: '默认收藏夹',
        files: [
          { name: '开启你和AI共用的收藏夹.md' },
          { name: '2024行业研究报告.pdf' }
        ]
      },
      {
        name: '开发文档',
        files: [
          { name: '前端组件库规范.md' },
          { name: 'API接口定义.pdf' }
        ]
      }
    ];
    
    const skills = [
      { name: '随心写小说', icon: <div className="w-5 h-5 rounded-full overflow-hidden shrink-0"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=novel&backgroundColor=transparent" className="w-full h-full object-cover bg-orange-100" /></div> },
      { name: '产品经理百宝箱', icon: <div className="w-5 h-5 rounded-full overflow-hidden shrink-0"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=pm&backgroundColor=transparent" className="w-full h-full object-cover bg-green-100" /></div> },
      { name: '设计', icon: <div className="w-5 h-5 rounded-full overflow-hidden shrink-0"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=design&backgroundColor=transparent" className="w-full h-full object-cover bg-blue-100" /></div> },
      { name: 'PPT', icon: <div className="w-5 h-5 rounded-full shrink-0 bg-red-100 flex items-center justify-center text-red-500 text-[10px] font-bold">P</div> },
    ];

    return (
      <>
        <div className="fixed inset-0 z-40" onClick={onClose}></div>
        <div className={`absolute ${positionClass} bg-white rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.15)] border border-gray-100 w-64 z-50 flex flex-col`}>
          <div className="p-2 border-b border-gray-50">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded-lg">
              <Search className="w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="搜索技能/文件" 
                className="bg-transparent border-none outline-none text-[13px] w-full text-gray-700 placeholder:text-gray-400"
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          
          <div className="flex items-center p-1 border-b border-gray-50 gap-1 px-2">
            <button onClick={() => setTab('all')} className={`flex-1 py-1 text-[13px] font-medium rounded-md transition-all ${tab === 'all' ? 'bg-gray-100 text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>全部</button>
            <button onClick={() => setTab('file')} className={`flex-1 py-1 text-[13px] font-medium rounded-md transition-all ${tab === 'file' ? 'bg-gray-100 text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>知识库</button>
            <button onClick={() => setTab('skill')} className={`flex-1 py-1 text-[13px] font-medium rounded-md transition-all ${tab === 'skill' ? 'bg-gray-100 text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>技能</button>
          </div>
          
          <div className="max-h-[280px] overflow-y-auto p-2 pb-3">
            {(tab === 'all' || tab === 'file') && (
              <div className="mb-3">
                <div className="text-[12px] text-gray-400 px-2 mb-1">知识库</div>
                {kbFolders.map(folder => (
                  <div key={folder.name} className="mb-1">
                    <div className="flex items-center group">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedFolders(prev => ({ ...prev, [folder.name]: !prev[folder.name] }));
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded"
                      >
                        {expandedFolders[folder.name] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </button>
                      <button 
                        onClick={() => onSelect(folder.name, 'kb')} 
                        className="flex-1 flex items-center gap-2 px-1 py-1.5 hover:bg-gray-50 rounded-lg text-[13px] text-gray-700 transition-colors text-left"
                      >
                        <Folder className="w-4 h-4 text-blue-500" />
                        <span className="truncate font-medium">{folder.name}</span>
                      </button>
                    </div>
                    
                    {expandedFolders[folder.name] && (
                      <div className="pl-6 mt-0.5 space-y-0.5">
                        {folder.files.map(f => (
                          <button 
                            key={f.name} 
                            onClick={() => onSelect(f.name, 'kb')} 
                            className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded-lg text-[13px] text-gray-600 transition-colors text-left"
                          >
                            <FileText className="w-3.5 h-3.5 text-gray-400" />
                            <span className="truncate">{f.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {(tab === 'all' || tab === 'skill') && (
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <div className="text-[12px] text-gray-400 px-2 mb-1">最近用过的技能</div>
                  {skills.map(s => (
                    <button key={s.name} onClick={() => onSelect(s.name, 'skill')} className="w-full flex items-center gap-2.5 px-2 py-1.5 hover:bg-gray-50 rounded-lg text-[13px] text-gray-700 transition-colors text-left">
                      {s.icon}
                      <span className="truncate">{s.name}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <button 
                    onClick={() => {
                      window.location.href = '/AI-Workspace/expert/community?tab=skills';
                    }}
                    className="w-full py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-[13px] font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    发现更多技能
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  const renderContent = () => {
    // Calculate greeting based on local time
    const hour = new Date().getHours();
    let greeting = '';
    if (hour >= 6 && hour < 12) {
      greeting = '早上好';
    } else if (hour >= 12 && hour < 13) {
      greeting = '中午好';
    } else if (hour >= 13 && hour < 18) {
      greeting = '下午好';
    } else if (hour >= 18 && hour < 23) {
      greeting = '晚上好';
    } else {
      greeting = '夜深了';
    }

    // Landing View (No messages yet)
    if (messages.length === 0) {
      return (
      <div className="flex flex-col h-full bg-white overflow-hidden relative">
      {configuringModel && (
        <ModelConfigModal 
          configuringModel={configuringModel}
          setConfiguringModel={setConfiguringModel}
          updateModelConfig={updateModelConfig}
          isAnonymous={isAnonymous}
          activeModels={activeModels}
          setActiveModels={setActiveModels}
          availableModels={AVAILABLE_MODELS}
        />
      )}

      <div className="flex flex-col flex-1 px-6 pt-12 pb-6">
          {/* Header */}
          <div className="flex flex-col items-center justify-center flex-1">
            <div className="w-24 h-24 mb-4">
              <img 
                src="https://api.dicebear.com/7.x/bottts/svg?seed=turing&backgroundColor=transparent&primaryColor=1e293b" 
                alt="AI Assistant" 
                className="w-full h-full object-contain opacity-80"
              />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-3 text-center tracking-tight">{greeting}！工作难题交给我来搞定吧</h1>
            <p className="text-gray-500 text-base mb-6 text-center max-w-2xl font-normal">
              免费调用<span className="font-bold text-indigo-600 px-1">全网顶配 AI 模型</span>，解决你的工作痛点，还能赚取丰厚赏金！
            </p>
          </div>

          {/* Bottom Area: Suggestions + Input Box */}
          <div className="w-full max-w-[1200px] mx-auto flex flex-col gap-3 mt-auto">
            
            {/* Dynamic Suggestions Area */}
            {selectedScenario ? (
              <div className="grid grid-cols-3 gap-3 mb-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
                {selectedScenario.examples?.map((example, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleExampleClick(example)}
                    className="flex text-left items-start p-4 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 hover:shadow-[0_4px_20px_rgb(59,130,246,0.08)] transition-all group h-full"
                  >
                    <span className="text-[13px] text-slate-600 leading-relaxed group-hover:text-slate-900 transition-colors line-clamp-3 break-all">
                      {example}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap justify-start gap-2 mb-2 animate-in fade-in duration-300">
                {suggestions.map((s, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleScenarioClick(s)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded-full hover:bg-gray-100 transition-colors group"
                  >
                    <s.icon className="w-4 h-4 text-gray-500 group-hover:text-gray-700" strokeWidth={2} />
                    <span className="text-[13px] text-slate-700 font-medium">{s.text}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Big Input Box */}
            <div className="w-full bg-gray-50 rounded-3xl p-4 border border-gray-200 transition-all focus-within:bg-white focus-within:border-blue-400 focus-within:shadow-[0_4px_20px_rgb(59,130,246,0.08)] flex flex-col">
              
              {/* Top Tools & Active Scenario Tag */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1 text-gray-500 relative">
                  <button onClick={() => setShowLandingAtDropdown(true)} className="p-1.5 hover:bg-gray-200 hover:text-gray-700 rounded-lg transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                  {showLandingAtDropdown && (
                    <AtDropdown 
                      positionClass="left-0 bottom-full mb-2" 
                      onClose={() => setShowLandingAtDropdown(false)} 
                      onSelect={(item, type) => {
                        if (type === 'kb' && !selectedKBs.includes(item)) setSelectedKBs([...selectedKBs, item]);
                        if (type === 'skill' && !selectedSkills.includes(item)) setSelectedSkills([...selectedSkills, item]);
                        setShowLandingAtDropdown(false);
                      }} 
                    />
                  )}
                  <div className="relative group/upload">
                    <button 
                      onClick={() => globalFileInputRef.current?.click()} 
                      className="p-1.5 hover:bg-gray-200 hover:text-gray-700 rounded-lg transition-colors"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-[calc(100%+8px)] left-0 w-max px-3 py-2 bg-gray-800 text-white text-xs font-medium rounded-lg opacity-0 invisible group-hover/upload:opacity-100 group-hover/upload:visible transition-all z-50 shadow-lg pointer-events-none">
                      支持上传图片、视频、音频及文档，单文件最大 30MB
                      <div className="absolute -bottom-1 left-3 w-2 h-2 bg-gray-800 rotate-45"></div>
                    </div>
                  </div>
                  <input type="file" multiple className="hidden" ref={globalFileInputRef} onChange={handleGlobalFileUpload} />
                </div>
              </div>

              {/* Active Scenario / KBs / Skills / Files Tags inside input area */}
              {(selectedScenario || selectedKBs.length > 0 || selectedSkills.length > 0 || globalFiles.length > 0) && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {selectedScenario && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-xl text-[13px] font-medium shadow-sm animate-in fade-in zoom-in-95 duration-200">
                      {selectedScenario.icon && <selectedScenario.icon className="w-3.5 h-3.5" />}
                      {selectedScenario.text}
                      <button 
                        onClick={() => handleScenarioClick(selectedScenario)} // This toggles it off
                        className="ml-1 p-0.5 hover:bg-white/20 rounded-md transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  {selectedKBs.map(kb => (
                    <div key={kb} className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl text-[13px] font-medium shadow-sm animate-in fade-in zoom-in-95 duration-200">
                      <Database className="w-3.5 h-3.5" />
                      {kb}
                      <button 
                        onClick={() => setSelectedKBs(selectedKBs.filter(k => k !== kb))}
                        className="ml-1 p-0.5 hover:bg-blue-200/50 rounded-md transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {selectedSkills.map(skill => (
                    <div key={skill} className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl text-[13px] font-medium shadow-sm animate-in fade-in zoom-in-95 duration-200">
                      <Sparkles className="w-3.5 h-3.5" />
                      {skill}
                      <button 
                        onClick={() => setSelectedSkills(selectedSkills.filter(s => s !== skill))}
                        className="ml-1 p-0.5 hover:bg-blue-200/50 rounded-md transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {globalFiles.map(file => (
                    <div key={file} className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-[13px] font-medium shadow-sm animate-in fade-in zoom-in-95 duration-200">
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      {file}
                      <button 
                        onClick={() => setGlobalFiles(globalFiles.filter(f => f !== file))}
                        className="ml-1 p-0.5 hover:bg-slate-200/70 rounded-md transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="输入消息..."
                className="w-full h-24 resize-none outline-none text-[15px] leading-relaxed text-slate-700 placeholder:text-gray-400 bg-transparent"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />

              {/* Bottom Tools */}
              <div className="flex items-end justify-between mt-2 pt-2 gap-4">
                
                {/* Left side: scrollable models + add button */}
                <div className="flex-1 overflow-x-auto no-scrollbar pt-8 -mt-8 pointer-events-none relative z-[100]">
                  <div className="flex items-center gap-2 min-w-max pb-1 pointer-events-auto">
                    {/* Collaborative Mode: Show all active models and Add button */}
                    {chatMode === 'collaborative' ? (
                      <>
                        {activeModels.map(model => (
                          <div key={model.id} className="relative group">
                            <button 
                              onClick={() => setConfiguringModel(model)}
                              className="flex items-center bg-white border border-gray-200 rounded-full pl-2.5 pr-1 py-1 shadow-sm cursor-pointer hover:border-blue-400 transition-colors shrink-0"
                            >
                              <div className={`w-2 h-2 rounded-full ${isAnonymous ? 'bg-gray-400' : model.avatar} mr-1.5`}></div>
                              <span className="text-[13px] font-medium text-slate-700 mr-1.5">@{isAnonymous ? '匿名模型' : (model.nickname || model.name)}</span>
                              <div className="w-px h-3 bg-gray-200 mx-1"></div>
                              <div className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                                <Settings2 className="w-3 h-3" />
                              </div>
                            </button>
                            
                            {activeModels.length > 1 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeModel(model.id);
                                }}
                                className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gray-200 hover:bg-red-100 text-gray-500 hover:text-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10 shadow-sm"
                                title="移除角色"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                        ))}
                        
                        {/* Add New Role Button */}
                        <button
                          onClick={() => {
                            const colors = ['bg-green-500', 'bg-orange-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500'];
                            const newModel = { 
                              id: `m${Date.now()}`, 
                              name: 'GPT-4o', 
                              nickname: `新角色${activeModels.length + 1}`,
                              avatar: colors[activeModels.length % colors.length], 
                              skills: [] 
                            };
                            setActiveModels(prev => [...prev, newModel]);
                            setConfiguringModel(newModel);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 border-dashed rounded-full text-[13px] text-gray-500 font-medium hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          添加角色
                        </button>
                      </>
                    ) : (
                      /* Fast/Think Mode: Show single model dropdown */
                      <div className="relative" ref={singleModelDropdownRef}>
                        <button 
                          onClick={() => setShowSingleModelDropdown(!showSingleModelDropdown)}
                          className="flex items-center bg-white border border-gray-200 rounded-full pl-2.5 pr-2 py-1 shadow-sm cursor-pointer hover:border-blue-400 transition-colors shrink-0"
                        >
                          <div className={`w-2 h-2 rounded-full ${isAnonymous ? 'bg-gray-400' : (activeModels[0]?.avatar || 'bg-red-500')} mr-1.5`}></div>
                          <span className="text-[13px] font-medium text-slate-700 mr-1.5">@{isAnonymous ? '匿名模型' : (activeModels[0]?.name || 'Doubao-Seed-2.0-pro')}</span>
                          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                        
                        {showSingleModelDropdown && (
                          <div className="absolute top-full left-0 mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50">
                            <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-50 mb-1">
                              切换模型
                            </div>
                            {AVAILABLE_MODELS.map(model => (
                              <button
                                key={model.id}
                                onClick={() => {
                                  // Update the first active model or create a new one if none exists
                                  const updatedModels = [...activeModels];
                                  if (updatedModels.length > 0) {
                                    updatedModels[0] = { ...updatedModels[0], name: model.name, nickname: model.name, avatar: model.avatar };
                                  } else {
                                    updatedModels.push({
                                      id: `m${Date.now()}`,
                                      name: model.name,
                                      nickname: model.name,
                                      avatar: model.avatar,
                                      skills: []
                                    });
                                  }
                                  // Force slice to 1 model since we are in single mode
                                  setActiveModels(updatedModels.slice(0, 1));
                                  setShowSingleModelDropdown(false);
                                }}
                                disabled={model.disabled}
                                className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${model.disabled ? 'opacity-50 cursor-not-allowed text-gray-400' : (activeModels[0]?.name === model.name ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50')}`}
                              >
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${model.avatar}`}></div>
                                  <span>{model.name}</span>
                                </div>
                                {activeModels[0]?.name === model.name && <Check className="w-3.5 h-3.5" />}
                              </button>
                            ))}
                            <div className="h-px bg-gray-100 my-1"></div>
                            <button 
                              onClick={() => {
                                setConfiguringModel(activeModels[0]);
                                setShowSingleModelDropdown(false);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                              <Settings2 className="w-3.5 h-3.5" />
                              角色高级配置...
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side: toggles and send button */}
                <div className="flex items-center gap-2 shrink-0 pb-1">
                  {/* Mode Switcher */}
                  <div className="relative" ref={modeDropdownRef}>
                    <button 
                      onClick={() => setShowModeDropdown(!showModeDropdown)}
                      className={`flex items-center justify-center h-8 px-3 rounded-full transition-colors font-medium text-[13px] ${
                        chatMode === 'think' 
                          ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200'
                          : chatMode === 'collaborative'
                          ? 'text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-200'
                          : 'text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200'
                      }`}
                      title={`${chatMode === 'fast' ? '快速' : chatMode === 'think' ? '思考' : '多角色圆桌辩论'}${isWebSearchEnabled ? ' | 联网搜索' : ''}${isAnonymous ? ' | 盲测' : ''}${chatMode === 'collaborative' && !isCollaborative ? ' | 独立对比' : ''}`}
                    >
                      <div className="flex items-center gap-1.5">
                        {chatMode === 'fast' && <Zap className="w-4 h-4" />}
                        {chatMode === 'think' && <Atom className="w-4 h-4" />}
                        {chatMode === 'collaborative' && <Users2 className="w-4 h-4" />}
                        <span>{chatMode === 'fast' ? '快速' : chatMode === 'think' ? '思考' : '多角色'}</span>
                        
                        {/* Active toggle indicators */}
                        {(isAnonymous || (chatMode === 'collaborative' && !isCollaborative) || isWebSearchEnabled) && (
                          <div className="flex items-center gap-1.5 opacity-80">
                            <span className="opacity-50 text-[10px] mx-0.5">|</span>
                            {isAnonymous && <Ghost className="w-3.5 h-3.5" />}
                            {chatMode === 'collaborative' && !isCollaborative && <SplitSquareHorizontal className="w-3.5 h-3.5" />}
                            {isWebSearchEnabled && <Globe className="w-3.5 h-3.5" />}
                          </div>
                        )}

                        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                      </div>
                    </button>
                    {showModeDropdown && (
                      <div className="absolute bottom-full right-0 mb-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50">
                        {/* Mode Section */}
                        <div className="px-1.5 pb-1">
                          <button 
                            onClick={() => { setChatMode('fast'); setIsCollaborative(false); }}
                            className={`w-full flex items-center justify-between px-2.5 py-2 text-sm rounded-lg transition-colors ${chatMode === 'fast' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}
                          >
                            <div className="flex items-center gap-3">
                              <Zap className="w-4 h-4" />
                              <span className="font-medium">快速</span>
                            </div>
                            {chatMode === 'fast' && <Check className="w-4 h-4" />}
                          </button>
                          <button 
                            onClick={() => { setChatMode('think'); setIsCollaborative(false); }}
                            className={`w-full flex items-center justify-between px-2.5 py-2 text-sm rounded-lg transition-colors ${chatMode === 'think' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}
                          >
                            <div className="flex items-center gap-3">
                              <Atom className="w-4 h-4" />
                              <span className="font-medium">思考</span>
                            </div>
                            {chatMode === 'think' && <Check className="w-4 h-4" />}
                          </button>
                          <button 
                            onClick={() => { setChatMode('collaborative'); setIsCollaborative(true); }}
                            className={`w-full flex items-center justify-between px-2.5 py-2 text-sm rounded-lg transition-colors ${chatMode === 'collaborative' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}
                          >
                            <div className="flex items-center gap-3">
                              <Users2 className="w-4 h-4" />
                              <span className="font-medium">多角色圆桌辩论</span>
                            </div>
                            {chatMode === 'collaborative' && <Check className="w-4 h-4" />}
                          </button>
                        </div>
                        
                        {/* Divider */}
                        <div className="h-px bg-gray-100 my-1"></div>
                        
                        {/* Testing Section */}
                        <div className="px-1.5 pt-1">
                          <div className="relative group/tooltip-anonymous">
                            <label className="w-full flex items-center justify-between px-2.5 py-2 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors">
                              <div className={`flex items-center gap-3 text-sm transition-colors ${isAnonymous ? 'text-purple-600' : 'text-gray-700'}`}>
                                <Ghost className="w-4 h-4" />
                                <span className="font-medium">盲测</span>
                              </div>
                              <div className="relative inline-flex items-center">
                                <input type="checkbox" className="sr-only" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
                                <div className={`w-9 h-5 rounded-full transition-colors ${isAnonymous ? 'bg-purple-500' : 'bg-gray-200'}`}></div>
                                <div className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform shadow-md ${isAnonymous ? 'translate-x-4' : 'translate-x-0'}`}></div>
                              </div>
                            </label>
                          <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 w-48 bg-gray-900 text-white text-xs rounded-lg py-2 px-3 opacity-0 group-hover/tooltip-anonymous:opacity-100 pointer-events-none transition-opacity z-50 flex items-center shadow-xl">
                            <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45 rounded-sm"></div>
                            <span className="relative z-10">
                              {isAnonymous ? 
                                "隐藏所有模型名称和头像，强制客观评分。评测结束后方可揭晓真实身份。" : 
                                "显示所有模型名称和头像，进行公开对比评测。"
                              }
                            </span>
                          </div>
                        </div>
                          
                          {/* 独立对比开关，仅在多角色圆桌辩论模式下显示，且颜色统一为紫色 */}
                          {chatMode === 'collaborative' && (
                            <div className="relative group/tooltip-collab">
                              <label className={`w-full flex items-center justify-between px-2.5 py-2 cursor-pointer rounded-lg transition-colors hover:bg-gray-50`}>
                                <div className={`flex items-center gap-3 text-sm transition-colors ${!isCollaborative ? 'text-purple-600' : 'text-gray-700'}`}>
                                  <SplitSquareHorizontal className="w-4 h-4" />
                                  <span className="font-medium">独立对比</span>
                                </div>
                                <div className="relative inline-flex items-center">
                                  <input 
                                    type="checkbox" 
                                    className="sr-only" 
                                    checked={!isCollaborative} 
                                    onChange={(e) => {
                                      setIsCollaborative(!e.target.checked);
                                    }} 
                                  />
                                  <div className={`w-9 h-5 rounded-full transition-colors ${!isCollaborative ? 'bg-purple-500' : 'bg-gray-200'}`}></div>
                                  <div className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform shadow-md ${!isCollaborative ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                </div>
                              </label>
                              <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 w-48 bg-gray-900 text-white text-xs rounded-lg py-2 px-3 opacity-0 group-hover/tooltip-collab:opacity-100 pointer-events-none transition-opacity z-50 flex items-center shadow-xl">
                                <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45 rounded-sm"></div>
                                <span className="relative z-10">
                                  {!isCollaborative ? 
                                    "大家在各自的单间面对同一个问题闭卷考试，互不干扰。适合横向评测、对比不同模型的能力高低。" : 
                                    "大家在同一个会议室，多个大模型能看到彼此的发言，可以互相补充、反驳或启发。适合头脑风暴或角色扮演。"
                                  }
                                </span>
                              </div>
                            </div>
                          )}
                          
                          {/* 联网搜索开关 */}
                          <div className="relative group/tooltip-websearch mt-1">
                            <label className="w-full flex items-center justify-between px-2.5 py-2 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors">
                              <div className={`flex items-center gap-3 text-sm transition-colors ${isWebSearchEnabled ? 'text-blue-600' : 'text-gray-700'}`}>
                                <Globe className="w-4 h-4" />
                                <span className="font-medium">联网搜索</span>
                              </div>
                              <div className="relative inline-flex items-center">
                                <input type="checkbox" className="sr-only" checked={isWebSearchEnabled} onChange={(e) => setIsWebSearchEnabled(e.target.checked)} />
                                <div className={`w-9 h-5 rounded-full transition-colors ${isWebSearchEnabled ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                                <div className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform shadow-md ${isWebSearchEnabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
                              </div>
                            </label>
                            <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 w-48 bg-gray-900 text-white text-xs rounded-lg py-2 px-3 opacity-0 group-hover/tooltip-websearch:opacity-100 pointer-events-none transition-opacity z-50 flex items-center shadow-xl">
                              <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45 rounded-sm"></div>
                              <span className="relative z-10">
                                {isWebSearchEnabled ? 
                                  "已开启联网功能，模型会根据您的问题实时搜索全网最新资讯并整合回答。" : 
                                  "已关闭联网功能，模型仅根据其训练数据进行回答。响应速度更快。"
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleSend(input)}
                  disabled={!input.trim()}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all disabled:opacity-30 disabled:hover:bg-slate-900 shadow-sm transform active:scale-95 shrink-0"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="text-center text-[12px] text-gray-400 mt-1">
              内容由 AI 生成，请核实重要信息。
            </div>
          </div>
        </div>
      </div>
    );
  }

    // Chat View (After messages started)
    return (
      <div className="flex flex-col h-full bg-white overflow-hidden relative">
      {configuringModel && (
        <ModelConfigModal 
          configuringModel={configuringModel}
          setConfiguringModel={setConfiguringModel}
          updateModelConfig={updateModelConfig}
          isAnonymous={isAnonymous}
          activeModels={activeModels}
          setActiveModels={setActiveModels}
          availableModels={AVAILABLE_MODELS}
        />
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col items-center">
        <div className="w-full max-w-[1200px] space-y-6">
        {(() => {
          // Process messages to group independent model replies
          const processedMessages: any[] = [];
          let currentGroup: any[] = [];

          messages.forEach((msg, index) => {
            if (!isCollaborative && msg.role === 'model') {
              currentGroup.push(msg);
              // If it's the last message or the next message is not a model reply
              if (index === messages.length - 1 || messages[index + 1].role !== 'model') {
                processedMessages.push({ type: 'model_group', messages: [...currentGroup], id: `group_${msg.id}` });
                currentGroup = [];
              }
            } else {
              processedMessages.push(msg);
            }
          });

          return processedMessages.map((msgOrGroup: any) => {
            if (msgOrGroup.type === 'model_group') {
              return (
                <div key={msgOrGroup.id} className="flex flex-col gap-3 w-full">
                  <div className="flex gap-4 w-full justify-start overflow-x-auto pb-2">
                    {msgOrGroup.messages.map((msg: any) => (
                      <div key={msg.id} className={`flex gap-3 ${chatMode === 'collaborative' ? 'min-w-[300px] max-w-[400px]' : 'w-full'} flex-1 shrink-0 group`}>
                        {chatMode === 'collaborative' && (
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm ${isAnonymous ? 'bg-gray-400' : (activeModels.find(m => m.id === msg.modelId)?.avatar || 'bg-gray-800')}`}>
                            <Bot className="w-5 h-5" />
                          </div>
                        )}
                        <div className="w-full pt-1">
                          {chatMode === 'collaborative' && (
                            <div className="font-semibold text-[13px] mb-2 flex items-center justify-between">
                              <span className={isAnonymous ? 'text-gray-500' : 'text-gray-800'}>
                                {isAnonymous ? `匿名模型 ${msg.modelId?.slice(-2)}` : (activeModels.find(m => m.id === msg.modelId)?.nickname || msg.modelName)}
                                {!isAnonymous && activeModels.find(m => m.id === msg.modelId)?.nickname && (
                                  <span className="ml-2 text-xs font-normal text-gray-400">({msg.modelName})</span>
                                )}
                              </span>
                              {isAnonymous && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md font-medium">待投票</span>}
                            </div>
                          )}
                          <div 
                              className={`text-[15px] leading-relaxed whitespace-pre-wrap text-gray-700 ${chatMode === 'collaborative' ? 'border border-gray-100 bg-white rounded-2xl p-4 shadow-[0_2px_10px_rgb(0,0,0,0.02)] mt-1.5' : 'mt-1.5'}`}
                              onMouseUp={(e) => handleTextSelection(e, activeModels.find(m => m.id === msg.modelId)?.nickname || msg.modelName || '')}
                            >
                            {msg.quote && (
                              <div className="mb-3 px-3 py-2 border-l-[3px] rounded-r-xl bg-slate-50 border-blue-400">
                                <div className="text-[12px] mb-0.5 font-medium flex items-center gap-1.5 text-gray-600">
                                  <span className="font-semibold text-blue-600">@{msg.quote.modelName}</span>
                                </div>
                                <div className="text-[13px] line-clamp-2 text-gray-500">"{msg.quote.text}"</div>
                              </div>
                            )}
                            {msg.content === LOADING_STATE_TEXT && !msg.reasoningContent ? <LoadingDots /> : renderMessageContentWithRefs(msg.content, msg.reasoningContent, msg.id, messages.findIndex(m => m.id === msg.id) > messages.map(m=>m.role).lastIndexOf('user'))}
                          </div>
                          <div className="flex items-center gap-3 mt-3 text-gray-400">
                            {chatMode === 'collaborative' && (
                              <button
                                onClick={() => {
                                setIsRightPanelOpen(true);
                                setActiveRightTab('trajectory');
                                setTimeout(() => {
                                  const el = document.getElementById(`trajectory-${msg.modelName}`);
                                  if (el) {
                                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    el.classList.add('bg-indigo-50', 'ring-2', 'ring-indigo-400');
                                    setTimeout(() => {
                                      el.classList.remove('bg-indigo-50', 'ring-2', 'ring-indigo-400');
                                    }, 2000);
                                  }
                                }, 300);
                              }}
                              className="ml-auto flex items-center gap-1.5 text-[12px] text-indigo-500 hover:text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all font-medium"
                            >
                              <Activity className="w-3.5 h-3.5" />
                              定位操作轨迹
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {msgOrGroup.messages.length > 1 && groupVotes[msgOrGroup.id]?.submitted !== 'hidden' && chatMode === 'collaborative' && (
                    <div className={`flex flex-col items-center justify-center gap-3 mt-2 self-center max-w-[800px] w-full transition-all duration-500 ease-in-out ${groupVotes[msgOrGroup.id]?.submitted === 'hiding' ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} ${groupVotes[msgOrGroup.id]?.submitted ? '' : 'bg-slate-50/50 py-4 px-6 rounded-2xl border border-slate-100'}`}>
                      {groupVotes[msgOrGroup.id]?.submitted === true || groupVotes[msgOrGroup.id]?.submitted === 'hiding' ? (
                        <div className="w-full flex items-center justify-center p-3 text-[13px] bg-green-50/50 text-green-600 border border-green-100 rounded-xl font-medium gap-1.5 animate-in fade-in zoom-in-95 duration-300">
                          <Check className="w-4 h-4" />
                          反馈已提交，感谢您的评价！
                        </div>
                      ) : (
                        <>
                          <span className="text-[13px] font-medium text-slate-600">请评价本次模型表现，帮助我们持续优化：</span>
                          <div className="flex flex-wrap items-center justify-center gap-2">
                            {msgOrGroup.messages.map((msg: any, idx: number) => {
                              const isSelected = groupVotes[msgOrGroup.id]?.selection === msg.id;
                              return (
                                <button 
                                  key={msg.id}
                                  onClick={() => setGroupVotes(prev => ({ ...prev, [msgOrGroup.id]: { ...prev[msgOrGroup.id], selection: isSelected ? undefined : msg.id } }))}
                                  className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
                                    isSelected 
                                      ? 'border border-indigo-300 bg-indigo-50 text-indigo-600' 
                                      : 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50'
                                  }`}
                                >
                                  {isAnonymous ? `模型 ${msg.modelId?.slice(-2)}` : (activeModels.find(m => m.id === msg.modelId)?.nickname || msg.modelName)} 更好
                                </button>
                              );
                            })}
                            <div className="w-px h-4 bg-slate-300 mx-1"></div>
                            <button 
                              onClick={() => {
                                const isSelected = groupVotes[msgOrGroup.id]?.selection === 'equal';
                                setGroupVotes(prev => ({ ...prev, [msgOrGroup.id]: { ...prev[msgOrGroup.id], selection: isSelected ? undefined : 'equal' } }));
                              }}
                              className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
                                groupVotes[msgOrGroup.id]?.selection === 'equal'
                                  ? 'border border-blue-300 bg-blue-50 text-blue-600' 
                                  : 'bg-white text-slate-700 border border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50'
                              }`}
                            >
                              一样好
                            </button>
                          </div>
                          
                          {/* Reason Textarea - appears when an option is selected */}
                          {groupVotes[msgOrGroup.id]?.selection && (
                            <div className="w-full mt-2 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                              <textarea 
                                placeholder="请填写原因（选填），鼓励大家提供反馈..."
                                value={groupVotes[msgOrGroup.id]?.reason || ''}
                                onChange={(e) => setGroupVotes(prev => ({ ...prev, [msgOrGroup.id]: { ...prev[msgOrGroup.id], reason: e.target.value } }))}
                                className="w-full p-3 text-[13px] bg-white border border-gray-200 rounded-xl resize-none focus:outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-300 transition-all"
                                rows={2}
                              />
                              <div className="flex justify-end">
                                <button 
                                  onClick={() => {
                                    const currentVote = groupVotes[msgOrGroup.id];
                                    if (currentVote) {
                                      setGroupVotes(prev => ({ ...prev, [msgOrGroup.id]: { ...prev[msgOrGroup.id], submitted: true } }));
                                      setTimeout(() => {
                                        setGroupVotes(prev => ({ ...prev, [msgOrGroup.id]: { ...prev[msgOrGroup.id], submitted: 'hiding' as any } }));
                                      }, 2500);
                                      setTimeout(() => {
                                        setGroupVotes(prev => ({ ...prev, [msgOrGroup.id]: { ...prev[msgOrGroup.id], submitted: 'hidden' as any } }));
                                      }, 3000);
                                    }
                                  }}
                                  className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-[12px] font-medium hover:bg-indigo-700 transition-colors"
                                >
                                  提交反馈
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            }

            const msg = msgOrGroup;
            if (msg.type === 'stage_divider') {
              return (
                <div key={msg.id} className="w-full flex items-center justify-center my-6 opacity-70">
                  <div className="h-px bg-indigo-200 flex-1"></div>
                  <div className="px-4 text-[12px] font-bold text-indigo-500 tracking-wider">{msg.content}</div>
                  <div className="h-px bg-indigo-200 flex-1"></div>
                </div>
              );
            }
            
            return (
              <div key={msg.id} className={`flex gap-4 w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group`}>
                {msg.role !== 'user' && msg.modelName !== '流程向导' && chatMode === 'collaborative' && (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm ${msg.role === 'system' ? 'bg-indigo-600' : (isAnonymous ? 'bg-gray-400' : (activeModels.find(m => m.id === msg.modelId)?.avatar || 'bg-gray-800'))}`}>
                  <Bot className="w-5 h-5" />
                </div>
              )}
            
            <div className={`${msg.role === 'user' ? 'max-w-[85%] bg-blue-600 text-white shadow-sm rounded-2xl px-5 py-3.5' : msg.role === 'model' ? (chatMode === 'collaborative' ? 'max-w-[85%]' : 'w-full') + ' pt-1' : 'w-full pt-1'}`}>
              {msg.role === 'model' && chatMode === 'collaborative' && (
                <div className="font-semibold text-[13px] mb-2 flex items-center justify-between">
                  <span className={isAnonymous ? 'text-gray-500' : 'text-gray-800'}>
                    {isAnonymous ? `匿名模型 ${msg.modelId?.slice(-2)}` : (activeModels.find(m => m.id === msg.modelId)?.nickname || msg.modelName)}
                    {!isAnonymous && activeModels.find(m => m.id === msg.modelId)?.nickname && (
                      <span className="ml-2 text-xs font-normal text-gray-400">({msg.modelName})</span>
                    )}
                  </span>
                  {isAnonymous && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md font-medium">待投票</span>}
                </div>
              )}
              
              {msg.role === 'system' && (msg.type === 'questionnaire' || msg.type === 'workflow') && msg.modelName !== '流程向导' && (
                <div className="font-semibold text-[13px] mb-3 flex items-center justify-between text-gray-800 w-full">
                  <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-indigo-500" /> {msg.modelName}</span>
                  <span className="text-xs text-gray-400 font-normal flex items-center gap-2">
                    3 个工具调用，1 条过程消息 <ChevronDown className="w-3.5 h-3.5" />
                  </span>
                </div>
              )}

              {msg.type === 'stage_summary' ? (
                <div className="w-full my-2">
                  {msg.modelName !== '流程向导' && (
                    <div className="flex items-center py-3 text-sm text-slate-700 font-medium">
                      <Bot className="w-4 h-4 text-indigo-500 mr-2" />
                      {msg.modelName}
                    </div>
                  )}
                  <div className="py-2">
                    <p className="text-[14px] text-slate-600 leading-relaxed">{msg.content}</p>
                  </div>
                  <div className="flex items-center gap-3 py-3">
                    <button 
                      onClick={() => {
                        setInput('我有以下补充意见：\n');
                        setTimeout(() => textareaRef.current?.focus(), 0);
                      }}
                      className="text-[13px] text-indigo-600 bg-indigo-50 hover:bg-indigo-100 font-medium px-4 py-1.5 rounded-lg transition-colors"
                    >
                      补充 / 反驳
                    </button>
                    <button 
                      onClick={() => handleSend('确认无误，请进入下一环节。', 'next_step')}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 text-[13px] font-medium rounded-lg transition-colors shadow-sm"
                    >
                      <ArrowRight className="w-3.5 h-3.5" /> 确认进入下一步
                    </button>
                  </div>
                </div>
              ) : msg.type === 'workflow' ? (() => {
                const steps = getWorkflowData(selectedScenario?.text);
                return (
                  <div className="w-full my-2">
                    <div className="flex items-center py-3 text-sm text-slate-700 font-medium">
                      <Settings2 className="w-4 h-4 text-indigo-500 mr-2" />
                      讨论流程确认
                    </div>
                    <div className="py-2">
                      <p className="text-[13px] text-slate-500 mb-4">请确认以下 <span className="font-semibold text-slate-700">{selectedScenario?.text || '讨论'}</span> 流程，群内模型将按此顺序和逻辑进行发言：</p>
                      <div className="flex flex-col gap-3">
                        {steps.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <div className="flex flex-col items-center mt-0.5">
                              <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[11px] font-bold border border-indigo-100 shrink-0">{idx + 1}</div>
                              {idx < steps.length - 1 && (
                                <div className="w-px h-full bg-indigo-100 my-1 min-h-[20px]"></div>
                              )}
                            </div>
                            <div className="flex-1 pb-1">
                              <div className="text-[13px] font-semibold text-slate-700 leading-tight">{step.title}</div>
                              <div className="text-[12px] text-slate-500 mt-1 leading-relaxed">{step.desc}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Missing Roles Section */}
                    {(() => {
                      const requiredRoles = Array.from(new Set(steps.flatMap(s => s.speakers))).filter(role => role !== 'All' && role !== '系统');
                      const currentRoles = activeModels.map(m => m.nickname || m.name);
                      const missingRoles = requiredRoles.filter(r => !currentRoles.includes(r));
                      
                      if (missingRoles.length > 0) {
                        return (
                          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
                            <span className="text-[13px] font-medium text-slate-600 shrink-0">添加发言人：</span>
                            <div className="flex flex-wrap gap-2">
                              {missingRoles.map((role, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    // Add the missing role to activeModels and open config modal
                                    const colors = ['bg-green-500', 'bg-orange-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500'];
                                    setActiveModels(prev => {
                                      const newModel = { 
                                        id: `m${Date.now()}_${idx}`, 
                                        name: 'GPT-4o', 
                                        nickname: role,
                                        avatar: colors[prev.length % colors.length], 
                                        skills: [] 
                                      };
                                      setConfiguringModel(newModel);
                                      return [...prev, newModel];
                                    });
                                  }}
                                  className="flex items-center bg-white border border-gray-200 rounded-full pl-2.5 pr-1 py-1 shadow-sm relative group cursor-pointer hover:border-indigo-300 transition-colors"
                                >
                                  <div className={`w-2 h-2 rounded-full ${['bg-green-500', 'bg-orange-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500'][activeModels.length % 5]} mr-1.5`}></div>
                                  <span className="text-[13px] font-medium text-slate-700 mr-1.5">@{role}</span>
                                  <div className="w-px h-3 bg-gray-200 mx-1"></div>
                                  <div className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                                    <Settings2 className="w-3 h-3" />
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    <div className="flex items-center gap-3 py-4">
                      <button 
                        onClick={() => {
                          setInput('我想调整一下当前的讨论流程：\n1. ');
                          setTimeout(() => textareaRef.current?.focus(), 0);
                        }}
                        className="text-[13px] text-gray-500 hover:text-gray-700 font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        调整流程
                      </button>
                      <button 
                      onClick={() => handleSend('好的，流程确认无误，请按照既定流程开始。', 'start_workflow')}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 text-[13px] font-medium rounded-lg transition-colors shadow-sm"
                    >
                        <Check className="w-3.5 h-3.5" /> 确认并开始
                      </button>
                    </div>
                  </div>
                );
              })() : msg.type === 'questionnaire' ? (() => {
                const qData = getQuestionnaireData(selectedScenario?.text);
                return (
                  <div className="w-full my-2">
                    <div className="flex items-center justify-between py-3 text-sm text-slate-700 font-medium">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-gray-400" />
                        问题
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-xs">
                        <span>0 / 4</span>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="py-2">
                      <p className="text-[14px] font-bold text-slate-800 mb-4">{qData.question}</p>
                      <div className="space-y-2.5">
                        {qData.options.map((opt, idx) => (
                          <button key={idx} className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors text-left group">
                            <div className="w-6 h-6 rounded bg-gray-50 flex items-center justify-center text-xs font-medium text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                              {String.fromCharCode(65 + idx)}
                            </div>
                            <span className="text-[14px] text-slate-700">{opt}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 py-4">
                      <button className="text-[13px] text-gray-400 hover:text-gray-600 font-medium">跳过</button>
                      <button className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-[13px] font-medium rounded-lg transition-colors border border-indigo-100">
                        完成 <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })() : (
                <div 
                  className={`text-[15px] leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user' 
                      ? 'text-white' 
                      : msg.role === 'model'
                        ? chatMode === 'collaborative' ? 'text-gray-700 border border-gray-100 bg-white rounded-2xl p-4 shadow-[0_2px_10px_rgb(0,0,0,0.02)] mt-1.5' : 'text-gray-700 mt-1.5'
                        : 'text-gray-700'
                  }`}
                  onMouseUp={(e) => msg.role === 'model' ? handleTextSelection(e, activeModels.find(m => m.id === msg.modelId)?.nickname || msg.modelName || '') : undefined}
                >
                  {msg.quote && (
                    <div className={`mb-3 px-3 py-2 border-l-[3px] rounded-r-xl ${
                      msg.role === 'user' 
                        ? 'bg-white/10 border-white/40' 
                        : 'bg-slate-50 border-blue-400'
                    }`}>
                      <div className={`text-[12px] mb-0.5 font-medium flex items-center gap-1.5 ${
                        msg.role === 'user' ? 'text-white/80' : 'text-gray-600'
                      }`}>
                        <span className={`font-semibold ${msg.role === 'user' ? '' : 'text-blue-600'}`}>@{msg.quote.modelName}</span>
                      </div>
                      <div className={`text-[13px] line-clamp-2 ${
                        msg.role === 'user' ? 'text-white/70' : 'text-gray-500'
                      }`}>"{msg.quote.text}"</div>
                    </div>
                  )}
                  {msg.role === 'user' && (msg.kbs?.length || msg.skills?.length || msg.files?.length || msg.mentions?.length) ? (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {msg.mentions?.map(mention => (
                        <div key={mention} className="inline-flex items-center gap-0.5 px-2.5 py-1 bg-white/20 text-white rounded-full text-[12px] font-medium">
                          <span className="opacity-70">@</span>{mention}
                        </div>
                      ))}
                      {msg.kbs?.map(kb => (
                        <div key={kb} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 text-white rounded-lg text-[12px] font-medium">
                          <Database className="w-3 h-3" />
                          {kb}
                        </div>
                      ))}
                      {msg.skills?.map(skill => (
                        <div key={skill} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 text-white rounded-lg text-[12px] font-medium">
                          <Sparkles className="w-3 h-3" />
                          {skill}
                        </div>
                      ))}
                      {msg.files?.map(file => (
                        <div key={file} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 text-white rounded-lg text-[12px] font-medium">
                          <FileText className="w-3 h-3" />
                          {file}
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {msg.role === 'model' ? renderMessageContentWithRefs(msg.content, msg.reasoningContent, msg.id, messages.findIndex(m => m.id === msg.id) > messages.map(m=>m.role).lastIndexOf('user')) : msg.content}
                </div>
              )}
              
              {(msg.role === 'model' || (msg.role === 'system' && msg.type !== 'stage_summary' && msg.type !== 'stage_divider' && msg.type !== 'workflow' && msg.type !== 'questionnaire')) && (
                <div className="flex items-center gap-3 mt-3 text-gray-400">
                  {msg.role === 'model' && chatMode === 'collaborative' && (
                    <button
                      onClick={() => {
                        setIsRightPanelOpen(true);
                        setActiveRightTab('trajectory');
                        setTimeout(() => {
                          const el = document.getElementById(`trajectory-${msg.modelName}`);
                          if (el) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            el.classList.add('bg-indigo-50', 'ring-2', 'ring-indigo-400');
                            setTimeout(() => {
                              el.classList.remove('bg-indigo-50', 'ring-2', 'ring-indigo-400');
                            }, 2000);
                          }
                        }, 300);
                      }}
                      className="ml-auto flex items-center gap-1.5 text-[12px] text-indigo-500 hover:text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all font-medium"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      定位操作轨迹
                    </button>
                  )}
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-sm">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        );
        });
        })()}
        <div ref={chatEndRef} />
      </div>
      </div>

      {/* Selection Popover */}
      {selectionPopover?.show && (
        <div 
          id="selection-popover"
          className="fixed z-[100] flex items-center gap-1 px-2 py-1.5 bg-white rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.15)] border border-gray-100 transform -translate-x-1/2 translate-y-2 animate-in fade-in zoom-in-95 duration-200"
          style={{ left: selectionPopover.x, top: selectionPopover.y }}
        >
          <div className="flex items-center justify-center w-8 h-8 bg-slate-900 text-white rounded-full mr-1 shrink-0 overflow-hidden shadow-sm">
            <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4L4 18H20L12 4Z" stroke="white" strokeWidth="2.5" strokeLinejoin="round"/>
              <circle cx="12" cy="13" r="3.5" fill="#3B82F6"/>
            </svg>
          </div>
          <div className="w-px h-4 bg-gray-200 mx-1"></div>
          <button 
            onClick={() => handleQuoteAction('refute')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            反驳ta
          </button>
          <button 
            onClick={() => handleQuoteAction('supplement')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            补充观点
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-white relative shrink-0">
        <div className="max-w-[1200px] mx-auto w-full bg-gray-50 rounded-3xl p-4 border border-gray-200 transition-all focus-within:bg-white focus-within:border-blue-400 focus-within:shadow-[0_4px_20px_rgb(59,130,246,0.08)] flex flex-col relative">
          
          {/* Top Tools & Active Scenario Tag */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1 text-gray-500 relative">
              <button onClick={() => setShowChatAtDropdown(true)} className="p-1.5 hover:bg-gray-200 hover:text-gray-700 rounded-lg transition-colors">
                <Plus className="w-4 h-4" />
              </button>
              {showChatAtDropdown && (
                <AtDropdown 
                  positionClass="bottom-[100%] left-0 mb-2" 
                  onClose={() => setShowChatAtDropdown(false)} 
                  onSelect={(item, type) => {
                    if (type === 'kb' && !selectedKBs.includes(item)) setSelectedKBs([...selectedKBs, item]);
                    if (type === 'skill' && !selectedSkills.includes(item)) setSelectedSkills([...selectedSkills, item]);
                    setShowChatAtDropdown(false);
                  }} 
                />
              )}
              <div className="relative group/upload">
                <button 
                  onClick={() => globalFileInputRef.current?.click()} 
                  className="p-1.5 hover:bg-gray-200 hover:text-gray-700 rounded-lg transition-colors"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-max px-3 py-2 bg-gray-800 text-white text-xs font-medium rounded-lg opacity-0 invisible group-hover/upload:opacity-100 group-hover/upload:visible transition-all z-50 shadow-lg">
                  支持上传图片、视频、音频及文档，单文件最大 30MB
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                </div>
              </div>
            </div>
            
            {/* Fail Points Indicator */}
            {(() => {
              const modelNames = activeModels.map(m => m.nickname || m.name).filter(Boolean);
              const escapedNames = modelNames.map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
              const regex = new RegExp(`(@(?:${escapedNames.join('|')}))`, 'g');
              const mentions = input.match(regex) || [];
              const lastMention = mentions[mentions.length - 1];
              
              if (lastMention) {
                const modelName = lastMention.substring(1);
                return (
                  <div className="relative">
                    <button 
                      onClick={() => setShowFailPointsFor(modelName)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-full text-[12px] font-medium transition-colors"
                    >
                      <Target className="w-3.5 h-3.5" />
                      查看 {modelName} 翻车点
                    </button>
                    
                    {showFailPointsFor === modelName && (
                      <>
                        <div className="fixed inset-0 z-[60]" onClick={() => setShowFailPointsFor(null)}></div>
                        <div className="absolute bottom-[calc(100%+8px)] right-0 w-[320px] bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-red-100 z-[70] animate-in slide-in-from-bottom-2 fade-in duration-200">
                          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                            <div className="flex items-center gap-2 font-medium text-slate-800">
                              <div className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                                <Target className="w-3.5 h-3.5" />
                              </div>
                              高频翻车点
                            </div>
                            <button onClick={() => setShowFailPointsFor(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded-md transition-colors">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="p-4">
                            <div className="bg-red-50/50 border border-red-100 rounded-xl p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-slate-800 text-[14px]">长文本幻觉</span>
                                <span className="text-[12px] font-medium px-2 py-0.5 bg-red-100 text-red-600 rounded-md">错误率 58%</span>
                              </div>
                              <p className="text-[13px] text-slate-600 leading-relaxed">
                                在生成极长文本时，后期容易偏离初始设定或产生事实性错误。建议要求该模型提供明确的论据来源。
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              }
              return null;
            })()}
          </div>

          {/* KBs / Skills / Files Tags inside input area */}
          {(selectedKBs.length > 0 || selectedSkills.length > 0 || globalFiles.length > 0) && (
            <div className="mb-2 flex flex-wrap gap-2">
              {selectedKBs.map(kb => (
                <div key={kb} className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl text-[13px] font-medium shadow-sm animate-in fade-in zoom-in-95 duration-200">
                  <Database className="w-3.5 h-3.5" />
                  {kb}
                  <button 
                    onClick={() => setSelectedKBs(selectedKBs.filter(k => k !== kb))}
                    className="ml-1 p-0.5 hover:bg-blue-200/50 rounded-md transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {selectedSkills.map(skill => (
                <div key={skill} className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-50 text-violet-700 border border-violet-100 rounded-xl text-[13px] font-medium shadow-sm animate-in fade-in zoom-in-95 duration-200">
                  <Sparkles className="w-3.5 h-3.5" />
                  {skill}
                  <button 
                    onClick={() => setSelectedSkills(selectedSkills.filter(s => s !== skill))}
                    className="ml-1 p-0.5 hover:bg-violet-200/50 rounded-md transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {globalFiles.map(file => (
                <div key={file} className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-[13px] font-medium shadow-sm animate-in fade-in zoom-in-95 duration-200">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  {file}
                  <button 
                    onClick={() => setGlobalFiles(globalFiles.filter(f => f !== file))}
                    className="ml-1 p-0.5 hover:bg-slate-200/70 rounded-md transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Quote Area inside input box */}
          {quote && (
            <div className="mb-2 px-3 py-2 bg-white/50 border-l-[3px] border-blue-400 rounded-r-xl relative group shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
              <div className="text-[13px] text-gray-700 mb-0.5 font-medium flex items-center gap-1.5 overflow-hidden">
                <span className="text-blue-600 font-semibold shrink-0">@{quote.modelName}</span>
                <span className="text-gray-500 font-normal line-clamp-1 break-all truncate">"{quote.text}"</span>
              </div>
              <button 
                onClick={() => setQuote(null)}
                className="absolute top-1/2 -translate-y-1/2 right-2 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 rounded-md opacity-0 group-hover:opacity-100 transition-all bg-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="relative w-full">
            <div 
              ref={highlightRef}
              className={`absolute inset-0 pointer-events-none text-transparent z-0 ${sharedInputClasses}`}
              style={{
                height: input ? Math.min(128, Math.max(44, input.split('\n').length * 24 + 20)) + 'px' : '44px'
              }}
              aria-hidden="true"
            >
              {renderHighlightedInput()}
            </div>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onScroll={handleScroll}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className={`relative z-10 text-transparent caret-slate-700 placeholder:text-transparent ${sharedInputClasses}`}
              rows={1}
              style={{
                height: input ? Math.min(128, Math.max(44, input.split('\n').length * 24 + 20)) + 'px' : '44px'
              }}
            />
          </div>

          {/* Bottom Tools */}
          <div className="flex items-end justify-between mt-2 pt-2 gap-4">
            
            {/* Left side: scrollable models */}
            <div className={`flex-1 ${chatMode === 'collaborative' ? 'overflow-x-auto' : 'overflow-visible'} no-scrollbar pt-8 -mt-8 pointer-events-none relative z-[100]`}>
              <div className="flex items-center gap-2 min-w-max pb-1 pointer-events-auto">
                {chatMode === 'collaborative' && (
                  <span className="text-[13px] text-gray-500 font-medium mr-1 shrink-0">指定发言：</span>
                )}
                {/* Collaborative Mode: Show all active models and Add button */}
                {chatMode === 'collaborative' ? (
                  <>
                    {/* Active Models rendering */}
                    {activeModels.map(model => (
                      <div key={model.id} className="relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveModelDropdown(activeModelDropdown === model.id ? null : model.id);
                          }}
                          className="flex items-center bg-white border border-gray-200 rounded-full pl-2.5 pr-1 py-1 shadow-sm group cursor-pointer hover:border-blue-400 transition-colors shrink-0"
                        >
                          <div className={`w-2 h-2 rounded-full ${isAnonymous ? 'bg-gray-400' : model.avatar} mr-1.5`}></div>
                          <span className="text-[13px] font-medium text-slate-700 mr-1.5">@{isAnonymous ? '匿名模型' : (model.nickname || model.name)}</span>
                          <div className="w-px h-3 bg-gray-200 mx-1"></div>
                          <div className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                            <Settings2 className="w-3 h-3" />
                          </div>
                        </button>

                        {/* Model Dropdown Menu */}
                        {activeModelDropdown === model.id && (
                          <div className="absolute bottom-full mb-2 left-0 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-200">
                            <button 
                              onClick={() => {
                                setInput(prev => prev + `@${model.nickname || model.name} `);
                                setActiveModelDropdown(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <AtSign className="w-4 h-4 text-gray-400" />
                              <span>在输入框提及 (@)</span>
                            </button>
                            <button 
                              onClick={() => {
                                setConfiguringModel(model);
                                setActiveModelDropdown(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <Settings2 className="w-4 h-4 text-gray-400" />
                              <span>配置角色与技能</span>
                            </button>
                            {activeModels.length > 1 && (
                              <>
                                <div className="h-px bg-gray-100 my-1"></div>
                                <button 
                                  onClick={() => {
                                    setActiveModels(prev => prev.filter(m => m.id !== model.id));
                                    setActiveModelDropdown(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                  <span>移除该角色</span>
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Add New Role Button */}
                    <button
                      onClick={() => {
                        const colors = ['bg-green-500', 'bg-orange-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500'];
                        const newModel = { 
                          id: `m${Date.now()}`, 
                          name: 'GPT-4o', 
                          nickname: `新角色${activeModels.length + 1}`,
                          avatar: colors[activeModels.length % colors.length], 
                          skills: [] 
                        };
                        setActiveModels(prev => {
                          const newModels = [...prev, newModel];
                          if (newModels.length > 1 && chatMode !== 'collaborative') {
                            setChatMode('collaborative');
                            setIsCollaborative(true);
                          }
                          return newModels;
                        });
                        setConfiguringModel(newModel);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 border-dashed rounded-full text-[13px] text-gray-500 font-medium hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      添加角色
                    </button>
                  </>
                ) : (
                  /* Fast/Think Mode: Show single model dropdown */
                  <div className="relative" ref={singleModelDropdownRef}>
                    <button 
                      onClick={() => setShowSingleModelDropdown(!showSingleModelDropdown)}
                      className="flex items-center bg-white border border-gray-200 rounded-full pl-2.5 pr-2 py-1 shadow-sm cursor-pointer hover:border-blue-400 transition-colors shrink-0"
                    >
                      <div className={`w-2 h-2 rounded-full ${isAnonymous ? 'bg-gray-400' : (activeModels[0]?.avatar || 'bg-blue-500')} mr-1.5`}></div>
                      <span className="text-[13px] font-medium text-slate-700 mr-1.5">@{isAnonymous ? '匿名模型' : (activeModels[0]?.nickname || activeModels[0]?.name || 'GPT-4o')}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                    
                    {showSingleModelDropdown && (
                      <div className="absolute bottom-full left-0 mb-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-[120]">
                        <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-50 mb-1">
                          切换模型
                        </div>
                        {AVAILABLE_MODELS.map(model => (
                          <button
                            key={model.id}
                            onClick={() => {
                              const updatedModels = [...activeModels];
                              if (updatedModels.length > 0) {
                                updatedModels[0] = { ...updatedModels[0], name: model.name, nickname: model.name, avatar: model.avatar };
                              } else {
                                updatedModels.push({
                                  id: `m${Date.now()}`,
                                  name: model.name,
                                  nickname: model.name,
                                  avatar: model.avatar,
                                  skills: []
                                });
                              }
                              setActiveModels(updatedModels.slice(0, 1));
                              setShowSingleModelDropdown(false);
                            }}
                            disabled={model.disabled}
                            title={model.disabled ? '该模型暂未接入，敬请期待' : ''}
                            className={`w-full flex items-center justify-between px-3 py-1.5 text-sm transition-colors ${model.disabled ? 'opacity-50 cursor-not-allowed text-gray-400' : (activeModels[0]?.name === model.name ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50')}`}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${model.avatar}`}></div>
                              <span>{model.name}</span>
                            </div>
                            {activeModels[0]?.name === model.name && <Check className="w-3.5 h-3.5" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right side: send button */}
            <div className="flex items-center gap-2 shrink-0 pb-1">
              {/* Mode Switcher */}
              <div className="relative" ref={modeDropdownRef}>
                <button 
                  onClick={() => setShowModeDropdown(!showModeDropdown)}
                  className={`flex items-center justify-center h-8 px-3 rounded-full transition-colors font-medium text-[13px] ${
                    chatMode === 'think' 
                      ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200'
                      : chatMode === 'collaborative'
                      ? 'text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-200'
                      : 'text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200'
                  }`}
                  title={`${chatMode === 'fast' ? '快速' : chatMode === 'think' ? '思考' : '多角色圆桌辩论'}${isAnonymous ? ' | 盲测' : ''}${chatMode === 'collaborative' && !isCollaborative ? ' | 独立对比' : ''}`}
                >
                  <div className="flex items-center gap-1.5">
                    {chatMode === 'fast' && <Zap className="w-4 h-4" />}
                    {chatMode === 'think' && <Atom className="w-4 h-4" />}
                    {chatMode === 'collaborative' && <Users2 className="w-4 h-4" />}
                    <span>{chatMode === 'fast' ? '快速' : chatMode === 'think' ? '思考' : '多角色'}</span>
                    
                    {/* Active toggle indicators */}
                    {(isAnonymous || (chatMode === 'collaborative' && !isCollaborative) || isWebSearchEnabled) && (
                      <div className="flex items-center gap-1.5 opacity-80">
                        <span className="opacity-50 text-[10px] mx-0.5">|</span>
                        {isAnonymous && <Ghost className="w-3.5 h-3.5" />}
                        {chatMode === 'collaborative' && !isCollaborative && <SplitSquareHorizontal className="w-3.5 h-3.5" />}
                        {isWebSearchEnabled && <Globe className="w-3.5 h-3.5" />}
                      </div>
                    )}

                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </div>
                </button>
                {showModeDropdown && (
                  <div className="absolute bottom-full right-0 mb-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50">
                    {/* Mode Section */}
                    <div className="px-1.5 pb-1">
                      <button 
                        onClick={() => { setChatMode('fast'); setIsCollaborative(false); }}
                        title="直接输出最终结果，适合常规对话或简单问答。"
                        className={`w-full flex items-center justify-between px-2.5 py-2 text-sm rounded-lg transition-colors ${chatMode === 'fast' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        <div className="flex items-center gap-3">
                          <Zap className="w-4 h-4" />
                          <span className="font-medium">快速</span>
                        </div>
                        {chatMode === 'fast' && <Check className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => { setChatMode('think'); setIsCollaborative(false); }}
                        title="在正式回复前进行深度思考（CoT），适合代码编写或复杂推理逻辑。"
                        className={`w-full flex items-center justify-between px-2.5 py-2 text-sm rounded-lg transition-colors ${chatMode === 'think' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        <div className="flex items-center gap-3">
                          <Atom className="w-4 h-4" />
                          <span className="font-medium">思考</span>
                        </div>
                        {chatMode === 'think' && <Check className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => { setChatMode('collaborative'); setIsCollaborative(true); }}
                        title="大家在同一个会议室，多个大模型能看到彼此的发言，可以互相补充、反驳或启发。适合头脑风暴或角色扮演。"
                        className={`w-full flex items-center justify-between px-2.5 py-2 text-sm rounded-lg transition-colors ${chatMode === 'collaborative' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        <div className="flex items-center gap-3">
                          <Users2 className="w-4 h-4" />
                          <span className="font-medium">多角色圆桌辩论</span>
                        </div>
                        {chatMode === 'collaborative' && <Check className="w-4 h-4" />}
                      </button>
                    </div>
                    
                    {/* Divider */}
                    <div className="h-px bg-gray-100 my-1"></div>
                    
                    {/* Testing Section */}
                    <div className="px-1.5 pt-1">
                      {/* 联网搜索开关 */}
                      <div className="relative group/tooltip-websearch">
                        <label className="w-full flex items-center justify-between px-2.5 py-2 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors">
                          <div className={`flex items-center gap-3 text-sm transition-colors ${isWebSearchEnabled ? 'text-blue-600' : 'text-gray-700'}`}>
                            <Globe className="w-4 h-4" />
                            <span className="font-medium">联网搜索</span>
                          </div>
                          <div className="relative inline-flex items-center">
                            <input type="checkbox" className="sr-only" checked={isWebSearchEnabled} onChange={(e) => setIsWebSearchEnabled(e.target.checked)} />
                            <div className={`w-9 h-5 rounded-full transition-colors ${isWebSearchEnabled ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                            <div className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform shadow-md ${isWebSearchEnabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
                          </div>
                        </label>
                        <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 w-48 bg-gray-900 text-white text-xs rounded-lg py-2 px-3 opacity-0 group-hover/tooltip-websearch:opacity-100 pointer-events-none transition-opacity z-50 flex items-center shadow-xl">
                          <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45 rounded-sm"></div>
                          <span className="relative z-10">
                            {isWebSearchEnabled ? 
                              "已开启联网功能，模型会根据您的问题实时搜索全网最新资讯并整合回答。" : 
                              "已关闭联网功能，模型仅根据其训练数据进行回答。响应速度更快。"
                            }
                          </span>
                        </div>
                      </div>

                      <div className="relative group/tooltip-anonymous2">
                        <label className="w-full flex items-center justify-between px-2.5 py-2 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors">
                          <div className={`flex items-center gap-3 text-sm transition-colors ${isAnonymous ? 'text-purple-600' : 'text-gray-700'}`}>
                            <Ghost className="w-4 h-4" />
                            <span className="font-medium">盲测</span>
                          </div>
                          <div className="relative inline-flex items-center">
                            <input type="checkbox" className="sr-only" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
                            <div className={`w-9 h-5 rounded-full transition-colors ${isAnonymous ? 'bg-purple-500' : 'bg-gray-200'}`}></div>
                            <div className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform shadow-md ${isAnonymous ? 'translate-x-4' : 'translate-x-0'}`}></div>
                          </div>
                        </label>
                          <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 w-48 bg-gray-900 text-white text-xs rounded-lg py-2 px-3 opacity-0 group-hover/tooltip-anonymous2:opacity-100 pointer-events-none transition-opacity z-50 flex items-center shadow-xl">
                            <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45 rounded-sm"></div>
                            <span className="relative z-10">
                              {isAnonymous ? 
                                "隐藏所有模型名称和头像，强制客观评分。评测结束后方可揭晓真实身份。" : 
                                "显示所有模型名称和头像，进行公开对比评测。"
                              }
                            </span>
                          </div>
                        </div>
                      
                      {/* 独立对比开关，仅在多角色圆桌辩论模式下显示，且颜色统一为紫色 */}
                      {chatMode === 'collaborative' && (
                        <div className="relative group/tooltip-collab2">
                          <label className={`w-full flex items-center justify-between px-2.5 py-2 cursor-pointer rounded-lg transition-colors hover:bg-gray-50`}>
                            <div className={`flex items-center gap-3 text-sm transition-colors ${!isCollaborative ? 'text-purple-600' : 'text-gray-700'}`}>
                              <SplitSquareHorizontal className="w-4 h-4" />
                              <span className="font-medium">独立对比</span>
                            </div>
                            <div className="relative inline-flex items-center">
                              <input 
                                type="checkbox" 
                                className="sr-only" 
                                checked={!isCollaborative} 
                                onChange={(e) => {
                                  setIsCollaborative(!e.target.checked);
                                }} 
                              />
                              <div className={`w-9 h-5 rounded-full transition-colors ${!isCollaborative ? 'bg-purple-500' : 'bg-gray-200'}`}></div>
                              <div className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform shadow-md ${!isCollaborative ? 'translate-x-4' : 'translate-x-0'}`}></div>
                            </div>
                          </label>
                          <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 w-48 bg-gray-900 text-white text-xs rounded-lg py-2 px-3 opacity-0 group-hover/tooltip-collab2:opacity-100 pointer-events-none transition-opacity z-50 flex items-center shadow-xl">
                            <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45 rounded-sm"></div>
                            <span className="relative z-10">
                              {!isCollaborative ? 
                                "大家在各自的单间面对同一个问题闭卷考试，互不干扰。适合横向评测、对比不同模型的能力高低。" : 
                                "大家在同一个会议室，多个大模型能看到彼此的发言，可以互相补充、反驳或启发。适合头脑风暴或角色扮演。"
                              }
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="w-px h-4 bg-gray-300 mx-1"></div>

              <button
                onClick={() => handleSend(input)}
                disabled={!input.trim()}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all disabled:opacity-30 disabled:hover:bg-slate-900 shadow-sm transform active:scale-95 shrink-0"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="text-center text-[12px] text-gray-400 mt-2">
          内容由 AI 生成，请核实重要信息。
        </div>
        
        {isAnonymous && (
          <div className="text-center mt-3">
            <button className="text-sm text-purple-600 font-medium hover:text-purple-700 bg-purple-50 px-4 py-1.5 rounded-full transition-colors border border-purple-100">
              盲测结束，点击揭晓模型身份并投票
            </button>
          </div>
        )}
      </div>
    </div>
  );
  };

  return (
    <div className="flex w-full h-[calc(100vh-64px)] overflow-hidden bg-slate-50 relative">
      <div className={`flex flex-col h-full transition-all duration-300 ${isRightPanelOpen ? 'w-[calc(100%-600px)] border-r border-gray-200' : 'w-full'}`}>
        {renderContent()}
      </div>

      {isRightPanelOpen && (
        <div className="w-[600px] fixed top-0 right-0 h-screen bg-white flex flex-col shadow-[-4px_0_15px_rgba(0,0,0,0.02)] z-[60] animate-in slide-in-from-right-8 duration-300">
          <div className="h-16 border-b border-gray-100 flex items-center justify-between px-4 shrink-0 bg-white">
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setActiveRightTab('artifacts')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeRightTab === 'artifacts' ? 'bg-gray-100 text-gray-800' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              >
                <FileText className="w-4 h-4" />
                产物
              </button>
              <button 
                onClick={() => setActiveRightTab('trajectory')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeRightTab === 'trajectory' ? 'bg-gray-100 text-gray-800' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              >
                <Activity className="w-4 h-4" />
                操作轨迹
              </button>
              <button 
                onClick={() => setActiveRightTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeRightTab === 'preview' ? 'bg-gray-100 text-gray-800' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              >
                <Globe className="w-4 h-4" />
                预览
              </button>
              <button 
                onClick={() => setActiveRightTab('references')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeRightTab === 'references' ? 'bg-gray-100 text-gray-800' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              >
                <BookOpen className="w-4 h-4" />
                参考文献
              </button>
            </div>
            <button onClick={() => setIsRightPanelOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden bg-slate-50/50">
            {activeRightTab === 'artifacts' && (
              <div className="flex h-full">
                {/* Sidebar */}
                <div className="w-48 border-r border-gray-100 flex flex-col bg-gray-50/30">
                  <div className="p-3 text-xs font-medium text-gray-400">工作空间</div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                    {/* Mock Tree */}
                    <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer text-sm text-gray-700 group">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="truncate flex-1">商业合同违约案分析报告.pdf</span>
                      <div className="w-2 h-2 rounded-full bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity" title="Generated by GPT-4o"></div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer text-sm text-gray-700 group">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="truncate flex-1">法庭辩论策略思维导图.xmind</span>
                      <div className="w-2 h-2 rounded-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" title="Generated by Claude 3.5"></div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-200/50 cursor-pointer text-sm text-gray-800 font-medium group">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="truncate flex-1">expert-history.json</span>
                      <div className="w-2 h-2 rounded-full bg-green-500 transition-opacity" title="Generated by GPT-4o"></div>
                    </div>
                  </div>
                </div>
                {/* Editor */}
                <div className="flex-1 bg-white flex flex-col">
                  <div className="h-10 border-b border-gray-100 flex items-center px-3 bg-gray-50/50">
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-gray-200 rounded-md text-sm text-gray-700 shadow-sm">
                      <span className="text-yellow-500 font-mono">{"{}"}</span>
                      expert-history.json
                      <X className="w-3 h-3 text-gray-400 ml-1 hover:text-gray-600 cursor-pointer" />
                    </div>
                  </div>
                  <div className="flex-1 p-4 font-mono text-[13px] text-gray-600 overflow-y-auto bg-[#fafafa] leading-relaxed">
                    <pre>
{`{
  "version": 2,
  "sessions": {
    "dc7a4f6ca5dd4f4db5713522d5a2a4e8": [
      {
        "expertId": "ContentCreator",
        "name": "Kai",
        "profession": "内容创作专家"
      }
    ]
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>
            )}
            
            {activeRightTab === 'trajectory' && (
              <div className="h-full overflow-y-auto p-6 bg-slate-50">
                <div className="relative">
                  <div className="absolute top-0 bottom-0 left-4 w-px bg-gray-200"></div>
                  <div className="space-y-6 relative">
                    <div id="trajectory-GPT-4o" className="flex gap-4 transition-all duration-500 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white shrink-0 z-10 ring-4 ring-slate-50">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="flex-1 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-sm text-gray-800">GPT-4o (肿瘤科专家)</span>
                          <span className="text-xs text-gray-400">10:42:15</span>
                        </div>
                        <div className="text-sm text-gray-600 mb-3">开始思考治疗方案，需要查询最新文献...</div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <Database className="w-3.5 h-3.5 text-blue-500" />
                            <span className="text-gray-600">检索知识库: <span className="font-medium">医学诊疗指南2024版</span></span>
                            <span className="ml-auto text-green-500 flex items-center gap-1"><Check className="w-3 h-3" /> 成功 (1.2s)</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                            <span className="text-gray-600">调用技能: <span className="font-medium">联网搜索</span> (关键词: "靶向药 最新进展")</span>
                            <span className="ml-auto text-green-500 flex items-center gap-1"><Check className="w-3 h-3" /> 成功 (2.5s)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div id="trajectory-Claude 3.5" className="flex gap-4 transition-all duration-500 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white shrink-0 z-10 ring-4 ring-slate-50">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="flex-1 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-sm text-gray-800">Claude 3.5 (心血管专家)</span>
                          <span className="text-xs text-gray-400">10:42:20</span>
                        </div>
                        <div className="text-sm text-gray-600 mb-3">分析心肺承受能力数据...</div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <Cpu className="w-3.5 h-3.5 text-orange-500" />
                            <span className="text-gray-600">执行代码: <span className="font-medium">计算心衰指数风险模型.py</span></span>
                            <span className="ml-auto text-green-500 flex items-center gap-1"><Check className="w-3 h-3" /> 成功 (0.8s)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeRightTab === 'preview' && (
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 p-2 border-b border-gray-200 bg-white">
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                    <button className="p-1.5 text-gray-300 rounded"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                  <div className="flex-1 flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200 focus-within:border-blue-400 focus-within:bg-white transition-colors">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <input type="text" className="flex-1 bg-transparent text-[13px] text-gray-700 outline-none" placeholder="搜索或输入网址" defaultValue="https://turing-arena.example.com/preview" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"><RotateCw className="w-4 h-4" /></button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"><Globe className="w-4 h-4" /></button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"><Maximize2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="flex-1 flex items-center justify-center bg-white m-2 border border-gray-100 rounded-xl shadow-sm">
                  <div className="text-gray-400 text-sm">暂无预览链接</div>
                </div>
              </div>
            )}

            {activeRightTab === 'references' && (
              <div className="flex flex-col h-full bg-white relative">
                {/* References Header */}
                <div className="px-6 py-4 border-b border-gray-100 shrink-0">
                  <div className="text-sm text-gray-400">4 个来源</div>
                </div>

                {/* References List */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-8 custom-scrollbar pb-24">
                  {/* Reference Item 1 (From KB) */}
                  <div id="ref-1" className="flex gap-4 p-2 -mx-2 rounded-xl transition-colors">
                    <span className="text-sm font-bold text-gray-900 mt-1 flex items-center gap-2">
                      {isRefSelectionMode && (
                        <input 
                          type="checkbox" 
                          checked={selectedRefs.includes('1')} 
                          onChange={(e) => {
                            if (e.target.checked) setSelectedRefs(prev => [...prev, '1']);
                            else setSelectedRefs(prev => prev.filter(id => id !== '1'));
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer" 
                        />
                      )}
                      1.
                    </span>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-[15px] font-bold text-gray-900 leading-tight hover:text-blue-600 cursor-pointer transition-colors">
                          Social Connectedness and Local Contagion
                        </h4>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">
                            <Database className="w-3 h-3" /> 知识库
                          </span>
                        </div>
                      </div>
                      <p className="text-[13px] text-gray-500">社会联系和地方传染</p>
                      <div className="flex flex-wrap gap-2 items-center">
                        <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                          <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white">C</div>
                          <span className="text-[11px] text-gray-600">C. Matthew Leister</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                          <div className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center text-[10px] text-white">Y</div>
                          <span className="text-[11px] text-gray-600">Yves Zenou</span>
                        </div>
                        <span className="text-[11px] text-gray-400">+1</span>
                      </div>
                      <div className="flex items-center gap-2 text-[12px] text-gray-400">
                        <span>2021.05.10</span>
                        <span>·</span>
                        <div className="flex items-center gap-1">
                          <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 text-[10px]">T</span>
                          </div>
                          <span>The Review of Econo...</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reference Item 2 (From Web Search) */}
                  <div id="ref-2" className="flex gap-4 p-2 -mx-2 rounded-xl transition-colors">
                    <span className="text-sm font-bold text-gray-900 mt-1 flex items-center gap-2">
                      {isRefSelectionMode && (
                        <input 
                          type="checkbox" 
                          checked={selectedRefs.includes('2')} 
                          onChange={(e) => {
                            if (e.target.checked) setSelectedRefs(prev => [...prev, '2']);
                            else setSelectedRefs(prev => prev.filter(id => id !== '2'));
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer" 
                        />
                      )}
                      2.
                    </span>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-[15px] font-bold text-gray-900 leading-tight hover:text-blue-600 cursor-pointer transition-colors">
                          The rise of domestic capital markets for corporate financing: Lessons from East Asia
                        </h4>
                        <div className="flex flex-col items-end gap-1.5 shrink-0 relative">
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-orange-50 text-orange-600 border border-orange-100">
                            <Globe className="w-3 h-3" /> 联网搜索
                          </span>
                          {!addedRefs['2'] ? (
                            <>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveKbDropdown(activeKbDropdown === '2' ? null : '2');
                                }} 
                                className="text-[11px] text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
                              >
                                <PlusCircle className="w-3 h-3" /> 加入知识库
                              </button>
                              {activeKbDropdown === '2' && (
                                <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-200">
                                  <div className="px-3 py-1.5 text-xs font-medium text-gray-400 border-b border-gray-100 mb-1">选择知识库文件夹</div>
                                  {dummyKBs.map(kb => (
                                    <button 
                                      key={kb}
                                      onClick={() => {
                                        setAddedRefs({...addedRefs, '2': true});
                                        setActiveKbDropdown(null);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors text-left truncate"
                                    >
                                      <Folder className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                      <span className="truncate">{kb}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </>
                          ) : (
                            <span className="text-[11px] text-green-600 flex items-center gap-1 font-medium">
                              <Check className="w-3 h-3" /> 已加入
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-[13px] text-gray-500">国内资本市场用于企业融资的崛起：来自东亚的经验教训</p>
                      <div className="flex flex-wrap gap-2 items-center">
                        <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                          <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-[10px] text-white">F</div>
                          <span className="text-[11px] text-gray-600">Facundo Abraham</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                          <div className="w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center text-[10px] text-white">J</div>
                          <span className="text-[11px] text-gray-600">Juan J. Cortina</span>
                        </div>
                        <span className="text-[11px] text-gray-400">+1</span>
                      </div>
                      <div className="flex items-center gap-2 text-[12px] text-gray-400">
                        <span>2021.01.01</span>
                        <span>·</span>
                        <div className="flex items-center gap-1">
                          <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 text-[10px]">J</span>
                          </div>
                          <span>Journal of Banking &...</span>
                        </div>
                        <span className="text-gray-300">( IS 3.8 )</span>
                      </div>
                    </div>
                  </div>

                  {/* Reference Item 3 (From Local File) */}
                  <div id="ref-3" className="flex gap-4 p-2 -mx-2 rounded-xl transition-colors">
                    <span className="text-sm font-bold text-gray-900 mt-1 flex items-center gap-2">
                      {isRefSelectionMode && (
                        <input 
                          type="checkbox" 
                          checked={selectedRefs.includes('3')} 
                          onChange={(e) => {
                            if (e.target.checked) setSelectedRefs(prev => [...prev, '3']);
                            else setSelectedRefs(prev => prev.filter(id => id !== '3'));
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer" 
                        />
                      )}
                      3.
                    </span>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-[15px] font-bold text-gray-900 leading-tight hover:text-blue-600 cursor-pointer transition-colors">
                          A simple parameter-driven binary time series model
                        </h4>
                        <div className="flex flex-col items-end gap-1.5 shrink-0 relative">
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100">
                            <UploadCloud className="w-3 h-3" /> 本地上传
                          </span>
                          {!addedRefs['3'] ? (
                            <>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveKbDropdown(activeKbDropdown === '3' ? null : '3');
                                }} 
                                className="text-[11px] text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
                              >
                                <PlusCircle className="w-3 h-3" /> 加入知识库
                              </button>
                              {activeKbDropdown === '3' && (
                                <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-200">
                                  <div className="px-3 py-1.5 text-xs font-medium text-gray-400 border-b border-gray-100 mb-1">选择知识库文件夹</div>
                                  {dummyKBs.map(kb => (
                                    <button 
                                      key={kb}
                                      onClick={() => {
                                        setAddedRefs({...addedRefs, '3': true});
                                        setActiveKbDropdown(null);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors text-left truncate"
                                    >
                                      <Folder className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                      <span className="truncate">{kb}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </>
                          ) : (
                            <span className="text-[11px] text-green-600 flex items-center gap-1 font-medium">
                              <Check className="w-3 h-3" /> 已加入
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-[13px] text-gray-500">一个简单的参数驱动二元时间序列模型</p>
                      <div className="flex flex-wrap gap-2 items-center">
                        <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                          <div className="w-4 h-4 rounded-full bg-pink-500 flex items-center justify-center text-[10px] text-white">Y</div>
                          <span className="text-[11px] text-gray-600">Yang Lu</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[12px] text-gray-400">
                        <span>2019.11.06</span>
                        <span>·</span>
                        <div className="flex items-center gap-1">
                          <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                            <span className="text-red-600 text-[10px]">J</span>
                          </div>
                          <span>Journal of Forecasting</span>
                        </div>
                        <span className="text-gray-300">( IS 2.7 )</span>
                      </div>
                    </div>
                  </div>

                  {/* Reference Item 4 (From Web Search) */}
                  <div id="ref-4" className="flex gap-4 p-2 -mx-2 rounded-xl transition-colors">
                    <span className="text-sm font-bold text-gray-900 mt-1 flex items-center gap-2">
                      {isRefSelectionMode && (
                        <input 
                          type="checkbox" 
                          checked={selectedRefs.includes('4')} 
                          onChange={(e) => {
                            if (e.target.checked) setSelectedRefs(prev => [...prev, '4']);
                            else setSelectedRefs(prev => prev.filter(id => id !== '4'));
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer" 
                        />
                      )}
                      4.
                    </span>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-[15px] font-bold text-gray-900 leading-tight hover:text-blue-600 cursor-pointer transition-colors">
                          Stock liquidity and corporate diversification: Evidence from China's split share structure reform
                        </h4>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-orange-50 text-orange-600 border border-orange-100">
                            <Globe className="w-3 h-3" /> 联网搜索
                          </span>
                          {!addedRefs['4'] ? (
                            <button onClick={() => setAddedRefs({...addedRefs, '4': true})} className="text-[11px] text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-colors">
                              <PlusCircle className="w-3 h-3" /> 加入知识库
                            </button>
                          ) : (
                            <span className="text-[11px] text-green-600 flex items-center gap-1 font-medium">
                              <Check className="w-3 h-3" /> 已加入
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-[13px] text-gray-500">股票流动性与公司多元化：来自中国股权分置改革的证据</p>
                      <div className="flex flex-wrap gap-2 items-center">
                        <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                          <div className="w-4 h-4 rounded-full bg-cyan-500 flex items-center justify-center text-[10px] text-white">L</div>
                          <span className="text-[11px] text-gray-600">Lifeng Gu</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                          <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] text-white">Y</div>
                          <span className="text-[11px] text-gray-600">Yixin Wang</span>
                        </div>
                        <span className="text-[11px] text-gray-400">+2</span>
                      </div>
                      <div className="flex items-center gap-2 text-[12px] text-gray-400">
                        <span>2018.12.01</span>
                        <span>·</span>
                        <div className="flex items-center gap-1">
                          <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 text-[10px]">J</span>
                          </div>
                          <span>Journal of Empirical ...</span>
                        </div>
                        <span className="text-gray-300">( IS 2.4 )</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fixed Footer Actions */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 flex items-center justify-center gap-3">
                  {!isRefSelectionMode ? (
                    <button onClick={() => setIsRefSelectionMode(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
                      <Search className="w-4 h-4" />
                      多文献对话
                    </button>
                  ) : (
                    <div className="flex items-center justify-between w-full px-2 animate-in fade-in duration-200">
                      <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={selectedRefs.length === 4}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedRefs(['1', '2', '3', '4']);
                            else setSelectedRefs([]);
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer" 
                        />
                        全选
                      </label>
                      <div className="text-sm text-gray-500">已选 <span className="text-blue-600 font-medium">{selectedRefs.length}</span> 个</div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            setIsRefSelectionMode(false);
                            setSelectedRefs([]);
                          }} 
                          className="px-4 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          取消
                        </button>
                        <button 
                          onClick={() => {
                            // Open new browser tab to the notebook page
                            const baseUrl = import.meta.env.BASE_URL;
                            const path = `${baseUrl}notebook/new?refs=${selectedRefs.join(',')}`.replace(/\/\//g, '/');
                            window.open(path, '_blank');
                            
                            // Optional: Reset selection mode after opening
                            setIsRefSelectionMode(false);
                            setSelectedRefs([]);
                          }}
                          disabled={selectedRefs.length === 0} 
                          className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                        >
                          多篇文献对话
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Share Modal */}
      {shareModalState.isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-[480px] max-w-full overflow-hidden font-sans" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Turing Arena 提醒</h2>
              <button 
                onClick={() => setShareModalState(prev => ({ ...prev, isOpen: false }))}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-[15px] text-gray-600 leading-relaxed mb-6">
                该链接是公开的，任何人拿到链接均可查看完整的对话内容，请注意不要泄露敏感信息。
              </p>
              
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1.5 pl-4 gap-3">
                <div className="flex-1 text-[14px] text-gray-600 font-medium truncate select-all">
                  {shareModalState.url}
                </div>
                <button
                  onClick={() => {
                    copyToClipboard(shareModalState.url).then(() => {
                      setShareModalState(prev => ({ ...prev, copied: true }));
                      setTimeout(() => {
                        setShareModalState(prev => ({ ...prev, copied: false }));
                      }, 2000);
                    });
                  }}
                  className={`flex items-center justify-center gap-1.5 px-5 py-2 rounded-lg text-[14px] font-bold transition-all min-w-[100px] shrink-0 ${
                    shareModalState.copied 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                  }`}
                >
                  {shareModalState.copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      复制
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
