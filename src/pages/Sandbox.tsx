import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Bot, 
  FileText, 
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Copy,
  Info,
  Send,
  Smile,
  Frown,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Upload,
  ChevronLeft,
  Bell,
  HelpCircle,
  Gift,
  MoreHorizontal,
  Paperclip,
  Download,
  Zap,
  Plus,
  Settings,
  Rocket,
  Atom,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Folder,
  PieChart,
  MessageSquarePlus,
  MessageSquareQuote,
  Languages,
  PenTool,
  Search,
  X,
  GraduationCap,
  Eye,
  Edit3,
  Star,
  ArrowUp,
  Maximize2,
  Minimize2,
  Users,
  Cpu,
  PlusCircle,
  Inbox,
  MessageSquare,
  User,
  Clock,
  ExternalLink
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { cn } from '../lib/utils';
import { useLanguage } from '../contexts/LanguageContext';
import { HLE_TASK_DATA } from '../data/hleTask';

// Mock File Card Component
const FileCard = ({ name, size, type }: { name: string; size: string; type: 'doc' | 'docx' | 'pdf' }) => (
  <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm min-w-[280px] hover:shadow-md transition-shadow cursor-pointer group">
    <div className="flex items-center gap-3">
      <div className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-[10px]",
        type === 'doc' || type === 'docx' ? "bg-blue-100 text-blue-600" : "bg-red-100 text-red-600"
      )}>
        {type.toUpperCase()}
      </div>
      <div>
        <div className="text-sm font-medium text-gray-900 truncate max-w-[160px]">{name}</div>
        <div className="text-xs text-gray-400">{size}</div>
      </div>
    </div>
    <button className="p-2 rounded-full hover:bg-gray-100 text-gray-400 group-hover:text-gray-600 transition-colors">
      <Download className="w-4 h-4" />
    </button>
  </div>
);

// Mock Tool Chip Component
const ToolChip = ({ text }: { text: string }) => (
  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-medium text-gray-600 border border-gray-200/50">
    <Zap className="w-3 h-3 text-purple-500 fill-current" />
    <span className="text-gray-400">MCP 工具</span>
    <span className="w-px h-3 bg-gray-300 mx-1"></span>
    <span className="text-gray-700">{text}</span>
  </div>
);

// Battle Response Component
  const BattleResponse = ({ onComplete }: { onComplete: (results: any, models: any[]) => void }) => {
  const [feedback, setFeedback] = useState<Record<number, { isCorrect: boolean | null; comment: string }>>({
    0: { isCorrect: null, comment: '' },
    1: { isCorrect: null, comment: '' },
    2: { isCorrect: null, comment: '' }
  });

  const models = [
    {
      id: 'claude',
      name: 'Claude 3.5',
      color: 'purple',
      content: '根据CRISPR-Cas9系统的作用机制，gRNA的特异性主要取决于spacer序列与靶DNA的互补配对，但PAM序列（NGG）的存在是Cas9酶识别和切割的前提条件。如果设计gRNA时未充分考虑全基因组范围内的潜在脱靶位点，特别是在高GC含量区域，可能会导致非预期的基因编辑事件。此外，Cas9蛋白的变体（如SpCas9-HF1或eSpCas9）通过结构优化减少了与DNA骨架的非特异性相互作用，从而显著提高了编辑的精确度。'
    },
    {
      id: 'gpt4',
      name: 'GPT-4',
      color: 'green',
      content: "In the context of gene editing, off-target effects are minimized by ensuring high specificity of the guide RNA (gRNA). The CRISPR-Cas9 system relies on the PAM sequence for initial DNA binding, followed by strand invasion. Mismatches in the 'seed region' of the gRNA can significantly reduce binding affinity, but distal mismatches might still be tolerated, leading to off-target cleavage. Advanced strategies, such as using paired nickases or high-fidelity Cas9 variants, have been developed to mitigate these risks and enhance the therapeutic safety of gene editing applications."
    },
    {
      id: 'llama3',
      name: 'Llama 3',
      color: 'blue',
      content: '分析实验数据表明，突变频率与底物浓度呈正相关，但这并不意味着二者之间存在直接的线性因果关系。酶促反应动力学（Michaelis-Menten方程）揭示了在低底物浓度下，反应速率随浓度增加而线性增加，但在高浓度下趋于饱和。若突变导致酶的Km值升高，则表明酶与底物的亲和力下降；反之，若Vmax降低，则可能是催化中心受到影响。因此，解释突变频率的变化需要综合考虑酶的结构变化、底物结合位点的特异性以及反应环境的微小波动。'
    }
  ];

  const handleFeedbackChange = (index: number, field: 'isCorrect' | 'comment', value: any) => {
    setFeedback(prev => ({
      ...prev,
      [index]: { ...prev[index], [field]: value }
    }));
  };

  const [submitted, setSubmitted] = useState(false);

  const isAllFeedbackSelected = models.every((_, index) => feedback[index].isCorrect !== null);
  const hasEmptyComment = models.some((_, index) => feedback[index].isCorrect === false && !feedback[index].comment.trim());
  const errorCount = Object.values(feedback).filter(f => f.isCorrect === false).length;
  const correctCount = Object.values(feedback).filter(f => f.isCorrect === true).length;
  
  const isAllFeedbackGiven = isAllFeedbackSelected && !hasEmptyComment;
  const canSubmit = isAllFeedbackGiven && errorCount >= 2;

  const handleSubmit = () => {
    if (canSubmit) {
      setSubmitted(true);
      onComplete(feedback, models);
    }
  };

  const handleArenaSelection = (selection: 'A' | 'B' | 'both' | 'neither') => {
    // We don't have access to setArenaSelection or setMessages here, 
    // so we'll just pass the selection up to the parent or ignore it
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <p className="font-bold text-gray-900">已为您生成 3 个模型的回答：</p>
         <div className="text-xs font-medium px-3 py-1 bg-orange-50 text-orange-700 rounded-full border border-orange-100 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            通过标准：至少 2 个模型回答错误 (当前: {errorCount}/2)
         </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {models.map((model, index) => (
          <div key={model.id} className="flex flex-col h-full bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-6 h-6 rounded-full bg-${model.color}-100 flex items-center justify-center text-xs font-bold text-${model.color}-600`}>
                  {String.fromCharCode(65 + index)}
                </div>
                <span className="font-bold text-sm">{model.name}</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {model.content}
              </p>
            </div>
            
            {/* Feedback Section */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex items-center gap-4 mb-3">
                <label className={cn("flex items-center gap-2 group", !submitted && "cursor-pointer")}>
                  <div className={cn(
                    "w-4 h-4 rounded-full border flex items-center justify-center transition-colors",
                    feedback[index].isCorrect === true 
                      ? "border-green-500 bg-green-500" 
                      : "border-gray-300",
                    !submitted && "group-hover:border-green-400"
                  )}>
                    {feedback[index].isCorrect === true && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <input 
                    type="radio" 
                    name={`feedback-${index}`} 
                    className="hidden" 
                    checked={feedback[index].isCorrect === true}
                    onChange={() => !submitted && handleFeedbackChange(index, 'isCorrect', true)}
                    disabled={submitted}
                  />
                  <span className={cn("text-xs font-medium", feedback[index].isCorrect === true ? "text-green-600" : "text-gray-500")}>正确</span>
                </label>
                
                <label className={cn("flex items-center gap-2 group", !submitted && "cursor-pointer")}>
                  <div className={cn(
                    "w-4 h-4 rounded-full border flex items-center justify-center transition-colors",
                    feedback[index].isCorrect === false 
                      ? "border-red-500 bg-red-500" 
                      : "border-gray-300",
                    !submitted && "group-hover:border-red-400"
                  )}>
                    {feedback[index].isCorrect === false && <X className="w-3 h-3 text-white" />}
                  </div>
                  <input 
                    type="radio" 
                    name={`feedback-${index}`} 
                    className="hidden" 
                    checked={feedback[index].isCorrect === false}
                    onChange={() => !submitted && handleFeedbackChange(index, 'isCorrect', false)}
                    disabled={submitted}
                  />
                  <span className={cn("text-xs font-medium", feedback[index].isCorrect === false ? "text-red-600" : "text-gray-500")}>错误</span>
                </label>
              </div>

              {feedback[index].isCorrect === false && (
                <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                  <textarea
                    value={feedback[index].comment}
                    onChange={(e) => handleFeedbackChange(index, 'comment', e.target.value)}
                    placeholder="请指出错误原因（必填）..."
                    className={cn(
                      "w-full text-xs p-2 bg-gray-50 border rounded outline-none resize-none disabled:bg-gray-100 disabled:text-gray-500 transition-colors",
                      !feedback[index].comment.trim() && !submitted
                        ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-1 focus:ring-red-200"
                        : "border-gray-200 focus:ring-1 focus:ring-red-200 focus:border-red-300"
                    )}
                    rows={2}
                    disabled={submitted}
                  />
                  {!feedback[index].comment.trim() && !submitted && (
                     <div className="flex items-center gap-1 mt-1.5 text-red-500 animate-in slide-in-from-left-1">
                        <AlertCircle className="w-3 h-3" />
                        <span className="text-[10px] font-medium">简要说明模型回答的错误之处</span>
                     </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-end">
          <div className="flex items-center gap-3">
            {!submitted && (
               <>
                 {correctCount > 1 ? (
                   <span className="text-xs text-red-500 font-bold animate-pulse">
                      错误数量不足，需至少 2 个
                   </span>
                 ) : isAllFeedbackSelected && errorCount >= 2 && hasEmptyComment ? (
                   <span className="text-xs text-red-500 font-bold animate-pulse">
                      简要说明模型回答的错误之处
                   </span>
                 ) : isAllFeedbackSelected && errorCount < 2 ? (
                   <span className="text-xs text-red-500 font-bold animate-pulse">
                      错误数量不足，需至少 2 个
                   </span>
                 ) : null}
               </>
            )}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || submitted}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all",
                canSubmit && !submitted
                  ? "bg-black text-white hover:bg-gray-800 shadow-md hover:scale-105"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              )}
            >
              {submitted ? "已提交评测" : "提交评测"}
              {submitted ? <CheckCircle2 className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
      </div>
    </div>
  );
};

export function Sandbox() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  // State Initialization
  const [activeTask, setActiveTask] = useState<any>(null);
  const [activeMode, setActiveMode] = useState<'guided' | 'battle' | 'compare' | 'free' | 'arena'>('guided');
  const [isProMode, setIsProMode] = useState(location.state?.initialMode === 'pro');
  
  // Thinking Process State
  const [thinkingStep, setThinkingStep] = useState(0); // 0: Idle, 1: Step 1, 2: Step 2, 3: Searching, 4: Done
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(false);
  const [isThinkingExpandedA, setIsThinkingExpandedA] = useState(false);
  const [isThinkingExpandedB, setIsThinkingExpandedB] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [visibleParas, setVisibleParas] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLeftMenuExpanded, setIsLeftMenuExpanded] = useState(false);
  const [isInputExpanded, setIsInputExpanded] = useState(false);
  const referenceRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleCitationClick = (index: number) => {
    setIsSidebarOpen(true);
    // Wait for animation to start/finish
    setTimeout(() => {
      referenceRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add a highlight effect
      const element = referenceRefs.current[index];
      if (element) {
        element.classList.add('bg-blue-50', 'ring-2', 'ring-blue-100');
        setTimeout(() => {
          element.classList.remove('bg-blue-50', 'ring-2', 'ring-blue-100');
        }, 2000);
      }
    }, 300);
  };

  // Auto-advance thinking steps
  useEffect(() => {
    if (isThinkingExpanded && location.state?.mode !== 'arena') {
        if (thinkingStep === 0) {
            setThinkingStep(1);
        } else if (thinkingStep === 1) {
            const t = setTimeout(() => setThinkingStep(2), 1000);
            return () => clearTimeout(t);
        } else if (thinkingStep === 2) {
            const t = setTimeout(() => setThinkingStep(3), 2000);
            return () => clearTimeout(t);
        } else if (thinkingStep === 3) {
            const t = setTimeout(() => setThinkingStep(4), 1500);
            return () => clearTimeout(t);
        } else if (thinkingStep === 4) {
            const t = setTimeout(() => {
                setThinkingStep(5);
                // After thinking completes:
                // 1. Collapse thinking after a short delay
                setTimeout(() => {
                    setIsThinkingExpanded(false);
                    setIsSidebarOpen(true);
                    // 2. Start streaming answer
                    setShowAnswer(true);
                }, 800);
            }, 1500);
            return () => clearTimeout(t);
        }
    }
  }, [isThinkingExpanded, thinkingStep, location.state?.mode]);

  // Stream Answer Paragraphs
  useEffect(() => {
      if (showAnswer && visibleParas < 4) {
          const t = setTimeout(() => {
              setVisibleParas(prev => prev + 1);
          }, 800);
          return () => clearTimeout(t);
      }
  }, [showAnswer, visibleParas]);

  // Auto-start thinking on entry
  useEffect(() => {
      if (location.state?.mode === 'free') {
        if (thinkingStep === 0) {
            setIsThinkingExpanded(true);
        } else if (thinkingStep === 5) {
            // If already done, ensure collapsed state is respected but don't reset
            // This allows manual re-expand to show full list
        }
      }
  }, [location.state?.mode]);
  
  const [rightPanelContent, setRightPanelContent] = useState<'none' | 'file' | 'battle' | 'reasoning'>('none');
  
  // Battle Mode State (Moved to Sandbox)
  const [battleInput, setBattleInput] = useState('');
  const [arenaSelection, setArenaSelection] = useState<string | null>(null);
  const [battleResult, setBattleResult] = useState<any>(null); // Store current battle result
  const [isBattleLoading, setIsBattleLoading] = useState(false);

  // Reasoning Sandbox State (Step 2)
  const [reasoningMessages, setReasoningMessages] = useState<Array<{
    role: 'user' | 'assistant'; 
    content: string;
    knowledge?: string;
  }>>([
    { role: 'assistant', content: '您好！我是您的推理助手。请告诉我您的解题思路，或者直接粘贴相关资料，我会协助您梳理并生成标准的解析过程。' }
  ]);
  const [reasoningInput, setReasoningInput] = useState('');
  const [selectedKnowledge, setSelectedKnowledge] = useState<string | null>(null);
  const [showKnowledgeSelector, setShowKnowledgeSelector] = useState(false);
  const [isReasoningLoading, setIsReasoningLoading] = useState(false);
  const [reasoningQueryMode, setReasoningQueryMode] = useState<'simple' | 'expert' | 'thought'>('expert');
  const [reasoningShowFilterDropdown, setReasoningShowFilterDropdown] = useState(false);
  const [reasoningSelectedJournalDb, setReasoningSelectedJournalDb] = useState<string>('国际期刊');
  const [reasoningShowModelDropdown, setReasoningShowModelDropdown] = useState(false);
  const [reasoningSelectedSkill, setReasoningSelectedSkill] = useState<{ id: string; name: string } | null>(null);
  const reasoningFilterButtonRef = useRef<HTMLButtonElement>(null);
  const [reasoningFilterButtonRect, setReasoningFilterButtonRect] = useState<DOMRect | null>(null);
  const reasoningSkillButtonRef = useRef<HTMLButtonElement>(null);
  const [reasoningSkillButtonRect, setReasoningSkillButtonRect] = useState<DOMRect | null>(null);
  const reasoningFileInputRef = useRef<HTMLInputElement>(null);
  const reasoningTextareaRef = useRef<HTMLTextAreaElement>(null);

  const [reasoningMentionQuery, setReasoningMentionQuery] = useState('');
  const [reasoningMentionPosition, setReasoningMentionPosition] = useState({ top: 0, left: 0 });

  const handleReasoningInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setReasoningInput(val);

    // Check for '@' symbol
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursorPosition);
    
    const lastAtMatch = textBeforeCursor.match(/@(\w*)$/);
    if (lastAtMatch) {
      setReasoningMentionQuery(lastAtMatch[1]);
      setShowKnowledgeSelector(true);
      
      // Calculate basic position
      if (reasoningTextareaRef.current) {
        const rect = reasoningTextareaRef.current.getBoundingClientRect();
        setReasoningMentionPosition({
          top: rect.top,
          left: rect.left + 20
        });
      }
    } else {
      setShowKnowledgeSelector(false);
    }
  };

  const selectReasoningKnowledgeDoc = (doc: typeof KNOWLEDGE_DOCS[0]) => {
    // Replace the '@...' with the doc name wrapped in brackets
    const cursorPosition = reasoningTextareaRef.current?.selectionStart || reasoningInput.length;
    const textBeforeCursor = reasoningInput.slice(0, cursorPosition);
    const textAfterCursor = reasoningInput.slice(cursorPosition);
    
    const newTextBeforeCursor = textBeforeCursor.replace(/@\w*$/, `【${doc.name}】 `);
    setReasoningInput(newTextBeforeCursor + textAfterCursor);
    
    setSelectedKnowledge(doc.name);
    setShowKnowledgeSelector(false);
    
    // Focus back on textarea
    setTimeout(() => {
      if (reasoningTextareaRef.current) {
        reasoningTextareaRef.current.focus();
        reasoningTextareaRef.current.selectionStart = newTextBeforeCursor.length;
        reasoningTextareaRef.current.selectionEnd = newTextBeforeCursor.length;
      }
    }, 0);
  };

  // Auto-scroll for Reasoning Sandbox
  const reasoningEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    reasoningEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [reasoningMessages]);

  // Answer Card Data State
  const [answerCardData, setAnswerCardData] = useState<{
    step1: {
      question: string;
      models: Array<{
        name: string;
        response: string;
        isCorrect: boolean | null;
        comment: string;
      }>;
    } | null;
    step2: {
      domainL1: string;
      domainL2: string;
      analysis: string;
      reasoningHistory: Array<{ role: 'user' | 'assistant'; content: string; knowledge?: string }>;
    } | null;
    step3: {
      standardAnswer: string;
    } | null;
  }>({ step1: null, step2: null, step3: null });

  // Step 2 & 3 Form State
  const [step2Data, setStep2Data] = useState({ domainL1: '', domainL2: '', analysis: '' });
  const [step3Data, setStep3Data] = useState({ standardAnswer: '' });

  // HLE Task Workflow State
  type SandboxStage = 'intro' | 'quiz' | 'execution' | 'step2' | 'step3' | 'evaluation';
  const [taskStage, setTaskStage] = useState<SandboxStage>('intro');
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  
  const isHLETask = activeTask?.title?.includes('HLE') || activeTask?.id?.includes('hle');

  // Chat History State
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesEndRefA = useRef<HTMLDivElement>(null);
  const messagesEndRefB = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Array<{
    id: string;
    role: 'user' | 'assistant';
    type?: 'normal' | 'step1_form' | 'step2_form' | 'step3_form';
    contentA?: React.ReactNode;
    contentB?: React.ReactNode;
    contentC?: React.ReactNode;
    prompt?: string;
    timestamp: number;
    isLoading?: boolean;
    files?: Array<{ name: string; size: string; type: 'doc' | 'docx' }>;
    tools?: string[];
  }>>([]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareTitle, setShareTitle] = useState('');
  const [shareSelection, setShareSelection] = useState<'A' | 'B' | 'Both'>('A');
  const [input, setInput] = useState('');
  const [isVotingEnabled, setIsVotingEnabled] = useState(false);
  const [votingCountdown, setVotingCountdown] = useState(5);
  
  // Workbench Input State
  const [queryMode, setQueryMode] = useState<'simple' | 'expert' | 'thought'>('expert');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedJournalDb, setSelectedJournalDb] = useState<string>('国际期刊');
  const [selectedSubject, setSelectedSubject] = useState<string>('自然科学');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<{ id: string; name: string } | null>(null);
  const [hoveredTooltip, setHoveredTooltip] = useState<{ mode: 'simple' | 'expert' | 'thought', rect: DOMRect } | null>(null);
  const [filterButtonRect, setFilterButtonRect] = useState<DOMRect | null>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollRefA = useRef<HTMLDivElement>(null);
  const scrollRefB = useRef<HTMLDivElement>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isTaskDocOpen, setIsTaskDocOpen] = useState(false);
  const [isEditingAnswerCard, setIsEditingAnswerCard] = useState(false);
  const taskDocRef = useRef<HTMLDivElement>(null);

  // New State for Input Mode (Tabs)
  const [inputMode, setInputMode] = useState<'classic' | 'battle'>('classic');

  // Knowledge base at mentions
  const [showKnowledgeMention, setShowKnowledgeMention] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [selectedKnowledgeDocs, setSelectedKnowledgeDocs] = useState<Array<{id: string, name: string}>>([]);
  const [files, setFiles] = useState<Array<{name: string, url?: string}>>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const KNOWLEDGE_DOCS = [
    { id: 'sp1', name: '我的数字分身 (李珂瑾)', type: 'SP', isPublic: false, isSp: true },
    { id: 'k1', name: '法律条款模糊语义标注规范 V2.0', type: 'PDF', isPublic: true },
    { id: 'k2', name: '生物HLE竞赛评测指南', type: 'PDF', isPublic: true },
    { id: 'k3', name: '代码评估安全合规清单', type: 'DOCX', isPublic: true },
    { id: 'k4', name: '医疗实体抽取专家共识_2023版', type: 'PDF', isPublic: true },
    { id: 'p1', name: '我的私有大数法则研究笔记', type: 'MD', isPublic: false },
    { id: 'p2', name: '个人整理_高频错题集', type: 'XLSX', isPublic: false },
  ];

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

  // Auto-scroll to bottom of chat
  useEffect(() => {
    // If it's a step transition (like entering step2 or step3), we want to scroll the new step into view smoothly
    // The delay ensures the DOM has updated with the new message before scrolling
    setTimeout(() => {
        if (messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.type && lastMsg.type.includes('_form')) {
                const element = document.getElementById(`message-${lastMsg.id}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    return;
                }
            }
        }
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        messagesEndRefA.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        messagesEndRefB.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        
        if (scrollRefA.current) {
          scrollRefA.current.scrollTo({ top: scrollRefA.current.scrollHeight, behavior: 'smooth' });
        }
        if (scrollRefB.current) {
          scrollRefB.current.scrollTo({ top: scrollRefB.current.scrollHeight, behavior: 'smooth' });
        }
    }, 100);
  }, [messages, selectedFile, taskStage]);

  // Initialize Task and Mode
  useEffect(() => {
    if (showFilterDropdown && filterButtonRef.current) {
      const updateRect = () => {
        setFilterButtonRect(filterButtonRef.current?.getBoundingClientRect() || null);
      };
      
      updateRect();
      window.addEventListener('scroll', updateRect, true);
      window.addEventListener('resize', updateRect);
      
      return () => {
        window.removeEventListener('scroll', updateRect, true);
        window.removeEventListener('resize', updateRect);
      };
    }
  }, [showFilterDropdown]);

  useEffect(() => {
    if (reasoningShowFilterDropdown && reasoningFilterButtonRef.current) {
      const updateRect = () => {
        setReasoningFilterButtonRect(reasoningFilterButtonRef.current?.getBoundingClientRect() || null);
      };
      
      updateRect();
      window.addEventListener('scroll', updateRect, true);
      window.addEventListener('resize', updateRect);
      
      return () => {
        window.removeEventListener('scroll', updateRect, true);
        window.removeEventListener('resize', updateRect);
      };
    }
  }, [reasoningShowFilterDropdown]);

  useEffect(() => {
    if (reasoningShowModelDropdown && reasoningSkillButtonRef.current) {
      const updateRect = () => {
        setReasoningSkillButtonRect(reasoningSkillButtonRef.current?.getBoundingClientRect() || null);
      };
      
      updateRect();
      window.addEventListener('scroll', updateRect, true);
      window.addEventListener('resize', updateRect);
      
      return () => {
        window.removeEventListener('scroll', updateRect, true);
        window.removeEventListener('resize', updateRect);
      };
    }
  }, [reasoningShowModelDropdown]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const modeParam = searchParams.get('mode');
    
    if (location.state?.task) {
      setActiveTask(location.state.task);
    } else {
      const storedTask = localStorage.getItem('current_sandbox_task');
      if (storedTask) {
        try {
          setActiveTask(JSON.parse(storedTask));
        } catch (e) {
          console.error("Failed to parse task from localStorage");
        }
      }
    }

    if (location.state?.mode) {
      setActiveMode(location.state.mode);
    } else if (modeParam) {
      setActiveMode(modeParam as 'guided' | 'battle' | 'compare' | 'free' | 'arena');
    }
  }, [location.state, location.search]);

  // Initialize Arena Mode Messages
  useEffect(() => {
    if ((location.state?.mode === 'arena' || location.state?.mode === 'compare') && location.state?.prompt && messages.length === 0) {
        const prompt = location.state.prompt;
        const userMsgId = Date.now().toString();
        const aiMsgId = (Date.now() + 1).toString();
        
        setMessages([
            {
                id: userMsgId,
                role: 'user',
                prompt: prompt,
                timestamp: Date.now()
            },
            {
                id: aiMsgId,
                role: 'assistant',
                timestamp: Date.now(),
                isLoading: true
            }
        ]);
        
        // Simulate response
    setTimeout(() => {
        setMessages(prev => prev.map(msg => 
            msg.id === aiMsgId 
                ? { 
                    ...msg, 
                    contentA: (
                        <>
                           <p className="animate-in fade-in slide-in-from-bottom-2 duration-700">
                             森林管理对碳循环的影响是缓解全球气候变化和维持生态系统平衡的核心课题。传统观点认为未受干扰的原始森林是最佳的碳汇，但实证研究反复证明，通过科学的营林措施，可以显著提升森林生态系统的固碳潜力和碳储量稳定性 <span onClick={() => handleCitationClick(0)} className="inline-flex items-center justify-center w-4 h-4 text-[10px] bg-gray-100 text-gray-500 rounded ml-1 cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors">1</span>。 这改变了单纯依赖自然演替来应对气候危机的被动策略 <span onClick={() => handleCitationClick(1)} className="inline-flex items-center justify-center w-4 h-4 text-[10px] bg-gray-100 text-gray-500 rounded ml-1 cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors">2</span>。 因此，发展并应用可持续的森林管理模型至关重要。
                           </p>
                           <p className="animate-in fade-in slide-in-from-bottom-2 duration-700 mt-4">
                             管理的核心方法主要围绕结构优化和采伐周期调整展开。在碳管理领域，延长轮伐期和选择性采伐是基础工具。例如，近自然林业管理能够有效促进林下植被发育以及“土壤碳泵效应”——即枯落叶和根系分泌物对土壤有机碳的持续输入 <span onClick={() => handleCitationClick(2)} className="inline-flex items-center justify-center w-4 h-4 text-[10px] bg-gray-100 text-gray-500 rounded ml-1 cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors">3</span>。 为进一步描述碳汇动态，标准的生长模型可与气候变量结合，如温度敏感性函数和降水响应曲线，以更好地预测不同管理措施下的固碳效率 <span onClick={() => handleCitationClick(3)} className="inline-flex items-center justify-center w-4 h-4 text-[10px] bg-gray-100 text-gray-500 rounded ml-1 cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors">4</span>。
                           </p>
                           <p className="animate-in fade-in slide-in-from-bottom-2 duration-700 mt-4">
                             对于极端干扰事件（如火灾、病虫害）的建模，干扰生态学提供了直接评估碳释放风险的框架。其中，燃料载量管理方法通过定期清理林下可燃物来降低高强度树冠火的发生概率，从而直接减少一次性的大量碳排放，保护现有的地上碳储量 <span onClick={() => handleCitationClick(0)} className="inline-flex items-center justify-center w-4 h-4 text-[10px] bg-gray-100 text-gray-500 rounded ml-1 cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors">1</span>。 另一种思路是改进木质林产品的生命周期规划。碳替代模型在评估木材在替代高碳排放的水泥和金属材料后对建筑和家具中连续发挥碳储作用时，这更符合生命周期周期碳管理的理念 <span onClick={() => handleCitationClick(2)} className="inline-flex items-center justify-center w-4 h-4 text-[10px] bg-gray-100 text-gray-500 rounded ml-1 cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors">3</span>、<span onClick={() => handleCitationClick(3)} className="inline-flex items-center justify-center w-4 h-4 text-[10px] bg-gray-100 text-gray-500 rounded ml-1 cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors">4</span>。 这类模型在林业减排政策中尤为重要，因为它能解释为何同一政策仍具有正向的净气候效益。
                           </p>
                        </>
                    ),
                    contentB: (
                        <>
                           <p className="animate-in fade-in slide-in-from-bottom-2 duration-700">
                             森林管理对碳循环的影响是缓解全球气候变化和维持生态系统平衡的核心课题。传统观点认为未受干扰的原始森林是最佳的碳汇，但实证研究反复证明，通过科学的营林措施，可以显著提升森林生态系统的固碳潜力和碳储量稳定性 <span onClick={() => handleCitationClick(0)} className="inline-flex items-center justify-center w-4 h-4 text-[10px] bg-gray-100 text-gray-500 rounded ml-1 cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors">1</span>。 这改变了单纯依赖自然演替来应对气候危机的被动策略 <span onClick={() => handleCitationClick(1)} className="inline-flex items-center justify-center w-4 h-4 text-[10px] bg-gray-100 text-gray-500 rounded ml-1 cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors">2</span>。 因此，发展并应用可持续的森林管理模型至关重要。
                           </p>
                           <p className="animate-in fade-in slide-in-from-bottom-2 duration-700">
                             管理的核心方法主要围绕结构优化和采伐周期调整展开。在碳管理领域，延长轮伐期和选择性采伐是基础工具。例如，近自然林业管理能够有效促进林下植被发育以及“土壤碳泵效应”——即枯落叶和根系分泌物对土壤有机碳的持续输入 <span onClick={() => handleCitationClick(2)} className="inline-flex items-center justify-center w-4 h-4 text-[10px] bg-gray-100 text-gray-500 rounded ml-1 cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors">3</span>。 为进一步描述碳汇动态，标准的生长模型可与气候变量结合，如温度敏感性函数和降水响应曲线，以更好地预测不同管理措施下的固碳效率 <span onClick={() => handleCitationClick(3)} className="inline-flex items-center justify-center w-4 h-4 text-[10px] bg-gray-100 text-gray-500 rounded ml-1 cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors">4</span>。
                           </p>
                           <p className="animate-in fade-in slide-in-from-bottom-2 duration-700">
                             对于极端干扰事件（如火灾、病虫害）的建模，干扰生态学提供了直接评估碳释放风险的框架。其中，燃料载量管理方法通过定期清理林下可燃物来降低高强度树冠火的发生概率，从而直接减少一次性的大量碳排放，保护现有的地上碳储量 <span onClick={() => handleCitationClick(0)} className="inline-flex items-center justify-center w-4 h-4 text-[10px] bg-gray-100 text-gray-500 rounded ml-1 cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors">1</span>。 另一种思路是改进木质林产品的生命周期规划。碳替代模型在评估木材在替代高碳排放的水泥和金属材料后对建筑和家具中连续发挥碳储作用时，这更符合生命周期周期碳管理的理念 <span onClick={() => handleCitationClick(2)} className="inline-flex items-center justify-center w-4 h-4 text-[10px] bg-gray-100 text-gray-500 rounded ml-1 cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors">3</span>、<span onClick={() => handleCitationClick(3)} className="inline-flex items-center justify-center w-4 h-4 text-[10px] bg-gray-100 text-gray-500 rounded ml-1 cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors">4</span>。 这类模型在林业减排政策中尤为重要，因为它能解释为何同一政策仍具有正向的净气候效益。
                           </p>
                        </>
                    ),
                    isLoading: false 
                  }
                : msg
        ));
    }, 1500);
    }
  }, [location.state]); // Only run when location state changes (mount)

  // Initial Welcome Message for Guided Mode
  useEffect(() => {
    if (activeMode === 'guided' && activeTask && messages.length === 0) {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          contentA: (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">👋 欢迎参与本次任务：{activeTask.title}</h3>
              <p className="text-gray-600">
                我是您的任务助手。在开始之前，请允许我简要说明本次任务的规则：
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-600 bg-gray-50 p-4 rounded-xl">
                <li><span className="font-bold text-gray-900">原创原则：</span>题目必须来自真实工作场景，禁止抄袭公开题库或私有教辅资料。</li>
                <li><span className="font-bold text-gray-900">隐私保护：</span>配图应避免包含敏感隐私信息，确保来自真实场景。</li>
                <li><span className="font-bold text-gray-900">难度要求：</span>题目应体现高专业度与清晰的复杂推理逻辑，拒绝简单知识问答。</li>
                <li><span className="font-bold text-gray-900">模型对抗：</span>设计需导致至少一个主流模型回答错误，不能所有模型都答对。</li>
                <li><span className="font-bold text-gray-900">解题逻辑：</span>解题过程需包含严谨的推理步骤，而非单纯的知识点堆砌。</li>
                <li><span className="font-bold text-gray-900">格式规范：</span>答案需简洁、客观，支持自动化评估；多小问拆分不超过3个。</li>
              </ul>
              <p className="text-gray-600">
                您对上述规则有什么疑问吗？如果没有，我们可以立即开始！
              </p>
              <div className="flex flex-wrap gap-3 mt-4">
                <button 
                  onClick={() => handleSend("有什么需要特别注意的吗？")}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                >
                  有什么注意事项？
                </button>
                <button 
                  onClick={() => handleSend("任务的截止时间是多久？")}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                >
                  截止时间？
                </button>
                <button 
                  onClick={() => handleSend("已确认规则，立即出发！")}
                  className="px-5 py-2 bg-black text-white rounded-full text-sm font-bold hover:bg-gray-800 hover:scale-105 transition-all shadow-md flex items-center gap-1.5"
                >
                  已确认规则，立即出发！
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ),
          timestamp: Date.now(),
        }
      ]);
    }
  }, [activeMode, activeTask]);

  // Helper to get model name
  const getModelName = (index: number) => {
    const selectedModels = location.state?.models || ['model-a', 'model-b'];
    const modelId = selectedModels[index];
    const modelMap: Record<string, string> = {
      'gpt-4': 'GPT-4',
      'claude-3-5': 'Claude 3.5',
      'gemini-pro': 'Gemini Pro',
      'llama-3': 'Llama 3'
    };
    return modelMap[modelId] || (index === 0 ? 'Model A' : 'Model B');
  };

  // Helper for skill placeholder
  const getSkillPlaceholder = (skillId: string) => {
    switch(skillId) {
      case 'research': return "请输入主题或报告要求";
      case 'data': return "请输入对于上传数据的任何分析处理要求";
      case 'literature': return "请上传文献，询问任何问题";
      case 'writing': return "请输入主题和写作要求";
      case 'translate': return "请输入要翻译的文本";
      case 'coding': return "请粘贴代码快速询问";
      default: return "上传文件或对当前文献，询问任何问题";
    }
  };

  const handleSend = async (userPrompt?: string | React.MouseEvent) => {
    const promptText = typeof userPrompt === 'string' ? userPrompt : input;
    
    if ((!promptText.trim() && selectedKnowledgeDocs.length === 0) || isGenerating) return;
    
    // Save real user input to localStorage for the sidebar history ONLY IF it's the first message in this chat session
    try {
      if (promptText.trim() && messages.filter(m => m.role === 'user').length === 0) {
        const storedHistory = localStorage.getItem('chatHistory');
        let historyArray = [];
        if (storedHistory) {
          try {
            const parsed = JSON.parse(storedHistory);
            if (Array.isArray(parsed)) {
              historyArray = parsed;
            }
          } catch (e) {
            console.error('Failed to parse existing history', e);
          }
        }
        
        // Remove duplicate if it already exists to move it to the top
        historyArray = historyArray.filter(item => item !== promptText.trim());
        // Add to the beginning
        historyArray.unshift(promptText.trim());
        // Keep only the latest 5
        const newHistory = historyArray.slice(0, 5);
        
        localStorage.setItem('chatHistory', JSON.stringify(newHistory));
        window.dispatchEvent(new Event('chatHistoryUpdated'));
      }
    } catch (e) {
      console.error('Failed to update chat history', e);
    }

    setInput('');
    setIsGenerating(true);

    const userMsgId = Date.now().toString();
    const aiMsgId = (Date.now() + 1).toString();

    // Check if confirming rules
    const isConfirmingRules = promptText === "已确认规则，立即出发！";
    const isArena = location.state?.mode === 'arena' || location.state?.mode === 'compare' || activeMode === 'battle' || activeMode === 'compare';
    
    if (isConfirmingRules) {
        setTaskStage('execution');
        setRightPanelContent('none'); // Do NOT auto-open sandbox
        
        // Add system message to guide user
        setTimeout(() => {
            const newMsgId = (Date.now() + 2).toString();
            setMessages(prev => [
                ...prev,
                {
                    id: newMsgId,
                    role: 'assistant',
                    type: 'step1_form',
                    contentA: (
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-gray-900">第一步：题目难度测试</h3>
                            <p className="text-gray-600">
                                我们即将进入 <span className="font-bold text-blue-600">【题目难度测试沙箱】</span>。
                            </p>
                            <p className="text-gray-600">
                                请在沙箱中反复打磨您的题目，调用 3 个大模型进行测试，直到至少有 2 个模型回答错误。
                            </p>
                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-800 text-sm flex items-start gap-2">
                                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <div>
                                    <span className="font-bold">为什么要使用沙箱？</span>
                                    <br/>
                                    为了避免多次尝试产生的冗余对话干扰上下文，所有的测试过程将在右侧独立进行。只有最终通过测试的题目才会被提交。
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => setRightPanelContent('battle')}
                                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 w-fit"
                            >
                                <Star className="w-4 h-4" />
                                打开题目难度测试沙箱
                            </button>
                        </div>
                    ),
                    timestamp: Date.now()
                }
            ]);
        }, 500);
        setIsGenerating(false);
        return; // Stop further processing for this special command
    }

    setMessages(prev => [
      ...prev, 
      {
        id: userMsgId,
        role: 'user',
        prompt: promptText,
        timestamp: Date.now(),
      },
      {
        id: aiMsgId,
        role: 'assistant',
        timestamp: Date.now(),
        isLoading: true,
        selection: null // Initialize selection as null for new message
      }
    ]);

    // Reset arena selection state when a new message is sent
    if (isArena) {
        setArenaSelection(null);
    }

    // Simulate response
    setTimeout(() => {
        setMessages(prev => prev.map(msg => 
            msg.id === aiMsgId 
                ? { 
                    ...msg, 
                    contentA: isArena ? (
                        <>
                           <p className="animate-in fade-in slide-in-from-bottom-2 duration-700">
                             针对"{promptText}"，Model A 提供以下见解：首先，我们需要明确该问题的核心在于多变量交互效应。基于最新的研究数据（2023），这种效应在复杂系统中尤为显著。建议采用分层线性模型进行分析...
                           </p>
                        </>
                    ) : (isConfirmingRules ? (
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-gray-900">第一步：题目难度测试</h3>
                            <p className="text-gray-600">请在下方输入您设计的生物学难题。我们将同时调用三个顶尖大模型（Claude 3.5, GPT-4, Llama 3）进行回答，以测试题目的难度和区分度。
                            <br/>
                            <span className="font-bold text-red-600">注意：为了确保题目具有足够的挑战性，至少需要有 2 个模型回答错误，才可进入下一步。</span></p>
                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-800 text-sm">
                                💡 提示：为了达到最佳效果，请确保题目包含复杂的推理逻辑，而非简单的知识点检索。
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                           {taskStage === 'step2' ? (
                             <div>
                                <p className="mb-2">关于"{promptText}"的推理过程建议：</p>
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm text-gray-700">
                                   建议从以下三个维度展开推理：
                                   <ol className="list-decimal list-inside mt-2 space-y-1">
                                     <li><span className="font-bold">核心机制定位</span>：明确题目考察的关键生物学过程（如CRISPR识别机制）。</li>
                                     <li><span className="font-bold">逻辑链条构建</span>：从分子结构基础推导至功能表现，建立因果关系。</li>
                                     <li><span className="font-bold">干扰项排除</span>：分析常见误区，说明为何其他选项或解释不成立。</li>
                                   </ol>
                                </div>
                             </div>
                           ) : (
                             <>
                                <p className="animate-in fade-in slide-in-from-bottom-2 duration-700">
                                   这是针对“{promptText}”的模型回答：大数法则（Law of Large Numbers, LLN）是概率论和统计学的基石，传统上它主要描述了独立同分布（i.i.d.）随机变量序列的样本均值依概率收敛或几乎必然收敛到其数学期望的现象。然而，在现代数据科学、金融工程以及复杂系统分析中，严格的 i.i.d. 假设往往难以满足。因此，大数法则的拓展成为了理论研究和应用实践的迫切需求 <span onClick={() => handleCitationClick(0)} className="inline-flex items-center justify-center w-4 h-4 text-[10px] bg-gray-100 text-gray-500 rounded ml-1 cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors">1</span>。
                                </p>
                                <p className="animate-in fade-in slide-in-from-bottom-2 duration-700 mt-4">
                                   首先，最直接的拓展是放宽“同分布”的假设。例如，马尔可夫（Markov）大数法则证明了只要随机变量序列的方差满足一定的增长限制条件，即使它们不同分布，大数法则依然成立。更进一步，针对“独立性”假设的放宽，研究者们引入了鞅差序列（Martingale Differences）和混合序列（Mixing Sequences）的概念。对于存在相依结构的数据（如时间序列分析中的自回归模型或空间统计中的局部传染效应），只要相依性随着距离的增加衰减得足够快，类似于大数法则的收敛性仍然可以得到保证 <span onClick={() => handleCitationClick(1)} className="inline-flex items-center justify-center w-4 h-4 text-[10px] bg-gray-100 text-gray-500 rounded ml-1 cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors">2</span> <span onClick={() => handleCitationClick(2)} className="inline-flex items-center justify-center w-4 h-4 text-[10px] bg-gray-100 text-gray-500 rounded ml-1 cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors">3</span>。
                                </p>
                                <p className="animate-in fade-in slide-in-from-bottom-2 duration-700 mt-4">
                                   其次，在机器学习和高维统计中，大数法则被拓展到了函数空间，即一致大数法则（Uniform Law of Large Numbers, ULLN）。在经验风险最小化（ERM）框架中，我们需要确保在整个假设空间（如神经网络的参数空间）内，经验误差一致收敛于泛化误差。这一拓展依赖于经验过程理论，通过引入 Vapnik-Chervonenkis (VC) 维度、Rademacher 复杂度和覆盖数（Covering Numbers）等工具，从本质上刻画了函数集的容量，从而为现代复杂模型的泛化能力提供了坚实的理论保障 <span onClick={() => handleCitationClick(3)} className="inline-flex items-center justify-center w-4 h-4 text-[10px] bg-gray-100 text-gray-500 rounded ml-1 cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors">4</span>。
                                </p>
                             </>
                           )}
                        </div>
                    )),
                    contentB: isArena ? (
                        <>
                           <p className="animate-in fade-in slide-in-from-bottom-2 duration-700">
                             Model B 从另一个角度分析"{promptText}"：考虑到系统的非线性特征，简单的线性模型可能无法捕捉关键动态。我们推荐使用贝叶斯网络来推断潜在的因果结构，这在处理不确定性方面具有优势...
                           </p>
                        </>
                    ) : undefined,
                    isLoading: false 
                  }
                : msg
        ));
        setIsGenerating(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showKnowledgeMention) {
      if (e.key === 'Escape') {
        setShowKnowledgeMention(false);
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey && !showKnowledgeMention) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStep2Submit = () => {
    // Save data
    setAnswerCardData(prev => ({
      ...prev,
      step2: {
        domainL1: step2Data.domainL1,
        domainL2: step2Data.domainL2,
        analysis: step2Data.analysis,
        reasoningHistory: reasoningMessages
      }
    }));
    
    // Move to next step
    setTaskStage('step3');
    
    // Add Step 3 Message
    const newMsgId = Date.now().toString();
    setMessages(prev => [
      ...prev,
      {
        id: newMsgId,
        role: 'assistant',
        type: 'step3_form',
        timestamp: Date.now()
      } as any
    ]);
  };

  const handleStep3Submit = () => {
     // Save data
    setAnswerCardData(prev => ({
      ...prev,
      step3: {
        standardAnswer: step3Data.standardAnswer
      }
    }));
    
    // Move to evaluation
    setTaskStage('evaluation');
    
    // Add Completion Message
    const newMsgId = Date.now().toString();
    setMessages(prev => [
      ...prev,
      {
        id: newMsgId,
        role: 'assistant',
        contentA: (
           <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">第四步：确认答题卡信息</h3>
              <p className="text-gray-600">
                 恭喜您，该HLE评测题目已初步构建完成！所有数据已保存至答题卡。
                 <br />
                 请点击下方按钮打开答题卡，仔细核对所有评测数据。
              </p>
              <button
                 onClick={() => {
                    setRightPanelContent('file');
                    setSelectedFile('生物HLE评测集答题卡.docx');
                 }}
                 className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-bold w-fit"
              >
                 <FileText className="w-4 h-4" />
                 打开答题卡核对信息
              </button>
              <div className="pt-4 border-t border-gray-100">
                 <p className="text-sm text-gray-500 mb-3">确认信息无误后，点击下方按钮完成最终提交并退出页面：</p>
                 <button
                    onClick={() => navigate('/my-tasks')}
                    className="px-6 py-2 bg-green-600 text-white rounded-full text-sm font-bold hover:bg-green-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2"
                 >
                    <CheckCircle2 className="w-4 h-4" />
                    确认无误，提交并退出
                 </button>
              </div>
           </div>
        ),
        timestamp: Date.now()
      }
    ]);
  };

  // Render Guided Message List (Screenshot Style)
  const renderGuidedMessageList = () => {
    return messages.map((msg) => (
      <div key={msg.id} id={`message-${msg.id}`} className="mb-8 w-full max-w-5xl mx-auto">
        {msg.type === 'step3_form' ? (
           <div className="flex gap-4 items-start">
             <div className="flex-1 space-y-4">
                <h3 className="text-xl font-bold text-gray-900">第三步：填写标准答案</h3>
                <p className="text-gray-600">
                    请基于之前的解析过程，整理出最终的标准答案。
                </p>
                <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 shadow-sm">
                    <textarea
                        value={step3Data.standardAnswer}
                        onChange={(e) => setStep3Data(prev => ({ ...prev, standardAnswer: e.target.value }))}
                        placeholder="在此输入标准答案..."
                        className="w-full min-h-[150px] p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm"
                    />
                    <div className="flex justify-end pt-2">
                        <button 
                           onClick={handleStep3Submit}
                           disabled={!step3Data.standardAnswer}
                           className="px-6 py-2 bg-green-600 text-white rounded-full text-sm font-bold hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 transition-colors flex items-center gap-2"
                        >
                           <CheckCircle2 className="w-4 h-4" />
                           提交任务
                        </button>
                    </div>
                </div>
             </div>
           </div>
        ) : msg.role === 'user' ? (
          <div className="flex justify-end mb-6">
            <div className="bg-gray-100 text-gray-900 px-6 py-4 rounded-[24px] rounded-tr-sm text-base leading-relaxed max-w-[80%]">
              {msg.prompt}
            </div>
          </div>
        ) : (
          <div className="flex gap-4 items-start">
            <div className="flex-1 space-y-2">
              <div className="text-gray-800 leading-relaxed text-base">
                {msg.isLoading ? (
                   <div className="flex items-center gap-2 text-gray-400">
                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                     <span>正在思考中...</span>
                   </div>
                ) : (
                   msg.contentA
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    ));
  };

  // Render Reasoning Sandbox (Step 2)
  const renderReasoningSandbox = () => {
    return (
      <div className="flex-1 bg-white flex flex-col h-full animate-in slide-in-from-right-10 duration-300 border-l border-gray-200">
        {/* Header */}
        <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
              <Atom className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900">解析推理沙箱</div>
              <div className="text-xs text-gray-500">Reasoning Sandbox</div>
            </div>
          </div>
          <button onClick={() => setRightPanelContent('none')} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-gray-50 flex flex-col gap-6">
           {/* Instructions */}
           <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl text-purple-800 text-sm">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>
                  在此处与AI共同完成题目的深度解析。通过对话梳理逻辑，最终生成标准的解析文本。
                </p>
              </div>
           </div>

           {/* Domain Selection */}
           <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
              <label className="block text-sm font-bold text-gray-900">
                1. 领域归属 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                  <select 
                    value={step2Data.domainL1}
                    onChange={(e) => setStep2Data(prev => ({ ...prev, domainL1: e.target.value }))}
                    className={cn(
                      "w-full p-2 border rounded-lg text-xs focus:ring-2 focus:ring-purple-500 outline-none",
                      !step2Data.domainL1 && !step2Data.domainL2 && step2Data.analysis ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"
                    )}
                  >
                      <option value="">一级领域</option>
                      <option value="molecular">分子生物学</option>
                      <option value="genetics">遗传学</option>
                      <option value="ecology">生态学</option>
                      <option value="neuro">神经生物学</option>
                  </select>
                  <select 
                    value={step2Data.domainL2}
                    onChange={(e) => setStep2Data(prev => ({ ...prev, domainL2: e.target.value }))}
                    className={cn(
                      "w-full p-2 border rounded-lg text-xs focus:ring-2 focus:ring-purple-500 outline-none",
                      !step2Data.domainL1 && !step2Data.domainL2 && step2Data.analysis ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"
                    )}
                  >
                      <option value="">二级领域</option>
                      <option value="crispr">CRISPR基因编辑</option>
                      <option value="protein">蛋白质结构与功能</option>
                      <option value="epigenetics">表观遗传学</option>
                      <option value="synapse">突触传递</option>
                  </select>
              </div>
              {(!step2Data.domainL1 || !step2Data.domainL2) && step2Data.analysis && (
                 <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    请选择领域归属
                 </p>
              )}
           </div>

           {/* Reasoning Chat Area */}
           <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col flex-1 min-h-[600px]">
              <div className="p-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                 <span className="text-sm font-bold text-gray-900">2. 推理对话</span>
                 <button 
                    onClick={() => setReasoningMessages([{ role: 'assistant', content: '您好！我是您的推理助手。请告诉我您的解题思路，或者直接粘贴相关资料，我会协助您梳理并生成标准的解析过程。' }])}
                    className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                 >
                    <RotateCcw className="w-3 h-3" />
                    重置
                 </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[600px] custom-scrollbar">
                 {reasoningMessages.map((msg, idx) => (
                    <div key={idx} className={cn("flex gap-2", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                       <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0",
                          msg.role === 'user' ? "bg-gray-200 text-gray-600" : "bg-purple-100 text-purple-600"
                       )}>
                          {msg.role === 'user' ? <Smile className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                       </div>
                       <div className={cn(
                          "px-3 py-2 rounded-xl text-sm max-w-[85%]",
                          msg.role === 'user' ? "bg-gray-100 text-gray-800 rounded-tr-none" : "bg-purple-50 text-purple-900 rounded-tl-none"
                       )}>
                          {msg.knowledge && (
                            <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg text-xs font-bold text-gray-600 border border-gray-200 mb-2 w-fit">
                               <div className="bg-blue-600 text-white px-1 py-0.5 rounded text-[10px] font-bold">#MD</div>
                               <span>{msg.knowledge}</span>
                            </div>
                          )}
                          {msg.content}
                       </div>
                    </div>
                 ))}
                 {isReasoningLoading && (
                    <div className="flex gap-2">
                       <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs flex-shrink-0">
                          <Bot className="w-3 h-3 text-purple-600" />
                       </div>
                       <div className="bg-purple-50 px-3 py-2 rounded-xl rounded-tl-none">
                          <div className="flex gap-1">
                             <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-0"></span>
                             <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-150"></span>
                             <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-300"></span>
                          </div>
                       </div>
                    </div>
                 )}
                 <div ref={reasoningEndRef} />
              </div>

              <div className="p-3 border-t border-gray-100">
                 <div className="relative group">
                    {/* Knowledge Base Popup */}
                    {showKnowledgeSelector && (
                       <div 
                         className="fixed z-[10000] w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                         style={{
                           top: reasoningMentionPosition.top,
                           left: reasoningMentionPosition.left,
                           transform: 'translateY(-100%)', // Shift up so it appears above the input
                           marginTop: '-8px' // Add some spacing
                         }}
                       >
                         <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                           <span className="text-xs font-bold text-gray-500">从知识库中引用</span>
                           <span className="text-[10px] text-gray-400 bg-white px-1.5 py-0.5 rounded border border-gray-200">ESC 退出</span>
                         </div>
                         <div className="max-h-60 overflow-y-auto py-1">
                           {KNOWLEDGE_DOCS.filter(d => d.name.toLowerCase().includes(reasoningMentionQuery.toLowerCase())).length > 0 ? (
                             <>
                               {/* Personal Docs */}
                               {KNOWLEDGE_DOCS.filter(d => !d.isPublic && d.name.toLowerCase().includes(reasoningMentionQuery.toLowerCase())).length > 0 && (
                                 <div className="mb-2">
                                   <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">我的专属设定与知识</div>
                                   {KNOWLEDGE_DOCS.filter(d => (!d.isPublic || d.isSp) && d.name.toLowerCase().includes(reasoningMentionQuery.toLowerCase())).map((doc) => (
                                     <button
                                       key={doc.id}
                                       onClick={() => selectReasoningKnowledgeDoc(doc)}
                                       className="w-full flex items-center gap-3 px-4 py-2 hover:bg-purple-50 transition-colors text-left group"
                                     >
                                       <div className={cn(
                                         "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                         doc.isSp ? "bg-indigo-100 text-indigo-600" : "bg-purple-100 text-purple-600"
                                       )}>
                                         {doc.isSp ? <Zap className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                       </div>
                                       <div className="flex-1 min-w-0">
                                         <div className="text-sm font-medium text-gray-900 truncate group-hover:text-purple-700">{doc.name}</div>
                                         <div className="text-xs text-gray-400 flex items-center gap-1">
                                           <span className={cn(
                                             "w-1.5 h-1.5 rounded-full",
                                             doc.isSp ? "bg-indigo-400" : "bg-purple-400"
                                           )}></span>
                                           {doc.type}
                                         </div>
                                       </div>
                                     </button>
                                   ))}
                                 </div>
                               )}
                               
                               {/* Public Docs */}
                               {KNOWLEDGE_DOCS.filter(d => d.isPublic && !d.isSp && d.name.toLowerCase().includes(reasoningMentionQuery.toLowerCase())).length > 0 && (
                                 <div>
                                   <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">公开知识库</div>
                                   {KNOWLEDGE_DOCS.filter(d => d.isPublic && !d.isSp && d.name.toLowerCase().includes(reasoningMentionQuery.toLowerCase())).map((doc) => (
                                     <button
                                       key={doc.id}
                                       onClick={() => selectReasoningKnowledgeDoc(doc)}
                                       className="w-full flex items-center gap-3 px-4 py-2 hover:bg-blue-50 transition-colors text-left group"
                                     >
                                       <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                                         <FileText className="w-4 h-4 text-blue-500" />
                                       </div>
                                       <div className="flex-1 min-w-0">
                                         <div className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-700">{doc.name}</div>
                                         <div className="text-xs text-gray-400 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                            {doc.type}
                                         </div>
                                       </div>
                                     </button>
                                   ))}
                                 </div>
                               )}
                             </>
                           ) : (
                             <div className="px-4 py-3 text-sm text-gray-500 text-center">
                               未找到相关文档，您可以直接去知识库上传
                             </div>
                           )}
                         </div>
                       </div>
                    )}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-100 to-blue-100 rounded-[24px] opacity-50 group-hover:opacity-100 transition duration-500 blur"></div>
                    <div className="relative bg-white rounded-[20px] border border-gray-200 shadow-sm flex flex-col transition-colors focus-within:border-purple-300 focus-within:ring-0 overflow-hidden">
                       <div className="p-3 flex flex-col">
                          {/* Selected Knowledge Tag */}
                          {selectedKnowledge && (
                            <div className="relative group/skill-tag flex-shrink-0 z-10 mb-2 inline-block">
                               <button 
                                 onClick={() => setSelectedKnowledge(null)}
                                 className="flex items-center gap-1.5 bg-gray-100 pl-1 pr-3 py-1 rounded-full text-xs font-bold hover:bg-gray-200 transition-colors border border-gray-200"
                               >
                                 <div className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">#MD</div>
                                 <span className="text-gray-600 max-w-[100px] truncate">{selectedKnowledge}</span>
                                 <X className="w-3 h-3 text-gray-400 hover:text-gray-600 ml-1" />
                               </button>
                            </div>
                          )}

                          {/* Selected Skill Tag */}
                          {reasoningSelectedSkill && (
                            <div className="relative group/skill-tag flex-shrink-0 z-10 mb-2">
                               <button 
                                 onClick={() => setReasoningSelectedSkill(null)}
                                 className="flex items-center gap-1.5 bg-gray-100 text-purple-600 px-3 py-1 rounded-full text-xs font-bold hover:bg-gray-200 transition-colors"
                               >
                                 {reasoningSelectedSkill.name}
                                 <div className="bg-slate-900 rounded-full p-0.5">
                                    <X className="w-2 h-2 text-white" />
                                 </div>
                               </button>
                            </div>
                          )}

                          <textarea
                             ref={reasoningTextareaRef}
                             value={reasoningInput}
                             onChange={handleReasoningInput}
                             onKeyDown={(e) => {
                                if (showKnowledgeSelector) {
                                   if (e.key === 'Escape') {
                                     setShowKnowledgeSelector(false);
                                     return;
                                   }
                                }
                                if (e.key === 'Enter' && !e.shiftKey && !showKnowledgeSelector) {
                                   e.preventDefault();
                                   if (!reasoningInput.trim() || isReasoningLoading) return;
                                   
                                   // Add user message
                                   setReasoningMessages(prev => [...prev, { 
                                     role: 'user', 
                                     content: reasoningInput,
                                     knowledge: selectedKnowledge || undefined
                                   }]);
                                   setReasoningInput('');
                                   setSelectedKnowledge(null);
                                   setIsReasoningLoading(true);

                                   // Simulate AI Response
                                   setTimeout(() => {
                                      setIsReasoningLoading(false);
                                      setReasoningMessages(prev => [...prev, { role: 'assistant', content: '好的，我已经理解了您的思路。这涉及到复杂的分子机制，建议从基因调控的角度切入。您可以参考以下结构：1. 背景介绍 2. 核心机制 3. 实验验证。' }]);
                                      
                                      // Auto-fill analysis (simulate)
                                      if (!step2Data.analysis) {
                                         setStep2Data(prev => ({ ...prev, analysis: "【解析过程】\n本题考察的是CRISPR-Cas9系统的特异性识别机制。首先，gRNA的spacer序列决定了靶向特异性，但PAM序列的存在是前提。其次，Cas9蛋白的构象变化..." }));
                                      }
                                   }, 1500);
                                }
                             }}
                             placeholder={
                               reasoningSelectedSkill 
                                 ? getSkillPlaceholder(reasoningSelectedSkill.id)
                                 : "输入你的思路，可输入 @ 调用知识库"
                             }
                             className="flex-1 min-h-[60px] bg-transparent border-none focus:ring-0 resize-none text-gray-800 placeholder-gray-300 leading-relaxed custom-scrollbar mb-2 text-sm outline-none focus:outline-none shadow-none focus:shadow-none"
                             rows={2}
                          />
                          
                          <div className="flex items-center justify-between relative">
                             <div className="flex items-center gap-2">
                                {/* Query Mode Selector */}
                                <div className="flex items-center bg-gray-100/80 rounded-full p-1 border border-gray-200/50 mr-1">
                                   <div className="relative">
                                     <button
                                       onClick={() => setReasoningQueryMode('simple')}
                                       className={cn(
                                         "flex items-center justify-center rounded-full transition-all duration-300",
                                         reasoningQueryMode === 'simple' 
                                         ? "bg-white text-purple-600 shadow-sm gap-1.5 px-2 py-1 text-[10px] font-bold" 
                                         : "text-gray-500 hover:text-gray-700 w-7 h-7"
                                       )}
                                     >
                                       <Zap className="w-3 h-3" />
                                       {reasoningQueryMode === 'simple' && "简洁"}
                                     </button>
                                   </div>
                                   <div className="relative">
                                     <button
                                       onClick={() => setReasoningQueryMode('expert')}
                                       className={cn(
                                         "flex items-center justify-center rounded-full transition-all duration-300",
                                         reasoningQueryMode === 'expert' 
                                         ? "bg-white text-purple-600 shadow-sm gap-1.5 px-2 py-1 text-[10px] font-bold" 
                                         : "text-gray-500 hover:text-gray-700 w-7 h-7"
                                       )}
                                     >
                                       <Rocket className="w-3 h-3" />
                                       {reasoningQueryMode === 'expert' && "专家"}
                                     </button>
                                   </div>
                                   <div className="relative">
                                     <button
                                       onClick={() => setReasoningQueryMode('thought')}
                                       className={cn(
                                         "flex items-center justify-center rounded-full transition-all duration-300",
                                         reasoningQueryMode === 'thought' 
                                         ? "bg-white text-purple-600 shadow-sm gap-1.5 px-2 py-1 text-[10px] font-bold" 
                                         : "text-gray-500 hover:text-gray-700 w-7 h-7"
                                       )}
                                     >
                                       <Atom className="w-3 h-3" />
                                       {reasoningQueryMode === 'thought' && "思考"}
                                     </button>
                                   </div>
                                </div>

                                {/* Journal Selector */}
                                <div className="relative">
                                   <button
                                     ref={reasoningFilterButtonRef} 
                                     onClick={(e) => { e.stopPropagation(); setReasoningShowFilterDropdown(!reasoningShowFilterDropdown); setReasoningShowModelDropdown(false); }}
                                     className={cn(
                                       "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border",
                                       reasoningShowFilterDropdown 
                                         ? "bg-purple-50 text-purple-600 border-purple-200 shadow-sm" 
                                         : "bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200"
                                     )}
                                   >
                                     <BookOpen className="w-3.5 h-3.5" />
                                     <span className="truncate max-w-[60px]">{reasoningSelectedJournalDb}</span>
                                     <ChevronDown className={cn("w-3 h-3 transition-transform", reasoningShowFilterDropdown ? "rotate-180" : "")} />
                                   </button>
                                   
                                   {reasoningShowFilterDropdown && reasoningFilterButtonRect && createPortal(
                                    <div 
                                      className="fixed z-[9999] animate-in fade-in zoom-in-95 duration-200 font-sans"
                                      style={{
                                        top: reasoningFilterButtonRect.top - 8,
                                        left: reasoningFilterButtonRect.left,
                                        transform: 'translateY(-100%)'
                                      }}
                                    >
                                      <div className="w-[480px] p-6 bg-white rounded-xl shadow-xl border border-gray-100">
                                        <h3 className="text-lg font-bold text-slate-900 mb-4">文献筛选</h3>
                                        <div className="mb-6">
                                          <div className="flex items-center gap-1.5 mb-3">
                                            <span className="font-bold text-slate-700">学科分类</span>
                                            <Info className="w-3.5 h-3.5 text-gray-400" />
                                          </div>
                                          <div className="flex flex-wrap gap-2">
                                            {['自然科学', '经济金融', '教育科研', '医疗健康', '法律', '哲学与社会科学', '软件与AI', '文学', '工程技术', '其他'].map((subject) => (
                                              <button
                                                key={subject}
                                                onClick={() => { /* Not implemented yet for reasoning, just visual for now */ }}
                                                className={cn(
                                                  "px-3 py-1.5 rounded-md text-sm transition-colors border border-gray-200 text-slate-600 hover:bg-gray-50"
                                                )}
                                              >
                                                {subject}
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                        <div className="mb-6">
                                          <div className="flex items-center gap-1.5 mb-3">
                                            <span className="font-bold text-slate-700">期刊库</span>
                                            <Info className="w-3.5 h-3.5 text-gray-400" />
                                          </div>
                                          <div className="flex gap-3">
                                            {[
                                              { name: '国际期刊', count: '1.7亿文献' },
                                              { name: '中国期刊', count: '0.8亿文献' },
                                              { name: '科协期刊集群', count: '60万全文文献' }
                                            ].map((db) => (
                                              <button
                                                key={db.name}
                                                onClick={() => { setReasoningSelectedJournalDb(db.name); setReasoningShowFilterDropdown(false); }}
                                                className={cn(
                                                  "flex-1 p-3 border rounded-lg text-left transition-colors",
                                                  reasoningSelectedJournalDb === db.name
                                                    ? "bg-purple-50 border-purple-200"
                                                    : "border-gray-200 hover:bg-gray-50 hover:border-purple-200"
                                                )}
                                              >
                                                <div className="font-bold text-slate-900 text-sm mb-1">{db.name}</div>
                                                <div className="text-xs text-gray-500">{db.count}</div>
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    </div>,
                                    document.body
                                  )}
                                </div>

                                {/* Skill/Model Selector */}
                                <div className="relative">
                                   {!reasoningSelectedSkill ? (
                                      <div className="relative">
                                         <button 
                                           ref={reasoningSkillButtonRef}
                                           onClick={(e) => { e.stopPropagation(); setReasoningShowModelDropdown(!reasoningShowModelDropdown); setReasoningShowFilterDropdown(false); }}
                                           className={cn(
                                             "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border",
                                             reasoningShowModelDropdown 
                                               ? "bg-purple-50 text-purple-600 border-purple-200 shadow-sm" 
                                               : "bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200"
                                           )}
                                         >
                                           <Settings className="w-3.5 h-3.5" />
                                           <span>技能</span>
                                         </button>
                                         
                                         {reasoningShowModelDropdown && reasoningSkillButtonRect && createPortal(
                                           <div 
                                             className="fixed z-[9999] animate-in fade-in zoom-in-95 duration-200 font-sans"
                                             style={{
                                                top: reasoningSkillButtonRect.top - 8,
                                                left: reasoningSkillButtonRect.left,
                                                transform: 'translateY(-100%)'
                                             }}
                                           >
                                             <div className="w-48 bg-white rounded-xl shadow-xl border border-gray-100 p-2">
                                               <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                                                 <button onClick={() => { setReasoningSelectedSkill({ id: 'research', name: '深入研究' }); setReasoningShowModelDropdown(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left text-gray-900 hover:bg-gray-50 transition-colors">
                                                   <Search className="w-4 h-4 text-gray-900" />
                                                   <span>深入研究</span>
                                                 </button>
                                                 <button onClick={() => { setReasoningSelectedSkill({ id: 'literature', name: '文献解读' }); setReasoningShowModelDropdown(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left text-gray-900 hover:bg-gray-50 transition-colors">
                                                   <MessageSquareQuote className="w-4 h-4 text-gray-900" />
                                                   <span>文献解读</span>
                                                 </button>
                                                 <button onClick={() => { setReasoningSelectedSkill({ id: 'data', name: '数据分析' }); setReasoningShowModelDropdown(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left text-gray-900 hover:bg-gray-50 transition-colors">
                                                   <PieChart className="w-4 h-4 text-gray-900" />
                                                   <span>数据分析</span>
                                                 </button>
                                                 <button onClick={() => { setReasoningSelectedSkill({ id: 'writing', name: '帮我写作' }); setReasoningShowModelDropdown(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left text-gray-900 hover:bg-gray-50 transition-colors">
                                                   <PenTool className="w-4 h-4 text-gray-900" />
                                                   <span>帮我写作</span>
                                                 </button>
                                                 <button onClick={() => { setReasoningSelectedSkill({ id: 'translate', name: '翻译' }); setReasoningShowModelDropdown(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left text-gray-900 hover:bg-gray-50 transition-colors">
                                                   <Languages className="w-4 h-4 text-gray-900" />
                                                   <span>翻译</span>
                                                 </button>
                                                 <button onClick={() => { setReasoningSelectedSkill({ id: 'coding', name: '编程' }); setReasoningShowModelDropdown(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left text-gray-900 hover:bg-gray-50 transition-colors">
                                                   <Zap className="w-4 h-4 text-gray-900" />
                                                   <span>编程</span>
                                                 </button>
                                               </div>
                                             </div>
                                           </div>,
                                           document.body
                                         )}
                                      </div>
                                   ) : null}
                                </div>

                                {/* File Upload */}
                                <input 
                                   type="file" 
                                   ref={reasoningFileInputRef} 
                                   className="hidden" 
                                   multiple 
                                />
                                <button 
                                   onClick={() => reasoningFileInputRef.current?.click()}
                                   className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all"
                                >
                                   <Paperclip className="w-3.5 h-3.5" />
                                </button>
                             </div>

                             <button 
                               onClick={() => {
                                  if (!reasoningInput.trim() || isReasoningLoading) return;
                                  setReasoningMessages(prev => [...prev, { 
                                     role: 'user', 
                                     content: reasoningInput,
                                     knowledge: selectedKnowledge || undefined
                                  }]);
                                  setReasoningInput('');
                                  setSelectedKnowledge(null);
                                  setIsReasoningLoading(true);
                                  setTimeout(() => {
                                     setIsReasoningLoading(false);
                                     setReasoningMessages(prev => [...prev, { role: 'assistant', content: '好的，我已经理解了您的思路。这涉及到复杂的分子机制，建议从基因调控的角度切入。您可以参考以下结构：1. 背景介绍 2. 核心机制 3. 实验验证。' }]);
                                     if (!step2Data.analysis) {
                                        setStep2Data(prev => ({ ...prev, analysis: "【解析过程】\n本题考察的是CRISPR-Cas9系统的特异性识别机制。首先，gRNA的spacer序列决定了靶向特异性，但PAM序列的存在是前提。其次，Cas9蛋白的构象变化..." }));
                                     }
                                  }, 1500);
                               }}
                               disabled={!reasoningInput.trim() && !isReasoningLoading}
                               className={cn(
                                 "w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm",
                                 reasoningInput.trim() 
                                   ? "bg-purple-600 text-white hover:bg-purple-700 hover:scale-105" 
                                   : "bg-gray-100 text-gray-600 text-gray-400 cursor-not-allowed"
                               )}
                             >
                                <Send className="w-3.5 h-3.5" />
                             </button>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Final Analysis Output */}
           <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                 <label className="block text-sm font-bold text-gray-900">3. 最终解析文本</label>
                 <button 
                    onClick={() => {
                        // Simulate generation
                        setStep2Data(prev => ({ ...prev, analysis: '正在生成解析...' }));
                        setTimeout(() => {
                            setStep2Data(prev => ({ 
                                ...prev, 
                                analysis: "【解析过程】\n本题考察的是CRISPR-Cas9系统的特异性识别机制。首先，gRNA的spacer序列决定了靶向特异性，但PAM序列的存在是前提。其次，Cas9蛋白的构象变化..." 
                            }));
                        }, 1000);
                    }}
                    className="text-xs text-white font-bold flex items-center gap-1 bg-purple-600 hover:bg-purple-700 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                 >
                    <Zap className="w-3.5 h-3.5" />
                    生成最终解析
                 </button>
              </div>
              <textarea
                value={step2Data.analysis}
                onChange={(e) => setStep2Data(prev => ({ ...prev, analysis: e.target.value }))}
                placeholder="在此处生成或编辑最终解析..."
                className="w-full min-h-[120px] p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none text-sm"
              />
           </div>

           {/* Submit Button */}
           <div className="flex justify-end pt-2 pb-6">
              <button 
                 onClick={() => {
                    handleStep2Submit();
                    setRightPanelContent('none'); // Close sandbox after submit
                 }}
                 disabled={!step2Data.domainL1 || !step2Data.domainL2 || !step2Data.analysis}
                 className="px-6 py-2 bg-purple-600 text-white rounded-full text-sm font-bold hover:bg-purple-700 disabled:bg-gray-200 disabled:text-gray-400 transition-colors flex items-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                 完成解析，进入下一步
                 <ArrowRight className="w-4 h-4" />
              </button>
           </div>
        </div>
      </div>
    );
  };

  // Render Battle Sandbox
  const renderBattleSandbox = () => {
    return (
      <div className="flex-1 bg-white flex flex-col h-full animate-in slide-in-from-right-10 duration-300 border-l border-gray-200">
        {/* Header */}
        <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
              <Star className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900">题目难度测试沙箱</div>
              <div className="text-xs text-gray-500">Battle Mode Sandbox</div>
            </div>
          </div>
          <button onClick={() => setRightPanelContent('none')} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-gray-50">
           {/* Instructions */}
           <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-800 text-sm">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>
                  在此处输入您的题目，点击发送后将同时调用 3 个模型生成回答。
                  <br/>
                  <span className="font-bold">通过标准：至少 2 个模型回答错误。</span>
                </p>
              </div>
           </div>

           {/* Input Area */}
           <div className="mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <label className="block text-sm font-bold text-gray-900 mb-2">题目输入</label>
              <textarea
                value={battleInput}
                onChange={(e) => setBattleInput(e.target.value)}
                placeholder="请输入您设计的生物学难题..."
                className="w-full min-h-[100px] p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm mb-3"
              />
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    if (!battleInput.trim() || isBattleLoading) return;
                    setIsBattleLoading(true);
                    setBattleResult(null); // Clear previous result
                    
                    // Simulate API call
                    setTimeout(() => {
                      setBattleResult(true); // Signal to show BattleResponse
                      setIsBattleLoading(false);
                    }, 1500);
                  }}
                  disabled={!battleInput.trim() || isBattleLoading}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all",
                    battleInput.trim() && !isBattleLoading
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  )}
                >
                  {isBattleLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      生成中...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      开始测试
                    </>
                  )}
                </button>
              </div>
           </div>

           {/* Results Area */}
           {battleResult && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <BattleResponse onComplete={(results, models) => {
                  console.log('Battle completed:', results);
                  
                  // Save data to Answer Card
                  setAnswerCardData(prev => ({
                    ...prev,
                    step1: {
                      question: battleInput,
                      models: models.map((m: any, i: number) => ({
                        name: m.name,
                        response: m.content,
                        isCorrect: results[i].isCorrect,
                        comment: results[i].comment
                      }))
                    }
                  }));

                  // Submit logic
                  setTaskStage('step2');
                  setRightPanelContent('none'); // Do NOT auto-open sandbox
                  
                  // Add system message for step 2 in main chat
                  const newMsgId = Date.now().toString();
                  setMessages(prev => [
                      ...prev,
                      {
                          id: newMsgId,
                          role: 'assistant',
                          type: 'step2_form',
                          contentA: (
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-gray-900">第二步：完善题目解析过程</h3>
                                <p className="text-gray-600">
                                    我们即将进入 <span className="font-bold text-purple-600">【解析推理沙箱】</span>。
                                </p>
                                <p className="text-gray-600">
                                    请在沙箱中与AI协作，梳理题目背后的复杂逻辑，并生成标准解析。
                                </p>
                                <button 
                                    onClick={() => setRightPanelContent('reasoning')}
                                    className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-full text-sm font-bold hover:bg-purple-700 transition-colors flex items-center gap-2 w-fit"
                                >
                                    <Atom className="w-4 h-4" />
                                    打开解析推理沙箱
                                </button>
                            </div>
                          ),
                          timestamp: Date.now()
                      }
                  ]);
               }} />
             </div>
           )}
        </div>
      </div>
    );
  };

  if (activeMode === 'guided') {
    return (
      <div className="h-full flex flex-row bg-white font-sans overflow-hidden">
        
        {/* Left Side: Chat & Input */}
        <div className={cn(
            "flex flex-col h-full transition-all duration-300 ease-in-out",
            rightPanelContent !== 'none' ? "w-[30%] border-r border-gray-200" : "w-full"
        )}>
            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar scroll-smooth bg-white">
              {renderGuidedMessageList()}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area - Hide in battle mode (step 1) */}
            {taskStage !== 'execution' && (
            <div className="p-6 pb-8 bg-white max-w-5xl mx-auto w-full sticky bottom-0 z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]" onClick={() => {
               if (showModelDropdown) setShowModelDropdown(false);
               if (showFilterDropdown) setShowFilterDropdown(false);
            }}>
               {/* Task Documentation Pill - Only show if not in execution/battle mode to avoid clutter, or keep it? Keeping it for now. */}
               <div className="mb-2 flex items-center gap-2">
                 <div className="relative">
                     <button
                       onClick={() => setIsTaskDocOpen(!isTaskDocOpen)}
                       className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-100 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                     >
                       <div className="w-4 h-4 bg-yellow-100 rounded flex items-center justify-center">
                         <FileText className="w-2.5 h-2.5 text-yellow-600" />
                       </div>
                       <span className="text-sm font-medium text-gray-700">项目文件</span>
                     </button>
                     
                     {isTaskDocOpen && (
                       <div className="absolute bottom-full left-0 mb-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                         <div className="flex items-center justify-between mb-3">
                           <h3 className="font-bold text-gray-900">项目说明文档</h3>
                           <button onClick={() => setIsTaskDocOpen(false)} className="text-gray-400 hover:text-gray-600">
                             <X className="w-4 h-4" />
                           </button>
                         </div>
                         <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                           <div 
                            onClick={() => { setSelectedFile('任务需求说明书.pdf'); setRightPanelContent('file'); setIsTaskDocOpen(false); }}
                            className="p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer hover:bg-blue-50 hover:border-blue-100 transition-colors"
                           >
                             <div className="flex items-center gap-2 mb-1">
                               <FileText className="w-4 h-4 text-blue-500" />
                               <span className="font-medium text-sm text-gray-900">任务需求说明书.pdf</span>
                             </div>
                             <p className="text-xs text-gray-500 ml-6">2.4 MB • 2024-03-15</p>
                           </div>
                           <div 
                            onClick={() => { setSelectedFile('数据标注规范_v2.docx'); setRightPanelContent('file'); setIsTaskDocOpen(false); }}
                            className="p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer hover:bg-blue-50 hover:border-blue-100 transition-colors"
                           >
                             <div className="flex items-center gap-2 mb-1">
                               <FileText className="w-4 h-4 text-blue-500" />
                               <span className="font-medium text-sm text-gray-900">数据标注规范_v2.docx</span>
                             </div>
                             <p className="text-xs text-gray-500 ml-6">1.8 MB • 2024-03-14</p>
                           </div>
                           <div 
                            onClick={() => { setSelectedFile('参考样例数据.xlsx'); setRightPanelContent('file'); setIsTaskDocOpen(false); }}
                            className="p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer hover:bg-blue-50 hover:border-blue-100 transition-colors"
                           >
                             <div className="flex items-center gap-2 mb-1">
                               <FileText className="w-4 h-4 text-green-500" />
                               <span className="font-medium text-sm text-gray-900">参考样例数据.xlsx</span>
                             </div>
                             <p className="text-xs text-gray-500 ml-6">456 KB • 2024-03-10</p>
                           </div>
                         </div>
                       </div>
                     )}
                 </div>

                 {/* Step 2: Answer Card */}
                 {(taskStage === 'step2' || taskStage === 'step3' || taskStage === 'evaluation') && (
                    <div className="animate-in fade-in slide-in-from-left-2">
                        <button 
                           onClick={() => {
                               // Open the answer card data
                               setRightPanelContent('file');
                               setSelectedFile('生物HLE评测集答题卡.docx');
                           }}
                           className="flex items-center gap-2 p-1.5 bg-blue-50 border border-blue-100 rounded-lg shadow-sm hover:bg-blue-100 transition-colors group text-left"
                        >
                            <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600 group-hover:bg-white transition-colors">
                                <FileText className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-gray-900 leading-none mb-0.5">生物HLE评测集答题卡.docx</span>
                              <div className="text-[10px] text-blue-600 flex items-center gap-1 leading-none">
                                  {taskStage === 'evaluation' ? (
                                     <span className="flex items-center gap-1 text-green-600">
                                         <CheckCircle2 className="w-3 h-3" />
                                         已完成评测数据录入
                                     </span>
                                  ) : (
                                     <>
                                        <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse"></span>
                                        {taskStage === 'step3' 
                                            ? "已保存难度测试、解析过程数据" 
                                            : (answerCardData.step1 ? "已保存难度测试数据" : "正在填写中...")}
                                     </>
                                  )}
                              </div>
                          </div>
                          <div className="p-1 rounded text-blue-400 group-hover:text-blue-600 transition-colors ml-1">
                              <Eye className="w-3 h-3" />
                          </div>
                        </button>
                    </div>
                 )}
               </div>

               <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-100 to-purple-100 rounded-[28px] opacity-50 group-hover:opacity-100 transition duration-500 blur"></div>
                  <div className="relative bg-white rounded-[24px] border border-gray-200 shadow-sm flex flex-col transition-colors focus-within:border-blue-300 focus-within:ring-0 overflow-hidden">
                    
                    {/* Tabs Header */}
                    {(taskStage as any) === 'execution' && (
                    <div className="flex items-center border-b border-gray-100 bg-gray-50/50 px-4 pt-2">
                          <button 
                              onClick={() => setInputMode('battle')}
                              className={cn(
                                  "px-4 py-2 text-sm font-medium transition-colors relative flex items-center gap-1.5",
                                  inputMode === 'battle' ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
                              )}
                          >
                              <Star className={cn("w-3.5 h-3.5 fill-current", inputMode === 'battle' ? "text-blue-500" : "text-gray-400")} />
                              擂台模式（多模型）
                              {inputMode === 'battle' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>}
                          </button>
                    </div>
                    )}

                    <div className="p-4 flex flex-col">
                        {/* Selected Skill Tag */}
                        {selectedSkill && (
                          <div className="relative group/skill-tag flex-shrink-0 z-10 mb-2">
                             <div className="absolute bottom-full left-0 mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover/skill-tag:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                点击退出技能
                                <div className="absolute top-full left-4 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                             </div>
                             <button 
                               onClick={() => setSelectedSkill(null)}
                               className="flex items-center gap-1.5 bg-gray-100 text-blue-600 px-3 py-1 rounded-full text-sm font-bold hover:bg-gray-200 transition-colors"
                             >
                               {selectedSkill.name}
                               <div className="bg-slate-900 rounded-full p-0.5">
                                  <X className="w-2 h-2 text-white" />
                               </div>
                             </button>
                          </div>
                        )}

                       <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={handleInput}
                            onKeyDown={handleKeyDown}
                            placeholder={
                              selectedSkill 
                                ? getSkillPlaceholder(selectedSkill.id)
                                : (inputMode === 'battle' 
                                    ? "请输入题目（输入 @ 快速引用知识库文档）"
                                    : ((taskStage === 'step2' || taskStage === 'step3') ? "在此处与AI对话，了解更多任务要求（输入 @ 快速引用知识库文档）" : "请输入需求，优化你的题目（输入 @ 快速引用知识库文档）"))
                            }
                            className="flex-1 min-h-[80px] bg-transparent border-none focus:ring-0 resize-none text-gray-800 placeholder-gray-300 leading-relaxed custom-scrollbar mb-2 text-base outline-none focus:outline-none shadow-none focus:shadow-none"
                            rows={2}
                         />
                         
                         {/* Knowledge Base @ Mention Dropdown */}
                         {showKnowledgeMention && createPortal(
                           <div 
                             className="fixed z-[10000] w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                             style={{
                               top: mentionPosition.top,
                               left: mentionPosition.left,
                               transform: 'translateY(-100%)', // Shift up so it appears above the input
                               marginTop: '-8px' // Add some spacing
                             }}
                           >
                             <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                               <span className="text-xs font-bold text-gray-500">从知识库中引用</span>
                               <span className="text-[10px] text-gray-400 bg-white px-1.5 py-0.5 rounded border border-gray-200">ESC 退出</span>
                             </div>
                             <div className="max-h-60 overflow-y-auto py-1">
                               {KNOWLEDGE_DOCS.filter(d => d.name.toLowerCase().includes(mentionQuery.toLowerCase())).length > 0 ? (
                                 <>
                                   {/* Personal Docs */}
                                   {KNOWLEDGE_DOCS.filter(d => !d.isPublic && d.name.toLowerCase().includes(mentionQuery.toLowerCase())).length > 0 && (
                                     <div className="mb-2">
                                   <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">我的专属设定与知识</div>
                                   {KNOWLEDGE_DOCS.filter(d => (!d.isPublic || d.isSp) && d.name.toLowerCase().includes(mentionQuery.toLowerCase())).map((doc) => (
                                     <button
                                       key={doc.id}
                                       onClick={() => selectKnowledgeDoc(doc)}
                                       className="w-full flex items-center gap-3 px-4 py-2 hover:bg-purple-50 transition-colors text-left group"
                                     >
                                       <div className={cn(
                                         "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                         doc.isSp ? "bg-indigo-100 text-indigo-600" : "bg-purple-100 text-purple-600"
                                       )}>
                                         {doc.isSp ? <Zap className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                       </div>
                                       <div className="flex-1 min-w-0">
                                         <div className="text-sm font-medium text-gray-900 truncate group-hover:text-purple-700">{doc.name}</div>
                                         <div className="text-xs text-gray-400 flex items-center gap-1">
                                           <span className={cn(
                                             "w-1.5 h-1.5 rounded-full",
                                             doc.isSp ? "bg-indigo-400" : "bg-purple-400"
                                           )}></span>
                                           {doc.type}
                                         </div>
                                       </div>
                                     </button>
                                   ))}
                                 </div>
                                   )}
                                   
                                   {/* Public Docs */}
                                   {KNOWLEDGE_DOCS.filter(d => d.isPublic && !d.isSp && d.name.toLowerCase().includes(mentionQuery.toLowerCase())).length > 0 && (
                                     <div>
                                       <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">公开知识库</div>
                                       {KNOWLEDGE_DOCS.filter(d => d.isPublic && !d.isSp && d.name.toLowerCase().includes(mentionQuery.toLowerCase())).map((doc) => (
                                         <button
                                           key={doc.id}
                                           onClick={() => selectKnowledgeDoc(doc)}
                                           className="w-full flex items-center gap-3 px-4 py-2 hover:bg-blue-50 transition-colors text-left group"
                                         >
                                           <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                                             <FileText className="w-4 h-4 text-blue-500" />
                                           </div>
                                           <div className="flex-1 min-w-0">
                                             <div className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-700">{doc.name}</div>
                                             <div className="text-xs text-gray-400 flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                                {doc.type}
                                             </div>
                                           </div>
                                         </button>
                                       ))}
                                     </div>
                                   )}
                                 </>
                               ) : (
                                 <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                   未找到相关文档，您可以直接去知识库上传
                                 </div>
                               )}
                             </div>
                           </div>,
                           document.body
                         )}

                         {/* Show selected files and knowledge docs below textarea */}
                         {(files.length > 0 || selectedKnowledgeDocs.length > 0) && (
                           <div className="flex flex-wrap gap-2 mb-3">
                             {files.map((file, index) => (
                               <span key={index} className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-medium border border-gray-200">
                                 <FileText className="w-3 h-3" />
                                 <span className="max-w-[150px] truncate">{file.name}</span>
                                 <button onClick={() => setFiles(files.filter((_, i) => i !== index))} className="hover:text-gray-900 ml-1"><X className="w-3 h-3" /></button>
                               </span>
                             ))}
                             {selectedKnowledgeDocs.map((doc, index) => (
                               <span key={`k-${index}`} className="flex items-center gap-1 bg-rose-50 text-rose-700 px-2 py-1 rounded-md text-xs font-medium border border-rose-200">
                                 <FileText className="w-3 h-3" />
                                 <span className="max-w-[150px] truncate">{doc.name}</span>
                                 <button onClick={() => setSelectedKnowledgeDocs(prev => prev.filter(d => d.id !== doc.id))} className="hover:text-rose-900 ml-1"><X className="w-3 h-3" /></button>
                               </span>
                             ))}
                           </div>
                         )}
                         
                         <div className="flex items-center justify-between relative">
                            <div className="flex items-center gap-2">
                               {/* Query Mode Selector */}
                               <div 
                                  className="flex items-center bg-gray-100/80 rounded-full p-1 border border-gray-200/50 mr-2 relative"
                                  onMouseLeave={(e) => {
                                    // Check if we are moving to the tooltip portal
                                    const relatedTarget = e.relatedTarget as HTMLElement;
                                    if (!relatedTarget?.closest('.fixed.z-\\[9999\\]')) {
                                      setHoveredTooltip(null);
                                    }
                                  }}
                                >
                                  <div 
                                    className="relative"
                                    onMouseEnter={(e) => {
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      setHoveredTooltip(prev => prev?.mode === 'simple' ? prev : { mode: 'simple', rect });
                                    }}
                                  >
                                    <button
                                      onClick={() => setQueryMode('simple')}
                                      className={cn(
                                        "flex items-center justify-center rounded-full transition-all duration-300",
                                        queryMode === 'simple' 
                                        ? "bg-white text-blue-600 shadow-sm gap-1.5 px-3 py-1.5 text-xs font-bold" 
                                        : "text-gray-500 hover:text-gray-700 w-8 h-8"
                                      )}
                                    >
                                      <Zap className="w-3.5 h-3.5" />
                                      {queryMode === 'simple' && "简洁"}
                                    </button>
                                  </div>
                                  <div 
                                    className="relative"
                                    onMouseEnter={(e) => {
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      setHoveredTooltip(prev => prev?.mode === 'expert' ? prev : { mode: 'expert', rect });
                                    }}
                                  >
                                    <button
                                      onClick={() => setQueryMode('expert')}
                                      className={cn(
                                        "flex items-center justify-center rounded-full transition-all duration-300",
                                        queryMode === 'expert' 
                                        ? "bg-white text-blue-600 shadow-sm gap-1.5 px-3 py-1.5 text-xs font-bold" 
                                        : "text-gray-500 hover:text-gray-700 w-8 h-8"
                                      )}
                                    >
                                      <Rocket className="w-3.5 h-3.5" />
                                      {queryMode === 'expert' && "专家"}
                                    </button>
                                  </div>
                                  <div 
                                    className="relative"
                                    onMouseEnter={(e) => {
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      setHoveredTooltip(prev => prev?.mode === 'thought' ? prev : { mode: 'thought', rect });
                                    }}
                                  >
                                    <button
                                      onClick={() => setQueryMode('thought')}
                                      className={cn(
                                        "flex items-center justify-center rounded-full transition-all duration-300",
                                        queryMode === 'thought' 
                                        ? "bg-white text-blue-600 shadow-sm gap-1.5 px-3 py-1.5 text-xs font-bold" 
                                        : "text-gray-500 hover:text-gray-700 w-8 h-8"
                                      )}
                                    >
                                      <Atom className="w-3.5 h-3.5" />
                                      {queryMode === 'thought' && "思考"}
                                    </button>
                                  </div>
                               </div>

                               {/* Journal Selector */}
                               {(taskStage as any) !== 'execution' && (
                               <div className="relative">
                                  <button
                                    ref={filterButtonRef}
                                    onClick={(e) => { e.stopPropagation(); setShowFilterDropdown(!showFilterDropdown); }}
                                    className={cn(
                                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border",
                                      showFilterDropdown 
                                        ? "bg-blue-50 text-blue-600 border-blue-200 shadow-sm" 
                                        : "bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200"
                                    )}
                                  >
                                    <BookOpen className="w-3.5 h-3.5" />
                                    <span>{selectedJournalDb}</span>
                                    <ChevronDown className={cn("w-3 h-3 transition-transform", showFilterDropdown ? "rotate-180" : "")} />
                                  </button>

                                  {showFilterDropdown && filterButtonRect && createPortal(
                                    <div 
                                      className="fixed z-[9999] animate-in fade-in zoom-in-95 duration-200 font-sans"
                                      style={{
                                        top: filterButtonRect.top - 8,
                                        left: filterButtonRect.left,
                                        transform: 'translateY(-100%)'
                                      }}
                                    >
                                      <div className="w-[480px] p-6 bg-white rounded-xl shadow-xl border border-gray-100">
                                        <h3 className="text-lg font-bold text-slate-900 mb-4">文献筛选</h3>
                                        <div className="mb-6">
                                          <div className="flex items-center gap-1.5 mb-3">
                                            <span className="font-bold text-slate-700">学科分类</span>
                                            <Info className="w-3.5 h-3.5 text-gray-400" />
                                          </div>
                                          <div className="flex flex-wrap gap-2">
                                            {['自然科学', '经济金融', '教育科研', '医疗健康', '法律', '哲学与社会科学', '软件与AI', '文学', '工程技术', '其他'].map((subject) => (
                                              <button
                                                key={subject}
                                                onClick={() => setSelectedSubject(subject)}
                                                className={cn(
                                                  "px-3 py-1.5 rounded-md text-sm transition-colors",
                                                  selectedSubject === subject
                                                    ? "bg-blue-50 text-blue-600 font-medium"
                                                    : "border border-gray-200 text-slate-600 hover:bg-gray-50"
                                                )}
                                              >
                                                {subject}
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                        <div className="mb-6">
                                          <div className="flex items-center gap-1.5 mb-3">
                                            <span className="font-bold text-slate-700">期刊库</span>
                                            <Info className="w-3.5 h-3.5 text-gray-400" />
                                          </div>
                                          <div className="flex gap-3">
                                            {[
                                              { name: '国际期刊', count: '1.7亿文献' },
                                              { name: '中国期刊', count: '0.8亿文献' },
                                              { name: '科协期刊集群', count: '60万全文文献' }
                                            ].map((db) => (
                                              <button
                                                key={db.name}
                                                onClick={() => setSelectedJournalDb(db.name)}
                                                className={cn(
                                                  "flex-1 p-3 border rounded-lg text-left transition-colors",
                                                  selectedJournalDb === db.name
                                                    ? "bg-blue-50 border-blue-200"
                                                    : "border-gray-200 hover:bg-gray-50 hover:border-blue-200"
                                                )}
                                              >
                                                <div className="font-bold text-slate-900 text-sm mb-1">{db.name}</div>
                                                <div className="text-xs text-gray-500">{db.count}</div>
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    </div>,
                                    document.body
                                  )}
                               </div>
                               )}

                               {/* Skill/Model Selector */}
                               {(taskStage as any) !== 'execution' && (
                               <div className="relative">
                                  {!selectedSkill ? (
                                     <div className="relative">
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); setShowModelDropdown(!showModelDropdown); setShowFilterDropdown(false); }}
                                          className={cn(
                                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border",
                                            showModelDropdown 
                                              ? "bg-blue-50 text-blue-600 border-blue-200 shadow-sm" 
                                              : "bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200"
                                          )}
                                        >
                                          <Settings className="w-3.5 h-3.5" />
                                          <span>技能</span>
                                        </button>
                                        
                                        {showModelDropdown && filterButtonRect && createPortal(
                                           <div 
                                             className="fixed z-[9999] animate-in fade-in zoom-in-95 duration-200 font-sans"
                                             style={{
                                               top: filterButtonRect.top - 8,
                                               left: filterButtonRect.left,
                                               transform: 'translateY(-100%)'
                                             }}
                                           >
                                             <div className="w-48 bg-white rounded-xl shadow-xl border border-gray-100 p-2">
                                                <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                                                  <button onClick={() => { setSelectedSkill({ id: 'research', name: '深入研究' }); setShowModelDropdown(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left text-gray-900 hover:bg-gray-50 transition-colors">
                                                    <Search className="w-4 h-4 text-gray-900" />
                                                    <span>深入研究</span>
                                                  </button>
                                                  <button onClick={() => { setSelectedSkill({ id: 'literature', name: '文献解读' }); setShowModelDropdown(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left text-gray-900 hover:bg-gray-50 transition-colors">
                                                    <MessageSquareQuote className="w-4 h-4 text-gray-900" />
                                                    <span>文献解读</span>
                                                  </button>
                                                  <button onClick={() => { setSelectedSkill({ id: 'data', name: '数据分析' }); setShowModelDropdown(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left text-gray-900 hover:bg-gray-50 transition-colors">
                                                    <PieChart className="w-4 h-4 text-gray-900" />
                                                    <span>数据分析</span>
                                                  </button>
                                                  <button onClick={() => { setSelectedSkill({ id: 'writing', name: '帮我写作' }); setShowModelDropdown(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left text-gray-900 hover:bg-gray-50 transition-colors">
                                                    <PenTool className="w-4 h-4 text-gray-900" />
                                                    <span>帮我写作</span>
                                                  </button>
                                                  <button onClick={() => { setSelectedSkill({ id: 'translate', name: '翻译' }); setShowModelDropdown(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left text-gray-900 hover:bg-gray-50 transition-colors">
                                                    <Languages className="w-4 h-4 text-gray-900" />
                                                    <span>翻译</span>
                                                  </button>
                                                  <button onClick={() => { setSelectedSkill({ id: 'coding', name: '编程' }); setShowModelDropdown(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left text-gray-900 hover:bg-gray-50 transition-colors">
                                                    <Zap className="w-4 h-4 text-gray-900" />
                                                    <span>编程</span>
                                                  </button>
                                                </div>
                                             </div>
                                           </div>,
                                           document.body
                                        )}
                                     </div>
                                  ) : null}
                               </div>
                               )}

                               {/* File Upload */}
                               <input 
                                  type="file" 
                                  ref={fileInputRef} 
                                  className="hidden" 
                                  multiple 
                               />
                               <button 
                                  onClick={() => fileInputRef.current?.click()}
                                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                               >
                                  <Paperclip className="w-4 h-4" />
                               </button>
                            </div>

                            <button 
                              onClick={handleSend}
                              disabled={!input.trim() && !isGenerating}
                              className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm",
                                input.trim() 
                                  ? "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105" 
                                  : "bg-gray-100 text-gray-600 text-gray-400 cursor-not-allowed"
                              )}
                            >
                               <Send className="w-4 h-4" />
                            </button>
                         </div>
                    </div>
                  </div>
               </div>
               
               <div className="text-center mt-4">
                  </div>
               
               {/* Portal Tooltip */}
               {hoveredTooltip && createPortal(
                <div 
                  className="fixed z-[9999] animate-in fade-in zoom-in-95 duration-200 font-sans pointer-events-auto"
                  style={{
                    top: hoveredTooltip.rect.top - 8, // Show above
                    left: hoveredTooltip.mode === 'simple' 
                      ? hoveredTooltip.rect.left 
                      : hoveredTooltip.mode === 'expert' 
                        ? hoveredTooltip.rect.left + (hoveredTooltip.rect.width / 2) 
                        : hoveredTooltip.rect.right,
                    transform: hoveredTooltip.mode === 'expert' 
                      ? 'translate(-50%, -100%)' 
                      : hoveredTooltip.mode === 'thought' 
                        ? 'translate(-100%, -100%)' 
                        : 'translateY(-100%)',
                  }}
                  onMouseEnter={() => setHoveredTooltip(prev => prev)}
                  onMouseLeave={() => setHoveredTooltip(null)}
                >
                  {/* Invisible bridge to prevent tooltip from disappearing when mouse moves between button and tooltip */}
                  <div className="absolute w-full h-[10px] -bottom-[10px] left-0 bg-transparent" />
                  
                  {hoveredTooltip.mode === 'simple' && (
                    <div className="w-64 p-4 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-slate-900" />
                        <span className="font-bold text-slate-900">简洁</span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed text-left font-normal">
                        快速提供学术答案，适合日常查词，帮助你迅速获取文献中的关键信息。
                      </p>
                    </div>
                  )}

                  {hoveredTooltip.mode === 'expert' && (
                    <div className="w-72 p-4 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Rocket className="w-4 h-4 text-slate-900" />
                          <span className="font-bold text-slate-900">专业</span>
                        </div>
                        <span className="text-xs text-blue-600 font-medium">当月剩余 5</span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed text-left font-normal mb-3">
                        提供更精准的学术回答，适合需要深入背景和精细分析的科研问题
                      </p>
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-blue-600 font-medium">
                            <GraduationCap className="w-3.5 h-3.5" />
                            学术认证领积分，畅享专业模式
                          </div>
                          <button className="text-gray-400 hover:text-blue-600">详情</button>
                        </div>
                      </div>
                      <button className="w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 text-slate-900 text-xs font-bold px-3 py-2 rounded-lg transition-colors">
                        完成学术认证
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {hoveredTooltip.mode === 'thought' && (
                    <div className="w-64 p-4 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Atom className="w-4 h-4 text-slate-900" />
                          <span className="font-bold text-slate-900">思考</span>
                        </div>
                        <span className="text-xs text-blue-600 font-medium">当月剩余 5</span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed text-left font-normal">
                        使用推理模型，展示思考过程
                      </p>
                    </div>
                  )}
                </div>,
                document.body
              )}
            </div>
            )}
            
        </div>

        {/* Right Side: Panel (File Preview or Battle Sandbox) */}
        {rightPanelContent !== 'none' && (
            rightPanelContent === 'battle' ? renderBattleSandbox() : 
            rightPanelContent === 'reasoning' ? renderReasoningSandbox() : (
            <div className="flex-1 bg-gray-50 flex flex-col h-full animate-in slide-in-from-right-10 duration-300 border-l border-gray-200">
                {/* Toolbar */}
                <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-gray-900">{selectedFile}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 text-gray-400">
                            <button className="hover:text-gray-600"><Eye className="w-4 h-4" /></button>
                            <button className="hover:text-gray-600"><Share2 className="w-4 h-4" /></button>
                            <button className="hover:text-gray-600"><RotateCcw className="w-4 h-4" /></button>
                        </div>
                        <div className="w-px h-4 bg-gray-200"></div>
                        {selectedFile === '生物HLE评测集答题卡.docx' && (
                           <button 
                               onClick={() => setIsEditingAnswerCard(!isEditingAnswerCard)}
                               className={cn(
                                   "px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5",
                                   isEditingAnswerCard 
                                      ? "bg-green-600 text-white hover:bg-green-700" 
                                      : "bg-black text-white hover:bg-gray-800"
                               )}
                           >
                               {isEditingAnswerCard ? <CheckCircle2 className="w-3 h-3" /> : <Edit3 className="w-3 h-3" />}
                               {isEditingAnswerCard ? "保存" : "编辑"}
                           </button>
                        )}
                        <button onClick={() => { setSelectedFile(null); setRightPanelContent('none'); setIsEditingAnswerCard(false); }} className="text-gray-400 hover:text-gray-600 ml-2">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Document Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="bg-white shadow-sm border border-gray-200 min-h-[800px] w-full max-w-[800px] mx-auto relative">
                         {/* Blue Banner */}
                         <div className="bg-[#2563eb] text-white p-12 text-center relative overflow-hidden">
                             <div className="relative z-10">
                                 <h1 className="text-3xl font-bold mb-4">{selectedFile === '生物HLE评测集答题卡.docx' ? '生物HLE评测集答题卡' : '生物学HLE评测集构建指南'}</h1>
                                 <p className="text-blue-100 text-lg opacity-90">{selectedFile === '生物HLE评测集答题卡.docx' ? '第一步：题目难度测试数据记录' : '面向2026年的前沿生物学难题生成与评测标准'}</p>
                             </div>
                             {/* Decorative circles/patterns if needed */}
                         </div>
                         
                         {/* Content Body */}
                         <div className="p-12 space-y-8 text-gray-800 leading-relaxed">
                             {selectedFile === '生物HLE评测集答题卡.docx' && answerCardData.step1 ? (
                               <div className="space-y-8">
                                  {/* Question Section */}
                                  <div className="space-y-3">
                                     <h3 className="text-lg font-bold text-gray-900 border-b pb-2">1. 原始题目</h3>
                                     {isEditingAnswerCard ? (
                                        <textarea 
                                            value={answerCardData.step1.question}
                                            onChange={(e) => setAnswerCardData(prev => ({
                                                ...prev,
                                                step1: prev.step1 ? { ...prev.step1, question: e.target.value } : null
                                            }))}
                                            className="w-full min-h-[100px] p-4 bg-white rounded-lg border border-blue-300 focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 resize-y"
                                        />
                                     ) : (
                                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-gray-700 whitespace-pre-wrap">
                                           {answerCardData.step1.question}
                                        </div>
                                     )}
                                  </div>

                                  {/* Models Response Section */}
                                  <div className="space-y-4">
                                     <h3 className="text-lg font-bold text-gray-900 border-b pb-2">2. 模型回答与评测</h3>
                                     <div className="grid gap-6">
                                        {answerCardData.step1.models.map((model, idx) => (
                                           <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden">
                                              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                                                 <span className="font-bold text-gray-900">{model.name}</span>
                                                 <div className={cn(
                                                    "px-2 py-1 rounded text-xs font-bold flex items-center gap-1",
                                                    model.isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                                 )}>
                                                    {model.isCorrect ? <CheckCircle2 className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                                    {model.isCorrect ? "回答正确" : "回答错误"}
                                                 </div>
                                              </div>
                                              <div className="p-4 space-y-3">
                                                 <div className="text-sm text-gray-600 leading-relaxed">
                                                    <span className="font-bold text-gray-400 text-xs uppercase tracking-wider block mb-1">Response</span>
                                                    {isEditingAnswerCard ? (
                                                       <textarea 
                                                           value={model.response}
                                                           onChange={(e) => {
                                                              const newModels = [...(answerCardData.step1?.models || [])];
                                                              newModels[idx].response = e.target.value;
                                                              setAnswerCardData(prev => ({
                                                                  ...prev,
                                                                  step1: prev.step1 ? { ...prev.step1, models: newModels } : null
                                                              }));
                                                           }}
                                                           className="w-full min-h-[80px] p-2 bg-white border border-blue-300 rounded focus:ring-1 focus:ring-blue-500 outline-none resize-y text-xs"
                                                       />
                                                    ) : (
                                                       model.response
                                                    )}
                                                 </div>
                                                 {!model.isCorrect && model.comment && (
                                                    <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-800">
                                                       <span className="font-bold block mb-1 flex items-center gap-1.5">
                                                          <AlertCircle className="w-3.5 h-3.5" />
                                                          错误原因分析：
                                                       </span>
                                                       {isEditingAnswerCard ? (
                                                          <textarea 
                                                              value={model.comment}
                                                              onChange={(e) => {
                                                                 const newModels = [...(answerCardData.step1?.models || [])];
                                                                 newModels[idx].comment = e.target.value;
                                                                 setAnswerCardData(prev => ({
                                                                     ...prev,
                                                                     step1: prev.step1 ? { ...prev.step1, models: newModels } : null
                                                                 }));
                                                              }}
                                                              className="w-full p-2 bg-white border border-red-300 rounded focus:ring-1 focus:ring-red-500 outline-none resize-y text-xs mt-1"
                                                              rows={2}
                                                          />
                                                       ) : (
                                                          model.comment
                                                       )}
                                                    </div>
                                                 )}
                                              </div>
                                           </div>
                                        ))}
                                     </div>
                                  </div>

                                  {/* Step 2 Section */}
                                  {answerCardData.step2 && (
                                    <div className="space-y-3 pt-6 border-t border-gray-200">
                                       <h3 className="text-lg font-bold text-gray-900 border-b pb-2">3. 题目解析</h3>
                                       <div className="flex gap-4 mb-2">
                                          <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100">
                                            {answerCardData.step2.domainL1 === 'molecular' ? '分子生物学' :
                                             answerCardData.step2.domainL1 === 'genetics' ? '遗传学' :
                                             answerCardData.step2.domainL1 === 'ecology' ? '生态学' :
                                             answerCardData.step2.domainL1 === 'neuro' ? '神经生物学' : answerCardData.step2.domainL1}
                                          </div>
                                          <div className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold border border-purple-100">
                                            {answerCardData.step2.domainL2 === 'crispr' ? 'CRISPR基因编辑' :
                                             answerCardData.step2.domainL2 === 'protein' ? '蛋白质结构与功能' :
                                             answerCardData.step2.domainL2 === 'epigenetics' ? '表观遗传学' :
                                             answerCardData.step2.domainL2 === 'synapse' ? '突触传递' : answerCardData.step2.domainL2}
                                          </div>
                                       </div>
                                       {isEditingAnswerCard ? (
                                          <textarea 
                                              value={answerCardData.step2.analysis}
                                              onChange={(e) => setAnswerCardData(prev => ({
                                                  ...prev,
                                                  step2: prev.step2 ? { ...prev.step2, analysis: e.target.value } : null
                                              }))}
                                              className="w-full min-h-[120px] p-4 bg-white rounded-lg border border-blue-300 focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 resize-y"
                                          />
                                       ) : (
                                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-gray-700 whitespace-pre-wrap">
                                             {answerCardData.step2.analysis}
                                          </div>
                                       )}

                                       {/* Reasoning History */}
                                       <div className="space-y-2 pt-4 border-t border-gray-100 mt-4">
                                          <h4 className="text-sm font-bold text-gray-900 mb-2">推理过程记录：</h4>
                                          <div className="space-y-3">
                                            {answerCardData.step2.reasoningHistory?.map((msg, idx) => (
                                              <div key={idx} className={cn("p-3 rounded-lg text-sm border", msg.role === 'user' ? "bg-white border-gray-200" : "bg-purple-50 border-purple-100 text-purple-900")}>
                                                <div className="flex items-center gap-2 mb-1">
                                                  <span className={cn("text-xs font-bold uppercase", msg.role === 'user' ? "text-gray-500" : "text-purple-600")}>
                                                    {msg.role === 'user' ? 'USER' : 'AI'}
                                                  </span>
                                                  {msg.knowledge && (
                                                    <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-bold border border-blue-200">
                                                      #MD {msg.knowledge}
                                                    </span>
                                                  )}
                                                </div>
                                                {msg.content}
                                              </div>
                                            ))}
                                          </div>
                                       </div>
                                    </div>
                                  )}
                                  
                                  {/* Step 3 Section */}
                                  {answerCardData.step3 && (
                                    <div className="space-y-3 pt-6 border-t border-gray-200">
                                       <h3 className="text-lg font-bold text-gray-900 border-b pb-2">4. 标准答案</h3>
                                       {isEditingAnswerCard ? (
                                          <textarea 
                                              value={answerCardData.step3.standardAnswer}
                                              onChange={(e) => setAnswerCardData(prev => ({
                                                  ...prev,
                                                  step3: prev.step3 ? { ...prev.step3, standardAnswer: e.target.value } : null
                                              }))}
                                              className="w-full min-h-[100px] p-4 bg-white rounded-lg border border-green-300 focus:ring-2 focus:ring-green-500 outline-none text-green-800 resize-y"
                                          />
                                       ) : (
                                          <div className="p-4 bg-green-50 rounded-lg border border-green-100 text-green-800 whitespace-pre-wrap">
                                             {answerCardData.step3.standardAnswer}
                                          </div>
                                       )}
                                    </div>
                                  )}
                               </div>
                             ) : (
                             <div className="prose prose-slate max-w-none">
                                <p className="text-lg">
                                   作为生物学领域的专家，我们需要构建一套高质量、高难度的生物学评测集（HLE），以评估大模型在复杂生物学问题上的推理能力。
                                </p>
                                <p>
                                   本评测集重点关注 <span className="font-bold text-[#2563eb]">遗传学、分子生物学、神经科学</span> 等前沿领域，要求题目具有深度的推理逻辑和严谨的科学依据。本文将为您提供一份详尽的题目构建与验证指南。
                                </p>
                                
                                <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">主要构建标准包括：</h3>
                                <div className="space-y-4">
                                    {[
                                        "题目必须包含多步推理过程，而非简单的知识检索，考察模型的深度思考能力",
                                        "结合最新的科研成果（如2024-2026年的顶刊论文），设计具有挑战性的实验分析题",
                                        "引入对抗性设计，确保题目能够有效区分模型的推理能力边界，避免模型通过死记硬背得分",
                                        "提供详尽的解题思路、推理步骤和参考文献，确保答案的唯一性和科学准确性",
                                        "严格遵守伦理规范，确保题目内容不涉及敏感生物安全信息，保障数据的合规性"
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-3">
                                            <span className="font-bold text-gray-900">{i+1}.</span>
                                            <span className="text-gray-600">{item}</span>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-100 text-gray-600 italic">
                                    “这份指南为您提供了从选题到验证的全流程标准，请务必严格遵守。”
                                </div>
                             </div>
                             )}
                         </div>
                         
                         {/* Document Footer */}
                         <div className="absolute bottom-4 left-0 right-0 text-center">
                             <p className="text-xs text-gray-400 mb-2">版本 1/1</p>
                             <p className="text-xs text-gray-300">内容由AI生成，不能保证完全准确</p>
                         </div>
                    </div>
                </div>
                
                {/* Floating Action Button inside Preview */}
                <div className="absolute bottom-8 right-8">
                    <button className="w-12 h-12 bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
                        <MessageSquareQuote className="w-5 h-5" />
                    </button>
                </div>
            </div>
        ))}
      </div>
    );
  }

  const renderRightSidebar = () => (
          <div className={cn("flex-shrink-0 flex flex-col h-full bg-white relative transition-all duration-500 ease-in-out border-l border-gray-100", isSidebarOpen ? "w-[400px] opacity-100 translate-x-0" : "w-0 opacity-0 overflow-hidden translate-x-20")}>
            {/* Sidebar Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
               <div className="flex items-center gap-6">
                  <button className="text-[15px] font-bold text-gray-900 border-b-2 border-gray-900 pb-4 -mb-4">参考文献</button>
                  <button className="text-[15px] font-medium text-gray-500 hover:text-gray-900 pb-4 -mb-4">全部搜索结果</button>
               </div>
               <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
               >
                  <X className="w-5 h-5" />
               </button>
            </div>
            
            <div className="px-6 py-3 border-b border-gray-50">
               <span className="text-xs text-gray-500">4 个来源</span>
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">
               {/* Result 1 */}
               <div ref={el => referenceRefs.current[0] = el} className="group">
                  <div className="flex items-start gap-3">
                     <span className="text-sm font-bold text-gray-900 mt-0.5">1.</span>
                     <div>
                        <h4 className="text-[15px] font-bold text-gray-900 leading-tight mb-1 group-hover:text-blue-600 cursor-pointer">Social Connectedness and Local Contagion</h4>
                        <p className="text-xs text-gray-500 mb-2">社会联系和地方传染</p>
                        
                        <div className="flex items-center gap-3 text-[11px] text-gray-500 mb-1.5">
                           <div className="flex items-center gap-1">
                              <div className="w-4 h-4 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-[8px] font-bold text-gray-500">C</div>
                              C. Matthew Leister
                           </div>
                           <div className="flex items-center gap-1">
                              <div className="w-4 h-4 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-[8px] font-bold text-gray-500">Y</div>
                              Yves Zenou
                           </div>
                           <div className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-400">+1</div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-[11px] text-gray-400">
                           <span>2021.05.10</span>
                           <span className="w-0.5 h-0.5 bg-gray-300 rounded-full"></span>
                           <div className="flex items-center gap-1">
                              <div className="w-3 h-3 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[8px]">T</div>
                              <span className="truncate max-w-[120px]">The Review of Econo...</span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Result 2 */}
               <div ref={el => referenceRefs.current[1] = el} className="group">
                  <div className="flex items-start gap-3">
                     <span className="text-sm font-bold text-gray-900 mt-0.5">2.</span>
                     <div>
                        <h4 className="text-[15px] font-bold text-gray-900 leading-tight mb-1 group-hover:text-blue-600 cursor-pointer">The rise of domestic capital markets for corporate financing: Lessons from East Asia</h4>
                        <p className="text-xs text-gray-500 mb-2">国内资本市场用于企业融资的崛起：来自东亚的经验教训</p>
                        
                        <div className="flex items-center gap-3 text-[11px] text-gray-500 mb-1.5">
                           <div className="flex items-center gap-1">
                              <div className="w-4 h-4 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-[8px] font-bold text-gray-500">F</div>
                              Facundo Abraham
                           </div>
                           <div className="flex items-center gap-1">
                              <div className="w-4 h-4 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-[8px] font-bold text-gray-500">J</div>
                              Juan J. Cortina
                           </div>
                           <div className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-400">+1</div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-[11px] text-gray-400">
                           <span>2021.01.01</span>
                           <span className="w-0.5 h-0.5 bg-gray-300 rounded-full"></span>
                           <div className="flex items-center gap-1">
                              <div className="w-3 h-3 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[8px]">J</div>
                              <span className="truncate max-w-[120px]">Journal of Banking & ...</span>
                           </div>
                           <span className="text-gray-400">( IS 3.8 )</span>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Result 3 */}
               <div ref={el => referenceRefs.current[2] = el} className="group">
                  <div className="flex items-start gap-3">
                     <span className="text-sm font-bold text-gray-900 mt-0.5">3.</span>
                     <div>
                        <h4 className="text-[15px] font-bold text-gray-900 leading-tight mb-1 group-hover:text-blue-600 cursor-pointer">A simple parameter-driven binary time series model</h4>
                        <p className="text-xs text-gray-500 mb-2">一个简单的参数驱动二元时间序列模型</p>
                        
                        <div className="flex items-center gap-3 text-[11px] text-gray-500 mb-1.5">
                           <div className="flex items-center gap-1">
                              <div className="w-4 h-4 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-[8px] font-bold text-gray-500">Y</div>
                              Yang Lu
                           </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-[11px] text-gray-400">
                           <span>2019.11.06</span>
                           <span className="w-0.5 h-0.5 bg-gray-300 rounded-full"></span>
                           <div className="flex items-center gap-1">
                              <div className="w-3 h-3 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-[8px]">J</div>
                              <span className="truncate max-w-[120px]">Journal of Forecasting</span>
                           </div>
                           <span className="text-gray-400">( IS 2.7 )</span>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Result 4 */}
               <div ref={el => referenceRefs.current[3] = el} className="group">
                  <div className="flex items-start gap-3">
                     <span className="text-sm font-bold text-gray-900 mt-0.5">4.</span>
                     <div>
                        <h4 className="text-[15px] font-bold text-gray-900 leading-tight mb-1 group-hover:text-blue-600 cursor-pointer">Stock liquidity and corporate diversification: Evidence from China's split share structure reform</h4>
                        <p className="text-xs text-gray-500 mb-2">股票流动性与公司多元化：来自中国股权分置改革的证据</p>
                        
                        <div className="flex items-center gap-3 text-[11px] text-gray-500 mb-1.5">
                           <div className="flex items-center gap-1">
                              <div className="w-4 h-4 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-[8px] font-bold text-gray-500">L</div>
                              Lifeng Gu
                           </div>
                           <div className="flex items-center gap-1">
                              <div className="w-4 h-4 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-[8px] font-bold text-gray-500">Y</div>
                              Yixin Wang
                           </div>
                           <div className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-400">+2</div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-[11px] text-gray-400">
                           <span>2018.12.01</span>
                           <span className="w-0.5 h-0.5 bg-gray-300 rounded-full"></span>
                           <div className="flex items-center gap-1">
                              <div className="w-3 h-3 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-[8px]">J</div>
                              <span className="truncate max-w-[120px]">Journal of Empirical F...</span>
                           </div>
                           <span className="text-gray-400">( IS 2.4 )</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
            
            {/* Bottom Actions */}
            <div className="absolute bottom-6 right-6 flex items-center gap-2 z-10 bg-white/80 backdrop-blur-sm p-2 rounded-xl">
               <button className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50 shadow-sm transition-colors">
                  <Search className="w-3.5 h-3.5" />
                  多文献对话
               </button>
               <button className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50 shadow-sm transition-colors">
                  <BookOpen className="w-3.5 h-3.5" />
                  加入到知识库
               </button>
            </div>
            
            {/* Floating Action Button */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 mt-32 z-10">
               <button className="w-10 h-10 bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
                  <MessageSquareQuote className="w-4 h-4" />
               </button>
            </div>
          </div>
  );

  // Render Roundtable Mode
  const renderRoundtable = () => {
    return (
      <div className="flex-1 flex h-full bg-white font-sans relative overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative w-full bg-white shadow-sm">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-20">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                圆桌讨论室
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                主题：{location.state?.prompt || '多模型协作与辩论'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-md">GPT-4</span>
              <span className="text-xs font-medium bg-purple-50 text-purple-700 px-2 py-1 rounded-md">Claude 3.5</span>
              <span className="text-xs font-medium bg-green-50 text-green-700 px-2 py-1 rounded-md">Llama 3</span>
            </div>
          </div>

          {/* Chat Timeline */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white max-w-5xl mx-auto w-full">
            {/* User Initial Message */}
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-gray-500">我 (主持人)</span>
              </div>
              <div className="bg-blue-600 text-white px-5 py-3 rounded-2xl rounded-tr-sm text-[15px] max-w-2xl leading-relaxed shadow-sm">
                {location.state?.prompt || '请各位专家探讨一下：大语言模型在医疗诊断中，最大的瓶颈是逻辑推理能力，还是知识库的覆盖面？'}
              </div>
            </div>

            {/* Model A Response */}
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2 mb-1 ml-1">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <Cpu className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <span className="text-xs font-bold text-gray-700">GPT-4 (激进派)</span>
                <span className="text-[10px] text-gray-400">10:42 AM</span>
              </div>
              <div className="bg-white border border-gray-200 px-5 py-4 rounded-2xl rounded-tl-sm text-[15px] max-w-2xl leading-relaxed shadow-sm text-gray-800">
                我认为最大的瓶颈在于<span className="font-bold text-blue-600">逻辑推理能力</span>。医疗诊断本质上是一个复杂的贝叶斯推理过程。虽然知识库可以无限扩充，但面对真实患者复杂的并发症、模糊的症状描述时，模型往往难以像人类医生那样进行多步的因果推断和假设检验。
              </div>
              <div className="flex items-center gap-2 mt-2 ml-2">
                <button 
                  onClick={() => {
                    setInput(prev => prev + (prev.endsWith(' ') || prev.length === 0 ? '' : ' ') + '@Claude 3.5 针对你的观点，我认为');
                    textareaRef.current?.focus();
                  }}
                  className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1 bg-white border border-gray-200 px-2 py-1 rounded-md shadow-sm transition-colors"
                >
                  <MessageSquareQuote className="w-3 h-3" />
                  反驳它
                </button>
                <button 
                  onClick={() => {
                    setInput(prev => prev + (prev.endsWith(' ') || prev.length === 0 ? '' : ' ') + '@Claude 3.5 我想补充一点：');
                    textareaRef.current?.focus();
                  }}
                  className="text-xs text-gray-500 hover:text-green-600 flex items-center gap-1 bg-white border border-gray-200 px-2 py-1 rounded-md shadow-sm transition-colors"
                >
                  <PlusCircle className="w-3 h-3" />
                  补充观点
                </button>
                <button 
                  onClick={() => {
                    setInput(prev => prev + (prev.endsWith(' ') || prev.length === 0 ? '' : ' ') + '@Claude 3.5 你的观点很有价值，可以作为最终结论。');
                    textareaRef.current?.focus();
                  }}
                  className="text-xs text-gray-500 hover:text-orange-600 flex items-center gap-1 bg-white border border-gray-200 px-2 py-1 rounded-md shadow-sm transition-colors"
                >
                  <ThumbsUp className="w-3 h-3" />
                  采纳为结论
                </button>
              </div>
            </div>

            {/* Model B Response */}
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2 mb-1 ml-1">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                  <Cpu className="w-3.5 h-3.5 text-purple-600" />
                </div>
                <span className="text-xs font-bold text-gray-700">Claude 3.5 (保守派)</span>
                <span className="text-[10px] text-gray-400">10:43 AM</span>
              </div>
              <div className="bg-white border border-gray-200 px-5 py-4 rounded-2xl rounded-tl-sm text-[15px] max-w-2xl leading-relaxed shadow-sm text-gray-800">
                <div className="mb-2 text-sm text-gray-500 bg-gray-50 p-2 rounded border-l-2 border-blue-400">
                  <span className="font-medium">@GPT-4</span> "我认为最大的瓶颈在于逻辑推理能力..."
                </div>
                我不同意这个观点。目前的瓶颈恰恰是<span className="font-bold text-purple-600">知识库的覆盖面和实时性</span>。逻辑推理的框架在很多医学指南中已经非常明确（如决策树），但长尾罕见病的数据、不同人种的特异性表现，这些底层知识的缺失会导致“巧妇难为无米之炊”。没有准确的先验概率，再强的推理也是空中楼阁。
              </div>
              <div className="flex items-center gap-2 mt-2 ml-2">
                <button 
                  onClick={() => {
                    setInput(prev => prev + (prev.endsWith(' ') || prev.length === 0 ? '' : ' ') + '@GPT-4 针对你的观点，我认为');
                    textareaRef.current?.focus();
                  }}
                  className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1 bg-white border border-gray-200 px-2 py-1 rounded-md shadow-sm transition-colors"
                >
                  <MessageSquareQuote className="w-3 h-3" />
                  反驳它
                </button>
                <button 
                  onClick={() => {
                    setInput(prev => prev + (prev.endsWith(' ') || prev.length === 0 ? '' : ' ') + '@GPT-4 我想补充一点：');
                    textareaRef.current?.focus();
                  }}
                  className="text-xs text-gray-500 hover:text-green-600 flex items-center gap-1 bg-white border border-gray-200 px-2 py-1 rounded-md shadow-sm transition-colors"
                >
                  <PlusCircle className="w-3 h-3" />
                  补充观点
                </button>
                <button 
                  onClick={() => {
                    setInput(prev => prev + (prev.endsWith(' ') || prev.length === 0 ? '' : ' ') + '@GPT-4 你的观点很有价值，可以作为最终结论。');
                    textareaRef.current?.focus();
                  }}
                  className="text-xs text-gray-500 hover:text-orange-600 flex items-center gap-1 bg-white border border-gray-200 px-2 py-1 rounded-md shadow-sm transition-colors"
                >
                  <ThumbsUp className="w-3 h-3" />
                  采纳为结论
                </button>
              </div>
            </div>

            {/* Moderator intervention example */}
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-gray-500">我 (主持人)</span>
              </div>
              <div className="bg-blue-600 text-white px-5 py-3 rounded-2xl rounded-tr-sm text-[15px] max-w-2xl leading-relaxed shadow-sm">
                <span className="bg-white/20 px-1.5 py-0.5 rounded text-sm mr-1">@Llama 3</span> 
                作为总结者，你能否调和一下两位的观点？是否有一种混合架构可以同时解决这两个问题？
              </div>
            </div>
            
            {/* Llama 3 Response (typing...) */}
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2 mb-1 ml-1">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <Cpu className="w-3.5 h-3.5 text-green-600" />
                </div>
                <span className="text-xs font-bold text-gray-700">Llama 3 (总结者)</span>
              </div>
              <div className="bg-white border border-gray-200 px-5 py-4 rounded-2xl rounded-tl-sm text-[15px] max-w-2xl leading-relaxed shadow-sm text-gray-800 flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
                <span className="text-sm text-gray-400 ml-2">正在思考混合架构方案...</span>
              </div>
            </div>

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Input Area */}
          <div className="p-4 bg-white border-t border-gray-100 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] relative">
            <div className="relative border border-gray-200 rounded-xl bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
              {/* Internal Toolbar above the textarea */}
              <div className="flex items-center justify-between p-3 border-b border-gray-100/50">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">指定发言：</span>
                  <button 
                    onClick={() => {
                      setInput(prev => prev + (prev.endsWith(' ') || prev.length === 0 ? '' : ' ') + '@GPT-4 ');
                      textareaRef.current?.focus();
                    }}
                    className="text-xs bg-white border border-gray-200 text-gray-700 px-3 py-1 rounded-full hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm"
                  >
                    @GPT-4
                  </button>
                  <button 
                    onClick={() => {
                      setInput(prev => prev + (prev.endsWith(' ') || prev.length === 0 ? '' : ' ') + '@Claude 3.5 ');
                      textareaRef.current?.focus();
                    }}
                    className="text-xs bg-white border border-gray-200 text-gray-700 px-3 py-1 rounded-full hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-colors shadow-sm"
                  >
                    @Claude 3.5
                  </button>
                  <button 
                    onClick={() => {
                      setInput(prev => prev + (prev.endsWith(' ') || prev.length === 0 ? '' : ' ') + '@Llama 3 ');
                      textareaRef.current?.focus();
                    }}
                    className="text-xs bg-white border border-gray-200 text-gray-700 px-3 py-1 rounded-full hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-colors shadow-sm"
                  >
                    @Llama 3
                  </button>
                </div>
                <button className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-4 py-1.5 rounded-full hover:bg-blue-100 transition-colors font-medium shadow-sm">
                  一键生成总结报告
                </button>
              </div>
              
              <textarea 
                ref={textareaRef}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="输入你的干预指令，或者 @ 某个模型..."
                className="w-full h-24 bg-transparent p-4 pr-12 text-sm focus:outline-none resize-none"
              ></textarea>
              <button className="absolute right-4 bottom-4 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow-sm hover:scale-105 active:scale-95">
                <Send className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Collapsible Sidebar moved here */}
        <div 
          className={cn(
            "bg-white border-l border-gray-200 transition-all duration-300 ease-in-out flex flex-col z-30 shadow-sm",
            isSidebarOpen ? "w-64" : "w-16"
          )}
        >
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            {isSidebarOpen && <span className="font-bold text-gray-900 text-sm">会议设置</span>}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={cn("p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors", !isSidebarOpen && "mx-auto")}
            >
              {isSidebarOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {/* Models Config */}
            <div>
              <div className={cn("flex items-center gap-2 mb-2 px-1", !isSidebarOpen && "justify-center")}>
                <Users className="w-4 h-4 text-gray-500" />
                {isSidebarOpen && <span className="text-xs font-bold text-gray-700">参会模型</span>}
              </div>
              {isSidebarOpen && (
                <div className="space-y-2">
                  <div className="p-2 border border-gray-100 rounded-lg bg-gray-50 flex items-center justify-between group">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center">
                        <Cpu className="w-3 h-3 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900">GPT-4</div>
                        <div className="text-[10px] text-gray-500">激进派</div>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"><Edit3 className="w-3 h-3" /></button>
                  </div>
                  <div className="p-2 border border-gray-100 rounded-lg bg-gray-50 flex items-center justify-between group">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-purple-100 flex items-center justify-center">
                        <Cpu className="w-3 h-3 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900">Claude 3.5</div>
                        <div className="text-[10px] text-gray-500">保守派</div>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"><Edit3 className="w-3 h-3" /></button>
                  </div>
                  <div className="p-2 border border-gray-100 rounded-lg bg-gray-50 flex items-center justify-between group">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-green-100 flex items-center justify-center">
                        <Cpu className="w-3 h-3 text-green-600" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900">Llama 3</div>
                        <div className="text-[10px] text-gray-500">总结者</div>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"><Edit3 className="w-3 h-3" /></button>
                  </div>
                  <button className="w-full py-1.5 border border-dashed border-gray-300 rounded-lg text-xs text-gray-500 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1">
                    <Plus className="w-3 h-3" /> 添加模型
                  </button>
                </div>
              )}
            </div>

            {/* Constraints */}
            <div>
              <div className={cn("flex items-center gap-2 mb-2 px-1 mt-4", !isSidebarOpen && "justify-center")}>
                <Settings className="w-4 h-4 text-gray-500" />
                {isSidebarOpen && <span className="text-xs font-bold text-gray-700">讨论约束</span>}
              </div>
              {isSidebarOpen && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-xs text-gray-600">强制引用知识库</span>
                    <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-500" />
                  </div>
                  <div className="flex items-center justify-between px-2">
                    <span className="text-xs text-gray-600">发言字数限制</span>
                    <div className="flex items-center">
                      <input 
                        type="number" 
                        defaultValue={200}
                        min={1}
                        max={1000}
                        className="w-12 text-[10px] bg-gray-100 px-1.5 py-0.5 rounded-l text-gray-700 text-center border-none focus:ring-1 focus:ring-blue-500 outline-none" 
                      />
                      <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded-r text-gray-500 border-l border-gray-200">字</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-2">
                    <span className="text-xs text-gray-600">自动轮流发言</span>
                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Fallback to Battle Mode (Original UI)
  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-gray-50 font-sans relative">
      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          {/* ... Share Modal Content ... */}
          <div className="bg-white rounded-3xl shadow-2xl w-[800px] h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 font-sans">
             <div className="p-8 text-center">Share Modal Content</div>
             <button onClick={() => setShowShareModal(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Main Content Area based on mode */}
      {location.state?.mode === 'roundtable' ? (
        renderRoundtable()
      ) : location.state?.mode !== 'arena' && location.state?.mode !== 'compare' && activeMode !== 'battle' && activeMode !== 'compare' ? (
        <div className="flex-1 flex h-full bg-white font-sans relative overflow-hidden">
          {/* Left Main Pane: Chat/Answer Area */}
          <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-gray-100 relative">
            
            {/* Main Chat Content Area */}
            <div className="flex-1 overflow-y-auto scroll-smooth relative flex flex-col" ref={scrollRefA}>
              <div className="flex-1 px-12 py-8 pb-12">
              
              {/* Top Action Bar */}
              {/* Note: Share button moved to Header.tsx */}

              {/* Main Question Header */}
              <div className="flex flex-col gap-6 mb-8 mt-4">
                 {/* Main Question Header - Force rendering first user prompt */}
                 <div className="flex justify-end">
                    <div className="bg-gray-50 text-gray-900 px-5 py-3 rounded-2xl rounded-tr-sm text-[15px] max-w-2xl leading-relaxed">
                      {location.state?.prompt || '大数法则的拓展如何实现？'}
                    </div>
                 </div>

                 {/* Assistant's initial response */}
                 <div className="flex flex-col gap-4">
                    {/* Answer Header for AI Response */}
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2 bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-100">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                          <span>参考 121 篇资料回答</span>
                       </div>
                       <button 
                         onClick={() => setIsThinkingExpanded(!isThinkingExpanded)}
                         className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-50 transition-colors"
                       >
                         <svg className={`w-4 h-4 transition-transform ${isThinkingExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                       </button>
                    </div>
                    
                    {/* Thinking process for the first AI response */}
                    {isThinkingExpanded && (
                      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm animate-in slide-in-from-top-4 fade-in duration-300">
                        {/* Step 1 */}
                        {thinkingStep >= 1 && (
                        <div className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                          <div className="flex items-center gap-2 mb-4">
                             <CheckCircle2 className="w-5 h-5 text-gray-900" />
                             <h3 className="font-bold text-gray-900 text-[15px]">已理解问题并定位研究方向</h3>
                          </div>
                          <div className="flex flex-wrap gap-2 pl-7">
                             {['law of large numbers', 'extension', 'probability theory', 'statistics', 'random variables'].map((tag, i) => (
                                <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-medium text-gray-700">
                                   <Search className="w-3 h-3 text-gray-400" />
                                   {tag}
                                </div>
                             ))}
                          </div>
                        </div>
                        )}

                        {/* Step 2 */}
                        {thinkingStep >= 2 && (
                        <div className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                          <div className="flex items-center gap-2 mb-4">
                             <CheckCircle2 className="w-5 h-5 text-gray-900" />
                             <h3 className="font-bold text-gray-900 text-[15px]">已深入分析问题</h3>
                          </div>
                          <div className="space-y-6 pl-7">
                             {/* Sub-step 2.1 */}
                             <div>
                                <div className="flex gap-2 mb-3">
                                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                                   <p className="text-sm text-gray-900 leading-relaxed">大数法则在非独立同分布条件下的扩展有哪些？</p>
                                </div>
                                <div className="flex flex-wrap gap-2 pl-3.5">
                                   {['dependent variables', 'non-identically distributed', 'martingale theory', 'ergodic theory'].map((tag, i) => (
                                      <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-medium text-gray-700">
                                         <Search className="w-3 h-3 text-gray-400" />
                                         {tag}
                                      </div>
                                   ))}
                                </div>
                             </div>
                             {/* Sub-step 2.2 */}
                             <div>
                                <div className="flex gap-2 mb-3">
                                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                                   <p className="text-sm text-gray-900 leading-relaxed">弱大数法则和强大数法则的现代推广在机器学习和高维统计中的应用是什么？</p>
                                </div>
                                <div className="flex flex-wrap gap-2 pl-3.5">
                                   {['machine learning', 'high-dimensional statistics', 'uniform laws of large numbers', 'empirical process'].map((tag, i) => (
                                      <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-medium text-gray-700">
                                         <Search className="w-3 h-3 text-gray-400" />
                                         {tag}
                                      </div>
                                   ))}
                                </div>
                             </div>
                          </div>
                        </div>
                        )}

                        {/* Step 3: Searching */}
                        {thinkingStep >= 3 && (
                        <div className="mb-8 pl-7 animate-in fade-in slide-in-from-bottom-2 duration-500">
                           <div className="flex items-center gap-2 mb-1 -ml-7">
                              {thinkingStep >= 4 ? (
                                 <CheckCircle2 className="w-5 h-5 text-gray-900" />
                              ) : (
                                 <div className="w-5 h-5 rounded-full border-2 border-gray-200 border-t-blue-500 animate-spin"></div>
                              )}
                              <h3 className="font-bold text-gray-900 text-[15px]">已在1.7亿文献中搜索</h3>
                           </div>
                           {thinkingStep >= 4 && (
                              <div className="text-xs text-gray-500 mb-2 font-medium">
                                 精选出 <span className="text-blue-600 font-bold">92</span> 篇相关文献
                              </div>
                           )}
                        </div>
                        )}

                        {/* Step 4: Analysis */}
                        {thinkingStep >= 4 && (
                        <div className="pl-7 animate-in fade-in slide-in-from-bottom-2 duration-500">
                           <div className="flex items-center gap-2 -ml-7">
                              {thinkingStep >= 5 ? (
                                 <CheckCircle2 className="w-5 h-5 text-gray-900" />
                              ) : (
                                 <div className="w-5 h-5 rounded-full border-2 border-gray-200 border-t-blue-500 animate-spin"></div>
                              )}
                              <h3 className="font-bold text-gray-900 text-[15px]">分析结果并完成总结</h3>
                           </div>
                        </div>
                        )}
                      </div>
                    )}

                    <div className="prose prose-slate max-w-none text-gray-800 text-[15px] leading-relaxed space-y-5">
                       <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
                          {visibleParas < 4 ? (
                             // Progressive reveal logic
                             <>
                                {visibleParas >= 1 && <p>大数法则（Law of Large Numbers, LLN）是概率论和统计学的基石，传统上它主要描述了独立同分布（i.i.d.）随机变量序列的样本均值依概率收敛或几乎必然收敛到其数学期望的现象。然而，在现代数据科学、金融工程以及复杂系统分析中，严格的 i.i.d. 假设往往难以满足。因此，大数法则的拓展成为了理论研究和应用实践的迫切需求 <span onClick={() => handleCitationClick(0)} className="inline-flex items-center justify-center w-4 h-4 text-[10px] bg-gray-100 text-gray-500 rounded ml-1 cursor-pointer hover:bg-blue-50 hover:text-blue-600">1</span>。</p>}
                                {visibleParas >= 2 && <p>首先，最直接的拓展是放宽“同分布”的假设。例如，马尔可夫（Markov）大数法则证明了只要随机变量序列的方差满足一定的增长限制条件，即使它们不同分布，大数法则依然成立。更进一步，针对“独立性”假设的放宽，研究者们引入了鞅差序列（Martingale Differences）和混合序列（Mixing Sequences）的概念。对于存在相依结构的数据（如时间序列分析中的自回归模型或空间统计中的局部传染效应），只要相依性随着距离的增加衰减得足够快，类似于大数法则的收敛性仍然可以得到保证 <span onClick={() => handleCitationClick(1)} className="inline-flex items-center justify-center w-4 h-4 text-[10px] bg-gray-100 text-gray-500 rounded ml-1 cursor-pointer hover:bg-blue-50 hover:text-blue-600">2</span> <span onClick={() => handleCitationClick(2)} className="inline-flex items-center justify-center w-4 h-4 text-[10px] bg-gray-100 text-gray-500 rounded ml-1 cursor-pointer hover:bg-blue-50 hover:text-blue-600">3</span>。</p>}
                                {visibleParas >= 3 && <p>其次，在机器学习和高维统计中，大数法则被拓展到了函数空间，即一致大数法则（Uniform Law of Large Numbers, ULLN）。在经验风险最小化（ERM）框架中，我们需要确保在整个假设空间（如神经网络的参数空间）内，经验误差一致收敛于泛化误差。这一拓展依赖于经验过程理论，通过引入 Vapnik-Chervonenkis (VC) 维度、Rademacher 复杂度和覆盖数（Covering Numbers）等工具，从本质上刻画了函数集的容量，从而为现代复杂模型的泛化能力提供了坚实的理论保障 <span onClick={() => handleCitationClick(3)} className="inline-flex items-center justify-center w-4 h-4 text-[10px] bg-gray-100 text-gray-500 rounded ml-1 cursor-pointer hover:bg-blue-50 hover:text-blue-600">4</span>。</p>}
                             </>
                          ) : (
                             // Final full text when visibleParas >= 4
                             <>
                                <p>大数法则（Law of Large Numbers, LLN）是概率论和统计学的基石，传统上它主要描述了独立同分布（i.i.d.）随机变量序列的样本均值依概率收敛或几乎必然收敛到其数学期望的现象。然而，在现代数据科学、金融工程以及复杂系统分析中，严格的 i.i.d. 假设往往难以满足。因此，大数法则的拓展成为了理论研究和应用实践的迫切需求 <span onClick={() => handleCitationClick(0)} className="inline-flex items-center justify-center w-4 h-4 text-[10px] bg-gray-100 text-gray-500 rounded ml-1 cursor-pointer hover:bg-blue-50 hover:text-blue-600">1</span>。</p>
                                <p>首先，最直接的拓展是放宽“同分布”的假设。例如，马尔可夫（Markov）大数法则证明了只要随机变量序列的方差满足一定的增长限制条件，即使它们不同分布，大数法则依然成立。更进一步，针对“独立性”假设的放宽，研究者们引入了鞅差序列（Martingale Differences）和混合序列（Mixing Sequences）的概念。对于存在相依结构的数据（如时间序列分析中的自回归模型或空间统计中的局部传染效应），只要相依性随着距离的增加衰减得足够快，类似于大数法则的收敛性仍然可以得到保证 <span onClick={() => handleCitationClick(1)} className="inline-flex items-center justify-center w-4 h-4 text-[10px] bg-gray-100 text-gray-500 rounded ml-1 cursor-pointer hover:bg-blue-50 hover:text-blue-600">2</span> <span onClick={() => handleCitationClick(2)} className="inline-flex items-center justify-center w-4 h-4 text-[10px] bg-gray-100 text-gray-500 rounded ml-1 cursor-pointer hover:bg-blue-50 hover:text-blue-600">3</span>。</p>
                                <p>其次，在机器学习和高维统计中，大数法则被拓展到了函数空间，即一致大数法则（Uniform Law of Large Numbers, ULLN）。在经验风险最小化（ERM）框架中，我们需要确保在整个假设空间（如神经网络的参数空间）内，经验误差一致收敛于泛化误差。这一拓展依赖于经验过程理论，通过引入 Vapnik-Chervonenkis (VC) 维度、Rademacher 复杂度和覆盖数（Covering Numbers）等工具，从本质上刻画了函数集的容量，从而为现代复杂模型的泛化能力提供了坚实的理论保障 <span onClick={() => handleCitationClick(3)} className="inline-flex items-center justify-center w-4 h-4 text-[10px] bg-gray-100 text-gray-500 rounded ml-1 cursor-pointer hover:bg-blue-50 hover:text-blue-600">4</span>。</p>
                             </>
                          )}
                       </div>
                    </div>
                 </div>

                 {/* Subsequent messages from interaction */}
                 {messages.map((msg: any) => (
                    <React.Fragment key={msg.id}>
                      {msg.role === 'user' ? (
                         <div className="flex justify-end mt-6">
                            <div className="bg-gray-50 text-gray-900 px-5 py-3 rounded-2xl rounded-tr-sm text-[15px] max-w-2xl leading-relaxed">
                               {msg.prompt || msg.content}
                            </div>
                         </div>
                      ) : (
                         <div className="flex flex-col gap-4 mt-6">
                            <div className="flex items-center justify-between">
                               <div className="flex items-center gap-2 bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-100">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                  <span>参考 {Math.floor(Math.random() * 100) + 20} 篇资料回答</span>
                               </div>
                            </div>
                            
                            <div className="prose prose-slate max-w-none text-gray-800 text-[15px] leading-relaxed space-y-5">
                               <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
                                  {typeof msg.content === 'string' ? <p>{msg.content}</p> : (msg.contentA ? msg.contentA : <p>{msg.prompt}</p>)}
                               </div>
                            </div>
                         </div>
                      )}
                    </React.Fragment>
                 ))}
                 
                 {/* Generation indicator */}
                 {isGenerating && (
                    <div className="flex flex-col gap-4 mt-6">
                       <div className="flex items-center gap-2 bg-gray-50 text-gray-600 w-fit px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-100">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                          <span>正在检索资料...</span>
                       </div>
                       <div className="flex items-center gap-2 text-gray-400 animate-pulse pl-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          <span className="text-sm">思考中...</span>
                       </div>
                    </div>
                 )}
                 <div ref={messagesEndRef} />
              </div>
              </div>
              
            {/* Bottom Input Composer */}
            <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent pt-6 pb-6 px-12 z-10 transition-all duration-500">
               <div className={cn(
                  "relative w-full mx-auto rounded-2xl bg-white border transition-all duration-300 flex flex-col overflow-hidden",
                  isInputExpanded ? "h-[50vh]" : "h-32",
                  input.trim() 
                     ? "border-blue-300 shadow-[0_4px_20px_rgba(37,99,235,0.15)]" 
                     : "border-gray-200 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:border-gray-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
               )}>
                  
                  {/* Input Area */}
                  <div className="flex-1 relative px-4 pt-4 pb-2">
                    {/* Expand Button */}
                    <div className="absolute top-2 right-2 z-10">
                       <button 
                          onClick={() => setIsInputExpanded(!isInputExpanded)}
                          className="text-gray-400 hover:text-gray-600 p-1.5 rounded-md hover:bg-gray-50 transition-colors"
                       >
                          {isInputExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                       </button>
                    </div>

                    {/* Inline Tag mimicking placeholder flow */}
                    {!input && messages.length === 0 && (
                       <div className="absolute top-4 left-4 pointer-events-none flex items-center h-[24px]">
                          <span className="text-blue-600 text-[15px] font-bold mr-2">学术搜索</span>
                       </div>
                    )}
                    
                    <textarea 
                       value={input}
                       onChange={(e) => setInput(e.target.value)}
                       onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend(input);
                          }
                       }}
                       className={cn(
                          "w-full h-full bg-transparent outline-none text-[15px] text-gray-900 placeholder-gray-400 resize-none scrollbar-hide leading-relaxed pb-12 pr-8",
                          !input && messages.length === 0 ? "indent-[76px]" : ""
                       )}
                       placeholder={!input && messages.length === 0 ? "询问任何科学问题" : ""}
                    />
                    
                    {/* Bottom Actions */}
                    <div className="absolute bottom-3 right-4 flex items-center gap-3 bg-white pl-2">
                        <button className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-50 transition-colors">
                            <Paperclip className="w-4 h-4" />
                        </button>
                        <div className="w-px h-4 bg-gray-200"></div>
                        
                        <button 
                          onClick={() => handleSend(input)}
                          disabled={!input.trim() || isGenerating}
                          className={cn(
                             "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm",
                             input.trim() && !isGenerating 
                               ? "bg-black text-white hover:bg-slate-800 hover:scale-105" 
                               : "bg-gray-100 text-gray-300 cursor-not-allowed"
                          )}
                        >
                           <Send className="w-4 h-4 ml-0.5" />
                        </button>
                     </div>
                  </div>
               </div>
               <div className="text-center mt-3">
                  <span className="text-[11px] text-gray-400">内容由AI生成，请仔细甄别</span>
               </div>
            </div>
            </div>
          </div>

          {/* Right Sidebar: Search Results */}
          {renderRightSidebar()}
        </div>
      ) : (
        <div className="flex-1 flex h-full bg-white font-sans relative overflow-hidden">
          <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-gray-100 relative">
          {/* Header for Arena / Compare */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-white z-10">
             <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-blue-500 fill-current" />
                <span className="font-bold text-gray-900">{location.state?.mode === 'compare' ? '对比模式 (Compare)' : '擂台模式 (Arena)'}</span>
             </div>
             <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                   <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                   <span>{location.state?.models?.[0] || 'GPT-4'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                   <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                   <span>{location.state?.models?.[1] || 'Claude 3.5'}</span>
                </div>
             </div>
          </div>

          {/* Split Content Area */}
          <div className="flex-1 flex overflow-hidden">
             {/* Left Column - Model A */}
             <div className="flex-1 border-r border-gray-100 flex flex-col bg-white transition-all duration-300 relative">
                <div className="flex-1 overflow-y-auto px-12 py-8 custom-scrollbar" ref={scrollRefA}>
                   {messages.map((msg: any, idx) => {
                      const isLatest = idx === messages.length - 1;
                      const hasSelectedA = msg.selection === 'A' || msg.selection === 'both';
                      const hasSelectedNeither = msg.selection === 'neither';
                      
                      return (
                      <div key={msg.id} className={cn(
                         "relative transition-all duration-300",
                         (hasSelectedA) ? "ring-2 ring-inset ring-green-500 rounded-2xl p-4 -m-4 bg-green-50/10" : 
                         (hasSelectedNeither) ? "ring-2 ring-inset ring-red-500 rounded-2xl p-4 -m-4 bg-red-50/10" : ""
                      )}>
                         {msg.role === 'user' ? (
                            <div className="flex justify-end mb-8 mt-4">
                               <div className="bg-gray-50 text-gray-900 px-5 py-3 rounded-2xl rounded-tr-sm text-[15px] max-w-2xl leading-relaxed shadow-sm">
                                  {msg.prompt}
                               </div>
                            </div>
                         ) : (
                            <div className="flex flex-col mb-6">
                               <div className="flex items-center gap-2 mb-6 relative">
                                  <div 
                                     onClick={() => setIsThinkingExpandedA(!isThinkingExpandedA)}
                                     className="flex items-center gap-2 bg-gray-50 text-gray-600 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200/60 shadow-sm cursor-pointer hover:bg-gray-100 transition-colors"
                                  >
                                     <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                     <span>参考 121 篇资料回答</span>
                                     <ChevronDown className={cn("w-3 h-3 ml-1 text-gray-400 transition-transform duration-200", isThinkingExpandedA ? "rotate-180" : "")} />
                                  </div>
                               </div>
                               
                               {/* Thinking Process Expandable Area */}
                               {isThinkingExpandedA && (
                                  <div className="mb-6 bg-gray-50/50 rounded-xl p-4 border border-gray-100 animate-in slide-in-from-top-2 duration-200">
                                     <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                           <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
                                           正在分析 "{msg.prompt}" 的意图...
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                           <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse delay-75"></div>
                                           检索相关的文献和数据库记录...
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                           <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse delay-150"></div>
                                           综合 121 篇相关资料进行推理...
                                        </div>
                                     </div>
                                  </div>
                               )}
                               <div className="prose prose-slate max-w-none text-gray-800 text-[15px] leading-relaxed space-y-5">
                                  {msg.isLoading ? (
                                     <div className="flex items-center gap-2 text-gray-400">
                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                                        正在思考...
                                     </div>
                                  ) : (
                                     msg.contentA
                                  )}
                               </div>
                            </div>
                         )}
                      </div>
                   )})}
                   <div ref={messagesEndRefA} />
                </div>
             </div>

             {/* Right Column - Model B */}
             <div className="flex-1 flex flex-col bg-white transition-all duration-300 relative">
                <div className="flex-1 overflow-y-auto px-12 py-8 custom-scrollbar" ref={scrollRefB}>
                   {messages.map((msg: any, idx) => {
                      const isLatest = idx === messages.length - 1;
                      const hasSelectedB = msg.selection === 'B' || msg.selection === 'both';
                      const hasSelectedNeither = msg.selection === 'neither';
                      
                      return (
                      <div key={msg.id} className={cn(
                         "relative transition-all duration-300",
                         (hasSelectedB) ? "ring-2 ring-inset ring-green-500 rounded-2xl p-4 -m-4 bg-green-50/10" : 
                         (hasSelectedNeither) ? "ring-2 ring-inset ring-red-500 rounded-2xl p-4 -m-4 bg-red-50/10" : ""
                      )}>
                         {msg.role === 'user' ? (
                            <div className="flex justify-end mb-8 mt-4">
                               <div className="bg-gray-50 text-gray-900 px-5 py-3 rounded-2xl rounded-tr-sm text-[15px] max-w-2xl leading-relaxed shadow-sm">
                                  {msg.prompt}
                               </div>
                            </div>
                         ) : (
                            <div className="flex flex-col mb-6">
                               <div className="flex items-center gap-2 mb-6 relative">
                                  <div 
                                     onClick={() => setIsThinkingExpandedB(!isThinkingExpandedB)}
                                     className="flex items-center gap-2 bg-gray-50 text-gray-600 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200/60 shadow-sm cursor-pointer hover:bg-gray-100 transition-colors"
                                  >
                                     <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                     <span>参考 121 篇资料回答</span>
                                     <ChevronDown className={cn("w-3 h-3 ml-1 text-gray-400 transition-transform duration-200", isThinkingExpandedB ? "rotate-180" : "")} />
                                  </div>
                               </div>
                               
                               {/* Thinking Process Expandable Area */}
                               {isThinkingExpandedB && (
                                  <div className="mb-6 bg-gray-50/50 rounded-xl p-4 border border-gray-100 animate-in slide-in-from-top-2 duration-200">
                                     <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                           <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></div>
                                           正在通过另外的视角分析 "{msg.prompt}"...
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                           <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse delay-75"></div>
                                           构建不同于 Model A 的推理逻辑...
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                           <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse delay-150"></div>
                                           生成对比性解答...
                                        </div>
                                     </div>
                                  </div>
                               )}
                               <div className="prose prose-slate max-w-none text-gray-800 text-[15px] leading-relaxed space-y-5">
                                  {msg.isLoading ? (
                                     <div className="flex items-center gap-2 text-gray-400">
                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-500"></div>
                                        正在思考...
                                     </div>
                                  ) : (
                                     msg.contentB || (msg.contentA && <span className="text-gray-400 italic">等待响应...</span>)
                                  )}
                               </div>
                            </div>
                         )}
                      </div>
                   )})}
                   <div ref={messagesEndRefB} />
                </div>
             </div>
          </div>

          {/* Shared Input Area */}
          <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent pt-6 pb-6 px-12 z-10 transition-all duration-500">
             {/* Arena / Compare Mode Selection Bar */}
             {!isGenerating && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (location.state?.mode === 'arena' || location.state?.mode === 'compare' || activeMode === 'compare') && (
                <div className="relative w-full max-w-[90%] mx-auto mb-6 flex items-center justify-center">
                   <div className="flex items-center bg-white rounded-xl p-1.5 border border-gray-100 shadow-sm gap-1.5">
                      <button 
                         onClick={() => {
                            setArenaSelection('A');
                            setMessages((prev: any) => {
                               const newMessages = [...prev];
                               for (let i = newMessages.length - 1; i >= 0; i--) {
                                  if (newMessages[i].role === 'assistant') {
                                     newMessages[i] = { ...newMessages[i], selection: 'A' };
                                     break;
                                  }
                               }
                               return newMessages;
                            });
                         }}
                         className={cn(
                            "flex items-center gap-2 px-8 py-2.5 rounded-lg transition-colors text-sm font-medium",
                            arenaSelection === 'A' 
                               ? "bg-blue-50 text-blue-600 border border-blue-100 shadow-sm" 
                               : "text-gray-600 hover:bg-gray-100 bg-gray-50/80"
                         )}
                      >
                         <span className={cn("text-lg leading-none", arenaSelection === 'A' ? "text-blue-500" : "text-gray-400")}>👈</span>
                         A 更好
                      </button>
                      <button 
                         onClick={() => {
                            setArenaSelection('both');
                            setMessages((prev: any) => {
                               const newMessages = [...prev];
                               for (let i = newMessages.length - 1; i >= 0; i--) {
                                  if (newMessages[i].role === 'assistant') {
                                     newMessages[i] = { ...newMessages[i], selection: 'both' };
                                     break;
                                  }
                               }
                               return newMessages;
                            });
                         }}
                         className={cn(
                            "flex items-center gap-2 px-8 py-2.5 rounded-lg transition-colors text-sm font-medium",
                            arenaSelection === 'both' 
                               ? "bg-blue-50 text-blue-600 border border-blue-100 shadow-sm" 
                               : "text-gray-600 hover:bg-gray-100 bg-gray-50/80"
                         )}
                      >
                         <ThumbsUp className={cn("w-4 h-4", arenaSelection === 'both' ? "text-blue-500" : "text-gray-400")} />
                         都好
                      </button>
                      <button 
                         onClick={() => {
                            setArenaSelection('neither');
                            setMessages((prev: any) => {
                               const newMessages = [...prev];
                               for (let i = newMessages.length - 1; i >= 0; i--) {
                                  if (newMessages[i].role === 'assistant') {
                                     newMessages[i] = { ...newMessages[i], selection: 'neither' };
                                     break;
                                  }
                               }
                               return newMessages;
                            });
                         }}
                         className={cn(
                            "flex items-center gap-2 px-8 py-2.5 rounded-lg transition-colors text-sm font-medium",
                            arenaSelection === 'neither' 
                               ? "bg-blue-50 text-blue-600 border border-blue-100 shadow-sm" 
                               : "text-gray-600 hover:bg-gray-100 bg-gray-50/80"
                         )}
                      >
                         <ThumbsDown className={cn("w-4 h-4", arenaSelection === 'neither' ? "text-blue-500" : "text-gray-400")} />
                         都不好
                      </button>
                      <button 
                         onClick={() => {
                            setArenaSelection('B');
                            setMessages((prev: any) => {
                               const newMessages = [...prev];
                               for (let i = newMessages.length - 1; i >= 0; i--) {
                                  if (newMessages[i].role === 'assistant') {
                                     newMessages[i] = { ...newMessages[i], selection: 'B' };
                                     break;
                                  }
                               }
                               return newMessages;
                            });
                         }}
                         className={cn(
                            "flex items-center gap-2 px-8 py-2.5 rounded-lg transition-colors text-sm font-medium",
                            arenaSelection === 'B' 
                               ? "bg-blue-50 text-blue-600 border border-blue-100 shadow-sm" 
                               : "text-gray-600 hover:bg-gray-100 bg-gray-50/80"
                         )}
                      >
                         <span className={cn("text-lg leading-none", arenaSelection === 'B' ? "text-blue-500" : "text-gray-400")}>👉</span>
                         B 更好
                      </button>
                   </div>
                </div>
             )}

             <div className={cn(
                "relative w-full mx-auto rounded-2xl bg-white border transition-all duration-300 flex flex-col overflow-hidden",
                isInputExpanded ? "h-[50vh]" : "h-32",
                input.trim() 
                   ? "border-blue-300 shadow-[0_4px_20px_rgba(37,99,235,0.15)]" 
                   : "border-gray-200 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:border-gray-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
             )}>
                <div className="flex-1 relative px-4 pt-4 pb-2">
                  <div className="absolute top-2 right-2 z-10">
                     <button 
                        onClick={() => setIsInputExpanded(!isInputExpanded)}
                        className="text-gray-400 hover:text-gray-600 p-1.5 rounded-md hover:bg-gray-50 transition-colors"
                     >
                        {isInputExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                     </button>
                  </div>
                  {!input && (
                     <div className="absolute top-4 left-4 pointer-events-none flex items-center h-[24px]">
                        <span className="text-blue-600 text-[15px] font-bold mr-2">学术搜索</span>
                     </div>
                  )}
                  <textarea 
                     value={input}
                     onChange={(e) => setInput(e.target.value)}
                     onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend(input);
                        }
                     }}
                     placeholder={!input ? "同时向两个模型提问" : ""}
                     className={cn(
                        "w-full h-full bg-transparent outline-none text-[15px] text-gray-900 placeholder-gray-400 resize-none scrollbar-hide leading-relaxed pb-12 pr-8",
                        !input ? "indent-[76px]" : ""
                     )}
                  />
                  <div className="absolute bottom-3 right-4 flex items-center gap-3 bg-white pl-2">
                      <button className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-50 transition-colors">
                          <Paperclip className="w-4 h-4" />
                      </button>
                      <div className="w-px h-4 bg-gray-200"></div>
                      <button 
                        onClick={() => handleSend(input)}
                        disabled={!input.trim() || isGenerating}
                        className={cn(
                           "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm",
                           input.trim() && !isGenerating 
                             ? "bg-black text-white hover:bg-slate-800 hover:scale-105" 
                             : "bg-gray-100 text-gray-300 cursor-not-allowed"
                        )}
                      >
                         <Send className="w-4 h-4 ml-0.5" />
                      </button>
                   </div>
                </div>
             </div>
             <div className="text-center mt-3">
                <span className="text-[11px] text-gray-400">内容由AI生成，请仔细甄别</span>
             </div>
          </div>
          </div>
          {renderRightSidebar()}
        </div>
      )}
    </div>
  );
}
