import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  List as ListIcon,
  Send,
  Ghost,
  Filter,
  ArrowDownUp,
  CheckCircle2,
  PanelLeft,
  PanelRight,
  MoveRight,
  CopyPlus,
  Download,
  X,
  MinusCircle,
  Minus,
  ArrowUp,
  ArrowDown,
  Languages,
  LayoutTemplate,
  Menu,
  Bot,
  GraduationCap,
  CreditCard,
  Inbox,
  History,
  MessageCirclePlus,
  Scissors,
  ExternalLink,
  Link as LinkIcon,
  Copy,
  ChevronRight,
  ArrowRight,
  ImageIcon,
  ListOrdered,
  Bold,
  Italic,
  Cloud,
  Check,
  ChevronDown,
  Highlighter
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useHeaderActions } from '../contexts/HeaderActionsContext';

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

export const domainMockFolders: Record<string, FolderData[]> = {
  '全部': [
    {
      id: 'pf1',
      name: '大模型安全与能力评测',
      isPublic: true,
      docCount: 3,
      docs: [
        { id: 'pd1', name: '2026大模型评测指南.pdf', type: 'PDF', size: '2.4 MB', updatedAt: '2026-03-15', summary: '涵盖了2026年最新的大模型安全、能力与价值观评测基准。', tags: ['评测指南', '安全'] },
        { id: 'pd2', name: '错题集整理.xlsx', type: 'XLSX', size: '1.1 MB', updatedAt: '2026-03-10', summary: '收录了过去一个月在模型标注和对抗训练中遇到的高频错题及专家解析。', tags: ['错题集'] },
        { id: 'pd3', name: '提示词优化技巧.md', type: 'MD', size: '45 KB', updatedAt: '2026-03-05', summary: '基于CoT和Few-shot原理的进阶提示词工程实战技巧总结。', tags: ['Prompt'] }
      ]
    },
    {
      id: 'pf2',
      name: '医疗实体抽取规范',
      isPublic: true,
      docCount: 4,
      docs: [
        { id: 'pd4', name: '医疗病历实体抽取标准.pdf', type: 'PDF', size: '3.1 MB', updatedAt: '2026-02-15', summary: '三甲医院专家联合制定的抽取规范。', tags: ['医疗', 'NER'] },
        { id: 'pd5', name: '药品名称对照表.xlsx', type: 'XLSX', size: '1.2 MB', updatedAt: '2026-02-14', summary: '常见处方药与非处方药的标准名称对照。', tags: ['药品'] },
        { id: 'pd6', name: '手术记录结构化指南.docx', type: 'DOCX', size: '800 KB', updatedAt: '2026-02-10', summary: '手术记录的结构化数据提取指南。', tags: ['手术', '结构化'] },
        { id: 'pd7', name: '医疗问答数据集.json', type: 'JSON', size: '5.4 MB', updatedAt: '2026-02-05', summary: '包含1万条医患多轮对话的高质量数据集。', tags: ['对话', '数据集'] }
      ]
    },
    {
      id: 'pf3',
      name: '数据合规与隐私保护',
      isPublic: true,
      docCount: 3,
      docs: [
        { id: 'law_d1', name: '数据安全法实施细则解读.pdf', type: 'PDF', size: '1.5 MB', updatedAt: '2026-03-12', summary: '数据安全法在AI行业的落地指引。', tags: ['合规', '数据安全'] },
        { id: 'law_d2', name: '用户隐私协议模板.docx', type: 'DOCX', size: '400 KB', updatedAt: '2026-03-10', summary: '标准的AI产品用户隐私保护协议模板。', tags: ['隐私', '协议'] },
        { id: 'law_d3', name: '跨境数据传输评估指南.pdf', type: 'PDF', size: '2.2 MB', updatedAt: '2026-03-05', summary: '数据出境安全评估的标准流程。', tags: ['跨境', '安全评估'] }
      ]
    }
  ],
  'AIDP': [
    {
      id: 'aidp1',
      name: 'AIDP核心算法与论文',
      isPublic: true,
      docCount: 3,
      docs: [
        { id: 'aidp_d1', name: 'AIDP_v2_architecture.pdf', type: 'PDF', size: '4.2 MB', updatedAt: '2026-03-01', summary: 'AIDP第二代架构设计细节。', tags: ['架构', '算法'] },
        { id: 'aidp_d2', name: '训练数据配比实验.xlsx', type: 'XLSX', size: '2.1 MB', updatedAt: '2026-02-28', summary: '不同领域数据配比对模型能力的影响实验记录。', tags: ['实验', '数据配比'] },
        { id: 'aidp_d3', name: '推理加速优化方案.md', type: 'MD', size: '120 KB', updatedAt: '2026-02-25', summary: '基于KV Cache压缩的推理加速方案。', tags: ['推理', '加速'] }
      ]
    },
    {
      id: 'aidp2',
      name: '产品设计与迭代',
      isPublic: true,
      docCount: 3,
      docs: [
        { id: 'aidp_d4', name: 'Q2产品路线图.pptx', type: 'PPTX', size: '5.5 MB', updatedAt: '2026-03-10', summary: 'AIDP Q2季度的主要产品功能规划。', tags: ['路线图', '产品'] },
        { id: 'aidp_d5', name: '用户调研报告_0305.pdf', type: 'PDF', size: '1.8 MB', updatedAt: '2026-03-05', summary: '针对深度用户的产品使用体验调研结果。', tags: ['调研', '用户体验'] },
        { id: 'aidp_d6', name: '竞品分析_Copilot.docx', type: 'DOCX', size: '900 KB', updatedAt: '2026-03-01', summary: '与主要竞品的功能对比分析。', tags: ['竞品分析'] }
      ]
    }
  ],
  '法律': [
    {
      id: 'law1',
      name: '数据合规与隐私保护',
      isPublic: true,
      docCount: 4,
      docs: [
        { id: 'law_d1', name: '数据安全法实施细则解读.pdf', type: 'PDF', size: '1.5 MB', updatedAt: '2026-03-12', summary: '数据安全法在AI行业的落地指引。', tags: ['合规', '数据安全'] },
        { id: 'law_d2', name: '用户隐私协议模板.docx', type: 'DOCX', size: '400 KB', updatedAt: '2026-03-10', summary: '标准的AI产品用户隐私保护协议模板。', tags: ['隐私', '协议'] },
        { id: 'law_d3', name: '跨境数据传输评估指南.pdf', type: 'PDF', size: '2.2 MB', updatedAt: '2026-03-05', summary: '数据出境安全评估的标准流程。', tags: ['跨境', '安全评估'] },
        { id: 'law_d4', name: '欧盟AI法案摘要.md', type: 'MD', size: '85 KB', updatedAt: '2026-03-01', summary: 'EU AI Act的核心条款摘要及影响分析。', tags: ['欧盟', 'AI法案'] }
      ]
    },
    {
      id: 'law2',
      name: '知识产权与专利',
      isPublic: true,
      docCount: 3,
      docs: [
        { id: 'law_d5', name: 'AIGC版权归属争议案例.pdf', type: 'PDF', size: '1.9 MB', updatedAt: '2026-02-28', summary: '近期关于AI生成内容版权归属的典型判例分析。', tags: ['版权', '案例'] },
        { id: 'law_d6', name: '核心算法专利申请清单.xlsx', type: 'XLSX', size: '600 KB', updatedAt: '2026-02-20', summary: '公司本年度已提交及拟提交的专利清单。', tags: ['专利', '清单'] },
        { id: 'law_d7', name: '开源协议(License)使用指南.md', type: 'MD', size: '110 KB', updatedAt: '2026-02-15', summary: '常见开源协议(MIT, Apache, GPL等)的合规使用说明。', tags: ['开源', '协议'] }
      ]
    }
  ],
  '商业': [
    {
      id: 'biz1',
      name: '行业研究与研报',
      isPublic: true,
      docCount: 3,
      docs: [
        { id: 'biz_d1', name: '2026年全球AI产业发展报告.pdf', type: 'PDF', size: '8.5 MB', updatedAt: '2026-03-18', summary: '全球AI产业规模、趋势与投融资分析报告。', tags: ['行研', '产业报告'] },
        { id: 'biz_d2', name: 'Agent应用落地场景盘点.pptx', type: 'PPTX', size: '6.2 MB', updatedAt: '2026-03-10', summary: 'AI Agent在B端与C端的主流商业化落地场景。', tags: ['Agent', '商业化'] },
        { id: 'biz_d3', name: '大模型算力成本估算模型.xlsx', type: 'XLSX', size: '1.5 MB', updatedAt: '2026-03-05', summary: '不同参数规模模型的训练与推理成本测算工具。', tags: ['成本', '算力'] }
      ]
    },
    {
      id: 'biz2',
      name: '商业计划与BP',
      isPublic: true,
      docCount: 3,
      docs: [
        { id: 'biz_d4', name: 'AIDP商业化变现策略.docx', type: 'DOCX', size: '1.2 MB', updatedAt: '2026-03-15', summary: 'SaaS订阅、API调用及私有化部署的定价策略。', tags: ['定价', '商业化'] },
        { id: 'biz_d5', name: 'Q1销售目标与达成情况.xlsx', type: 'XLSX', size: '850 KB', updatedAt: '2026-03-01', summary: '第一季度各行业客户的拓展进度。', tags: ['销售', '业绩'] },
        { id: 'biz_d6', name: '战略合作伙伴名录.md', type: 'MD', size: '45 KB', updatedAt: '2026-02-25', summary: '生态合作伙伴与核心KA客户名单。', tags: ['合作', '生态'] }
      ]
    }
  ],
  '医疗': [
    {
      id: 'med1',
      name: '医疗大模型评测集',
      isPublic: true,
      docCount: 3,
      docs: [
        { id: 'med_d1', name: 'MedQA评测集(中文版).json', type: 'JSON', size: '12.4 MB', updatedAt: '2026-03-20', summary: '中文医疗问答标准评测数据集。', tags: ['评测集', '问答'] },
        { id: 'med_d2', name: '执业医师资格考试题库.xlsx', type: 'XLSX', size: '5.8 MB', updatedAt: '2026-03-15', summary: '用于测试模型医学专业知识的真题库。', tags: ['题库', '考试'] },
        { id: 'med_d3', name: '医疗幻觉检测指南.pdf', type: 'PDF', size: '2.6 MB', updatedAt: '2026-03-10', summary: '专门针对医疗领域的大模型幻觉(Hallucination)评估方法。', tags: ['幻觉', '安全'] }
      ]
    },
    {
      id: 'med2',
      name: '临床数据结构化',
      isPublic: true,
      docCount: 3,
      docs: [
        { id: 'med_d4', name: '电子病历(EMR)脱敏规范.docx', type: 'DOCX', size: '950 KB', updatedAt: '2026-03-05', summary: '临床数据用于AI训练前的隐私脱敏操作规范。', tags: ['脱敏', '隐私'] },
        { id: 'med_d5', name: 'ICD-11疾病编码映射表.xlsx', type: 'XLSX', size: '3.2 MB', updatedAt: '2026-03-01', summary: '最新版国际疾病分类代码对照表。', tags: ['ICD-11', '编码'] },
        { id: 'med_d6', name: '医学影像报告生成模板.md', type: 'MD', size: '60 KB', updatedAt: '2026-02-20', summary: 'CT/MRI等影像报告的标准结构与生成提示词。', tags: ['影像', '报告'] }
      ]
    }
  ]
};

export const initialPersonalFolders: FolderData[] = domainMockFolders['全部'];

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
  onFolderChange?: (folderName: string | null) => void;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  showCreateFolderModal?: boolean;
  setShowCreateFolderModal?: (show: boolean) => void;
  activeDomain?: string;
}

const ColorfulBotIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M8 4V8M16 4V8" stroke="url(#botGrad)" strokeWidth="2.5" strokeLinecap="round"/>
    <rect x="4" y="8" width="16" height="12" rx="4" fill="url(#botGrad)"/>
    <circle cx="9" cy="13" r="1.5" fill="white"/>
    <circle cx="15" cy="13" r="1.5" fill="white"/>
    <path d="M10 16.5Q12 18.5 14 16.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M2 14H4M20 14H22" stroke="url(#botGrad)" strokeWidth="2.5" strokeLinecap="round"/>
    <defs>
      <linearGradient id="botGrad" x1="2" y1="4" x2="22" y2="20" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3B82F6"/>
        <stop offset="0.5" stopColor="#8B5CF6"/>
        <stop offset="1" stopColor="#EC4899"/>
      </linearGradient>
    </defs>
  </svg>
);

const CloudCheckIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
    <path d="m9 13 2 2 4-4"/>
  </svg>
);

export function KnowledgeBaseView({ 
  type, 
  onFolderChange, 
  searchQuery: externalSearchQuery,
  onSearchQueryChange,
  showCreateFolderModal: externalShowCreateModal,
  setShowCreateFolderModal: externalSetShowCreateModal,
  activeDomain = '全部'
}: KnowledgeBaseViewProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [allPersonalFolders, setAllPersonalFolders] = useState<Record<string, FolderData[]>>({
    'default': initialPersonalFolders
  });
  
  const spaceId = searchParams.get('spaceId') || 'default';
  
  // Calculate effective space ID based on domain if it's the default shared space
  const effectiveSpaceId = spaceId === 'default' ? `default_${activeDomain}` : spaceId;
  
  // Get folders for current space
  const personalFolders = allPersonalFolders[effectiveSpaceId] || (spaceId === 'default' ? domainMockFolders[activeDomain] || [] : []);

  const setPersonalFolders = (updater: (prev: FolderData[]) => FolderData[]) => {
    setAllPersonalFolders(prev => ({
      ...prev,
      [effectiveSpaceId]: updater(prev[effectiveSpaceId] || (spaceId === 'default' ? domainMockFolders[activeDomain] || [] : []))
    }));
  };
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [internalShowCreateModal, setInternalShowCreateModal] = useState(false);

  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
  const setSearchQuery = onSearchQueryChange || setInternalSearchQuery;

  const showCreateFolderModal = externalShowCreateModal !== undefined ? externalShowCreateModal : internalShowCreateModal;
  const setShowCreateFolderModal = externalSetShowCreateModal || setInternalShowCreateModal;
  
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
  const [isFileListCollapsed, setIsFileListCollapsed] = useState(false);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);

  const [isSearchActive, setIsSearchActive] = useState(false);

  const [activeRightTab, setActiveRightTab] = useState('笔记 (0)');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [filterType, setFilterType] = useState('ALL');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortType, setSortType] = useState('添加时间');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const [showMoveDropdown, setShowMoveDropdown] = useState(false);
  const [isCreatingSpace, setIsCreatingSpace] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const moveMenuRef = useRef<HTMLDivElement>(null);
  const { customSpaces, setCustomSpaces } = useHeaderActions();
  const [chatInput, setChatInput] = useState('');
  const [quotedText, setQuotedText] = useState<string | null>(null);
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: '您好！我已经阅读了当前文件夹中的所有文档。您可以向我提问，或者让我为您总结文档内容。' }
  ]);

  const [newFolderName, setNewFolderName] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10;

  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [selectedModel, setSelectedModel] = useState('Gemini 3.1 Pro');
  const modelMenuRef = useRef<HTMLDivElement>(null);

  // Chat History Dropdown States
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyTab, setHistoryTab] = useState<'all' | 'pinned'>('all');
  const [historySearch, setHistorySearch] = useState('');
  const [activeHistoryMenu, setActiveHistoryMenu] = useState<string | null>(null);
  const [editingHistoryId, setEditingHistoryId] = useState<string | null>(null);
  const [editingHistoryTitle, setEditingHistoryTitle] = useState('');
  const historyMenuRef = useRef<HTMLDivElement>(null);
  
  const [notes, setNotes] = useState<{id: string, title: string, content: string, time: string}[]>([]);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [currentNoteTitle, setCurrentNoteTitle] = useState('');
  const [currentNoteContent, setCurrentNoteContent] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Translation State
  const [isTranslating, setIsTranslating] = useState(false);
  const [isCompareMode, setIsCompareMode] = useState(true);
  const [showTranslateMenu, setShowTranslateMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [translateLang, setTranslateLang] = useState('Chinese (Simplified)');
  const translateMenuRef = useRef<HTMLDivElement>(null);

  // Text Selection State
  const [selectionText, setSelectionText] = useState('');
  const [selectionPosition, setSelectionPosition] = useState({ top: 0, left: 0 });
  const [showSelectionPopup, setShowSelectionPopup] = useState(false);
  const selectionPopupRef = useRef<HTMLDivElement>(null);

  const TRANSLATION_LANGUAGES = [
    { name: 'English', native: 'English' },
    { name: 'Chinese (Simplified)', native: '中文(简体)' },
    { name: 'Chinese (Traditional)', native: '中文(繁體)' },
    { name: 'Spanish', native: 'Español' },
    { name: 'French', native: 'Français' },
    { name: 'Japanese', native: '日本語' }
  ];

  const noteTextareaRef = useRef<HTMLTextAreaElement>(null);
  const noteImageInputRef = useRef<HTMLInputElement>(null);

  // Auto-save logic
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isEditingNote && (currentNoteTitle.trim() || currentNoteContent.trim())) {
      setSaveState('saving');
      timeout = setTimeout(() => {
        setSaveState('saved');
        // Actually save the note data
        if (editingNoteId) {
          setNotes(prev => prev.map(n => n.id === editingNoteId ? {
            ...n,
            title: currentNoteTitle || '未命名',
            content: currentNoteContent || '无内容',
            time: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '.')
          } : n));
        } else {
          const newId = Date.now().toString();
          setEditingNoteId(newId); // Set ID so future auto-saves update this note
          setNotes(prev => [{
            id: newId,
            title: currentNoteTitle || '未命名',
            content: currentNoteContent || '无内容',
            time: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '.')
          }, ...prev]);
        }
        
        // Reset to idle after showing saved state for 3s
        setTimeout(() => {
          setSaveState('idle');
        }, 3000);
      }, 5000); // Save after 5s of typing
    } else {
      setSaveState('idle');
    }
    return () => clearTimeout(timeout);
  }, [isEditingNote, currentNoteTitle, currentNoteContent]);

  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = noteTextareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = currentNoteContent;
    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end);
    
    const newText = before + prefix + selected + suffix + after;
    setCurrentNoteContent(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const handleNoteImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      insertFormatting(`![${file.name}](${url})`);
    }
    if (e.target) e.target.value = '';
  };

  // Mock history items
  const [historyItems, setHistoryItems] = useState([
    { id: '1', title: '你觉得下一代数据标注平台应该是什么样...', preview: '我觉得"下一代数据标注平台"不该只是一个让标...', time: '今天', isPinned: false },
    { id: '2', title: '如何用 React 18 的 Concurrent Mode ...', preview: 'React 18 引入的 Concurrent Mode 主要是通过...', time: '今天', isPinned: true },
    { id: '3', title: '分析特斯拉 Q3 财报的核心指标与市场预...', preview: '从特斯拉刚发布的 Q3 财报来看，其汽车毛利率...', time: '昨天', isPinned: false },
    { id: '4', title: '帮我润色一份前端高级开发工程师的英文...', preview: 'Here is the polished version of your resume,...', time: '昨天', isPinned: false },
    { id: '5', title: '对比 Next.js 和 Nuxt.js 在服务端渲染(SS...', preview: '这两个框架都是目前非常流行的 SSR 解决方案。...', time: '前天', isPinned: false },
  ]);

  const filteredHistory = historyItems.filter(item => {
    if (historyTab === 'pinned' && !item.isPinned) return false;
    if (historySearch && !item.title.toLowerCase().includes(historySearch.toLowerCase())) return false;
    return true;
  });

  // When exiting batch mode, clear selection
  useEffect(() => {
    if (!isBatchMode) {
      setSelectedFileIds(new Set());
    }
  }, [isBatchMode]);

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const newFolder: FolderData = {
      id: `pf${Date.now()}`,
      name: newFolderName,
      isPublic: spaceId === 'default', // Only default to public in the default shared space
      docCount: 0,
      docs: []
    };
    
    setPersonalFolders(prev => [newFolder, ...prev]);
    
    setNewFolderName('');
    setShowCreateFolderModal(false);
  };

  const toggleFolderVisibility = (e: React.MouseEvent, folderId: string) => {
    e.stopPropagation();
    setPersonalFolders(prev => prev.map(folder => 
      folder.id === folderId 
        ? { ...folder, isPublic: !folder.isPublic }
        : folder
    ));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedFolderId) return;

    const newDocs: Document[] = Array.from(files).map(file => ({
      id: `doc${Date.now()}_${file.name}`,
      name: file.name,
      type: file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
      size: `${(file.size / 1024).toFixed(1)} KB`,
      updatedAt: new Date().toISOString().split('T')[0]
    }));

    setPersonalFolders(prev => prev.map(folder => {
      if (folder.id === selectedFolderId) {
        return {
          ...folder,
          docCount: folder.docCount + newDocs.length,
          docs: [...newDocs, ...folder.docs]
        };
      }
      return folder;
    }));
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const activeFolders = type === 'personal' ? personalFolders : mockPublicFolders;
  
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

  useEffect(() => {
    if (onFolderChange) {
      onFolderChange(selectedFolder ? selectedFolder.name : null);
    }
  }, [selectedFolder, onFolderChange]);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() && !quotedText) return;
    
    let userContent = chatInput;
    if (quotedText) {
      userContent = `> ${quotedText}\n\n${chatInput}`;
    }
    
    setChatHistory(prev => [...prev, { role: 'user', content: userContent }]);
    const input = chatInput;
    setChatInput('');
    setQuotedText(null);
    
    // Mock AI response
    setTimeout(() => {
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: `关于"${input || '引用内容'}"，基于当前知识库的分析如下...\n\n(这是一个演示回答，在实际接入后端后将返回真实的大模型分析结果)` 
      }]);
    }, 1000);
  };

  const handleNewChat = () => {
    // If there is meaningful history (more than just the welcome message)
    if (chatHistory.length > 1) {
      // Find the first user message to use as the title
      const firstUserMsg = chatHistory.find(msg => msg.role === 'user')?.content || '新对话';
      
      // Add the current chat to historyItems
      const newHistoryItem = {
        id: Date.now().toString(),
        title: firstUserMsg,
        preview: firstUserMsg.substring(0, 30) + '...',
        time: '今天',
        isPinned: false
      };
      
      setHistoryItems(prev => [newHistoryItem, ...prev]);
    }
    
    // Reset the current chat
    setChatHistory([
      { role: 'assistant', content: '您好！我已经阅读了当前文件夹中的所有文档。您可以向我提问，或者让我为您总结文档内容。' }
    ]);
    setChatInput('');
  };

  useEffect(() => {
    if (isSearchActive && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchActive]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false);
      }
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
      if (moveMenuRef.current && !moveMenuRef.current.contains(event.target as Node)) {
        setShowMoveDropdown(false);
      }
      if (modelMenuRef.current && !modelMenuRef.current.contains(event.target as Node)) {
        setShowModelDropdown(false);
      }
      if (historyMenuRef.current && !historyMenuRef.current.contains(event.target as Node)) {
        setShowHistoryModal(false);
      }
      if (translateMenuRef.current && !translateMenuRef.current.contains(event.target as Node)) {
        setShowTranslateMenu(false);
        setShowLangMenu(false);
      }
      if (selectionPopupRef.current && !selectionPopupRef.current.contains(event.target as Node)) {
        const selection = window.getSelection();
        if (!selection || selection.toString().trim().length === 0) {
          setShowSelectionPopup(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFolderClick = (folderId: string) => {
    setSelectedFolderId(folderId);
    setSelectedFileIds(new Set()); // Reset selection when changing folders
  };

  const toggleFileSelection = (fileId: string) => {
    const newSelection = new Set(selectedFileIds);
    if (newSelection.has(fileId)) {
      newSelection.delete(fileId);
    } else {
      newSelection.add(fileId);
    }
    setSelectedFileIds(newSelection);
  };

  const toggleAllFiles = () => {
    if (!selectedFolder) return;
    
    if (selectedFileIds.size === selectedFolder.docs.length) {
      setSelectedFileIds(new Set());
    } else {
      setSelectedFileIds(new Set(selectedFolder.docs.map(d => d.id)));
    }
  };

  const handleDocumentMouseUp = () => {
    setTimeout(() => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelectionText(selection.toString().trim());
        setSelectionPosition({
          top: Math.max(10, rect.top - 50),
          left: rect.left + rect.width / 2,
        });
        setShowSelectionPopup(true);
      } else {
        setShowSelectionPopup(false);
      }
    }, 10);
  };

  const handleHighlight = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && selection.toString().trim().length > 0) {
      try {
        const range = selection.getRangeAt(0);
        const mark = document.createElement('mark');
        mark.className = 'bg-yellow-200/70 rounded-[2px] text-inherit';
        
        // Try to surround the contents (works if selection is within a single node)
        // If it fails (e.g., spans multiple nodes), fallback to extract and insert
        try {
          range.surroundContents(mark);
        } catch (e) {
          mark.appendChild(range.extractContents());
          range.insertNode(mark);
        }
      } catch (e) {
        console.error("Failed to highlight text", e);
      }
    }

    const now = new Date();
    const timestamp = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const noteId = Date.now().toString();
    
    const newNote = {
      id: noteId,
      title: '生成中...',
      content: `> ${selectionText}\n\n`,
      time: timestamp
    };
    
    setNotes(prev => [newNote, ...prev]);
    setShowSelectionPopup(false);
    window.getSelection()?.removeAllRanges();
    setActiveRightTab(`笔记 (${notes.length + 1})`);
    setIsRightPanelCollapsed(false);

    // Simulate AI title generation
    setTimeout(() => {
      setNotes(prevNotes => prevNotes.map(note => {
        if (note.id === noteId) {
          // Mock an AI generated title based on the highlighted text
          let generatedTitle = selectionText.split(/[\s,，。;；]+/).filter(Boolean).slice(0, 4).join(' ');
          if (selectionText.includes('NVIDIA') || selectionText.includes('revenue')) {
            generatedTitle = 'NVIDIA Q3 Revenue Report';
          } else if (selectionText.includes('Transformer') || selectionText.includes('BLEU')) {
            generatedTitle = 'Transformer Model Performance';
          } else if (selectionText.length > 20) {
            generatedTitle = selectionText.substring(0, 20) + '...';
          } else {
            generatedTitle = selectionText || '新笔记';
          }
          return { ...note, title: generatedTitle };
        }
        return note;
      }));
    }, 1500); // 1.5s delay to simulate generation
  };

  const handleAskAI = () => {
    setQuotedText(selectionText);
    setShowSelectionPopup(false);
    window.getSelection()?.removeAllRanges();
    setActiveRightTab('聊天');
    setIsRightPanelCollapsed(false);
    // Focus the chat textarea
    setTimeout(() => {
      const textarea = document.querySelector('textarea[placeholder^="基于这"]') as HTMLTextAreaElement;
      if (textarea) textarea.focus();
    }, 100);
  };

  const handleCopySelection = () => {
    navigator.clipboard.writeText(selectionText);
    setShowSelectionPopup(false);
    window.getSelection()?.removeAllRanges();
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className={cn(
        "flex-1 transition-all duration-300",
        selectedFolderId ? "h-full" : "bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
      )}>
        {selectedFolderId && selectedFolder ? (
          // NotebookLM Style Split View
          <div className="flex h-full gap-4 animate-in fade-in duration-300 overflow-x-auto snap-x">
            {/* Left Panel: Sources */}
            <div className={cn(
              "shrink-0 flex flex-col bg-gray-50/50 rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300 ease-in-out snap-start",
              isFileListCollapsed ? "w-0 opacity-0 border-0 pointer-events-none -ml-4" : "w-[380px] min-w-[320px] max-w-[450px]"
            )}>
              <div className="px-5 py-4 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsFileListCollapsed(true)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors -ml-1.5"
                    title="折叠文件列表"
                  >
                    <PanelLeft className="w-[18px] h-[18px]" />
                  </button>
                  <div className="flex flex-col min-w-0">
                    <h2 className="text-base font-bold text-gray-900 leading-tight truncate">文件（{selectedFolder.docCount}）</h2>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-lg shrink-0 ml-2">
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

              {/* Pinned Toolbar */}
              <div className="px-5 py-3 bg-white border-b border-gray-100 shrink-0 sticky top-0 z-10 flex flex-col gap-3 min-h-[92px]">
                {isSearchActive ? (
                  <div className="flex items-center w-full h-[34px] border-2 border-blue-500 rounded-full bg-white shadow-[0_0_0_4px_rgba(59,130,246,0.1)] px-3">
                    <Search className="w-[16px] h-[16px] text-gray-900 shrink-0" />
                    <div className="w-px h-4 bg-gray-300 mx-2 shrink-0"></div>
                    <input 
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onBlur={(e) => {
                        if (!e.target.value) {
                          setIsSearchActive(false);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setIsSearchActive(false);
                          setSearchQuery('');
                        }
                      }}
                      placeholder="搜索"
                      className="flex-1 bg-transparent border-none outline-none text-[13px] text-gray-900 placeholder:text-gray-300 min-w-0"
                    />
                  </div>
                ) : selectedFileIds.size > 0 ? (
                  <div className="flex items-center justify-between h-[34px]">
                    <div 
                      className="flex items-center gap-2 text-[13px] font-medium text-gray-900 cursor-pointer"
                      onClick={toggleAllFiles}
                    >
                      <MinusCircle className="w-[18px] h-[18px] text-gray-900 fill-gray-900 stroke-white" />
                      选择 {selectedFileIds.size}
                    </div>
                    <div className="flex items-center gap-4 text-gray-600">
                      <div className="relative" ref={moveMenuRef}>
                        <div 
                          className={cn("cursor-pointer transition-colors", showMoveDropdown ? "text-blue-600" : "hover:text-gray-900")} 
                          title="移动"
                          onClick={() => setShowMoveDropdown(!showMoveDropdown)}
                        >
                          <ArrowDownUp className="w-[18px] h-[18px] transform rotate-90" />
                        </div>
                        {showMoveDropdown && (
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-3 z-[100] animate-in fade-in zoom-in-95 duration-200">
                            <div className="px-4 pb-2 text-sm font-bold text-gray-900 border-b border-gray-50 mb-2">移动到</div>
                            <div className="max-h-[240px] overflow-y-auto">
                              {customSpaces.map((space) => (
                                <button 
                                  key={space.id}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                                  onClick={() => setShowMoveDropdown(false)}
                                >
                                  <div className={cn(
                                    "w-6 h-6 rounded flex items-center justify-center shrink-0",
                                    space.name.includes('LLM') || space.name.includes('AI') ? "bg-orange-50 text-orange-500" :
                                    space.name.includes('Paper') || space.name.includes('Research') ? "bg-blue-50 text-blue-500" :
                                    "bg-slate-100 text-slate-500"
                                  )}>
                                    <Folder className="w-4 h-4 fill-current/20" />
                                  </div>
                                  <span className="text-sm text-gray-700 truncate">{space.name}</span>
                                </button>
                              ))}
                            </div>
                            <div className="px-3 pt-2 mt-1 border-t border-gray-50">
                              {isCreatingSpace ? (
                                <div className="relative flex items-center mb-1">
                                  <input
                                    type="text"
                                    value={newSpaceName}
                                    onChange={(e) => setNewSpaceName(e.target.value)}
                                    placeholder="输入知识空间名称..."
                                    className="w-full pl-3 pr-14 py-2 border border-purple-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && newSpaceName.trim()) {
                                        const newSpace = {
                                          id: `proj_${Date.now()}`,
                                          name: newSpaceName.trim()
                                        };
                                        setCustomSpaces(prev => {
                                          // Add the new space right after the first item (if it exists) or at the beginning
                                          const newSpaces = [...prev];
                                          if (newSpaces.length > 0) {
                                            newSpaces.splice(1, 0, newSpace);
                                          } else {
                                            newSpaces.push(newSpace);
                                          }
                                          return newSpaces;
                                        });
                                        setIsCreatingSpace(false);
                                        setNewSpaceName('');
                                        setShowMoveDropdown(false);
                                      } else if (e.key === 'Escape') {
                                        setIsCreatingSpace(false);
                                        setNewSpaceName('');
                                      }
                                    }}
                                  />
                                  <button 
                                    className={cn(
                                      "absolute right-1.5 px-2 py-1 rounded text-[13px] font-medium transition-colors",
                                      newSpaceName.trim() ? "text-purple-600 hover:bg-purple-50" : "text-gray-300"
                                    )}
                                    disabled={!newSpaceName.trim()}
                                    onClick={() => {
                                      if (newSpaceName.trim()) {
                                        const newSpace = {
                                          id: `proj_${Date.now()}`,
                                          name: newSpaceName.trim()
                                        };
                                        setCustomSpaces(prev => {
                                          const newSpaces = [...prev];
                                          if (newSpaces.length > 0) {
                                            newSpaces.splice(1, 0, newSpace);
                                          } else {
                                            newSpaces.push(newSpace);
                                          }
                                          return newSpaces;
                                        });
                                      }
                                      setIsCreatingSpace(false);
                                      setNewSpaceName('');
                                      setShowMoveDropdown(false);
                                    }}
                                  >
                                    保存
                                  </button>
                                </div>
                              ) : (
                                <button 
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors text-left font-medium"
                                  onClick={() => setIsCreatingSpace(true)}
                                >
                                  <Plus className="w-4 h-4" />
                                  创建一个知识空间
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="cursor-pointer hover:text-gray-900 transition-colors" title="复制"><CopyPlus className="w-[18px] h-[18px]" /></div>
                      <div className="cursor-pointer hover:text-gray-900 transition-colors" title="下载"><Download className="w-[18px] h-[18px]" /></div>
                      <div className="cursor-pointer hover:text-red-600 transition-colors" title="删除"><Trash2 className="w-[18px] h-[18px]" /></div>
                      <div className="w-px h-4 bg-gray-200"></div>
                      <div 
                        className="cursor-pointer hover:text-gray-900 transition-colors" 
                        onClick={() => setIsBatchMode(false)}
                        title="退出选中"
                      >
                        <X className="w-[18px] h-[18px]" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between h-[34px]">
                    <div className="flex items-center gap-4 text-gray-600">
                      <Search 
                        className="w-[18px] h-[18px] cursor-pointer hover:text-gray-900 transition-colors" 
                        onClick={() => setIsSearchActive(true)}
                      />
                      <div className="relative" ref={filterMenuRef}>
                        <Filter 
                          className={cn("w-[18px] h-[18px] cursor-pointer transition-colors", showFilterDropdown || filterType !== 'ALL' ? "text-blue-600" : "hover:text-gray-900")}
                          onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                        />
                        {showFilterDropdown && (
                          <div className="absolute top-full left-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-[100] animate-in fade-in zoom-in-95 duration-200 flex flex-col">
                            {['ALL', 'PDF', 'Word', 'Webpage', 'Audio', 'PPT', 'Txt', 'Image', 'Video'].map((type) => (
                              <button
                                key={type}
                                onClick={() => {
                                  setFilterType(type);
                                  setShowFilterDropdown(false);
                                }}
                                className={cn(
                                  "w-full text-left px-4 py-2 text-sm transition-colors hover:bg-gray-50",
                                  filterType === type ? "text-blue-600 bg-blue-50/50 font-medium" : "text-gray-700"
                                )}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="relative" ref={sortMenuRef}>
                        <ArrowDownUp 
                          className={cn("w-[18px] h-[18px] cursor-pointer transition-colors", showSortDropdown ? "text-blue-600" : "hover:text-gray-900")} 
                          onClick={() => setShowSortDropdown(!showSortDropdown)}
                        />
                        {showSortDropdown && (
                          <div className="absolute top-full left-0 mt-2 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-[100] animate-in fade-in zoom-in-95 duration-200 flex flex-col">
                            {['文档标题', '最近打开时间', '添加时间', '修改时间', '尺寸大小'].map((type) => (
                              <button
                                key={type}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (sortType === type) {
                                    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                                  } else {
                                    setSortType(type);
                                    setSortOrder('desc');
                                  }
                                  setShowSortDropdown(false);
                                }}
                                className={cn(
                                  "w-full text-left px-4 py-2 text-sm transition-colors hover:bg-gray-50 flex items-center justify-between group",
                                  sortType === type ? "text-blue-600 bg-blue-50/50 font-medium" : "text-gray-700"
                                )}
                              >
                                <span>{type}</span>
                                {sortType === type && (
                                  sortOrder === 'asc' ? (
                                    <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
                                  ) : (
                                    <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
                                  )
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div title="多选" className="flex items-center">
                        <CheckCircle2 
                          className={cn(
                            "w-[18px] h-[18px] cursor-pointer transition-colors",
                            isBatchMode ? "text-purple-600 fill-purple-600/20" : "hover:text-gray-900"
                          )}
                          onClick={() => {
                            setIsBatchMode(!isBatchMode);
                          }}
                        />
                      </div>
                    </div>
                    {type === 'personal' && (
                      <>
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-1.5 px-4 py-1.5 border border-gray-200 rounded-full text-[13px] font-medium text-gray-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 transition-all shrink-0"
                        >
                          <Plus className="w-[14px] h-[14px]" />
                          添加文件
                        </button>
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleFileUpload} 
                          className="hidden" 
                          multiple 
                        />
                      </>
                    )}
                  </div>
                )}
                {isBatchMode && (
                  <div 
                    className="flex items-center gap-2 text-[13px] font-medium text-gray-600 h-[22px] cursor-pointer hover:text-gray-900 transition-colors animate-in fade-in slide-in-from-top-1 duration-200"
                    onClick={toggleAllFiles}
                  >
                    {selectedFileIds.size > 0 ? (
                      <CheckCircle2 className="w-[18px] h-[18px] text-gray-900 fill-gray-900 stroke-white" />
                    ) : (
                      <div className="w-[18px] h-[18px] rounded-full border border-gray-300"></div>
                    )}
                    选择来源 ({selectedFileIds.size > 0 ? `已选 ${selectedFileIds.size} 项` : filterType})
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {selectedFolder.docs.filter(doc => {
                  if (filterType === 'ALL') return true;
                  // Map the dropdown types to the actual file extensions/types
                  const typeMap: Record<string, string[]> = {
                    'PDF': ['PDF'],
                    'Word': ['DOCX', 'DOC'],
                    'Webpage': ['HTML'],
                    'Audio': ['MP3', 'WAV'],
                    'PPT': ['PPTX', 'PPT'],
                    'Txt': ['TXT', 'MD'],
                    'Image': ['JPG', 'PNG', 'JPEG'],
                    'Video': ['MP4', 'AVI'],
                  };
                  const allowedTypes = typeMap[filterType] || [];
                  return allowedTypes.includes(doc.type.toUpperCase());
                }).sort((a, b) => {
                    let result = 0;
                    switch (sortType) {
                      case '文档标题':
                        result = a.name.localeCompare(b.name);
                        break;
                      case '最近打开时间':
                      case '修改时间':
                      case '添加时间':
                        result = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
                        break;
                      case '尺寸大小':
                        const sizeA = parseFloat(a.size) * (a.size.includes('MB') ? 1024 : 1);
                        const sizeB = parseFloat(b.size) * (b.size.includes('MB') ? 1024 : 1);
                        result = sizeA - sizeB;
                        break;
                      default:
                        result = 0;
                    }
                    return sortOrder === 'asc' ? result : -result;
                  }).map((doc) => {
                  const isSelected = selectedFileIds.has(doc.id);
                  return (
                    <div 
                      key={doc.id} 
                      onClick={() => {
                        if (isBatchMode) {
                          toggleFileSelection(doc.id);
                        } else {
                          setViewingDoc(doc);
                          setCurrentPage(1);
                          setActiveRightTab('聊天');
                          setIsRightPanelCollapsed(false);
                        }
                      }}
                      className={cn(
                        "rounded-xl border transition-all cursor-pointer group flex items-start gap-3 relative",
                        viewMode === 'grid' ? "p-4 flex-col" : "p-3",
                        isSelected 
                          ? "bg-purple-50/50 border-purple-300" 
                          : "bg-white border-gray-200 hover:border-purple-300 hover:bg-purple-50/20"
                      )}
                    >
                      {viewMode === 'list' && isBatchMode && (
                        <div className="mt-1 shrink-0 transition-all duration-200">
                          {isSelected ? (
                            <CheckCircle2 className="w-5 h-5 text-gray-900 fill-gray-900 stroke-white" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border border-gray-300 group-hover:border-purple-400"></div>
                          )}
                        </div>
                      )}
                      <div className={cn("flex items-start gap-3 w-full", viewMode === 'grid' ? "mb-3" : "flex-1 min-w-0")}>
                        {viewMode === 'grid' && (
                          <div className="shrink-0 absolute top-4 right-4 transition-all duration-200 z-10">
                            {isSelected ? (
                              <CheckCircle2 className="w-5 h-5 text-gray-900 fill-gray-900 stroke-white" />
                            ) : (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsFileListCollapsed(true);
                                }}
                                className="p-1 hover:bg-gray-100/50 rounded-md text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100 bg-white shadow-sm border border-gray-200"
                                title="折叠文件列表"
                              >
                                <PanelLeft className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )}
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">
                          {doc.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] text-gray-400">{doc.updatedAt}</span>
                          <span className="w-px h-2.5 bg-gray-300"></span>
                          <span className="px-1.5 py-0.5 bg-yellow-50/80 text-yellow-700 text-[10px] font-bold rounded border border-yellow-200/50">
                            {doc.type}
                          </span>
                          <span className="text-[11px] text-gray-400 ml-1">{doc.size}</span>
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
                );
              })}
                
                {/* type === 'personal' && (
                  <>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-sm font-medium text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      上传文档
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      className="hidden" 
                      multiple 
                    />
                  </>
                ) */}
              </div>
            </div>

            {/* Right Panel: Studio / Chat */}
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden relative transition-all duration-300 min-w-[400px] snap-start">
              {viewingDoc ? (
                <>
                  <div className="h-14 border-b border-gray-100 flex items-center justify-between px-4 shrink-0 bg-gray-50/50">
                    <div className="flex items-center gap-2 shrink-0">
                      {isFileListCollapsed && (
                        <>
                          <button 
                            onClick={() => setIsFileListCollapsed(false)}
                            className="p-2 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
                            title="展开文件列表"
                          >
                            <PanelLeft className="w-[18px] h-[18px]" />
                          </button>
                          <div className="w-px h-4 bg-gray-300 mx-1"></div>
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-gray-500 overflow-x-auto scrollbar-hide px-2">
                      <button className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors shrink-0"><Menu className="w-[18px] h-[18px]"/></button>
                      <div className="w-px h-4 bg-gray-300 shrink-0"></div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"><Minus className="w-[18px] h-[18px]"/></button>
                        <span className="text-sm font-medium min-w-[3rem] text-center">100%</span>
                        <button className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"><Plus className="w-[18px] h-[18px]"/></button>
                      </div>
                      <div className="w-px h-4 bg-gray-300 shrink-0"></div>
                      <div className="flex items-center gap-2 text-sm font-medium shrink-0">
                        <button 
                          className={cn("p-1.5 rounded-lg transition-colors", currentPage > 1 ? "hover:bg-gray-200 text-gray-700" : "text-gray-300 cursor-not-allowed")}
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage <= 1}
                        >
                          <ArrowUp className="w-[18px] h-[18px]"/>
                        </button>
                        <span className="min-w-[3rem] text-center">{currentPage} / {totalPages}</span>
                        <button 
                          className={cn("p-1.5 rounded-lg transition-colors", currentPage < totalPages ? "hover:bg-gray-200 text-gray-700" : "text-gray-300 cursor-not-allowed")}
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage >= totalPages}
                        >
                          <ArrowDown className="w-[18px] h-[18px]"/>
                        </button>
                      </div>
                      <div className="w-px h-4 bg-gray-300 shrink-0"></div>
                      <div className="flex items-center gap-1 relative shrink-0" ref={translateMenuRef}>
                        <div className="flex items-center bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors overflow-hidden">
                          <button 
                            onClick={() => setIsTranslating(!isTranslating)}
                            className={cn(
                              "px-3 py-1.5 text-sm font-medium flex items-center gap-1.5 transition-colors",
                              isTranslating ? "text-[#6C38FF]" : "text-gray-700"
                            )}
                          >
                            <Languages className="w-4 h-4"/>
                            {isTranslating ? '关闭翻译' : '翻译'}
                          </button>
                          <div className="w-px h-4 bg-gray-300"></div>
                          <button 
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setShowTranslateMenu(prev => !prev);
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            className="px-2 py-1.5 hover:bg-gray-200 transition-colors"
                          >
                            <ChevronDown className="w-4 h-4 text-gray-500"/>
                          </button>
                        </div>
                        
                        {/* Translate Dropdown Menu */}
                        {showTranslateMenu && (
                          <div 
                            className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 z-[100] p-4 animate-in fade-in zoom-in-95"
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                              <span className="text-[15px] font-bold text-gray-900">对比</span>
                              <button 
                                onClick={() => setIsCompareMode(!isCompareMode)}
                                className={cn("w-10 h-6 rounded-full transition-colors relative", isCompareMode ? "bg-[#6C38FF]" : "bg-gray-200")}
                              >
                                <div className={cn("w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm", isCompareMode ? "translate-x-4.5" : "translate-x-0.5")} />
                              </button>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <div className="text-[13px] text-gray-500 mb-1.5">翻译服务</div>
                                <button className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm transition-colors">
                                  <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-purple-500"/> 免费</div>
                                  <ChevronDown className="w-4 h-4 text-gray-400"/>
                                </button>
                              </div>
                              <div>
                                <div className="text-[13px] text-gray-500 mb-1.5">翻译为</div>
                                <div className="relative">
                                  <button 
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setShowLangMenu(prev => !prev);
                                    }}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                    }}
                                    className={cn(
                                      "w-full flex items-center justify-between px-3 py-2 bg-white border rounded-xl text-sm transition-colors",
                                      showLangMenu ? "border-[#6C38FF] text-gray-900" : "border-gray-200 hover:bg-gray-50"
                                    )}
                                  >
                                    {TRANSLATION_LANGUAGES.find(l => l.name === translateLang)?.native || translateLang}
                                    <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", showLangMenu ? "rotate-180 text-[#6C38FF]" : "")}/>
                                  </button>
                                  
                                  {showLangMenu && (
                                    <div 
                                      className="absolute top-full left-0 mt-1.5 w-full bg-white rounded-xl shadow-xl border border-gray-100 z-[110] p-1.5 max-h-[240px] overflow-y-auto"
                                      onMouseDown={(e) => e.stopPropagation()}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <div className="px-2 mb-1.5 mt-1 relative">
                                        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                        <input 
                                          type="text" 
                                          placeholder="搜索" 
                                          className="w-full bg-gray-50 border-none rounded-lg py-1.5 pl-8 pr-3 text-[13px] focus:outline-none focus:ring-1 focus:ring-[#6C38FF]/50"
                                          onClick={e => e.stopPropagation()}
                                        />
                                      </div>
                                      <div className="space-y-0.5">
                                        {TRANSLATION_LANGUAGES.map(lang => (
                                          <button
                                            key={lang.name}
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              setTranslateLang(lang.name);
                                              setShowLangMenu(false);
                                            }}
                                            className={cn(
                                              "w-full text-left px-3 py-1.5 rounded-lg text-[13px] transition-colors",
                                              translateLang === lang.name ? "bg-purple-50 text-[#6C38FF]" : "hover:bg-gray-50 text-gray-700"
                                            )}
                                          >
                                            <div className="font-medium">{lang.name}</div>
                                            <div className={cn("text-[12px] mt-0.5", translateLang === lang.name ? "text-[#6C38FF]/70" : "text-gray-400")}>{lang.native}</div>
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors"><Download className="w-[18px] h-[18px]"/></button>
                      {isRightPanelCollapsed && (
                        <button 
                          onClick={() => setIsRightPanelCollapsed(false)}
                          className="p-2 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
                          title="展开工作区"
                        >
                          <PanelRight className="w-[18px] h-[18px]" />
                        </button>
                      )}
                      <button 
                        className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors ml-1"
                        onClick={() => {
                          setViewingDoc(null);
                          if (activeRightTab === '聊天') {
                            setActiveRightTab('笔记 (0)');
                          }
                        }}
                      >
                        <X className="w-[18px] h-[18px]"/>
                      </button>
                    </div>
                  </div>
                  
                  <div 
                    className={cn("flex-1 bg-gray-100 overflow-y-auto p-8 flex justify-center items-start", isTranslating && isCompareMode ? "gap-4" : "")}
                    onMouseUp={handleDocumentMouseUp}
                  >
                    {(!isTranslating || (isTranslating && isCompareMode)) && (
                      <div className="bg-white shadow-sm border border-gray-200 w-full max-w-[800px] min-h-[800px] h-max p-16 flex flex-col gap-6">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 bg-green-500 rounded-lg"></div>
                          <span className="text-xl font-bold tracking-tight">NVIDIA</span>
                        </div>
                        <h1 className="text-4xl font-bold leading-tight text-gray-900">
                          {viewingDoc.name.replace('.pdf', '')} {currentPage > 1 ? `- Page ${currentPage}` : ''}
                        </h1>
                        <ul className="list-disc pl-5 space-y-2 text-gray-800 text-lg">
                          <li>{currentPage === 1 ? "Record quarterly revenue of $35.1 billion, up 17% from Q2 and up 94% from a year ago" : `Key insight 1 for page ${currentPage} regarding ${viewingDoc.name.replace('.pdf', '')}`}</li>
                          <li>{currentPage === 1 ? "Record quarterly Data Center revenue of $30.8 billion, up 17% from Q2 and up 112% from a year ago" : `Key insight 2 for page ${currentPage} showing growth and metrics`}</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed text-justify mt-4">
                          {currentPage === 1 
                            ? "SANTA CLARA, Calif., Nov. 20, 2024 (GLOBE NEWSWIRE) -- NVIDIA (NASDAQ: NVDA) today reported revenue for the third quarter ended October 27, 2024, of $35.1 billion, up 17% from the previous quarter and up 94% from a year ago. For the quarter, GAAP earnings per diluted share was $0.78, up 16% from the previous quarter and up 111% from a year ago. Non-GAAP earnings per diluted share was $0.81, up 19% from the previous quarter and up 103% from a year ago."
                            : `This is the detailed mock content for page ${currentPage}. The company continues to innovate in the AI space, delivering unprecedented performance across its data center and gaming segments. As we look towards the future, the demand for accelerated computing and generative AI continues to drive our roadmap. [Additional mock text to simulate a full page of content for page ${currentPage}...]`}
                        </p>
                      </div>
                    )}
                    
                    {isTranslating && (
                      <div className="bg-white shadow-sm border border-gray-200 w-full max-w-[800px] min-h-[800px] h-max p-16 flex flex-col gap-6">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 bg-green-500 rounded-lg"></div>
                          <span className="text-xl font-bold tracking-tight">NVIDIA</span>
                        </div>
                        <h1 className="text-4xl font-bold leading-tight text-gray-900">
                          {viewingDoc.name.replace('.pdf', '')} {currentPage > 1 ? `- 第 ${currentPage} 页` : ''} (译文)
                        </h1>
                        <ul className="list-disc pl-5 space-y-2 text-gray-800 text-lg">
                          <li>{currentPage === 1 ? "创纪录的季度营收达351亿美元，较第二季度增长17%，较去年同期增长94%" : `关于 ${viewingDoc.name.replace('.pdf', '')} 第 ${currentPage} 页的核心观点一`}</li>
                          <li>{currentPage === 1 ? "创纪录的季度数据中心营收达308亿美元，较第二季度增长17%，较去年同期增长112%" : `第 ${currentPage} 页的核心观点二，展示了增长与关键指标`}</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed text-justify mt-4">
                          {currentPage === 1
                            ? "加利福尼亚州圣克拉拉，2024年11月20日（全球新闻资讯）-- NVIDIA（纳斯达克股票代码：NVDA）今天公布了截至2024年10月27日的第三季度营收为351亿美元，较上一季度增长17%，较去年同期增长94%。本季度，GAAP摊薄后每股收益为0.78美元，较上一季度增长16%，较去年同期增长111%。Non-GAAP摊薄后每股收益为0.81美元，较上一季度增长19%，较去年同期增长103%。"
                            : `这是第 ${currentPage} 页的详细内容。公司继续在AI领域进行创新，在其数据中心和游戏部门提供前所未有的性能。展望未来，对加速计算和生成式AI的需求继续推动着我们的路线图。[附加的模拟文本，用于模拟第 ${currentPage} 页的完整页面内容...]`}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Text Selection Popup */}
                  {showSelectionPopup && (
                    <div 
                      ref={selectionPopupRef}
                      className="fixed z-[200] flex items-center gap-1 bg-white rounded-full shadow-lg border border-gray-100 p-1.5 -translate-x-1/2 animate-in fade-in zoom-in duration-200"
                      style={{ top: selectionPosition.top, left: selectionPosition.left }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                    >
                      <button 
                        onClick={handleAskAI}
                        className="px-3 py-1.5 hover:bg-gray-100 rounded-full text-[13px] font-medium flex items-center gap-1.5 transition-colors text-purple-600"
                      >
                        <Sparkles className="w-4 h-4" />
                        询问AI
                      </button>
                      <div className="w-px h-3.5 bg-gray-200 mx-1"></div>
                      <button 
                        onClick={handleHighlight}
                        className="px-3 py-1.5 hover:bg-gray-100 rounded-full text-[13px] font-medium flex items-center gap-1.5 transition-colors text-gray-700"
                      >
                        <Highlighter className="w-4 h-4" />
                        高亮
                      </button>
                      <button 
                        onClick={handleCopySelection}
                        className="px-3 py-1.5 hover:bg-gray-100 rounded-full text-[13px] font-medium flex items-center gap-1.5 transition-colors text-gray-700"
                      >
                        <Copy className="w-4 h-4" />
                        复制
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Top Summary Bar */}
                  <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-purple-50/50 flex items-start justify-between shrink-0">
                <div className="flex items-start gap-3">
                  {isFileListCollapsed && (
                    <button 
                      onClick={() => setIsFileListCollapsed(false)}
                      className="p-1.5 hover:bg-white/60 bg-white/40 rounded-lg text-gray-600 transition-colors border border-gray-200/50 shadow-sm shrink-0 -ml-2"
                      title="展开文件列表"
                    >
                      <PanelLeft className="w-[18px] h-[18px]" />
                    </button>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="truncate">全局洞察</span>
                    </h3>
                    <p className="text-xs text-gray-600 mt-1.5 max-w-2xl leading-relaxed">
                      这份知识库主要涵盖了 <strong>{selectedFolder.docs.length}</strong> 份关于 {selectedFolder.name.replace('我的', '').replace('资料', '')} 的文档。您可以直接向我提问，或者让我为您生成文档摘要、对比分析。
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4 relative">
                  <div ref={historyMenuRef}>
                    <button 
                      onClick={() => setShowHistoryModal(!showHistoryModal)}
                      className={cn(
                        "p-1.5 hover:bg-white/60 bg-white/40 rounded-lg text-gray-600 transition-colors border border-gray-200/50 shadow-sm group relative",
                        showHistoryModal ? "bg-white/60 text-blue-600 border-blue-200" : ""
                      )}
                    >
                      <History className="w-[18px] h-[18px]" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-gray-900 text-white text-[11px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        历史记录
                      </div>
                    </button>
                    
                    {/* Chat History Dropdown */}
                    {showHistoryModal && (
                      <div className="absolute top-full right-0 mt-2 w-[340px] bg-white rounded-2xl shadow-xl border border-gray-100 z-50 flex flex-col max-h-[600px] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
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
                              className={cn("pb-2 text-[14px] font-bold relative", historyTab === 'all' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700')}
                            >
                              所有
                              {historyTab === 'all' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-t-full"></div>}
                            </button>
                            <button 
                              onClick={() => setHistoryTab('pinned')}
                              className={cn("pb-2 text-[14px] font-bold relative", historyTab === 'pinned' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700')}
                            >
                              我的收藏
                              {historyTab === 'pinned' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-t-full"></div>}
                            </button>
                            <button className="ml-auto mb-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="清空全部">
                              <Trash2 className="w-4 h-4" />
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
                        <div className="flex-1 overflow-y-auto p-2">
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
                                      className={cn("group relative p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors", activeHistoryMenu === item.id ? 'z-50' : 'z-0')}
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
                                                  setHistoryItems(prev => prev.map(i => i.id === item.id ? { ...i, title: editingHistoryTitle || i.title } : i));
                                                  setEditingHistoryId(null);
                                                } else if (e.key === 'Escape') {
                                                  setEditingHistoryId(null);
                                                }
                                              }}
                                              onBlur={() => {
                                                setHistoryItems(prev => prev.map(i => i.id === item.id ? { ...i, title: editingHistoryTitle || i.title } : i));
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
                                      
                                      <div className={cn("absolute right-2 top-1/2 -translate-y-1/2 flex items-center transition-opacity bg-gradient-to-l from-gray-50 via-gray-50 to-transparent pl-4 py-1", activeHistoryMenu === item.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100')}>
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setHistoryItems(prev => prev.map(i => i.id === item.id ? { ...i, isPinned: !i.isPinned } : i));
                                          }}
                                          className={cn("p-1.5 rounded-lg transition-colors", item.isPinned ? 'text-orange-500' : 'text-gray-400 hover:text-orange-500 hover:bg-gray-100')}
                                        >
                                          <svg width="14" height="14" viewBox="0 0 24 24" fill={item.isPinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                        </button>
                                        <div className="relative">
                                          <button 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setActiveHistoryMenu(activeHistoryMenu === item.id ? null : item.id);
                                            }}
                                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                          >
                                            <MoreHorizontal className="w-4 h-4" />
                                          </button>
                                          
                                          {/* Context Menu */}
                                          {activeHistoryMenu === item.id && (
                                            <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50">
                                              <button className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors text-left">
                                                <ExternalLink className="w-3.5 h-3.5 text-gray-400" /> 在新标签页打开
                                              </button>
                                              <button className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors text-left">
                                                <LinkIcon className="w-3.5 h-3.5 text-gray-400" /> 复制链接
                                              </button>
                                              <button className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors text-left">
                                                <Copy className="w-3.5 h-3.5 text-gray-400" /> 创建副本
                                              </button>
                                              <div className="my-1 border-t border-gray-100"></div>
                                              <button className="w-full flex items-center justify-between px-3 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors text-left">
                                                <div className="flex items-center gap-2">
                                                  <Folder className="w-3.5 h-3.5 text-gray-400" /> 移动至项目
                                                </div>
                                                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                                              </button>
                                              <button 
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setEditingHistoryId(item.id);
                                                  setEditingHistoryTitle(item.title);
                                                  setActiveHistoryMenu(null);
                                                }}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors text-left"
                                              >
                                                <Edit2 className="w-3.5 h-3.5 text-gray-400" /> 重命名
                                              </button>
                                              <div className="my-1 border-t border-gray-100"></div>
                                              <button 
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setHistoryItems(prev => prev.filter(i => i.id !== item.id));
                                                  setActiveHistoryMenu(null);
                                                }}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-red-600 hover:bg-red-50 transition-colors text-left font-medium"
                                              >
                                                <Trash2 className="w-3.5 h-3.5" /> 删除
                                              </button>
                                            </div>
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
                  </div>
                  <button 
                    onClick={handleNewChat}
                    className="p-1.5 hover:bg-white/60 bg-white/40 rounded-lg text-gray-600 transition-colors border border-gray-200/50 shadow-sm group relative"
                  >
                    <MessageCirclePlus className="w-[18px] h-[18px]" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-gray-900 text-white text-[11px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                      新对话
                    </div>
                  </button>
                  {isRightPanelCollapsed && (
                    <button 
                      onClick={() => setIsRightPanelCollapsed(false)}
                      className="p-1.5 hover:bg-white/60 bg-white/40 rounded-lg text-gray-600 transition-colors border border-gray-200/50 shadow-sm"
                      title="展开工作区"
                    >
                      <PanelRight className="w-[18px] h-[18px]" />
                    </button>
                  )}
                </div>
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
                <form onSubmit={handleChatSubmit} className="relative flex flex-col bg-gray-50/50 rounded-xl border border-gray-200 p-3 pt-2 overflow-visible">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <button type="button" className="p-1 hover:bg-gray-200/50 rounded text-gray-500 group relative">
                        <Scissors className="w-3.5 h-3.5"/>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-gray-900 text-white text-[11px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                          截图
                        </div>
                      </button>
                    </div>
                  </div>
                  <textarea 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (chatInput.trim()) {
                          handleChatSubmit(e as any);
                        }
                      }
                    }}
                    className="w-full bg-transparent border-none outline-none text-[13px] resize-none min-h-[44px] placeholder:text-gray-400 focus:ring-0" 
                    placeholder={`基于这 ${selectedFolder.docCount} 份文档提问...`}
                  ></textarea>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 relative" ref={modelMenuRef}>
                       <button 
                         type="button"
                         onClick={() => setShowModelDropdown(!showModelDropdown)}
                         className={cn(
                           "px-2 py-1.5 hover:bg-gray-200/50 rounded-lg text-[13px] flex items-center gap-1.5 transition-colors font-medium",
                           showModelDropdown ? "bg-gray-200/50 text-gray-900" : "text-gray-600"
                         )}
                       >
                         <ColorfulBotIcon className="w-[18px] h-[18px]"/> 
                         {selectedModel}
                       </button>
                       {showModelDropdown && (
                         <div className="absolute bottom-full left-0 mb-2 w-[220px] bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-[100] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                           <div className="px-3 py-1.5 text-xs font-medium text-gray-400">基础</div>
                           {['Sider Fusion', 'GPT-5.4 mini', 'Claude Haiku 4.5', 'Gemini 2.5 Flash', 'Gemini 3.0 Flash Think'].map(model => (
                             <button
                               key={model}
                               type="button"
                               onClick={() => { setSelectedModel(model); setShowModelDropdown(false); }}
                               className={cn(
                                 "w-full text-left px-3 py-2 text-[13px] flex items-center gap-2 hover:bg-gray-50 transition-colors",
                                 selectedModel === model ? "text-blue-600 font-medium bg-blue-50/30" : "text-gray-700"
                               )}
                             >
                               <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center shrink-0">
                                 <Sparkles className={cn("w-2.5 h-2.5", selectedModel === model ? "text-blue-500" : "text-gray-400")} />
                               </div>
                               {model}
                             </button>
                           ))}
                           <div className="px-3 py-1.5 mt-1 text-xs font-medium text-gray-400 border-t border-gray-50">高级</div>
                           {['GPT-5.4', 'Gemini 3.1 Pro', 'Claude Sonnet 4.6', 'Claude Sonnet 4', 'Gemini 2.5 Pro', 'Gemini 2.5 Flash Think', 'GPT-5.1', 'Grok 4', 'DeepSeek v3.2'].map(model => (
                             <button
                               key={model}
                               type="button"
                               onClick={() => { setSelectedModel(model); setShowModelDropdown(false); }}
                               className={cn(
                                 "w-full text-left px-3 py-2 text-[13px] flex items-center gap-2 hover:bg-gray-50 transition-colors",
                                 selectedModel === model ? "text-blue-600 font-medium bg-blue-50/30" : "text-gray-700"
                               )}
                             >
                               <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center shrink-0">
                                 <Bot className={cn("w-2.5 h-2.5", selectedModel === model ? "text-blue-500" : "text-gray-400")} />
                               </div>
                               {model}
                             </button>
                           ))}
                           <div className="px-3 py-1.5 mt-1 text-xs font-medium text-gray-400 border-t border-gray-50">超级高级</div>
                           {['GPT-5.1 Think', 'DeepSeek-R1-0528', 'Claude Sonnet 4.6 Think', 'Claude Sonnet 4 Think'].map(model => (
                             <button
                               key={model}
                               type="button"
                               onClick={() => { setSelectedModel(model); setShowModelDropdown(false); }}
                               className={cn(
                                 "w-full text-left px-3 py-2 text-[13px] flex items-center gap-2 hover:bg-gray-50 transition-colors",
                                 selectedModel === model ? "text-blue-600 font-medium bg-blue-50/30" : "text-gray-700"
                               )}
                             >
                               <div className="w-4 h-4 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center shrink-0">
                                 <Flame className={cn("w-2.5 h-2.5", selectedModel === model ? "text-blue-500" : "text-gray-400")} />
                               </div>
                               {model}
                             </button>
                           ))}
                         </div>
                       )}
                    </div>
                    <button 
                      type="submit"
                      disabled={!chatInput.trim()}
                      className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all disabled:opacity-30 disabled:hover:bg-slate-900 shadow-sm shrink-0"
                    >
                      <ArrowRight className="w-4 h-4"/>
                    </button>
                  </div>
                </form>
              </div>
              </>
              )}
            </div>

            {/* Interactive Workspace Panel */}
            <div className={cn(
              "shrink-0 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 ease-in-out snap-start",
              isRightPanelCollapsed ? "w-0 opacity-0 border-0 pointer-events-none -ml-4" : "w-[360px] min-w-[300px] max-w-[400px]"
            )}>
              {/* Workspace Tabs */}
                  <div className="flex items-center justify-between border-b border-gray-100 px-2 shrink-0">
                <div className="flex items-center overflow-x-auto scrollbar-hide">
                  {(viewingDoc ? ['聊天', `笔记 (${notes.length})`, '闪卡', '测验', '知识图谱'] : [`笔记 (${notes.length})`, '闪卡', '测验', '知识图谱']).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveRightTab(tab)}
                      className={cn(
                        "px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                        activeRightTab === tab || (activeRightTab.startsWith('笔记') && tab.startsWith('笔记'))
                          ? "border-gray-900 text-gray-900" 
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-2 relative z-[100]">
                  {activeRightTab === '聊天' && (
                    <>
                      <div className="relative" ref={historyMenuRef}>
                        <button 
                          onClick={() => setShowHistoryModal(!showHistoryModal)}
                          className={cn(
                            "p-1.5 border border-gray-200 rounded-full transition-colors flex items-center justify-center shadow-sm group relative",
                            showHistoryModal ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-white text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50"
                          )}
                        >
                          <History className="w-[14px] h-[14px]" />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-gray-900 text-white text-[11px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[60]">
                            历史记录
                          </div>
                        </button>
                        
                        {/* Chat History Dropdown */}
                        {showHistoryModal && (
                          <div className="absolute top-full right-0 mt-2 w-[340px] bg-white rounded-2xl shadow-xl border border-gray-100 z-[100] flex flex-col max-h-[600px] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
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
                                  className={cn("pb-2 text-[14px] font-bold relative", historyTab === 'all' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700')}
                                >
                                  所有
                                  {historyTab === 'all' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-t-full"></div>}
                                </button>
                                <button 
                                  onClick={() => setHistoryTab('pinned')}
                                  className={cn("pb-2 text-[14px] font-bold relative", historyTab === 'pinned' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700')}
                                >
                                  我的收藏
                                  {historyTab === 'pinned' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-t-full"></div>}
                                </button>
                                <button className="ml-auto mb-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="清空全部">
                                  <Trash2 className="w-4 h-4" />
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
                            <div className="flex-1 overflow-y-auto p-2">
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
                                          className={cn("group relative p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors", activeHistoryMenu === item.id ? 'z-50' : 'z-0')}
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
                                                      setHistoryItems(prev => prev.map(i => i.id === item.id ? { ...i, title: editingHistoryTitle || i.title } : i));
                                                      setEditingHistoryId(null);
                                                    } else if (e.key === 'Escape') {
                                                      setEditingHistoryId(null);
                                                    }
                                                  }}
                                                  onBlur={() => {
                                                    setHistoryItems(prev => prev.map(i => i.id === item.id ? { ...i, title: editingHistoryTitle || i.title } : i));
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
                                          
                                          <div className={cn("absolute right-2 top-1/2 -translate-y-1/2 flex items-center transition-opacity bg-gradient-to-l from-gray-50 via-gray-50 to-transparent pl-4 py-1", activeHistoryMenu === item.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100')}>
                                            <button 
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setHistoryItems(prev => prev.map(i => i.id === item.id ? { ...i, isPinned: !i.isPinned } : i));
                                              }}
                                              className={cn("p-1.5 rounded-lg transition-colors", item.isPinned ? 'text-orange-500' : 'text-gray-400 hover:text-orange-500 hover:bg-gray-100')}
                                            >
                                              <svg width="14" height="14" viewBox="0 0 24 24" fill={item.isPinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                            </button>
                                            <div className="relative">
                                              <button 
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setActiveHistoryMenu(activeHistoryMenu === item.id ? null : item.id);
                                                }}
                                                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                              >
                                                <MoreHorizontal className="w-4 h-4" />
                                              </button>
                                              
                                              {/* Context Menu */}
                                              {activeHistoryMenu === item.id && (
                                                <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50">
                                                  <button className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors text-left">
                                                    <ExternalLink className="w-3.5 h-3.5 text-gray-400" /> 在新标签页打开
                                                  </button>
                                                  <button className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors text-left">
                                                    <LinkIcon className="w-3.5 h-3.5 text-gray-400" /> 复制链接
                                                  </button>
                                                  <button className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors text-left">
                                                    <Copy className="w-3.5 h-3.5 text-gray-400" /> 创建副本
                                                  </button>
                                                  <div className="my-1 border-t border-gray-100"></div>
                                                  <button className="w-full flex items-center justify-between px-3 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors text-left">
                                                    <div className="flex items-center gap-2">
                                                      <Folder className="w-3.5 h-3.5 text-gray-400" /> 移动至项目
                                                    </div>
                                                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                                                  </button>
                                                  <button 
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      setEditingHistoryId(item.id);
                                                      setEditingHistoryTitle(item.title);
                                                      setActiveHistoryMenu(null);
                                                    }}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors text-left"
                                                  >
                                                    <Edit2 className="w-3.5 h-3.5 text-gray-400" /> 重命名
                                                  </button>
                                                  <div className="my-1 border-t border-gray-100"></div>
                                                  <button 
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      setHistoryItems(prev => prev.filter(i => i.id !== item.id));
                                                      setActiveHistoryMenu(null);
                                                    }}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-red-600 hover:bg-red-50 transition-colors text-left font-medium"
                                                  >
                                                    <Trash2 className="w-3.5 h-3.5" /> 删除
                                                  </button>
                                                </div>
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
                      </div>
                      <button 
                        onClick={handleNewChat}
                        className="p-1.5 bg-white border border-gray-200 rounded-full text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 transition-colors flex items-center justify-center shadow-sm group relative"
                      >
                        <MessageCirclePlus className="w-[14px] h-[14px]" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-gray-900 text-white text-[11px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[60]">
                          新对话
                        </div>
                      </button>
                      <div className="w-px h-4 bg-gray-200 mx-0.5"></div>
                    </>
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsRightPanelCollapsed(true);
                    }}
                    className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-gray-600 transition-colors shrink-0 ml-1"
                    title="收起工作区"
                  >
                    <PanelRight className="w-[18px] h-[18px]" />
                  </button>
                </div>
              </div>

              {/* Workspace Content - Render Based on Tab */}
              {viewingDoc && activeRightTab === '聊天' ? (
                <div className="flex-1 flex flex-col bg-white overflow-hidden">
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
                              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors shadow-sm text-left"
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
                    <form onSubmit={handleChatSubmit} className="relative flex flex-col bg-gray-50/50 rounded-xl border border-gray-200 p-3 pt-2 overflow-visible">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <button type="button" className="p-1 hover:bg-gray-200/50 rounded text-gray-500 group relative">
                            <Scissors className="w-3.5 h-3.5"/>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-gray-900 text-white text-[11px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[60]">
                              截图
                            </div>
                          </button>
                        </div>
                      </div>
                      
                      {quotedText && (
                        <div className="mb-2 relative group">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-md"></div>
                          <div className="bg-blue-50/50 pr-8 pl-3 py-2 rounded-r-md text-[13px] text-gray-600 line-clamp-3 border border-blue-100/50 border-l-0">
                            <span className="text-blue-600 font-medium mr-1">@引用</span>
                            "{quotedText}"
                          </div>
                          <button 
                            onClick={() => setQuotedText(null)}
                            className="absolute right-2 top-2 p-1 rounded-full hover:bg-blue-100 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      <textarea 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            if (chatInput.trim() || quotedText) {
                              handleChatSubmit(e as any);
                            }
                          }
                        }}
                        className="w-full bg-transparent border-none outline-none text-[13px] resize-none min-h-[44px] placeholder:text-gray-400 focus:ring-0" 
                        placeholder={quotedText ? "基于引用的文本提问..." : `基于这 ${selectedFolder.docCount} 份文档提问...`}
                      ></textarea>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 relative" ref={modelMenuRef}>
                           <button 
                             type="button"
                             onClick={() => setShowModelDropdown(!showModelDropdown)}
                             className={cn(
                               "px-2 py-1.5 hover:bg-gray-200/50 rounded-lg text-[13px] flex items-center gap-1.5 transition-colors font-medium",
                               showModelDropdown ? "bg-gray-200/50 text-gray-900" : "text-gray-600"
                             )}
                           >
                             <ColorfulBotIcon className="w-[18px] h-[18px]"/> 
                             {selectedModel}
                           </button>
                           {showModelDropdown && (
                             <div className="absolute bottom-full left-0 mb-2 w-[220px] bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-[100] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                               <div className="px-3 py-1.5 text-xs font-medium text-gray-400">基础</div>
                               {['Sider Fusion', 'GPT-5.4 mini', 'Claude Haiku 4.5', 'Gemini 2.5 Flash', 'Gemini 3.0 Flash Think'].map(model => (
                                 <button
                                   key={model}
                                   type="button"
                                   onClick={() => { setSelectedModel(model); setShowModelDropdown(false); }}
                                   className={cn(
                                     "w-full text-left px-3 py-2 text-[13px] flex items-center gap-2 hover:bg-gray-50 transition-colors",
                                     selectedModel === model ? "text-blue-600 font-medium bg-blue-50/30" : "text-gray-700"
                                   )}
                                 >
                                   <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center shrink-0">
                                     <Sparkles className={cn("w-2.5 h-2.5", selectedModel === model ? "text-blue-500" : "text-gray-400")} />
                                   </div>
                                   {model}
                                 </button>
                               ))}
                               <div className="px-3 py-1.5 mt-1 text-xs font-medium text-gray-400 border-t border-gray-50">高级</div>
                               {['GPT-5.4', 'Gemini 3.1 Pro', 'Claude Sonnet 4.6', 'Claude Sonnet 4', 'Gemini 2.5 Pro', 'Gemini 2.5 Flash Think', 'GPT-5.1', 'Grok 4', 'DeepSeek v3.2'].map(model => (
                                 <button
                                   key={model}
                                   type="button"
                                   onClick={() => { setSelectedModel(model); setShowModelDropdown(false); }}
                                   className={cn(
                                     "w-full text-left px-3 py-2 text-[13px] flex items-center gap-2 hover:bg-gray-50 transition-colors",
                                     selectedModel === model ? "text-blue-600 font-medium bg-blue-50/30" : "text-gray-700"
                                   )}
                                 >
                                   <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center shrink-0">
                                     <Bot className={cn("w-2.5 h-2.5", selectedModel === model ? "text-blue-500" : "text-gray-400")} />
                                   </div>
                                   {model}
                                 </button>
                               ))}
                               <div className="px-3 py-1.5 mt-1 text-xs font-medium text-gray-400 border-t border-gray-50">超级高级</div>
                               {['GPT-5.1 Think', 'DeepSeek-R1-0528', 'Claude Sonnet 4.6 Think', 'Claude Sonnet 4 Think'].map(model => (
                                 <button
                                   key={model}
                                   type="button"
                                   onClick={() => { setSelectedModel(model); setShowModelDropdown(false); }}
                                   className={cn(
                                     "w-full text-left px-3 py-2 text-[13px] flex items-center gap-2 hover:bg-gray-50 transition-colors",
                                     selectedModel === model ? "text-blue-600 font-medium bg-blue-50/30" : "text-gray-700"
                                   )}
                                 >
                                   <div className="w-4 h-4 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center shrink-0">
                                     <Flame className={cn("w-2.5 h-2.5", selectedModel === model ? "text-blue-500" : "text-gray-400")} />
                                   </div>
                                   {model}
                                 </button>
                               ))}
                             </div>
                           )}
                        </div>
                        <button 
                          type="submit"
                          disabled={!chatInput.trim()}
                          className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all disabled:opacity-30 disabled:hover:bg-slate-900 shadow-sm shrink-0"
                        >
                          <ArrowRight className="w-4 h-4"/>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              ) : activeRightTab.startsWith('笔记') ? (
                isEditingNote ? (
                  <div className="flex-1 flex flex-col bg-white overflow-visible animate-in fade-in duration-200">
                    <div className="h-12 border-b border-gray-100 flex items-center justify-between px-4 shrink-0 relative z-[50]">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <button 
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          onClick={() => noteImageInputRef.current?.click()}
                        >
                          <ImageIcon className="w-4 h-4" />
                        </button>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          ref={noteImageInputRef} 
                          onChange={handleNoteImageUpload} 
                        />
                        <button 
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          onClick={() => insertFormatting('1. ')}
                        >
                          <ListOrdered className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          onClick={() => insertFormatting('- ')}
                        >
                          <ListIcon className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          onClick={() => insertFormatting('**', '**')}
                        >
                          <Bold className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          onClick={() => insertFormatting('*', '*')}
                        >
                          <Italic className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors group relative"
                          onClick={() => {
                            const textToCopy = `${currentNoteTitle}\n\n${currentNoteContent}`.trim();
                            navigator.clipboard.writeText(textToCopy || ' ');
                            setIsCopied(true);
                            setTimeout(() => setIsCopied(false), 1000);
                          }}
                        >
                          {isCopied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-gray-900 text-white text-[11px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[60]">
                            {isCopied ? '已复制' : '复制'}
                          </div>
                        </button>
                        <div className="w-px h-4 bg-gray-200 mx-1"></div>
                        <div 
                          className="flex items-center justify-center p-1.5 text-gray-500"
                          title="自动保存"
                        >
                          {saveState === 'saving' ? (
                            <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-blue-500 animate-spin"></div>
                          ) : saveState === 'saved' ? (
                            <CloudCheckIcon className="w-4 h-4 text-blue-500" />
                          ) : (
                            <Cloud className="w-4 h-4" />
                          )}
                        </div>
                        <button 
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                          onClick={() => {
                            setIsEditingNote(false);
                            setEditingNoteId(null);
                            setCurrentNoteTitle('');
                            setCurrentNoteContent('');
                          }}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 flex flex-col">
                      <input 
                        type="text" 
                        placeholder="未命名" 
                        value={currentNoteTitle}
                        onChange={(e) => setCurrentNoteTitle(e.target.value)}
                        className="w-full text-2xl font-bold text-gray-900 focus:text-gray-900 border-none outline-none bg-transparent mb-4 placeholder:text-gray-400"
                      />
                      <textarea 
                        ref={noteTextareaRef}
                        placeholder="输入内容" 
                        value={currentNoteContent}
                        onChange={(e) => setCurrentNoteContent(e.target.value)}
                        className="flex-1 w-full resize-none text-sm text-gray-600 border-none outline-none bg-transparent placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                ) : notes.length > 0 ? (
                  <div className="flex-1 flex flex-col bg-white overflow-visible animate-in fade-in duration-200">
                    <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100 shrink-0">
                      <div className="flex items-center gap-2 text-gray-500">
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><Search className="w-4 h-4" /></button>
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><Filter className="w-4 h-4" /></button>
                      </div>
                      <button 
                        onClick={() => setIsEditingNote(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F172A] hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        添加笔记
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {notes.map(note => (
                        <div 
                          key={note.id} 
                          onClick={() => {
                            setEditingNoteId(note.id);
                            setCurrentNoteTitle(note.title);
                            setCurrentNoteContent(note.content);
                            setIsEditingNote(true);
                          }}
                          className="p-4 border border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer bg-white"
                        >
                          <h4 className="font-bold text-[14px] text-gray-900 mb-2 truncate">{note.title}</h4>
                          <div className="pl-3 border-l-2 border-gray-200 text-[13px] text-gray-500 mb-3 line-clamp-2">
                            {note.content}
                          </div>
                          <div className="text-[12px] text-gray-400">{note.time}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white">
                    <div className="w-20 h-20 mb-6 relative">
                      <div className="absolute inset-0 bg-[#F0F4FF] rounded-2xl rotate-3 -mr-2 mt-1"></div>
                      <div className="absolute inset-0 bg-white rounded-2xl border-2 border-slate-800 flex flex-col items-center justify-center -rotate-3 z-10">
                        <div className="w-8 h-0.5 bg-slate-300 rounded-full mb-2"></div>
                        <div className="w-10 h-0.5 bg-slate-300 rounded-full mb-2"></div>
                        <div className="w-8 h-0.5 bg-slate-300 rounded-full"></div>
                      </div>
                      {/* Decorative elements */}
                      <div className="absolute -top-3 -right-3 w-4 h-4 text-yellow-400 z-20">✨</div>
                      <div className="absolute top-4 -left-2 w-1.5 h-1.5 rounded-full border-2 border-slate-800 bg-white z-20"></div>
                      <div className="absolute top-10 -left-2 w-1.5 h-1.5 rounded-full border-2 border-slate-800 bg-white z-20"></div>
                    </div>
                    
                    <h3 className="text-base font-bold text-gray-900 mb-2">开始笔记</h3>
                    <p className="text-[13px] text-gray-500 mb-6 leading-relaxed">
                      高亮、保存对话作为笔记，或点击“添加笔记”。
                    </p>
                    
                    <button 
                      onClick={() => setIsEditingNote(true)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#F5F5FA] hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      添加笔记
                    </button>
                  </div>
                )
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400 text-[14px] bg-white">
                  {activeRightTab}功能开发中...
                </div>
              )}
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
                        <span 
                          onClick={(e) => toggleFolderVisibility(e, folder.id)}
                          className={cn(
                            "flex items-center gap-1 shrink-0 px-1.5 py-0.5 -ml-1.5 rounded transition-colors cursor-pointer",
                            folder.isPublic ? "hover:bg-blue-50 hover:text-blue-600 text-gray-500" : "hover:bg-gray-100 text-gray-500"
                          )}
                          title="点击切换公开/私有状态"
                        >
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
                <Ghost className="w-16 h-16 mb-4 text-blue-300 animate-bounce" strokeWidth={1.5} />
                <p className="text-lg font-medium text-gray-900 mb-1">这里还是一片荒芜~</p>
                <p className="text-sm">快来创建你的第一个文件夹，开启知识的宝库吧！</p>
                <button 
                  onClick={() => setShowCreateFolderModal(true)}
                  className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-black transition-all shadow-sm hover:shadow-md active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  新建文件夹
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Folder Modal */}
      {showCreateFolderModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">新建文件夹</h2>
              <button 
                onClick={() => setShowCreateFolderModal(false)} 
                className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full p-1.5 transition-colors"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-[14px] font-bold text-gray-900 mb-2">
                  文件夹名称 <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  autoFocus
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateFolder();
                  }}
                  placeholder="例如：产品设计资料"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm placeholder:text-gray-400"
                />
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50/50 flex justify-end gap-3 border-t border-gray-100">
              <button 
                onClick={() => setShowCreateFolderModal(false)}
                className="px-5 py-2.5 text-[14px] font-medium text-gray-600 hover:bg-white hover:shadow-sm rounded-xl border border-transparent hover:border-gray-200 transition-all"
              >
                取消
              </button>
              <button 
                disabled={!newFolderName.trim()}
                onClick={handleCreateFolder}
                className={cn(
                  "px-5 py-2.5 text-[14px] font-medium rounded-xl transition-all shadow-sm",
                  newFolderName.trim() 
                    ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md active:scale-95" 
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                )}
              >
                创建
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}