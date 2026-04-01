import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { 
  Send, 
  Paperclip, 
  Settings,
  Grid,
  Zap,
  ChevronDown,
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
  Users,
  BookOpen,
  MoreHorizontal,
  TrendingUp,
  FileSpreadsheet,
  FileText,
  PenTool,
  Search,
  Sparkles,
  Cpu,
  Layout,
  Image,
  Star,
  Clock,
  AlertCircle,
  Trophy,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Feather,
  Rocket,
  Atom,
  Info,
  Languages,
  RefreshCcw,
  PieChart,
  MessageSquareQuote
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

const SUGGESTED_QUESTIONS = [
  { id: 1, text: "大数法则的拓展如何实现？", icon: TrendingUp, color: "bg-orange-100 text-orange-600" },
  { id: 2, text: "森林管理对碳循环的影响是什么？", icon: Globe, color: "bg-emerald-100 text-emerald-600" },
  { id: 3, text: "暗物质与暗能量的本质是什么？", icon: Sparkles, color: "bg-indigo-100 text-indigo-600" },
  { id: 4, text: "量子计算的算法发展方向是什么？", icon: Cpu, color: "bg-blue-100 text-blue-600" },
  { id: 5, text: "如何用博弈论分析市场竞争？", icon: Scale, color: "bg-purple-100 text-purple-600" },
  { id: 6, text: "基因编辑技术的伦理边界在哪里？", icon: Stethoscope, color: "bg-red-100 text-red-600" },
  { id: 7, text: "人工智能在医疗诊断中的应用前景？", icon: Monitor, color: "bg-cyan-100 text-cyan-600" },
  { id: 8, text: "全球气候变暖对极地生态的影响？", icon: FlaskConical, color: "bg-green-100 text-green-600" },
  { id: 9, text: "区块链技术如何重构供应链金融？", icon: Briefcase, color: "bg-yellow-100 text-yellow-600" },
  { id: 10, text: "认知心理学如何解释记忆偏差？", icon: BookOpen, color: "bg-pink-100 text-pink-600" },
];

const BOUNTY_CHALLENGES = [
  {
    id: 1,
    title: "挑战大模型边界，赢取 ¥100~300 现金奖励",
    description: "用真实生活场景的难题测试 AI 能力。如果您觉得生成的答案不满意，提供您的参考答案和推导思路。一经采纳，即刻发放现金奖励！",
    icon: Trophy,
    color: "from-indigo-600 via-purple-600 to-pink-500",
    badge: "寻找最强出题人",
    badgeColor: "bg-yellow-400 text-yellow-900",
    highlight: "¥100~300",
    highlightColor: "text-yellow-300",
    royalty: true,
    attribution: true
  },
  {
    id: 2,
    title: "为难题写考点，赢取 ¥100~300 现金奖励",
    description: "不仅仅是出题，更要懂得如何评价。为复杂问题设计多维度的评分标准，帮助模型更精准地自我迭代。",
    icon: PenTool,
    color: "from-blue-600 via-cyan-500 to-teal-400",
    badge: "铁面判官",
    badgeColor: "bg-white text-blue-600",
    highlight: "¥100~300",
    highlightColor: "text-yellow-300",
    royalty: true,
    attribution: false
  },
  {
    id: 3,
    title: "指令遵循：给顶尖大模型当裁判，赢取 ¥100~300",
    description: "不仅要会问，还要会判。同时评估多个顶级模型的回答，找出细微的指令遵循差异，你的判断将决定模型的进化方向。",
    icon: Scale,
    color: "from-rose-500 via-orange-500 to-amber-500",
    badge: "金牌阅卷官",
    badgeColor: "bg-white text-rose-600",
    highlight: "¥100~300",
    highlightColor: "text-yellow-300",
    royalty: false,
    attribution: true
  },
  {
    id: 4,
    title: "收集 Badcase：抓住大模型的小辫子，赢取 ¥100~300",
    description: "专门寻找模型的逻辑漏洞、幻觉和错误。每一个被你揪出的 Badcase，都是模型通往完美的垫脚石。",
    icon: AlertCircle,
    color: "from-emerald-600 via-green-500 to-lime-400",
    badge: "漏洞猎手",
    badgeColor: "bg-white text-emerald-600",
    highlight: "¥100~300",
    highlightColor: "text-yellow-300",
    royalty: true,
    attribution: true
  }
];

const RECOMMENDED_TASKS = [
  {
    id: 'rec-1',
    title: '医疗报告实体抽取与纠错',
    type: '文本标注',
    domain: '医疗',
    price: '1500积分',
    unit: '题',
    deadline: '2天后',
    tags: ['临床', 'NER'],
    color: 'bg-green-50 text-green-700 border-green-200',
    icon: Stethoscope
  },
  {
    id: 'rec-2',
    title: 'Python 代码生成质量评估',
    type: '代码评估',
    domain: '软件与AI',
    price: '2500积分',
    unit: '题',
    deadline: '5小时后',
    tags: ['Python', '算法'],
    color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    icon: Code
  },
   {
    id: 'rec-3',
    title: '金融合同风险条款识别',
    type: '信息抽取',
    domain: '商业与金融',
    price: '4000积分',
    unit: '题',
    deadline: '1天后',
    tags: ['合同', '风险'],
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Briefcase
  }
];

export function Workbench() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  
  // New State for Model, Skill, File Upload
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showDomainDropdown, setShowDomainDropdown] = useState(false);
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [showError, setShowError] = useState(false);
  const [mode, setMode] = useState<'arena' | 'single' | 'compare' | 'roundtable'>('roundtable');
  const [showJournalDropdown, setShowJournalDropdown] = useState(false);
  const journalButtonRef = useRef<HTMLButtonElement>(null);
  const [journalButtonRect, setJournalButtonRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (showJournalDropdown && journalButtonRef.current) {
      const updateRect = () => {
        setJournalButtonRect(journalButtonRef.current?.getBoundingClientRect() || null);
      };
      updateRect();
      window.addEventListener('scroll', updateRect, true);
      window.addEventListener('resize', updateRect);
      return () => {
        window.removeEventListener('scroll', updateRect, true);
        window.removeEventListener('resize', updateRect);
      };
    }
  }, [showJournalDropdown]);
  const [queryMode, setQueryMode] = useState<'simple' | 'expert' | 'thought'>('expert');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('自然科学');
  const [selectedJournalDb, setSelectedJournalDb] = useState<string>('国际期刊');
  const [selectedSkill, setSelectedSkill] = useState<{ id: string; name: string } | null>(null);
  const [hoveredTooltip, setHoveredTooltip] = useState<{ mode: 'simple' | 'expert' | 'thought', rect: DOMRect } | null>(null);
  const [filterButtonRect, setFilterButtonRect] = useState<DOMRect | null>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [suggestionPage, setSuggestionPage] = useState(0);

  const [showPrivacyPopover, setShowPrivacyPopover] = useState(false);
  const privacyButtonRef = useRef<HTMLButtonElement>(null);
  const [privacyButtonRect, setPrivacyButtonRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (showFilterDropdown && filterButtonRef.current) {
      const updateRect = () => {
        setFilterButtonRect(filterButtonRef.current?.getBoundingClientRect() || null);
      };
      
      updateRect();
      window.addEventListener('resize', updateRect);
      
      // Close dropdown when scrolling outside
      const handleScroll = (e: Event) => {
        // Only close if scrolling an element that is NOT inside the dropdown
        const target = e.target as HTMLElement;
        if (!target.closest('.filter-dropdown-content')) {
          setShowFilterDropdown(false);
        }
      };
      
      window.addEventListener('scroll', handleScroll, true);
      
      return () => {
        window.removeEventListener('resize', updateRect);
        window.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [showFilterDropdown]);

  useEffect(() => {
    if (showPrivacyPopover && privacyButtonRef.current) {
      const updateRect = () => {
        setPrivacyButtonRect(privacyButtonRef.current?.getBoundingClientRect() || null);
      };
      updateRect();
      window.addEventListener('scroll', updateRect, true);
      window.addEventListener('resize', updateRect);
      return () => {
        window.removeEventListener('scroll', updateRect, true);
        window.removeEventListener('resize', updateRect);
      };
    }
  }, [showPrivacyPopover]);

  const [compareModel1, setCompareModel1] = useState<string>('gpt-4');
  const [compareModel2, setCompareModel2] = useState<string>('claude-3-5');
  const [showCompareDropdown1, setShowCompareDropdown1] = useState(false);
  const [showCompareDropdown2, setShowCompareDropdown2] = useState(false);
  const [modelSearchQuery, setModelSearchQuery] = useState('');

  const [roles, setRoles] = useState([
    {
      id: 'r1',
      name: '环境模拟器 (Patient)',
      model: 'Llama 3 (推荐)',
      prompt: '扮演客观环境或用户，提供模糊的初始反馈，不主动给出答案。',
      type: 'neutral'
    },
    {
      id: 'r2',
      name: '规则护栏 (Challenger)',
      model: 'Claude 3.5 (推荐)',
      prompt: '扮演伦理审查员或安全护栏，对测试模型进行极其苛刻的挑刺和漏洞挖掘。',
      type: 'challenger'
    },
    {
      id: 'r3',
      name: '被测模型 (Target AI)',
      model: 'GPT-4 (待测)',
      prompt: '试图在沙盒中完成任务，同时应对模拟器和护栏的双重压力。',
      type: 'target'
    }
  ]);

  const addRole = () => {
    const newRole = {
      id: `r${Date.now()}`,
      name: '新角色 (New Role)',
      model: 'GPT-4',
      prompt: '请输入该角色的行为准则和目标设定。',
      type: 'neutral' // default type
    };
    setRoles([...roles, newRole]);
  };

  const removeRole = (id: string) => {
    setRoles(roles.filter(r => r.id !== id));
  };

  const updateRole = (id: string, field: string, value: string) => {
    setRoles(roles.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  // Knowledge base at mentions
  const [showKnowledgeMention, setShowKnowledgeMention] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [selectedKnowledgeDocs, setSelectedKnowledgeDocs] = useState<Array<{id: string, name: string}>>([]);
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

  // When switching modes, adjust selected models
  useEffect(() => {
    if (mode === 'single' && selectedModels.length > 1) {
      setSelectedModels([selectedModels[0]]);
    }
  }, [mode]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentChallengeIndex((prev) => (prev + 1) % BOUNTY_CHALLENGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Listen for insertPrompt events from ExpertCopilotSidebar
  useEffect(() => {
    const handleInsertPrompt = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setInput(prev => prev ? `${prev}\n\n${customEvent.detail}` : customEvent.detail);
      
      // Auto-focus textarea
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.selectionStart = textareaRef.current.value.length;
          textareaRef.current.selectionEnd = textareaRef.current.value.length;
        }
      }, 50);
    };

    window.addEventListener('insertPrompt', handleInsertPrompt);
    return () => window.removeEventListener('insertPrompt', handleInsertPrompt);
  }, []);

  const handleStart = () => {
    if (!input.trim() && files.length === 0 && selectedKnowledgeDocs.length === 0) return;
    
    // Save real user input to localStorage for the sidebar history
    try {
      if (input.trim()) {
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
        historyArray = historyArray.filter(item => item !== input.trim());
        // Add to the beginning
        historyArray.unshift(input.trim());
        // Keep only the latest 5
        const newHistory = historyArray.slice(0, 5);
        
        localStorage.setItem('chatHistory', JSON.stringify(newHistory));
        window.dispatchEvent(new Event('chatHistoryUpdated'));
      }
    } catch (e) {
      console.error('Failed to update chat history', e);
    }

    // Auto-select models logic
    let finalModels = [...selectedModels];
    if (mode === 'compare') {
      finalModels = [compareModel1, compareModel2];
    } else if (finalModels.length === 0) {
      // 1. If no model selected, select the first two
      finalModels = [MODELS[0].id, MODELS[1].id];
    } else if (finalModels.length === 1) {
      // 2. If only one selected, select another one (first available that isn't already selected)
      const available = MODELS.find(m => m.id !== finalModels[0]);
      if (available) {
        finalModels.push(available.id);
      }
    }

    navigate('/expert/sandbox', { 
      state: { 
        prompt: input,
        models: finalModels,
        domain: selectedSubject,
        skills: selectedSkill ? [selectedSkill.id] : [],
        files: files,
        knowledgeDocs: selectedKnowledgeDocs,
        task: { 
             title: input.substring(0, 15) + (input.length > 15 ? "..." : ""),
             domain: selectedSubject,
             description: input
        },
        mode: mode === 'single' ? 'free' : mode
      } 
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showKnowledgeMention) {
      if (e.key === 'Escape') {
        setShowKnowledgeMention(false);
        return;
      }
      // Simple keyboard navigation could be added here
    }

    if (e.key === 'Enter' && !e.shiftKey && !showKnowledgeMention) {
      e.preventDefault();
      handleStart();
    }
  };

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
          top: rect.top, // Changed from rect.top - 200 to just rect.top, the translate-y-[-100%] handles moving it up
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 11) return '早上好';
    if (hour >= 11 && hour < 13) return '中午好';
    if (hour >= 13 && hour < 18) return '下午好';
    if (hour >= 18 && hour < 22) return '晚上好';
    return '夜深了';
  };

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col pt-24 pb-16 px-6 gap-12" onClick={() => {
      if (showModelDropdown) setShowModelDropdown(false);
      if (showDomainDropdown) setShowDomainDropdown(false);
      if (showSkillDropdown) setShowSkillDropdown(false);
      if (showCompareDropdown1) setShowCompareDropdown1(false);
      if (showCompareDropdown2) setShowCompareDropdown2(false);
    }}>
      {/* Greeting & Input Section */}
      <div className="flex flex-col items-center w-full">
        <h1 className="text-4xl font-bold text-slate-900 mb-4 text-center tracking-tight">{getGreeting()}！工作难题交给我来搞定吧</h1>
        <p className="text-gray-500 text-lg mb-10 text-center max-w-2xl font-normal">
          用真实生活工作场景的难题挑战 AI ，赚取高额报酬。
        </p>
        <div className="w-full relative group animate-in fade-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
          <div className="absolute inset-0 bg-white/50 rounded-2xl shadow-sm transition-shadow duration-300"></div>
          <div className="relative bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] transition-all">
            
              <div className="flex items-center gap-1 border-b border-gray-100 px-6 pt-4 relative">
                <button 
                  onClick={() => setMode('roundtable')}
                  className={cn(
                    "flex items-center gap-2 pb-3 px-2 text-sm font-bold transition-all relative",
                    mode === 'roundtable' ? "text-blue-600" : "text-gray-500 hover:text-blue-500"
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <Sparkles className={cn("w-4 h-4", mode === 'roundtable' ? "text-blue-600" : "text-gray-400")} />
                    圆桌沙盒 (辩论)
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm -ml-0.5 transform -translate-y-1">BETA</span>
                  </div>
                  {mode === 'roundtable' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full shadow-[0_-1px_4px_rgba(37,99,235,0.5)]"></div>}
                </button>
                
                <div className="w-px h-4 bg-gray-200 mx-2 mb-3"></div>

                <button 
                  onClick={() => setMode('single')}
                  className={cn(
                    "flex items-center gap-2 pb-3 px-2 text-sm font-medium transition-all relative",
                    mode === 'single' ? "text-slate-900" : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  经典模式 (单挑)
                  {mode === 'single' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-800 rounded-full"></div>}
                </button>
                
                <div className="w-px h-4 bg-gray-200 mx-2 mb-3"></div>

                <button 
                  onClick={() => setMode('compare')}
                  className={cn(
                    "flex items-center gap-2 pb-3 px-2 text-sm font-medium transition-all relative",
                    mode === 'compare' ? "text-slate-900" : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  对比模式 (明牌)
                  {mode === 'compare' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-800 rounded-full"></div>}
                </button>

                <div className="w-px h-4 bg-gray-200 mx-2 mb-3"></div>

                <button 
                  onClick={() => setMode('arena')}
                  className={cn(
                    "flex items-center gap-2 pb-3 px-2 text-sm font-medium transition-all relative",
                    mode === 'arena' ? "text-slate-900" : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  擂台模式 (盲测)
                  {mode === 'arena' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-800 rounded-full"></div>}
                </button>

              {/* Privacy Info Icon at Top Right */}
              <div className="absolute right-4 top-3">
                <button 
                  ref={privacyButtonRef}
                  onClick={(e) => { e.stopPropagation(); setShowPrivacyPopover(!showPrivacyPopover); }}
                  className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                >
                  <MessageSquareQuote className="w-4 h-4" />
                </button>
                {showPrivacyPopover && privacyButtonRect && createPortal(
                  <div 
                      className="fixed z-[9999] animate-in fade-in zoom-in-95 duration-200"
                      style={{
                        top: privacyButtonRect.bottom + 8,
                        left: privacyButtonRect.right - 320,
                      }}
                      onClick={e => e.stopPropagation()}
                    >
                    <div className="w-80 p-5 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 relative">
                      <h3 className="text-base font-serif italic text-gray-900 mb-3 leading-tight">
                        您的提示词可能会被公开分享以支持AI研究
                      </h3>
                      <p className="text-[13px] text-gray-600 leading-relaxed">您的对话可能会被分享，以支持我们的社区、改进我们的服务，并推动可靠AI的发展。这包括将去标识化（脱敏）的对话作为研究数据集的一部分在网上公开。</p>
                      <div className="absolute -top-2 right-[14px] w-4 h-4 bg-white border-t border-l border-gray-100 transform rotate-45"></div>
                    </div>
                    <div className="fixed inset-0 -z-10" onClick={() => setShowPrivacyPopover(false)} />
                  </div>,
                  document.body
                )}
              </div>
            </div>

            <div className="p-6">
              {/* Selected Chips Area */}
              {(selectedModels.length > 0 || selectedDomain || selectedSkills.length > 0 || files.length > 0 || selectedKnowledgeDocs.length > 0) && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {/* For compare mode, hide the selected models chip since they have dedicated dropdowns, but show other chips */}
                  {mode !== 'compare' && selectedModels.map(id => {
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
                  {selectedKnowledgeDocs.map((doc, index) => (
                    <span key={`k-${index}`} className="flex items-center gap-1 bg-rose-50 text-rose-700 px-2 py-1 rounded-md text-xs font-medium border border-rose-200">
                      <FileText className="w-3 h-3" />
                      <span className="max-w-[100px] truncate">{doc.name}</span>
                      <button onClick={() => setSelectedKnowledgeDocs(prev => prev.filter(d => d.id !== doc.id))} className="hover:text-rose-900 ml-1"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              )}

              <div className="relative flex items-start gap-2 min-h-[96px]">
                {selectedSkill && (
                  <div className="relative group/skill-tag flex-shrink-0 z-10">
                     {/* Tooltip */}
                     <div className="absolute bottom-full left-0 mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover/skill-tag:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        点击退出技能
                        <div className="absolute top-full left-4 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                     </div>
                     
                     {/* Tag */}
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
                      : mode === 'arena'
                        ? '工作遇到什么难题了？调用2个顶尖大模型来匿名对战吧！\n输入 @ 快速引用你的数字分身和专属知识库文档'
                        : mode === 'compare'
                          ? '工作遇到什么难题了？选择2个你最信任的大模型进行明牌对比！\n输入 @ 快速引用你的数字分身和专属知识库文档'
                          : mode === 'roundtable'
                            ? '设定一个辩论主题，并指定每个回合的任务（如：金融欺诈案，Round 1 陈述案情，Round 2 交叉质询...）\n如果不指定，平台将提供通用的圆桌推进流程'
                            : '工作遇到什么难题了？快把那些让头发掉光的学术问题扔给我！\n输入 @ 快速引用你的数字分身和专属知识库文档'
                  }
                  className="flex-1 h-24 resize-none outline-none text-gray-700 placeholder-gray-300 bg-transparent text-sm leading-relaxed py-1.5"
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
              </div>
              
              <div className="flex items-center justify-between mt-6 relative">
                <div className="flex items-center gap-3">
                  {mode === 'compare' ? (
                    <div className="flex items-center gap-2">
                      {/* Compare Model 1 Selector */}
                      <div className="relative">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setShowCompareDropdown1(!showCompareDropdown1); setShowCompareDropdown2(false); setModelSearchQuery(''); }}
                          className="flex items-center justify-between min-w-[160px] gap-2 px-3 py-1.5 bg-blue-50/50 hover:bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-100 transition-colors"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Cpu className="w-4 h-4 shrink-0" />
                            <span className="truncate">{MODELS.find(m => m.id === compareModel1)?.name || '选择模型'}</span>
                          </div>
                          <ChevronDown className="w-4 h-4 shrink-0 opacity-50" />
                        </button>
                        
                        {showCompareDropdown1 && (
                          <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 z-[100] animate-in fade-in zoom-in-95 duration-200 overflow-hidden" onClick={e => e.stopPropagation()}>
                            <div className="p-2 border-b border-gray-100">
                              <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input 
                                  type="text" 
                                  placeholder="搜索模型" 
                                  value={modelSearchQuery}
                                  onChange={(e) => setModelSearchQuery(e.target.value)}
                                  className="w-full bg-gray-50 border-none rounded-lg pl-8 pr-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                />
                              </div>
                            </div>
                            <div className="max-h-64 overflow-y-auto py-1">
                              <div className="px-3 py-1.5 text-xs font-bold text-gray-500">推荐模型</div>
                              {MODELS.filter(m => m.name.toLowerCase().includes(modelSearchQuery.toLowerCase())).map(model => (
                                <button
                                  key={model.id}
                                  disabled={compareModel2 === model.id}
                                  onClick={() => { setCompareModel1(model.id); setShowCompareDropdown1(false); }}
                                  className={cn(
                                    "w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors",
                                    compareModel2 === model.id 
                                      ? "opacity-50 cursor-not-allowed" 
                                      : compareModel1 === model.id
                                        ? "bg-blue-50/50 text-blue-700"
                                        : "hover:bg-gray-50 text-gray-900"
                                  )}
                                >
                                  <div className="flex items-center gap-2">
                                    <Cpu className="w-4 h-4" />
                                    <span>{model.name}</span>
                                  </div>
                                  {compareModel1 === model.id && <CheckCircle className="w-4 h-4 text-blue-500" />}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <span className="text-gray-300 font-bold px-1 text-sm">VS</span>

                      {/* Compare Model 2 Selector */}
                      <div className="relative">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setShowCompareDropdown2(!showCompareDropdown2); setShowCompareDropdown1(false); setModelSearchQuery(''); }}
                          className="flex items-center justify-between min-w-[160px] gap-2 px-3 py-1.5 bg-purple-50/50 hover:bg-purple-50 text-purple-700 rounded-lg text-sm font-medium border border-purple-100 transition-colors"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Cpu className="w-4 h-4 shrink-0" />
                            <span className="truncate">{MODELS.find(m => m.id === compareModel2)?.name || '选择模型'}</span>
                          </div>
                          <ChevronDown className="w-4 h-4 shrink-0 opacity-50" />
                        </button>
                        
                        {showCompareDropdown2 && (
                          <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 z-[100] animate-in fade-in zoom-in-95 duration-200 overflow-hidden" onClick={e => e.stopPropagation()}>
                            <div className="p-2 border-b border-gray-100">
                              <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input 
                                  type="text" 
                                  placeholder="搜索模型" 
                                  value={modelSearchQuery}
                                  onChange={(e) => setModelSearchQuery(e.target.value)}
                                  className="w-full bg-gray-50 border-none rounded-lg pl-8 pr-3 py-2 text-sm focus:ring-1 focus:ring-purple-500 outline-none"
                                />
                              </div>
                            </div>
                            <div className="max-h-64 overflow-y-auto py-1">
                              <div className="px-3 py-1.5 text-xs font-bold text-gray-500">推荐模型</div>
                              {MODELS.filter(m => m.name.toLowerCase().includes(modelSearchQuery.toLowerCase())).map(model => (
                                <button
                                  key={model.id}
                                  disabled={compareModel1 === model.id}
                                  onClick={() => { setCompareModel2(model.id); setShowCompareDropdown2(false); }}
                                  className={cn(
                                    "w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors",
                                    compareModel1 === model.id 
                                      ? "opacity-50 cursor-not-allowed" 
                                      : compareModel2 === model.id
                                        ? "bg-purple-50/50 text-purple-700"
                                        : "hover:bg-gray-50 text-gray-900"
                                  )}
                                >
                                  <div className="flex items-center gap-2">
                                    <Cpu className="w-4 h-4" />
                                    <span>{model.name}</span>
                                  </div>
                                  {compareModel2 === model.id && <CheckCircle className="w-4 h-4 text-purple-500" />}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                    {mode !== 'roundtable' && (
                    <div 
                      className="flex items-center bg-gray-100/80 rounded-full p-1 border border-gray-200/50 relative"
                      onMouseEnter={() => {}}
                      onMouseLeave={(e) => {
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
                            ? "bg-white text-blue-600 shadow-sm gap-1.5 px-4 py-1.5 text-sm font-medium" 
                            : "text-gray-500 hover:text-gray-700 w-9 h-9"
                          )}
                        >
                          <Zap className="w-4 h-4" />
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
                            ? "bg-white text-blue-600 shadow-sm gap-1.5 px-4 py-1.5 text-sm font-medium" 
                            : "text-gray-500 hover:text-gray-700 w-9 h-9"
                          )}
                        >
                          <Rocket className="w-4 h-4" />
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
                            ? "bg-white text-blue-600 shadow-sm gap-1.5 px-4 py-1.5 text-sm font-medium" 
                            : "text-gray-500 hover:text-gray-700 w-9 h-9"
                          )}
                        >
                          <Atom className="w-4 h-4" />
                          {queryMode === 'thought' && "思考"}
                        </button>
                      </div>
                    </div>
                    )}
                    </>
                  )}

                  {/* Skill Selector */}
                  <div className="relative shrink-0 flex items-center gap-2">
                    {mode === 'roundtable' && (
                      <>
                        <button
                          ref={filterButtonRef}
                          onClick={(e) => { e.stopPropagation(); setShowFilterDropdown(!showFilterDropdown); setShowJournalDropdown(false); }}
                          className={cn(
                            "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm transition-all border",
                            showFilterDropdown 
                              ? "bg-blue-50 text-blue-600 border-blue-200 shadow-sm" 
                              : "bg-white text-slate-700 border-gray-200 hover:border-blue-200 hover:text-blue-600"
                          )}
                        >
                          <Users className="w-4 h-4" />
                          <span>辩论角色分配</span>
                          <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showFilterDropdown ? "rotate-180" : "")} />
                        </button>

                        {showFilterDropdown && filterButtonRect && createPortal(
                          <div 
                            className="fixed z-[9999] animate-in fade-in zoom-in-95 duration-200 flex flex-col filter-dropdown-content"
                            style={{
                              top: filterButtonRect.bottom + 8,
                              left: filterButtonRect.left,
                              maxHeight: 'calc(100vh - ' + (filterButtonRect.bottom + 20) + 'px)'
                            }}
                          >
                            <div className="w-[600px] p-6 bg-white rounded-xl shadow-xl border border-gray-100 flex flex-col overflow-hidden">
                              <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3 shrink-0">
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                  <Users className="w-5 h-5 text-blue-600" />
                                  沙盒角色分配
                                </h3>
                                <button onClick={() => setShowFilterDropdown(false)} className="text-gray-400 hover:text-gray-600">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                              
                              <div className="space-y-4 overflow-y-auto pr-2 pb-2">
                                {roles.map((role) => (
                                  <div key={role.id} className={cn(
                                    "rounded-lg p-3 border group relative",
                                    role.type === 'neutral' ? "bg-slate-50 border-slate-200" :
                                    role.type === 'challenger' ? "bg-rose-50 border-rose-200" :
                                    "bg-emerald-50 border-emerald-200"
                                  )}>
                                    <button 
                                      onClick={() => removeRole(role.id)}
                                      className="absolute -top-2 -right-2 w-5 h-5 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2 flex-1">
                                        <div className={cn(
                                          "w-6 h-6 rounded-md flex items-center justify-center shrink-0",
                                          role.type === 'neutral' ? "bg-blue-100 text-blue-700" :
                                          role.type === 'challenger' ? "bg-rose-100 text-rose-700" :
                                          "bg-emerald-100 text-emerald-700"
                                        )}>
                                          {role.type === 'neutral' ? <Cpu className="w-3.5 h-3.5" /> :
                                           role.type === 'challenger' ? <AlertCircle className="w-3.5 h-3.5" /> :
                                           <Rocket className="w-3.5 h-3.5" />}
                                        </div>
                                        <input 
                                          type="text" 
                                          value={role.name}
                                          onChange={(e) => updateRole(role.id, 'name', e.target.value)}
                                          className={cn(
                                            "font-semibold text-sm bg-transparent border-b border-transparent focus:outline-none px-1 py-0.5 w-full transition-colors",
                                            role.type === 'neutral' ? "text-slate-800 hover:border-slate-300 focus:border-blue-500" :
                                            role.type === 'challenger' ? "text-rose-800 hover:border-rose-300 focus:border-rose-500" :
                                            "text-emerald-800 hover:border-emerald-300 focus:border-emerald-500"
                                          )}
                                        />
                                      </div>
                                      <select 
                                        value={role.model}
                                        onChange={(e) => updateRole(role.id, 'model', e.target.value)}
                                        className="text-xs border-gray-300 rounded bg-white text-gray-700 px-2 py-1 outline-none ml-4 shrink-0"
                                      >
                                        <option value="GPT-4 (待测)">GPT-4</option>
                                        <option value="Claude 3.5 (推荐)">Claude 3.5</option>
                                        <option value="Llama 3 (推荐)">Llama 3</option>
                                        <option value="Gemini Pro (待测)">Gemini Pro</option>
                                      </select>
                                    </div>
                                    <div className="pl-8">
                                      <textarea 
                                        value={role.prompt}
                                        onChange={(e) => updateRole(role.id, 'prompt', e.target.value)}
                                        className={cn(
                                          "w-full text-xs bg-transparent resize-none border border-transparent focus:bg-white focus:outline-none rounded p-1 transition-all",
                                          role.type === 'neutral' ? "text-slate-500 hover:border-slate-200 focus:border-blue-300" :
                                          role.type === 'challenger' ? "text-rose-600/80 hover:border-rose-200 focus:border-rose-300" :
                                          "text-emerald-600/80 hover:border-emerald-200 focus:border-emerald-300"
                                        )}
                                        rows={2}
                                      />
                                    </div>
                                  </div>
                                ))}
                                
                                <button 
                                  onClick={addRole}
                                  className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-blue-600 transition-colors flex items-center justify-center gap-1"
                                >
                                  <span>+</span> 添加新角色
                                </button>
                                
                                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Info className="w-3.5 h-3.5" />
                                    您将作为<strong className="text-gray-700">大法官 (Adjudicator)</strong>在讨论中发放最终奖励。
                                  </div>
                                  <button 
                                    onClick={() => setShowFilterDropdown(false)}
                                    className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                                  >
                                    确认配置
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div className="fixed inset-0 -z-10" onClick={() => setShowFilterDropdown(false)} />
                          </div>,
                          document.body
                        )}
                      </>
                    )}

                    {/* 始终显示国际期刊按钮，如果在圆桌模式下则作为独立的过滤按钮 */}
                    {mode !== 'roundtable' && (
                    <>
                      <button
                        ref={filterButtonRef}
                        onClick={(e) => { 
                          setShowFilterDropdown(!showFilterDropdown);
                        }}
                        aria-label="filter-button"
                        className={cn(
                          "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm transition-all border",
                          showFilterDropdown
                            ? "bg-blue-50 text-blue-600 border-blue-200 shadow-sm" 
                            : "bg-white text-slate-700 border-gray-200 hover:border-blue-200 hover:text-blue-600"
                        )}
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>{selectedJournalDb}</span>
                        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showFilterDropdown ? "rotate-180" : "")} />
                      </button>

                      {showFilterDropdown && filterButtonRect && createPortal(
                        <div 
                          className="fixed z-[9999] animate-in fade-in zoom-in-95 duration-200 filter-dropdown-content"
                          style={{
                            top: filterButtonRect.bottom + 8,
                            left: filterButtonRect.left,
                          }}
                        >
                          <div className="w-[480px] p-6 bg-white rounded-xl shadow-xl border border-gray-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">文献筛选</h3>
                            
                            <div className="mb-6">
                              <div className="flex items-center gap-1.5 mb-3">
                                <span className="font-bold text-slate-700">学科分类</span>
                                <div className="relative group">
                                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-pointer" />
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[10000]">
                                    选择适当的学科分类，使回答更贴合你的学术需求。
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                  </div>
                                </div>
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
                                <div className="relative group">
                                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-pointer" />
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 p-4 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[10000]">
                                    <p className="mb-2 leading-relaxed">选择不同期刊库可让AI回答更贴合你的研究语境。</p>
                                    <p className="mb-2 text-slate-300">注：分类依据期刊来源而非文献语言</p>
                                    <ul className="list-disc pl-4 space-y-1 text-slate-300">
                                      <li>国际期刊以英文文献为主（含少部分非英文文献）</li>
                                      <li>中国期刊以中文文献为主（含少部分非中文文献）</li>
                                      <li>科协期刊集群主要包含中国科协主管主办的期刊</li>
                                    </ul>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                  </div>
                                </div>
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
                          {/* Overlay to close dropdown */}
                          <div 
                            className="fixed inset-0 -z-10" 
                            onClick={() => {
                              setShowFilterDropdown(false);
                              setShowJournalDropdown(false);
                            }}
                          />
                        </div>,
                        document.body
                      )}
                    </>
                    )}
                  </div>

                  {/* Model Selector */}
                  {mode !== 'roundtable' && (
                  <div className="relative">
                    {!selectedSkill ? (
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
                          <span>技能</span>
                        </button>
                        
                        {showModelDropdown && (
                          <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                            {/* Updated Dropdown Menu */}
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
                              <Code className="w-4 h-4 text-gray-900" />
                              <span>编程</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                  )}

                  {/* File Upload */}
                  {mode !== 'roundtable' && (
                  <div className="flex items-center">
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
                  )}
                </div>
                
                <div className="relative group/send">
                  <button 
                    onClick={handleStart}
                    disabled={!input.trim() && files.length === 0}
                    className={cn(
                      "w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm",
                      (input.trim() || files.length > 0)
                        ? mode === 'roundtable' 
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:scale-105" 
                          : "bg-black text-white hover:bg-slate-800 hover:scale-105 hover:shadow-md" 
                        : "bg-gray-100 text-gray-300 cursor-not-allowed"
                    )}
                  >
                    {mode === 'roundtable' ? <Sparkles className="w-5 h-5 ml-0.5" /> : <Send className="w-5 h-5 ml-0.5" />}
                  </button>
                  {(!input.trim() && files.length === 0) && (
                    <div className={cn(
                      "absolute bottom-full right-0 mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded transition-opacity pointer-events-none z-50",
                      showError ? "opacity-100" : "opacity-0 group-hover/send:opacity-100"
                    )}>
                      请输入内容
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Suggested Questions */}
        <div className="mt-16 animate-in fade-in slide-in-from-bottom-4 duration-500 px-4">
          <div className="flex flex-wrap justify-center gap-3 mb-4">
              {SUGGESTED_QUESTIONS.slice(suggestionPage * 5, (suggestionPage + 1) * 5).map((question, index) => {
                // First row has 3 items, second row has 2 items
                const isFirstRow = index < 3;
                return (
                  <button
                    key={question.id}
                    onClick={() => setInput(question.text)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 rounded-xl transition-all border border-gray-100 hover:border-gray-200 text-left group shadow-sm"
                    )}
                  >
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", question.color)}>
                      <question.icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                      {question.text}
                    </span>
                  </button>
                );
              })}
            </div>
            
            <div className="flex justify-center">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSuggestionPage((prev) => (prev + 1) * 5 >= SUGGESTED_QUESTIONS.length ? 0 : prev + 1);
                }}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors px-3 py-1.5 rounded-full hover:bg-gray-100"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                换一换
              </button>
            </div>
          </div>
      </div>

      {/* Dashboard Metrics */}
      

      {/* Recommended Tasks */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">参与挑战赚积分</h2>
          <button 
            onClick={() => navigate('/expert')} 
            className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors"
          >
            查看全部
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Bounty Challenge Banner - Carousel */}
        <div className="relative group cursor-pointer mb-6">
          <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 h-[200px] mb-4">
            {BOUNTY_CHALLENGES.map((challenge, index) => {
              let position = "translate-x-full opacity-0";
              if (index === currentChallengeIndex) {
                position = "translate-x-0 opacity-100 z-10";
              } else if (
                index === (currentChallengeIndex - 1 + BOUNTY_CHALLENGES.length) % BOUNTY_CHALLENGES.length
              ) {
                position = "-translate-x-full opacity-0 z-0";
              }

              return (
                <div 
                  key={challenge.id}
                  className={cn(
                    "absolute inset-0 transition-all duration-500 ease-in-out transform",
                    position
                  )}
                  style={{
                    background: `linear-gradient(to right, var(--tw-gradient-stops))`,
                  }}
                >
                  <div className={cn("absolute inset-0 bg-gradient-to-r", challenge.color)}></div>
                  
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
                  <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
                  
                  <div className="relative h-full bg-white/10 backdrop-blur-sm p-6 sm:p-8 flex flex-col justify-center">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex-1 text-white">
                        <div className="flex items-center gap-2 mb-3">
                          <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm backdrop-blur-md", challenge.badgeColor)}>
                            <challenge.icon className="w-3.5 h-3.5" />
                            {challenge.badge}
                          </span>
                          
                          {/* Royalty Badge */}
                          {challenge.royalty && (
                            <span className="text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 bg-white/20 text-white backdrop-blur-md border border-white/20" title="包含模型收益分红">
                              <TrendingUp className="w-3 h-3" />
                              模型分红
                            </span>
                          )}

                          {/* Attribution Badge */}
                          {challenge.attribution && (
                            <span className="text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 bg-white/20 text-white backdrop-blur-md border border-white/20" title="保留专家署名权">
                              <Feather className="w-3 h-3" />
                              署名权
                            </span>
                          )}

                          <span className="text-white/80 text-sm font-medium tracking-wide ml-auto">
                            {index + 1} / {BOUNTY_CHALLENGES.length}
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold mb-3 text-white tracking-tight">
                          {challenge.title.split(challenge.highlight).map((part, i, arr) => (
                            <React.Fragment key={i}>
                              {part}
                              {i < arr.length - 1 && (
                                <span className={cn("font-extrabold text-3xl mx-1.5", challenge.highlightColor)}>
                                  {challenge.highlight}
                                </span>
                              )}
                            </React.Fragment>
                          ))}
                        </h3>
                        <p className="text-white/90 text-sm max-w-2xl leading-relaxed font-light">
                          {challenge.description}
                        </p>
                      </div>
                      
                      <button className="shrink-0 bg-white/95 hover:bg-white text-gray-900 active:scale-95 px-6 py-3 rounded-xl font-bold text-sm shadow-xl transition-all flex items-center gap-2 group/btn backdrop-blur-sm">
                        立即挑战
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Carousel Indicators */}
          <div className="flex justify-center gap-2 mt-4">
            {BOUNTY_CHALLENGES.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentChallengeIndex(idx);
                }}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  idx === currentChallengeIndex ? "bg-purple-600 w-6" : "bg-gray-200 hover:bg-gray-300"
                )}
              />
            ))}
          </div>

          {/* Navigation Arrows */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setCurrentChallengeIndex((prev) => (prev - 1 + BOUNTY_CHALLENGES.length) % BOUNTY_CHALLENGES.length);
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/40 backdrop-blur-sm -mt-4"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setCurrentChallengeIndex((prev) => (prev + 1) % BOUNTY_CHALLENGES.length);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/40 backdrop-blur-sm -mt-4"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {RECOMMENDED_TASKS.map((task) => (
            <div 
              key={task.id}
              className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all group cursor-pointer"
              onClick={() => navigate('/expert/sandbox', { state: { task: { ...task, description: task.title }, mode: 'guided' } })}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={cn("p-2 rounded-lg", task.color.split(' ')[0])}>
                  <task.icon className={cn("w-5 h-5", task.color.split(' ')[1])} />
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-slate-900">{task.price} <span className="text-xs font-normal text-gray-400">/{task.unit}</span></div>
                </div>
              </div>
              
              <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                {task.title}
              </h3>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {task.tags.map((tag, idx) => (
                  <span key={idx} className="bg-gray-50 text-gray-500 text-xs px-2 py-1 rounded-md border border-gray-100">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center text-xs text-gray-400 gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {task.deadline}
                </div>
                <button className="text-xs font-bold bg-black text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors">
                  立即开始
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Portal Tooltip */}
      {hoveredTooltip && createPortal(
        <div 
          className="fixed z-[9999] animate-in fade-in zoom-in-95 duration-200 pointer-events-auto group/tooltip"
          style={{
            top: hoveredTooltip.rect.bottom + 8,
            left: hoveredTooltip.mode === 'simple' 
              ? hoveredTooltip.rect.left 
              : hoveredTooltip.mode === 'expert' 
                ? hoveredTooltip.rect.left + (hoveredTooltip.rect.width / 2) 
                : hoveredTooltip.rect.right,
            transform: hoveredTooltip.mode === 'expert' 
              ? 'translateX(-50%)' 
              : hoveredTooltip.mode === 'thought' 
                ? 'translateX(-100%)' 
                : 'none',
          }}
          onMouseEnter={() => setHoveredTooltip(prev => prev)}
          onMouseLeave={() => setHoveredTooltip(null)}
        >
          {/* Invisible bridge to prevent tooltip from disappearing when mouse moves between button and tooltip */}
          <div className="absolute w-full h-[10px] -top-[10px] left-0 bg-transparent" />
          
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
              <button 
                onClick={() => {
                  setHoveredTooltip(null);
                  navigate('/expert/profile', { state: { activeTab: '身份与背书', scrollTo: 'platform-verification' } });
                }}
                className="w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 text-slate-900 text-xs font-bold px-3 py-2 rounded-lg transition-colors"
              >
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
  );
}
