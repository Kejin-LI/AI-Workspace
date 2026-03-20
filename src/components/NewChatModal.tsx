import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, 
  Paperclip, 
  Settings,
  Grid,
  Zap,
  CheckCircle,
  X,
  Briefcase,
  Scale,
  Code,
  Globe,
  Monitor,
  GraduationCap,
  FlaskConical,
  Stethoscope,
  BookOpen,
  MoreHorizontal,
  TrendingUp,
  FileSpreadsheet,
  FileText,
  PenTool,
  Search,
  Sparkles,
  Cpu,
  Star,
  Image
} from 'lucide-react';
import { cn } from '../lib/utils';

const MODELS = [
  { id: 'gpt-4', name: 'GPT-4' },
  { id: 'claude-3-5', name: 'Claude 3.5' },
  { id: 'gemini-pro', name: 'Gemini Pro' },
  { id: 'llama-3', name: 'Llama 3' },
];

const DOMAINS = [
  { id: 'business', name: '商业与金融', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  { id: 'legal', name: '法律', icon: Scale, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  { id: 'stem', name: '理工科 (STEM)', icon: Code, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  { id: 'social-science', name: '社会科学', icon: Globe, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  { id: 'software-ai', name: '软件与AI', icon: Monitor, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200' },
  { id: 'education', name: '教育', icon: GraduationCap, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  { id: 'natural-science', name: '自然科学', icon: FlaskConical, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { id: 'medical', name: '医疗', icon: Stethoscope, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  { id: 'humanities', name: '人文社科', icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  { id: 'other', name: '其他', icon: MoreHorizontal, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' },
];

const SKILLS = [
  // Business
  { id: 'market-analysis', name: '市场分析', icon: TrendingUp, domainId: 'business' },
  { id: 'financial-modeling', name: '财务建模', icon: FileSpreadsheet, domainId: 'business' },
  { id: 'report-writing', name: '报告撰写', icon: FileText, domainId: 'business' },
  // Legal
  { id: 'case-research', name: '案例检索', icon: Search, domainId: 'legal' },
  { id: 'contract-review', name: '合同审查', icon: FileText, domainId: 'legal' },
  { id: 'legal-drafting', name: '法律文书', icon: PenTool, domainId: 'legal' },
  // Medical
  { id: 'clinical-diagnosis', name: '临床诊断', icon: Stethoscope, domainId: 'medical' },
  { id: 'literature-review', name: '文献综述', icon: BookOpen, domainId: 'medical' },
  { id: 'case-report', name: '病例报告', icon: FileText, domainId: 'medical' },
  // STEM
  { id: 'code-generation', name: '代码生成', icon: Code, domainId: 'stem' },
  { id: 'algorithm-design', name: '算法设计', icon: Cpu, domainId: 'stem' },
  { id: 'data-analysis', name: '数据分析', icon: TrendingUp, domainId: 'stem' },
  // Humanities
  { id: 'creative-writing', name: '创意写作', icon: PenTool, domainId: 'humanities' },
  { id: 'translation', name: '翻译', icon: Globe, domainId: 'humanities' },
  { id: 'content-creation', name: '内容创作', icon: Sparkles, domainId: 'humanities' },
  // Social Science
  { id: 'social-research', name: '社会调研', icon: TrendingUp, domainId: 'social-science' },
  { id: 'policy-analysis', name: '政策分析', icon: FileText, domainId: 'social-science' },
  // Software & AI
  { id: 'code-review', name: '代码审查', icon: Code, domainId: 'software-ai' },
  { id: 'prompt-engineering', name: '提示词工程', icon: Sparkles, domainId: 'software-ai' },
  // Education
  { id: 'curriculum-design', name: '课程设计', icon: BookOpen, domainId: 'education' },
  { id: 'tutoring', name: '辅导', icon: GraduationCap, domainId: 'education' },
  // Natural Science
  { id: 'lab-report', name: '实验报告', icon: FlaskConical, domainId: 'natural-science' },
  { id: 'data-processing', name: '数据处理', icon: FileSpreadsheet, domainId: 'natural-science' },
  // Other
  { id: 'general-task', name: '通用任务', icon: CheckCircle, domainId: 'other' },
];

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewChatModal({ isOpen, onClose }: NewChatModalProps) {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  
  // New State for Model, Skill, File Upload
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showDomainDropdown, setShowDomainDropdown] = useState(false);
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [showError, setShowError] = useState(false);
  const [mode, setMode] = useState<'text' | 'image' | 'mixed'>('text');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Knowledge base at mentions
  const [showKnowledgeMention, setShowKnowledgeMention] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [selectedKnowledgeDocs, setSelectedKnowledgeDocs] = useState<Array<{id: string, name: string}>>([]);

  const KNOWLEDGE_DOCS = [
    { id: 'sp1', name: '我的数字分身 (李珂瑾)', type: 'SP', isPublic: false, isSp: true },
    { id: 'k1', name: '2024大语言模型安全评测基准', type: 'PDF', isPublic: true },
    { id: 'k2', name: '生物HLE竞赛评测指南', type: 'PDF', isPublic: true },
    { id: 'k3', name: '代码评估安全合规清单', type: 'DOCX', isPublic: true },
    { id: 'k4', name: '医疗实体抽取专家共识_2023版', type: 'PDF', isPublic: true },
    { id: 'p1', name: '我的私有大数法则研究笔记', type: 'MD', isPublic: false },
    { id: 'p2', name: '个人整理_高频错题集', type: 'XLSX', isPublic: false },
  ];

  if (!isOpen) return null;

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);

    // Check for '@' symbol
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursorPosition);
    
    const lastAtMatch = textBeforeCursor.match(/@(\w*)$/);
    if (lastAtMatch) {
      setMentionQuery(lastAtMatch[1]);
      setShowKnowledgeMention(true);
      
      // Calculate basic position
      if (textareaRef.current) {
        const rect = textareaRef.current.getBoundingClientRect();
        setMentionPosition({
          top: rect.top,
          left: rect.left + 20
        });
      }
    } else {
      setShowKnowledgeMention(false);
    }
  };

  const selectKnowledgeDoc = (doc: typeof KNOWLEDGE_DOCS[0]) => {
    // Replace the '@...' with the doc name wrapped in brackets
    const cursorPosition = textareaRef.current?.selectionStart || input.length;
    const textBeforeCursor = input.slice(0, cursorPosition);
    const textAfterCursor = input.slice(cursorPosition);
    
    const newTextBeforeCursor = textBeforeCursor.replace(/@\w*$/, `【${doc.name}】 `);
    setInput(newTextBeforeCursor + textAfterCursor);
    
    if (!selectedKnowledgeDocs.find(d => d.id === doc.id)) {
      setSelectedKnowledgeDocs([...selectedKnowledgeDocs, doc]);
    }
    
    setShowKnowledgeMention(false);
    
    // Focus back on textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.selectionStart = newTextBeforeCursor.length;
        textareaRef.current.selectionEnd = newTextBeforeCursor.length;
      }
    }, 0);
  };

  const handleStart = () => {
    if (!selectedDomain) {
      setShowDomainDropdown(true);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }
    if (!input.trim() && files.length === 0) return;
    
    // Auto-select models logic
    let finalModels = [...selectedModels];
    if (finalModels.length === 0) {
      // 1. If no model selected, select the first two
      finalModels = [MODELS[0].id, MODELS[1].id];
    } else if (finalModels.length === 1) {
      // 2. If only one selected, select another one (first available that isn't already selected)
      const available = MODELS.find(m => m.id !== finalModels[0]);
      if (available) {
        finalModels.push(available.id);
      }
    }

    onClose();
    navigate('/expert/sandbox', { 
      state: { 
        prompt: input,
        models: finalModels,
        domain: selectedDomain,
        skills: selectedSkills,
        files: files,
        task: { 
             title: input.substring(0, 20) + "...",
             domain: selectedDomain,
             description: input
        },
        mode: 'free'
      } 
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleStart();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const toggleModel = (modelId: string) => {
    setSelectedModels(prev => {
      if (prev.includes(modelId)) {
        return prev.filter(id => id !== modelId);
      }
      if (prev.length >= 2) {
        return prev;
      }
      return [...prev, modelId];
    });
  };

  const selectDomain = (domainId: string) => {
    setSelectedDomain(domainId);
    setSelectedSkills([]); 
    setShowDomainDropdown(false);
    setShowSkillDropdown(true);
  };

  const toggleSkill = (skillId: string) => {
    setSelectedSkills(prev => 
      prev.includes(skillId) 
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
    );
  };

  const filteredSkills = selectedDomain 
    ? SKILLS.filter(skill => skill.domainId === selectedDomain)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-[800px] animate-in fade-in zoom-in duration-200 relative"
        onClick={(e) => {
          e.stopPropagation();
          if (showModelDropdown) setShowModelDropdown(false);
          if (showDomainDropdown) setShowDomainDropdown(false);
          if (showSkillDropdown) setShowSkillDropdown(false);
        }}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">发起新对话</h2>

          {/* Main Input Card */}
          <div className="w-full relative group">
            <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm transition-all">
              
              {/* Tabs Header */}
              <div className="flex items-center gap-1 border-b border-gray-100 px-6 pt-4">
                <button 
                  onClick={() => setMode('text')}
                  className={cn(
                    "flex items-center gap-2 pb-3 px-2 text-sm font-medium transition-all relative",
                    mode === 'text' ? "text-slate-900" : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  {mode === 'text' && <Star className="w-3 h-3 text-blue-500 fill-blue-500" />}
                  文本擂台
                  {mode === 'text' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-full"></div>}
                </button>
                
                <div className="w-px h-4 bg-gray-200 mx-2 mb-3"></div>

                <button 
                  onClick={() => setMode('image')}
                  className={cn(
                    "flex items-center gap-2 pb-3 px-2 text-sm font-medium transition-all relative",
                    mode === 'image' ? "text-slate-900" : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  图片擂台
                  {mode === 'image' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-full"></div>}
                </button>

                <div className="w-px h-4 bg-gray-200 mx-2 mb-3"></div>

                <button 
                  onClick={() => setMode('mixed')}
                  className={cn(
                    "flex items-center gap-2 pb-3 px-2 text-sm font-medium transition-all relative",
                    mode === 'mixed' ? "text-slate-900" : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  图文擂台
                  {mode === 'mixed' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-full"></div>}
                </button>
              </div>

              <div className="p-6">
                {/* Selected Chips Area */}
                {(selectedModels.length > 0 || selectedDomain || selectedSkills.length > 0 || files.length > 0) && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedModels.map(id => {
                      const model = MODELS.find(m => m.id === id);
                      return (
                        <span key={id} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium border border-blue-100">
                          <Cpu className="w-3 h-3" />
                          {model?.name}
                          <button onClick={() => toggleModel(id)} className="hover:text-blue-900 ml-1"><X className="w-3 h-3" /></button>
                        </span>
                      );
                    })}
                    {selectedDomain && (() => {
                      const domain = DOMAINS.find(d => d.id === selectedDomain);
                      return domain ? (
                        <span key={domain.id} className="flex items-center gap-1 bg-orange-50 text-orange-700 px-2 py-1 rounded-md text-xs font-medium border border-orange-200">
                          <domain.icon className="w-3 h-3" />
                          {domain.name}
                          <button onClick={() => { setSelectedDomain(null); setSelectedSkills([]); }} className="hover:text-orange-900 ml-1"><X className="w-3 h-3" /></button>
                        </span>
                      ) : null;
                    })()}
                    {selectedSkills.map(id => {
                      const skill = SKILLS.find(s => s.id === id);
                      return (
                        <span key={id} className="flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-1 rounded-md text-xs font-medium border border-purple-100">
                          <Zap className="w-3 h-3" />
                          {skill?.name}
                          <button onClick={() => toggleSkill(id)} className="hover:text-purple-900 ml-1"><X className="w-3 h-3" /></button>
                        </span>
                      );
                    })}
                    {files.map((file, index) => (
                      <span key={index} className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-medium border border-gray-200">
                        <FileText className="w-3 h-3" />
                        <span className="max-w-[100px] truncate">{file.name}</span>
                        <button onClick={() => removeFile(index)} className="hover:text-gray-900 ml-1"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                )}

                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  placeholder={'工作遇到什么难题了？调用2个顶尖大模型来同时帮你搞定吧！\n要是这俩货都翻车了，平台倒贴白额积分给你压压惊！\n(输入 @ 调取数字分身和知识库)'}
                  className="w-full h-24 resize-none outline-none text-gray-700 placeholder-gray-400 bg-transparent text-sm leading-relaxed"
                  autoFocus
                />
                
                {/* Knowledge Base Mention Dropdown */}
                {showKnowledgeMention && (
                  <div 
                    className="absolute bg-white rounded-xl shadow-xl border border-gray-100 w-64 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                    style={{ 
                      bottom: '100%',
                      left: 24,
                      marginBottom: '8px'
                    }}
                  >
                    <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500">从知识库中引用</span>
                      <span className="text-[10px] text-gray-400 bg-white px-1.5 py-0.5 rounded border border-gray-200">ESC 退出</span>
                    </div>
                    <div className="max-h-60 overflow-y-auto py-1">
                      {KNOWLEDGE_DOCS.filter(d => d.name.toLowerCase().includes(mentionQuery.toLowerCase())).length > 0 ? (
                        <>
                          {/* Personal Docs & SP */}
                          {KNOWLEDGE_DOCS.filter(d => (!d.isPublic || d.isSp) && d.name.toLowerCase().includes(mentionQuery.toLowerCase())).length > 0 && (
                            <div className="mb-2">
                              <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">我的专属设定与知识</div>
                              {KNOWLEDGE_DOCS.filter(d => (!d.isPublic || d.isSp) && d.name.toLowerCase().includes(mentionQuery.toLowerCase())).map((doc) => (
                                <button
                                  key={doc.id}
                                  onClick={() => selectKnowledgeDoc(doc)}
                                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-purple-50 transition-colors text-left group"
                                >
                                  <div className={cn(
                                    "w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold",
                                    doc.isSp ? "bg-indigo-100 text-indigo-600" : "bg-blue-100 text-blue-600"
                                  )}>
                                    {doc.isSp ? <Zap className="w-3.5 h-3.5" /> : doc.type}
                                  </div>
                                  <span className="text-sm text-gray-700 group-hover:text-purple-700 truncate">{doc.name}</span>
                                </button>
                              ))}
                            </div>
                          )}
                          
                          {/* Public Docs */}
                          {KNOWLEDGE_DOCS.filter(d => d.isPublic && !d.isSp && d.name.toLowerCase().includes(mentionQuery.toLowerCase())).length > 0 && (
                            <div>
                              <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">公共参考资料</div>
                              {KNOWLEDGE_DOCS.filter(d => d.isPublic && !d.isSp && d.name.toLowerCase().includes(mentionQuery.toLowerCase())).map((doc) => (
                                <button
                                  key={doc.id}
                                  onClick={() => selectKnowledgeDoc(doc)}
                                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-purple-50 transition-colors text-left group"
                                >
                                  <div className="w-6 h-6 rounded bg-gray-100 text-gray-500 flex items-center justify-center text-[10px] font-bold">
                                    {doc.type}
                                  </div>
                                  <span className="text-sm text-gray-700 group-hover:text-purple-700 truncate">{doc.name}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                          未找到相关资料
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-6 relative">
                  <div className="flex items-center gap-3">
                    {/* Domain Selector */}
                    <div className="relative">
                      <button 
                        onClick={() => { setShowDomainDropdown(!showDomainDropdown); setShowModelDropdown(false); setShowSkillDropdown(false); }}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all border",
                          showDomainDropdown 
                            ? "bg-orange-50 text-orange-600 border-orange-200 shadow-sm" 
                            : (selectedDomain ? "bg-white text-slate-700 border-gray-200 hover:border-orange-200 hover:text-orange-600" : "bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100")
                        )}
                      >
                        <Grid className="w-4 h-4" />
                        <span>{selectedDomain ? DOMAINS.find(d => d.id === selectedDomain)?.name : "领域"}</span>
                        {!selectedDomain && <span className="text-red-500 font-bold ml-0.5 translate-y-0.5">*</span>}
                      </button>
                      
                      {showDomainDropdown && (
                        <div className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                          <div className="text-xs font-medium text-gray-400 px-3 py-2">选择领域 (必选)</div>
                          <div className="max-h-64 overflow-y-auto">
                            {DOMAINS.map(domain => (
                              <button
                                key={domain.id}
                                onClick={() => selectDomain(domain.id)}
                                className={cn(
                                  "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-left transition-colors mb-0.5",
                                  selectedDomain === domain.id ? "bg-orange-50 text-orange-700" : "text-gray-600 hover:bg-gray-50"
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <domain.icon className="w-4 h-4" />
                                  <span>{domain.name}</span>
                                </div>
                                {selectedDomain === domain.id && <CheckCircle className="w-4 h-4" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Skill Selector */}
                    <div className="relative">
                      <button 
                        onClick={() => { 
                          if (selectedDomain) {
                            setShowSkillDropdown(!showSkillDropdown); 
                            setShowModelDropdown(false);
                            setShowDomainDropdown(false);
                          } else {
                            setShowDomainDropdown(true);
                          }
                        }}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all border",
                          !selectedDomain 
                            ? "opacity-50 cursor-not-allowed bg-gray-50 text-gray-400 border-transparent" 
                            : (showSkillDropdown ? "bg-purple-50 text-purple-600 border-purple-200 shadow-sm" : "bg-white text-slate-700 border-gray-200 hover:border-purple-200 hover:text-purple-600")
                        )}
                      >
                        <Zap className="w-4 h-4" />
                        <span>技能</span>
                      </button>

                      {showSkillDropdown && selectedDomain && (
                        <div className="absolute bottom-full left-0 mb-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                          <div className="text-xs font-medium text-gray-400 px-3 py-2">选择技能 (可多选)</div>
                          <div className="max-h-64 overflow-y-auto">
                            {filteredSkills.length > 0 ? (
                              filteredSkills.map(skill => (
                                <button
                                  key={skill.id}
                                  onClick={() => toggleSkill(skill.id)}
                                  className={cn(
                                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-left transition-colors mb-0.5",
                                    selectedSkills.includes(skill.id) ? "bg-purple-50 text-purple-700" : "text-gray-600 hover:bg-gray-50"
                                  )}
                                >
                                  <div className="flex items-center gap-3">
                                    <skill.icon className="w-4 h-4" />
                                    <span>{skill.name}</span>
                                  </div>
                                  {selectedSkills.includes(skill.id) && <CheckCircle className="w-3.5 h-3.5" />}
                                </button>
                              ))
                            ) : (
                              <div className="px-3 py-4 text-sm text-gray-400 text-center">该领域暂无特定技能</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Model Selector */}
                    <div className="relative">
                      <button 
                        onClick={() => { setShowModelDropdown(!showModelDropdown); setShowDomainDropdown(false); setShowSkillDropdown(false); }}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all border",
                          showModelDropdown 
                            ? "bg-blue-50 text-blue-600 border-blue-200 shadow-sm" 
                            : "bg-white text-slate-700 border-gray-200 hover:border-blue-200 hover:text-blue-600"
                        )}
                      >
                        <Settings className="w-4 h-4" />
                        <span>模型</span>
                      </button>
                      
                      {showModelDropdown && (
                        <div className="absolute bottom-full left-0 mb-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                          <div className="text-xs font-medium text-gray-400 px-3 py-2">选择模型 (最多选2个)</div>
                          {MODELS.map(model => {
                            const isSelected = selectedModels.includes(model.id);
                            const isDisabled = !isSelected && selectedModels.length >= 2;
                            
                            return (
                              <button
                                key={model.id}
                                onClick={() => toggleModel(model.id)}
                                disabled={isDisabled}
                                className={cn(
                                  "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-left transition-colors mb-0.5",
                                  isSelected 
                                    ? "bg-blue-50 text-blue-700" 
                                    : isDisabled
                                      ? "text-gray-300 cursor-not-allowed"
                                      : "text-gray-600 hover:bg-gray-50"
                                )}
                              >
                                <span>{model.name}</span>
                                {isSelected && <CheckCircle className="w-3.5 h-3.5" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* File Upload */}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      className="hidden" 
                      multiple 
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors ml-1"
                      title="上传文件"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="relative group/send">
                    <button 
                      onClick={handleStart}
                      disabled={!selectedDomain || (!input.trim() && files.length === 0)}
                      className={cn(
                        "w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm",
                        selectedDomain && (input.trim() || files.length > 0)
                          ? "bg-black text-white hover:bg-slate-800 hover:scale-105 hover:shadow-md" 
                          : "bg-gray-100 text-gray-300 cursor-not-allowed"
                      )}
                    >
                      <Send className="w-5 h-5 ml-0.5" />
                    </button>
                    {(!selectedDomain || (!input.trim() && files.length === 0)) && (
                      <div className={cn(
                        "absolute bottom-full right-0 mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded transition-opacity pointer-events-none z-50",
                        showError ? "opacity-100" : "opacity-0 group-hover/send:opacity-100"
                      )}>
                        {!selectedDomain && (!input.trim() && files.length === 0) 
                          ? "请先选择领域并输入内容" 
                          : (!selectedDomain ? "请先选择领域" : "请输入内容")}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}