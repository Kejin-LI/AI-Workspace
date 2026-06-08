import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, Clock, CheckCircle2, Search, Flame, Eye, ThumbsUp, ChevronRight, ChevronLeft, HelpCircle, X, Send, ChevronDown, ArrowLeft, ArrowRight, PenTool, TrendingUp, Feather, Trophy, Scale, AlertCircle, Zap, Bot, Star, Plus, ShoppingBag, Download, Briefcase } from 'lucide-react';
import { cn } from '../lib/utils';
import { KnowledgeBaseView } from '../components/KnowledgeBaseView';
import { SkillDetailModal } from '../components/SkillDetailModal';

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

const AVATARS_GALLERY = [
  {
    id: 1,
    name: 'Kai',
    expertName: '李珂瑾',
    title: '内容创作专家',
    description: '擅长创作引人入胜的多平台内容，让品牌故事触达受众',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kai',
    category: '设计',
    rating: 4.9,
    usageCount: 1280
  },
  {
    id: 2,
    name: 'Phoebe',
    expertName: '王律师',
    title: '数据分析报告师',
    description: '将复杂数据转化为清晰可执行的业务报告，让数据说话',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Phoebe',
    category: '付费媒体',
    rating: 4.8,
    usageCount: 956
  },
  {
    id: 3,
    name: 'Jude',
    expertName: '张医生',
    title: '中国电商运营专家',
    description: '精通天猫京东拼多多平台运营，从选品到爆款一站式操盘',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jude',
    category: '专业服务',
    rating: 4.95,
    usageCount: 2100
  },
  {
    id: 4,
    name: 'Maya',
    expertName: '刘教授',
    title: '抖音策略师',
    description: '精通抖音算法和内容生态，打造短视频爆款并实现商业变现',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya',
    category: '销售',
    rating: 4.7,
    usageCount: 876
  },
  {
    id: 5,
    name: 'Sam',
    expertName: '陈工程师',
    title: 'UI设计师',
    description: '精通设计系统和组件库，追求像素级完美，打造无缝用户界面',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam',
    category: '产品',
    rating: 4.85,
    usageCount: 1540
  },
  {
    id: 6,
    name: 'Ula',
    expertName: '黄教练',
    title: '销售教练',
    description: '用苏格拉底式培训训练销售团队，从60%达标到全员俱乐部',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ula',
    category: '项目管理',
    rating: 4.9,
    usageCount: 654
  },
  {
    id: 7,
    name: 'Ben',
    expertName: '周策略师',
    title: '品牌策略师',
    description: '15年品牌经验，守护品牌一致性的终极捍卫者',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ben',
    category: '质量测试',
    rating: 4.75,
    usageCount: 1120
  },
  {
    id: 8,
    name: 'Fay',
    expertName: '吴运营',
    title: '小红书运营专家',
    description: '深谙小红书种草逻辑和推荐机制，打造高互动率种草内容',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fay',
    category: '运营支持',
    rating: 4.8,
    usageCount: 1680
  }
];

const AVATAR_CATEGORIES = ['全部', '设计', '工程技术', '市场营销', '付费媒体', '销售', '产品', '项目管理', '质量测试', '运营支持', '专业服务'];

// Mock Data for the new feed
export const mockFeed = [
  {
    id: 1,
    category: '经验分享',
    tags: ['软件与AI'],
    title: '如何构建高质量的数学推理思维链（CoT）？',
    snippet: '在处理复杂数学问题时，构建清晰、严谨的思维链（Chain of Thought）至关重要。本文总结了在标注数学题时的几个核心技巧：1. 拆解步骤要细致，避免跳步；2. 每一步的逻辑推导必须提供理论依据；3. 最终答案的格式需要严格对齐...',
    author: 'MathWizard',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    views: '3.5k',
    image: null
  },
  {
    id: 2,
    category: '求助讨论',
    tags: ['经济金融'],
    title: '求助：财报分析中如何界定“供应链波动”的风险等级？',
    snippet: '各位金融领域的专家，最近在处理一批财报分析的标注任务时遇到一个难点。当公司财报中提到“受宏观经济影响，供应链存在一定波动，但已采取预案”时，这个风险等级应该标为“中风险”还是“低风险”？有没有相关的行业标准或参考案例？',
    author: 'FinanceExpert_01',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    views: '1.2k',
    image: null
  },
  {
    id: 3,
    category: '经验分享',
    tags: ['法律'],
    title: '关于法律条款中“模糊语义”的标注标准探讨',
    snippet: '法律合同中经常出现类似“合理时间内”、“重大不利影响”等模糊表述。在训练法律领域大模型时，如何让模型准确理解这些模糊语义的边界？我们团队尝试引入了判例法中的“理性人标准”来进行标注，这里分享一下我们的标注指南草案，欢迎大家拍砖。',
    author: 'Alex Chen (Legal)',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex2',
    views: '8.6k',
    image: null
  },
  {
    id: 4,
    category: '求助讨论',
    tags: ['医疗健康'],
    title: '医疗诊断场景下的多模态数据清洗技巧',
    snippet: '在处理电子病历（包含文本和影像）时，数据清洗的质量直接决定了后续标注的准确率。特别是对于带有水印或隐私信息的医学影像，我们开发了一套自动脱敏与关键特征提取的工作流，能够将清洗效率提升 300%...',
    author: 'Dr. House',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=House',
    views: '2.1k',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=200&h=120'
  },
  {
    id: 5,
    category: '求助讨论',
    tags: ['泛领域'],
    title: '通用指令遵循评估中的主观性如何消除？',
    snippet: '在做泛领域的对话指令遵循评估时，经常发现不同标注员对“回答是否详尽”有不同的理解。有的人觉得列出要点就够了，有的人觉得必须有长篇大论。大家在制定泛领域评分细则时，是怎么量化这个“详尽程度”的？',
    author: 'PromptMaster',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Prompt',
    views: '4.2k',
    image: null
  },
  {
    id: 6,
    category: '经验分享',
    tags: ['教育科研'],
    title: '教育类问答模型的数据增强策略分享',
    snippet: '我们在优化K12教育问答模型时发现，仅仅依靠现有的题库数据是不够的。模型往往缺乏“启发式”的回答能力。我们尝试了一种基于苏格拉底提问法的数据增强策略，通过改写标准答案，将其转化为引导式提问，显著提升了模型在教育场景的表现...',
    author: 'EduTech_Researcher',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Edu',
    views: '1.8k',
    image: null
  },
  {
    id: 7,
    category: '经验分享',
    tags: ['哲学与社会科学'],
    title: '伦理与价值观对齐：哲学视角的标注实践',
    snippet: '大模型的价值观对齐不仅是一个技术问题，更是一个哲学问题。在处理涉及道德困境的提示词时，我们参考了功利主义和绝对命令的框架来构建我们的标注树。本文将详细探讨如何在实际标注过程中引入这些哲学框架，以减少模型输出的偏见。',
    author: 'Socrates_AI',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Socrates',
    views: '5.5k',
    image: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=200&h=120'
  },
  {
    id: 8,
    category: '求助讨论',
    tags: ['文学'],
    title: '如何评估大模型生成的古诗词“意境”？',
    snippet: '目前大模型写格律诗在平仄上已经能做到基本无误，但是在“意境”和“用典”的评估上依然非常困难。我们团队正在制定一套针对古典文学生成的评估维度，除了基础的格律，大家觉得还需要包含哪些核心指标？',
    author: 'Poet_Coder',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Poet',
    views: '900',
    image: null
  },
  {
    id: 9,
    category: '经验分享',
    tags: ['自然科学'],
    title: '处理物理化学公式标注的避坑指南',
    snippet: '在标注包含大量复杂物理化学公式的语料时，LaTeX 格式的准确性是重中之重。过去一个月我们踩了无数的坑，总结出了这套公式格式化与校验的自动化脚本，不仅能自动修正常见的语法错误，还能识别公式中的上下文变量一致性问题...',
    author: 'Quantum_Leap',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Quantum',
    views: '2.7k',
    image: null
  },
  {
    id: 10,
    category: '求助讨论',
    tags: ['工程技术'],
    title: '工业图纸和CAD数据的多模态理解，大家有什么思路？',
    snippet: '最近接到一个需求，要求评估模型对机械工程CAD图纸的理解能力。这类数据和普通的自然图像完全不同，包含大量的尺寸标注、公差和材料信息。目前市面上开源的VLM在这方面表现都很差，大家在构建这类评测集时有什么好的思路或工具推荐吗？',
    author: 'MechEng_Pro',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mech',
    views: '1.5k',
    image: null
  }
];

// Mock Data for model leaderboard
const mockModelLeaderboard = [
  { id: 1, name: 'GPT-4o', org: 'OpenAI', baseScore: 93.4, badge: 'SOTA' },
  { id: 2, name: 'Claude 3.5 Sonnet', org: 'Anthropic', baseScore: 92.8 },
  { id: 3, name: 'Gemini 1.5 Pro', org: 'Google', baseScore: 91.5 },
  { id: 4, name: 'Llama 3 (70B)', org: 'Meta', baseScore: 89.1, badge: 'Open' },
  { id: 5, name: 'Qwen Max', org: 'Alibaba', baseScore: 88.5 },
  { id: 6, name: 'DeepSeek V2', org: 'DeepSeek', baseScore: 87.9 },
  { id: 7, name: 'Mistral Large', org: 'Mistral AI', baseScore: 87.2 },
  { id: 8, name: 'Yi-Large', org: '01.AI', baseScore: 86.8 },
  { id: 9, name: 'GLM-4', org: 'Zhipu AI', baseScore: 86.5 },
  { id: 10, name: 'Command R+', org: 'Cohere', baseScore: 86.1 },
  { id: 11, name: 'Mixtral 8x22B', org: 'Mistral AI', baseScore: 85.4 },
  { id: 12, name: 'Llama 3 (8B)', org: 'Meta', baseScore: 84.2 },
  { id: 13, name: 'Qwen 1.5 (72B)', org: 'Alibaba', baseScore: 83.9 },
  { id: 14, name: 'Claude 3 Haiku', org: 'Anthropic', baseScore: 83.5 },
  { id: 15, name: 'Gemma 7B', org: 'Google', baseScore: 82.1 },
  { id: 16, name: 'DeepSeek Coder', org: 'DeepSeek', baseScore: 81.8 },
  { id: 17, name: 'Baichuan 3', org: 'Baichuan', baseScore: 81.2 },
  { id: 18, name: 'Phi-3 Mini', org: 'Microsoft', baseScore: 80.5 },
  { id: 19, name: 'StarCoder 2', org: 'DeepSeek', baseScore: 79.9 },
  { id: 20, name: 'Grok-1.5', org: 'xAI', baseScore: 79.1 },
];

const FeedItem = ({ item, onClick }: { item: typeof mockFeed[0], onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className="group cursor-pointer"
  >
    <div className="flex gap-4">
      <div className="flex-1">
        {/* Badges */}
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-md">
            {item.category}
          </span>
          {item.tags.map(tag => (
            <span key={tag} className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded-md">
              {tag}
            </span>
          ))}
        </div>
        
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {item.title}
        </h3>
        
        {/* Snippet */}
        <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2">
          {item.snippet}
        </p>
        
        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <img src={item.avatar} alt={item.author} className="w-5 h-5 rounded-full bg-gray-100" />
            <span>{item.author}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            浏览 {item.views}
          </div>
        </div>
      </div>
      
        {/* Optional Thumbnail */}
      {item.image && (
        <div className="w-32 h-24 shrink-0 rounded-lg overflow-hidden border border-gray-100 mt-2 shadow-sm group-hover:shadow-md transition-shadow duration-300">
          <img src={item.image} alt="Thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
      )}
    </div>
  </div>
);

const PostDetailPage = ({ post, onBack, onDelete }: { post: typeof mockFeed[0], onBack: () => void, onDelete?: (id: number) => void }) => {
  const [replies, setReplies] = useState([
    { id: 1, author: 'AI_Researcher', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=R1', content: '我觉得可以参考这篇最新的论文，他们提出了一种自动生成高质量CoT的框架...', time: '2小时前', isAccepted: false, isExpert: true, expertLevel: 'LV4', expertDomain: 'AI算法专家' },
    { id: 2, author: 'DataMaster', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=M2', content: '这确实是个难点。我们的做法是首先让人工标注出最关键的逻辑跳跃点，然后用模型去填补中间过程。', time: '5小时前', isAccepted: false, isExpert: false },
  ]);
  const [newReply, setNewReply] = useState('');
  const [isResolved, setIsResolved] = useState(false);
  const [showProfileCard, setShowProfileCard] = useState<{show: boolean, x: number, y: number, user: any}>({show: false, x: 0, y: 0, user: null});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Check if profile preferences allow showing level/skills (for the current user)
  const [profilePreferences, setProfilePreferences] = useState(() => {
    try {
      const saved = localStorage.getItem('expert_profile_preferences');
      return saved ? JSON.parse(saved) : { showLevel: true, showSkills: true };
    } catch (e) {
      return { showLevel: true, showSkills: true };
    }
  });

  useEffect(() => {
    const handlePreferencesUpdate = () => {
      try {
        const saved = localStorage.getItem('expert_profile_preferences');
        if (saved) setProfilePreferences(JSON.parse(saved));
      } catch (e) {}
    };
    window.addEventListener('profile_preferences_updated', handlePreferencesUpdate);
    return () => window.removeEventListener('profile_preferences_updated', handlePreferencesUpdate);
  }, []);

  const handleAvatarClick = (e: React.MouseEvent, user: any) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setShowProfileCard({
      show: true,
      x: rect.left,
      y: rect.bottom + 10,
      user
    });
  };

  const closeProfileCard = () => {
    setShowProfileCard(prev => ({ ...prev, show: false }));
  };

  const handleReply = () => {
    if (!newReply.trim()) return;
    setReplies([...replies, {
      id: Date.now(),
      author: '我',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Me',
      content: newReply,
      time: '刚刚',
      isAccepted: false,
      isExpert: true, // Assuming current user is an expert
      expertLevel: 'LV1',
      expertDomain: '金融领域专家'
    }]);
    setNewReply('');
  };

  const handleAccept = (replyId: number) => {
    setReplies(replies.map(r => r.id === replyId ? { ...r, isAccepted: true } : r));
    setIsResolved(true);
    alert('已采纳该回复，对方将获得积分奖励！');
  };

  const handleDeletePost = () => {
    // In a real app, this would be an API call
    setShowDeleteConfirm(false);
    if (onDelete) {
      onDelete(post.id);
    } else {
      onBack();
    }
    alert('帖子已删除');
  };

  return (
    <div className="absolute inset-0 bg-gray-50/50 z-20 overflow-y-auto flex flex-col">
      {/* Header Area */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            返回社区
          </button>
          <div className="flex items-center gap-3">
            {post.author === '当前用户' && (
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
              >
                删除帖子
              </button>
            )}
            <button className="px-4 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors">分享</button>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 pt-2 pb-8 flex-1">
        {/* Main Post Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 lg:p-12 mb-6 mt-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-sm font-medium rounded-md flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                {post.category}
              </span>
              {post.tags.map(tag => (
                <span key={tag} className="px-2.5 py-1 bg-gray-50 text-gray-600 text-sm rounded-md">
                  {tag}
                </span>
              ))}
            </div>
            {isResolved && (
              <span className="px-3 py-1 bg-green-50 text-green-600 text-sm font-medium rounded-full flex items-center gap-1.5 border border-green-100">
                <CheckCircle2 className="w-4 h-4" />
                已解决
              </span>
            )}
          </div>
          
          <h1 className="text-3xl font-black text-gray-900 mb-6 leading-tight tracking-tight">
            {post.title}
          </h1>
          
          <div className="flex items-center justify-between pb-6 border-b border-gray-100 mb-8">
            <div className="flex items-center gap-4">
              <img 
                src={post.avatar} 
                alt={post.author} 
                className="w-12 h-12 rounded-full bg-gray-100 border-2 border-white shadow-sm cursor-pointer hover:ring-2 hover:ring-blue-100 transition-all" 
                onClick={(e) => handleAvatarClick(e, {
                  name: post.author,
                  avatar: post.avatar,
                  isExpert: true,
                  level: 'LV3',
                  domain: '大模型应用专家',
                  skills: ['Prompt工程', 'Python', 'Agent开发']
                })}
              />
              <div>
                <div className="font-bold text-gray-900 text-base">{post.author}</div>
                <div className="text-sm text-gray-500 flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 发布于昨天</span>
                  <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> 浏览 {post.views}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="prose prose-blue max-w-none">
            <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
              {post.snippet}
              {'\n\n(此处省略详细内容...) \n这部分数据涉及到具体的案例和场景，希望能有相关经验的同行提供一些思路或者直接分享一套可用的标准模板。谢谢大家！'}
            </p>
          </div>
          
          {post.image && (
            <div className="mt-8 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              <img src={post.image} alt="附件" className="w-full h-auto object-cover" />
            </div>
          )}
        </div>

        {/* Replies Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 lg:p-12">
          <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2 border-b border-gray-100 pb-4">
            全部讨论 
            <span className="text-base font-normal text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
              {replies.length}
            </span>
          </h3>
          
          <div className="space-y-8">
            {replies.map((reply, index) => (
              <div key={reply.id} className={cn(
                "flex gap-5",
                index !== replies.length - 1 && "pb-8 border-b border-gray-100",
                reply.isAccepted && "p-6 bg-green-50/30 rounded-xl border border-green-100 -mx-6 px-6"
              )}>
                <img 
                  src={reply.avatar} 
                  alt={reply.author} 
                  className="w-10 h-10 rounded-full bg-gray-100 shrink-0 shadow-sm cursor-pointer hover:ring-2 hover:ring-blue-100 transition-all" 
                  onClick={(e) => {
                    // For the current user, respect their privacy settings
                    if (reply.author === '我') {
                      handleAvatarClick(e, {
                        name: '李珂瑾',
                        avatar: reply.avatar,
                        isExpert: true,
                        level: profilePreferences.showLevel ? reply.expertLevel : null,
                        domain: profilePreferences.showSkills ? reply.expertDomain : null,
                        skills: profilePreferences.showSkills ? ['强化学习', '提示词工程', 'Python'] : []
                      });
                    } else {
                      // For other users, use mock data
                      handleAvatarClick(e, {
                        name: reply.author,
                        avatar: reply.avatar,
                        isExpert: reply.isExpert,
                        level: reply.isExpert ? reply.expertLevel : null,
                        domain: reply.isExpert ? reply.expertDomain : null,
                        skills: reply.isExpert ? ['自然语言处理', 'PyTorch'] : []
                      });
                    }
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900">{reply.author}</span>
                      <span className="text-sm text-gray-400">{reply.time}</span>
                    </div>
                    {reply.isAccepted && (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        提问者已采纳
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 text-base leading-relaxed mb-4">
                    {reply.content}
                  </p>
                  <div className="flex items-center gap-6">
                    <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors font-medium">
                      <ThumbsUp className="w-4 h-4" /> 赞 (0)
                    </button>
                    <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors font-medium">
                      <MessageSquare className="w-4 h-4" /> 回复
                    </button>
                    {!isResolved && !reply.isAccepted && (
                      <button 
                        onClick={() => handleAccept(reply.id)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-bold transition-colors ml-auto flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        采纳此回复
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Input Area */}
      <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] z-40 mt-auto">
        <div className="max-w-[1200px] mx-auto flex gap-4 items-end">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Me" alt="Me" className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 shrink-0" />
          <div className="flex-1 relative">
            <textarea 
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              placeholder="写下你的回复..."
              className="w-full h-[46px] min-h-[46px] max-h-[160px] py-3 pl-4 pr-16 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-y text-base bg-gray-50/50 focus:bg-white transition-colors"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleReply();
                }
              }}
            />
            <button 
              onClick={handleReply}
              disabled={!newReply.trim()}
              className="absolute right-2 bottom-2 p-2 text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 rounded-lg transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative z-10">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">确认删除帖子？</h3>
              <p className="text-sm text-gray-500 mb-6">
                删除后该帖子将从社区和您的个人主页中移除，此操作不可恢复。
              </p>
              <div className="flex items-center justify-end gap-3">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={handleDeletePost}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* User Profile Popover */}
      {showProfileCard.show && showProfileCard.user && createPortal(
        <div 
          className="fixed z-[9999] animate-in fade-in zoom-in-95 duration-200"
          style={{
            top: showProfileCard.y,
            left: showProfileCard.x,
          }}
          onClick={e => e.stopPropagation()}
        >
          <div className="w-72 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 relative overflow-hidden">
            <div className="h-16 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
            <div className="px-5 pb-5">
              <div className="flex justify-between items-start -mt-8 mb-3">
                <img src={showProfileCard.user.avatar} alt="Avatar" className="w-16 h-16 rounded-full border-4 border-white bg-white shadow-sm" />
                {showProfileCard.user.isExpert && showProfileCard.user.level && (
                  <span className="bg-gradient-to-r from-gray-700 to-gray-900 text-white text-xs font-bold px-2.5 py-1 rounded shadow-sm mt-10">
                    {showProfileCard.user.level}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{showProfileCard.user.name}</h3>
              {showProfileCard.user.domain && (
                <p className="text-sm text-gray-500 mb-4">{showProfileCard.user.domain}</p>
              )}
              
              {showProfileCard.user.skills && showProfileCard.user.skills.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">专业技能</div>
                  <div className="flex flex-wrap gap-1.5">
                    {showProfileCard.user.skills.map((skill: string) => (
                      <span key={skill} className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-medium rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Invisible overlay to close popover when clicking outside */}
          <div className="fixed inset-0 -z-10" onClick={closeProfileCard} />
        </div>,
        document.body
      )}
    </div>
  );
};

export function Community() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    return tab || 'recommend';
  });
  
  const [skillsSubTab, setSkillsSubTab] = useState('market'); // market, my_skills
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  
  // 监听路由参数变化更新 activeTab
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  // 监听路由状态变化
  useEffect(() => {
    if (location.state?.defaultTab) {
      setActiveTab(location.state.defaultTab);
      // 清除 state，避免刷新页面时再次触发
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>(['全部']);
  const [selectedAvatarCategory, setSelectedAvatarCategory] = useState('全部');
  const [addedAvatarIds, setAddedAvatarIds] = useState<string[]>([]);
  
  // 技能商店相关状态
  const [showCreateSkillModal, setShowCreateSkillModal] = useState(false);
  const [installedSkills, setInstalledSkills] = useState<any[]>([]);
  const [installedSkillSearchQuery, setInstalledSkillSearchQuery] = useState('');
  const [showAllInstalled, setShowAllInstalled] = useState(false);
  const [selectedSkillCategory, setSelectedSkillCategory] = useState('全部');
  const [selectedSkillDetail, setSelectedSkillDetail] = useState<any>(null);

  const SKILL_CATEGORIES = ['全部', 'AIDP', '法律', '商业', '医疗', '设计', '编程', '写作'];

  // 模拟收藏数和下载数的状态管理
  const [skillStats, setSkillStats] = useState<Record<string, { stars: number, downloads: string }>>({});
  
  const skillMarkdownData: Record<string, string> = {
    'aidp_skill_creator': `---
name: "skill-creator"
description: "MANDATORY tool for creating SKILLs. Invoke IMMEDIATELY when user wants to create/add/make a new skill, or asks how to create a skill."
---

# Skill Creator

This skill helps you create new SKILLs for the workspace. It adopts the **Agent Skills open standard**, treating skills as filesystem-based domain knowledge packages.

## When to Use

**CRITICAL: You MUST invoke this skill IMMEDIATELY as your FIRST action when:**
- User wants to create a new skill
- User wants to add a custom skill to the workspace
- User asks to set up a skill template
- User asks "how to create a skill"
- User mentions creating/adding/making any skill

## SKILL Structure (Agent Skills Standard)

Following the latest Agent Skills standard (like Claude's implementation), a skill is a self-contained directory with a core \`SKILL.md\` file. It relies on **Progressive Disclosure**: the YAML frontmatter is used for intent recognition, while the Markdown body provides the full SOP. It also clearly separates the SOP (Skill) from atomic tools (MCP).

When the user asks to create a skill, scaffold the following structure in \`skills/<skill-name>/\`:

1. **\`SKILL.md\` (The Core)**
   - **YAML Frontmatter (Metadata Layer)**: Must contain \`name\`, \`description\` (crucial for intent recognition), and optional \`dependencies\` or \`metadata\`. This is the lightweight context loaded first.
   - **Markdown Body (Instruction Layer)**: The System Prompt (SOP) defining the skill's persona, boundaries, workflow steps, and how to use specific tools (MCP).
2. **\`references/\` (Optional RAG/Context)**
   - Directory for supplemental knowledge base files (Markdown, PDFs, etc.). The \`SKILL.md\` can instruct the agent to read these only when specific conditions are met.
3. **\`scripts/\` or \`tools/\` (Optional Executables/MCP)**
   - Directory for local scripts (\`.py\`, \`.js\`, \`.sh\`) or MCP server definitions that the skill might need to invoke.

## Creation & Iteration Workflow (Human-in-the-Loop + Agent RL)

To create a high-quality skill, you must act as a proactive evaluator. Follow this Step-by-Step wizard approach:

1. **Requirement Gathering (HITL)**: 
   - **CRITICAL**: Use the \`AskUserQuestion\` tool to gather structured requirements (e.g., skill name, specific domain, need for MCP tools, need for RAG). Do not just guess. Provide multi-choice options where applicable to guide the user.
2. **Draft the Core Files**:
   - Create \`skills/<skill-name>/SKILL.md\` with the YAML Frontmatter (\`name\`, \`description\`) and Markdown Body (SOP).
   - Create \`skills/<skill-name>/references/\` and \`skills/<skill-name>/scripts/\` if required.
3. **Generate Test Cases & Eval**:
   - Once the draft is created, **proactively generate 2-3 mock test cases** representing real-world user queries for this skill.
   - Simulate a run of these test cases using the new \`SKILL.md\` SOP.
   - Generate an Eval Review report showing the difference between "Without Skill" and "With Skill".
4. **Iterative Refinement (RLHF)**:
   - Present the Eval results to the user.
   - Ask for feedback: "Does this output meet your expectations? What feels clunky or fails?"
   - Use their feedback to refine the \`SKILL.md\`. Every iteration is a manual RLHF cycle.
`
  };

  // 初始化随机数，确保不会每次渲染都变化
  useEffect(() => {
    const stats: Record<string, { stars: number, downloads: string }> = {};
    // 假设所有技能都有一个唯一的 id
    // 这里我们先初始化可能出现的所有技能 id 的随机数
    const allSkillIds = [
      'law_101', 'law_102', 'law_103', 'law_104', 'law_105',
      'biz_201', 'med_301', 'aidp_307', 'aidp_skill_creator'
    ];
    
    allSkillIds.forEach(id => {
      stats[id] = {
        stars: Math.floor(Math.random() * 500) + 50,
        downloads: (Math.random() * 20 + 1).toFixed(1) + 'k'
      };
    });
    setSkillStats(stats);
  }, []);

  const handleToggleSkill = (skill: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const isInstalled = installedSkills.some(s => s.id === skill.id);
    if (isInstalled) {
      setInstalledSkills(prev => prev.filter(s => s.id !== skill.id));
      // 取消收藏时，数字-1
      setSkillStats(prev => ({
        ...prev,
        [skill.id]: {
          ...prev[skill.id],
          stars: Math.max(0, prev[skill.id].stars - 1)
        }
      }));
    } else {
      setInstalledSkills(prev => [...prev, skill]);
      // 收藏时，数字+1
      setSkillStats(prev => ({
        ...prev,
        [skill.id]: {
          ...prev[skill.id],
          stars: (prev[skill.id]?.stars || 0) + 1
        }
      }));
    }
  };

  // 监听分身添加/移除状态
  useEffect(() => {
    const loadAddedAvatars = () => {
      const existingStr = localStorage.getItem('addedAvatars');
      const existing = existingStr ? JSON.parse(existingStr) : [];
      setAddedAvatarIds(existing.map((a: any) => a.id));
    };
    loadAddedAvatars();
    window.addEventListener('avatars-changed', loadAddedAvatars);
    return () => window.removeEventListener('avatars-changed', loadAddedAvatars);
  }, []);

  const [selectedPost, setSelectedPost] = useState<typeof mockFeed[0] | null>(null);
  const [feedData, setFeedData] = useState(mockFeed);
  const [showAllModels, setShowAllModels] = useState(false);
  const [leaderboardCategory, setLeaderboardCategory] = useState('Overall');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [showPageSizeDropdown, setShowPageSizeDropdown] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentChallengeIndex((prev) => (prev + 1) % BOUNTY_CHALLENGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const leaderboardCategories = ['Overall', 'Expert', 'Hard Prompts', 'Coding', 'Math', 'Creative Writing', 'Instruction Following', 'Longer Query', 'Text'];

  // Calculate dynamic scores based on category to simulate different rankings
  const getCategoryScoreModifier = (modelName: string, category: string) => {
    let modifier = 0;
    
    // Pseudo-random but deterministic logic based on string lengths and char codes
    const hash = (modelName.charCodeAt(0) + category.charCodeAt(0)) % 10;
    
    switch (category) {
      case 'Overall':
        return 0; // base score
      case 'Coding':
        if (modelName.includes('Coder')) return 15;
        if (modelName.includes('GPT-4') || modelName.includes('Claude')) return 8;
        modifier = (hash - 5) * 2;
        break;
      case 'Math':
        if (modelName.includes('Qwen') || modelName.includes('DeepSeek')) return 12;
        modifier = (hash - 4) * 2.5;
        break;
      case 'Expert':
      case 'Hard Prompts':
        if (modelName.includes('Pro') || modelName.includes('Max') || modelName.includes('Large')) return 10;
        modifier = (hash - 6) * 3;
        break;
      case 'Creative Writing':
        if (modelName.includes('Claude') || modelName.includes('Yi')) return 14;
        modifier = (hash - 3) * 2;
        break;
      default:
        modifier = (hash - 5) * 1.5;
    }
    
    return modifier;
  };

  const getSortedLeaderboard = () => {
    const scoredList = mockModelLeaderboard.map(model => {
      const modifier = getCategoryScoreModifier(model.name, leaderboardCategory);
      // Ensure score stays within reasonable bounds (0-100)
      const finalScore = Math.min(99.9, Math.max(60.0, model.baseScore + modifier));
      return {
        ...model,
        score: finalScore.toFixed(1)
      };
    });

    // Sort descending by score
    return scoredList.sort((a, b) => parseFloat(b.score) - parseFloat(a.score));
  };

  const currentLeaderboard = getSortedLeaderboard();

  const disciplines = ['全部', '泛领域', '自然科学', '经济金融', '教育科研', '医疗健康', '法律', '哲学与社会科学', '软件与AI', '文学', '工程技术', '其他'];

  const toggleDiscipline = (tag: string) => {
    if (tag === '全部') {
      setSelectedDisciplines(['全部']);
      setCurrentPage(1); // Reset page on filter change
      return;
    }

    setSelectedDisciplines(prev => {
      const newSelection = prev.filter(t => t !== '全部');
      if (newSelection.includes(tag)) {
        const filtered = newSelection.filter(t => t !== tag);
        setCurrentPage(1); // Reset page on filter change
        return filtered.length === 0 ? ['全部'] : filtered;
      }
      setCurrentPage(1); // Reset page on filter change
      return [...newSelection, tag];
    });
  };

  // Pagination logic
  const filteredFeed = feedData.filter(item => 
    selectedDisciplines.includes('全部') || item.tags.some(tag => selectedDisciplines.includes(tag))
  );
  
  const totalPages = Math.ceil(filteredFeed.length / pageSize);
  const currentFeedPage = filteredFeed.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full min-h-screen bg-transparent">
      {/* View switching logic */}
      {selectedPost ? (
        <PostDetailPage 
          post={selectedPost} 
          onBack={() => {
            // Check if post was deleted by checking if it still exists in feedData
            // If it was just deleted, the actual deletion logic happens in handleDeletePost
            // but we need to update the parent state as well.
            // A better way would be passing an onDelete callback, but this works for the mock
            if (!feedData.find(p => p.id === selectedPost.id)) {
              // Already deleted, just close
              setSelectedPost(null);
            } else {
              setSelectedPost(null);
            }
          }} 
          onDelete={(postId) => {
            setFeedData(prev => prev.filter(p => p.id !== postId));
            setSelectedPost(null);
            // Also dispatch event to remove from UserProfile
            window.dispatchEvent(new CustomEvent('delete-community-post', { detail: { id: postId } }));
          }}
        />
      ) : (
        <>
      {/* Tab Navigation */}
      {/* 专家分身和技能商店均不再显示此 Tab */}
      {activeTab === 'recommend' && (
      <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 pb-0 pt-8">
        <div className="flex items-center gap-2 mb-6 bg-white rounded-xl p-1 border border-gray-200 shadow-sm w-fit">
          <button
            onClick={() => setActiveTab('recommend')}
            className={cn(
              "px-6 py-2.5 rounded-lg text-sm font-bold transition-all",
              activeTab === 'recommend'
                ? "bg-black text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            )}
          >推荐</button>
        </div>
      </div>
      )}

      {/* Main Content Area */}
      <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 lg:px-24 pb-16 pt-0">
        {activeTab === 'recommend' ? (
          <>
            {/* Top Search Area with Gradient Background */}
            <div className="w-full bg-transparent pb-6">
              <div className="flex flex-col items-center justify-center max-w-3xl mx-auto">
                {/* Search Bar */}
                <div className="w-full relative mb-4 shadow-sm group">
                  <input 
                    type="text" 
                    placeholder="搜搜大佬们的通关秘籍，或者发个求助贴摇人，顺便赚点积分加个鸡腿！"
                    className="w-full pl-6 pr-12 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder:text-gray-400 placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all text-base"
                  />
                  <button className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-black transition-colors">
                    <Search className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Discipline Categories */}
                <div className="flex items-center gap-3 w-full pl-2">
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mb-2 w-full mask-edges">
                    {disciplines.map((tag) => {
                      const isSelected = selectedDisciplines.includes(tag);
                      return (
                        <button 
                          key={tag} 
                          onClick={() => toggleDiscipline(tag)}
                          className={cn(
                            "px-3.5 py-1.5 border text-xs rounded-full transition-all whitespace-nowrap shrink-0",
                            isSelected 
                              ? "bg-black border-black text-white font-medium shadow-sm" 
                              : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600"
                          )}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px] gap-10 xl:gap-16">
          
          {/* Left Column: Feed */}
          <div>
            {/* Feed Filter */}
            <div className="flex items-center mb-6 text-sm text-gray-600">
                  <span>以下内容根据你选择的专业领域进行推荐，可在</span>
                  <button onClick={() => {
                    navigate('/expert/profile');
                    setTimeout(() => {
                      document.getElementById('platform-verification')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }} className="text-blue-600 hover:underline px-1 font-medium">个人中心</button>
                  <span>调整</span>
                </div>

                {/* Feed List */}
                <div className="space-y-4">
                  {currentFeedPage.map(item => (
                    <div 
                      key={item.id} 
                      className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-gray-200 transition-all duration-300 cursor-pointer"
                      onClick={() => setSelectedPost(item)}
                    >
                      <FeedItem item={item} />
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>共 {filteredFeed.length} 条</span>
                      <div className="relative">
                        <button 
                          onClick={() => setShowPageSizeDropdown(!showPageSizeDropdown)}
                          className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded-md transition-colors"
                        >
                          {pageSize} 条/页
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        {showPageSizeDropdown && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowPageSizeDropdown(false)} />
                            <div className="absolute bottom-full left-0 mb-1 w-24 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
                              {[5, 10, 20, 50].map(size => (
                                <button
                                  key={size}
                                  onClick={() => {
                                    setPageSize(size);
                                    setCurrentPage(1);
                                    setShowPageSizeDropdown(false);
                                  }}
                                  className={cn(
                                    "w-full text-left px-3 py-1.5 text-sm transition-colors",
                                    pageSize === size ? "bg-blue-50 text-blue-600 font-medium" : "hover:bg-gray-50 text-gray-700"
                                  )}
                                >
                                  {size} 条/页
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      
                      <div className="flex items-center gap-1 mx-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                          // Simple logic to show limited pages if there are many
                          if (
                            totalPages <= 7 ||
                            page === 1 || 
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={cn(
                                  "w-8 h-8 rounded-md text-sm font-medium transition-colors flex items-center justify-center",
                                  currentPage === page 
                                    ? "bg-black text-white" 
                                    : "text-gray-600 hover:bg-gray-100"
                                )}
                              >
                                {page}
                              </button>
                            );
                          }
                          
                          // Show ellipsis
                          if (page === currentPage - 2 || page === currentPage + 2) {
                            return <span key={page} className="text-gray-400 px-1">...</span>;
                          }
                          
                          return null;
                        })}
                      </div>

                      <button 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
          </div>

          {/* Right Column: Sidebar */}
          <div className="space-y-6">
            {/* Banner - Replaced with Workbench Carousel Style */}
            <div className="relative group cursor-pointer mb-6">
              <div className="relative overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-all duration-500 h-[180px] mb-4">
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
                      
                      <div className="relative h-full bg-white/10 backdrop-blur-sm p-5 flex flex-col justify-center">
                        <div className="flex flex-col h-full justify-between">
                          <div className="text-white">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm backdrop-blur-md", challenge.badgeColor)}>
                                <challenge.icon className="w-3 h-3" />
                                {challenge.badge}
                              </span>
                              
                              {challenge.royalty && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 bg-white/20 text-white backdrop-blur-md border border-white/20">
                                  <TrendingUp className="w-2.5 h-2.5" />
                                  模型分红
                                </span>
                              )}

                              {challenge.attribution && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 bg-white/20 text-white backdrop-blur-md border border-white/20">
                                  <Feather className="w-2.5 h-2.5" />
                                  署名权
                                </span>
                              )}
                            </div>
                            <h3 className="text-lg font-bold mb-2 text-white tracking-tight leading-tight">
                              {challenge.title.split(challenge.highlight).map((part, i, arr) => (
                                <React.Fragment key={i}>
                                  {part}
                                  {i < arr.length - 1 && (
                                    <span className={cn("font-extrabold text-xl mx-1", challenge.highlightColor)}>
                                      {challenge.highlight}
                                    </span>
                                  )}
                                </React.Fragment>
                              ))}
                            </h3>
                          </div>
                          
                          <div className="flex justify-end mt-auto mb-2">
                            <button className="shrink-0 bg-white/95 hover:bg-white text-gray-900 active:scale-95 px-4 py-2 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center gap-1.5 group/btn backdrop-blur-sm">
                              立即挑战
                              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Carousel indicators */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                {BOUNTY_CHALLENGES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentChallengeIndex(idx);
                    }}
                    className={cn(
                      "h-1 rounded-full transition-all duration-300",
                      idx === currentChallengeIndex ? "bg-white w-4" : "bg-white/50 w-1 hover:bg-white/80"
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
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/20 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/40 backdrop-blur-sm -mt-4"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentChallengeIndex((prev) => (prev + 1) % BOUNTY_CHALLENGES.length);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/20 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/40 backdrop-blur-sm -mt-4"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Rankings Widget */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                  模型评测榜
                  <HelpCircle className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                </h3>
                <div className="relative">
                  <button 
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 transition-colors"
                  >
                    {leaderboardCategory}
                    <ChevronDown className={cn("w-3 h-3 transition-transform", showCategoryDropdown && "rotate-180")} />
                  </button>
                  
                  {showCategoryDropdown && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setShowCategoryDropdown(false)}
                      />
                      <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20 overflow-hidden">
                        {leaderboardCategories.map(cat => (
                          <button
                            key={cat}
                            onClick={() => {
                              setLeaderboardCategory(cat);
                              setShowCategoryDropdown(false);
                            }}
                            className={cn(
                              "w-full text-left px-3 py-2 text-xs transition-colors hover:bg-gray-50",
                              leaderboardCategory === cat ? "text-blue-600 font-medium bg-blue-50/50" : "text-gray-700"
                            )}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {(showAllModels ? currentLeaderboard : currentLeaderboard.slice(0, 10)).map((item, index) => (
                  <div key={item.id} className="flex items-center gap-3 group cursor-pointer">
                    <div className={cn(
                      "w-5 h-5 rounded flex items-center justify-center text-xs font-bold shrink-0",
                      index === 0 ? "bg-amber-100 text-amber-600" :
                      index === 1 ? "bg-gray-100 text-gray-600" :
                      index === 2 ? "bg-orange-100 text-orange-600" :
                      "text-gray-400 font-medium"
                    )}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm text-gray-900 font-medium truncate group-hover:text-blue-600 transition-colors flex items-center gap-2">
                        {item.name}
                        {item.badge && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-500 text-[10px] rounded border border-blue-100 leading-none">{item.badge}</span>}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[11px] text-gray-500 truncate">
                          {item.org}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-blue-600">{item.score}</div>
                      <div className="text-[10px] text-gray-400">Score</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={() => setShowAllModels(!showAllModels)}
                className="w-full mt-4 py-2 flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
              >
                {showAllModels ? '收起榜单' : '查看全部'}
                {showAllModels ? <ChevronLeft className="w-4 h-4 rotate-90" /> : <ChevronRight className="w-4 h-4 rotate-90" />}
              </button>
            </div>
          </div>
          
          </div>
          </>
        ) : activeTab === 'avatars' ? (
          <div className="w-full">
            {/* 分类筛选 */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
              {AVATAR_CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedAvatarCategory(category)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                    selectedAvatarCategory === category
                      ? "bg-black text-white"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  )}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* 数字分身卡片网格 */}
            {AVATARS_GALLERY.filter((avatar) => selectedAvatarCategory === '全部' || avatar.category === selectedAvatarCategory).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {AVATARS_GALLERY
                  .filter((avatar) => selectedAvatarCategory === '全部' || avatar.category === selectedAvatarCategory)
                  .map((avatar) => (
                    <div
                      key={avatar.id}
                      className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl hover:border-blue-200 transition-all duration-300 group cursor-pointer"
                    >
                    {/* 头像区域 */}
                    <div className="relative mb-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto shadow-sm">
                        <img
                          src={avatar.avatar}
                          alt={avatar.name}
                          className="w-16 h-16 rounded-full"
                        />
                      </div>
                      <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {avatar.category}
                      </div>
                    </div>
                    {/* 信息区域 */}
                    <div className="text-center mb-4">
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <h3 className="text-lg font-bold text-gray-900">{avatar.name}</h3>
                        <span className="text-xs text-gray-400">· {avatar.expertName}的分身</span>
                      </div>
                      <p className="text-sm text-blue-600 font-medium mb-2">{avatar.title}</p>
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{avatar.description}</p>
                    </div>
                    {/* 评分和使用次数 */}
                    <div className="flex items-center justify-center gap-4 mb-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span className="font-medium text-gray-700">{avatar.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-blue-500" />
                        <span>{avatar.usageCount} 次使用</span>
                      </div>
                    </div>
                    {/* 添加按钮 */}
                    {(() => {
                      const targetId = `new_e_${avatar.id}`;
                      const isAdded = addedAvatarIds.includes(targetId);
                      return (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const existingStr = localStorage.getItem('addedAvatars');
                            const existing = existingStr ? JSON.parse(existingStr) : [];
                            
                            if (!isAdded) {
                              const newAvatar = {
                                id: targetId,
                                name: `${avatar.expertName} (${avatar.title})`,
                                type: 'expert',
                                avatar: avatar.avatar
                              };
                              localStorage.setItem('addedAvatars', JSON.stringify([...existing, newAvatar]));
                              window.dispatchEvent(new CustomEvent('avatars-changed'));
                              window.dispatchEvent(new CustomEvent('avatar-added')); // for compatibility
                              
                              const toast = document.createElement('div');
                              toast.className = 'fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm shadow-xl z-50 animate-in slide-in-from-bottom-5';
                              toast.innerHTML = `已将 <strong>${avatar.expertName}</strong> 添加到您的分身列表`;
                              document.body.appendChild(toast);
                              setTimeout(() => {
                                toast.classList.add('animate-out', 'fade-out', 'slide-out-to-bottom-5');
                                setTimeout(() => document.body.removeChild(toast), 300);
                              }, 2000);
                            } else {
                              const filtered = existing.filter((a: any) => a.id !== targetId);
                              localStorage.setItem('addedAvatars', JSON.stringify(filtered));
                              window.dispatchEvent(new CustomEvent('avatars-changed'));
                              window.dispatchEvent(new CustomEvent('avatar-added')); // for compatibility
                              
                              const toast = document.createElement('div');
                              toast.className = 'fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm shadow-xl z-50 animate-in slide-in-from-bottom-5';
                              toast.innerHTML = `已取消添加 <strong>${avatar.expertName}</strong>`;
                              document.body.appendChild(toast);
                              setTimeout(() => {
                                toast.classList.add('animate-out', 'fade-out', 'slide-out-to-bottom-5');
                                setTimeout(() => document.body.removeChild(toast), 300);
                              }, 2000);
                            }
                          }}
                          className={cn(
                            "w-full py-2.5 text-sm font-bold rounded-xl transition-all",
                            isAdded
                              ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          )}
                        >
                          {isAdded ? '✓ 已添加 (取消)' : '➕ 添加分身'}
                        </button>
                      );
                    })()}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                  <Bot className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">哎呀，这里还是片荒芜的沙漠 🌵</h3>
                <p className="text-gray-500 text-sm mb-6 max-w-md text-center">
                  这位领域大牛似乎还在闭关修炼，暂时没有放出自己的数字分身。
                  不如你来做个表率？把你的智慧沉淀下来，让 AI 替你接客赚外快！
                </p>
                <button
                  onClick={() => navigate('/expert/profile', { state: { defaultTab: '数字分身' } })}
                  className="px-6 py-2.5 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-all shadow-sm flex items-center gap-2"
                >
                  <Bot className="w-4 h-4" />
                  去发布我的数字分身
                </button>
              </div>
            )}
          </div>
        ) : activeTab === 'skills' ? (
          <div className="w-full flex flex-col items-center">
            {/* Header Area */}
            <div className="text-center mb-10 mt-6 w-full">
              {/* Sub Tabs for Skills */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                <div className="flex p-1.5 bg-gray-100/80 backdrop-blur-xl rounded-2xl w-fit shadow-sm border border-white/50 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-transparent opacity-50 pointer-events-none"></div>
                  <button
                    onClick={() => setSkillsSubTab('market')}
                    className={cn(
                      "relative px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 z-10",
                      skillsSubTab === 'market' 
                        ? "bg-white text-black shadow-[0_2px_10px_rgba(0,0,0,0.08)] border border-gray-200/50 scale-100" 
                        : "text-gray-500 hover:text-gray-800 hover:bg-white/50 scale-95"
                    )}
                  >
                    <ShoppingBag className={cn("w-4 h-4 transition-colors", skillsSubTab === 'market' ? "text-lab-blue" : "text-gray-400")} />
                    技能市场
                  </button>
                  <button
                    onClick={() => setSkillsSubTab('my_skills')}
                    className={cn(
                      "relative px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 z-10",
                      skillsSubTab === 'my_skills' 
                        ? "bg-white text-black shadow-[0_2px_10px_rgba(0,0,0,0.08)] border border-gray-200/50 scale-100" 
                        : "text-gray-500 hover:text-gray-800 hover:bg-white/50 scale-95"
                    )}
                  >
                    <Briefcase className={cn("w-4 h-4 transition-colors", skillsSubTab === 'my_skills' ? "text-lab-purple" : "text-gray-400")} />
                    我的技能
                  </button>
                </div>
                <button 
                  onClick={() => setShowCreateSkillModal(true)}
                  className="px-4 py-2 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-all shadow-sm flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  创建技能
                </button>
              </div>

              {skillsSubTab === 'my_skills' ? (
                <>
                  <div className="mb-12 w-full text-left">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                      <div className="flex items-center gap-3">
                        <h2 className="text-lg font-bold text-gray-900">我创建的</h2>
                        <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-0.5 rounded-full">0</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 mb-12">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                        <Bot className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">还没有创建过技能</h3>
                      <p className="text-gray-500 text-sm mb-6 max-w-md text-center">使用 AI 帮你快速创建一个专属技能，让它成为你的得力助手！</p>
                      <button 
                        onClick={() => setShowCreateSkillModal(true)}
                        className="px-6 py-2.5 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-all shadow-sm flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        创建技能
                      </button>
                    </div>

                    <div className="w-full h-px bg-gray-100 mb-10"></div>

                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                      <div className="flex items-center gap-3">
                        <h2 className="text-lg font-bold text-gray-900">我的收藏</h2>
                        <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-0.5 rounded-full">{installedSkills.length}</span>
                      </div>
                      <div className="relative w-full md:w-64 shrink-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="在已安装中搜索..."
                          value={installedSkillSearchQuery}
                          onChange={(e) => setInstalledSkillSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                        />
                      </div>
                    </div>
                    
                    {installedSkills.length > 0 ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 w-full">
                          {installedSkills
                            .filter(skill => installedSkillSearchQuery ? skill.title.toLowerCase().includes(installedSkillSearchQuery.toLowerCase()) || skill.desc.toLowerCase().includes(installedSkillSearchQuery.toLowerCase()) : true)
                            .slice(0, showAllInstalled ? installedSkills.length : 8)
                            .map(skill => {
                              const isInstalled = true;
                              return (
                            <div key={skill.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer group flex flex-col h-full text-left" onClick={() => setSelectedSkillDetail({ ...skill, description: skill.desc || skill.description })}>
                              <div className="flex items-center gap-3 mb-4">
                                <div className={`w-10 h-10 rounded-xl ${skill.color || 'bg-gray-800'} ${!skill.color && !skill.icon ? 'text-white' : ''} flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform`}>
                                  {skill.icon ? skill.icon : <span className="text-white font-bold">{skill.title.charAt(0).toUpperCase()}</span>}
                                </div>
                                <h3 className="font-bold text-gray-900 text-[15px] group-hover:text-blue-600 transition-colors truncate">{skill.title}</h3>
                              </div>
                              <p className="text-[13px] text-gray-500 leading-relaxed mb-6 flex-1 line-clamp-3">
                                {skill.desc}
                              </p>
                              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                                <div className="text-xs text-gray-400 font-medium">
                                  {skill.author || '系统内置'}
                                </div>
                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                  <button 
                                    onClick={(e) => handleToggleSkill(skill, e)}
                                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-gray-100 text-gray-500"
                                    title={isInstalled ? "取消收藏" : "收藏"}
                                  >
                                    <Star className={`w-4 h-4 ${isInstalled ? 'fill-amber-400 text-amber-400' : ''}`} />
                                    <span>{skillStats[skill.id]?.stars || 0}</span>
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      setSelectedSkillDetail({ ...skill, defaultTab: 'install' });
                                    }}
                                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-gray-100 text-gray-500"
                                    title="下载/安装"
                                  >
                                    <Download className="w-4 h-4" />
                                    <span>{skillStats[skill.id]?.downloads || '0k'}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )})}
                        </div>
                        
                        {installedSkills.length > 8 && (
                          <div className="flex justify-center mt-6">
                            <button 
                              onClick={() => setShowAllInstalled(!showAllInstalled)}
                              className="text-xs text-gray-500 hover:text-gray-900 font-medium transition-colors"
                            >
                              {showAllInstalled ? '收起' : `显示更多 (${installedSkills.length - 8})`}
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                          <Zap className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">还没有收藏任何技能</h3>
                        <p className="text-gray-500 text-sm mb-6 max-w-md text-center">
                          去技能商店逛逛，发现更多有趣好用的 AI 技能吧！
                        </p>
                        <button
                          onClick={() => setSkillsSubTab('market')}
                          className="px-6 py-2.5 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-all shadow-sm flex items-center gap-2"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          去技能市场
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="w-full">
                  {/* Skill Categories (Domain tags similar to avatars) and Search */}
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 justify-start w-full md:w-auto no-scrollbar">
                      {SKILL_CATEGORIES.map((category) => (
                        <button
                          key={category}
                          onClick={() => setSelectedSkillCategory(category)}
                          className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap shrink-0",
                            selectedSkillCategory === category
                              ? "bg-black text-white"
                              : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                          )}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                    <div className="relative w-full md:w-64 shrink-0">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="搜索技能名称或描述..."
                        value={skillSearchQuery}
                        onChange={(e) => setSkillSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                      />
                    </div>
                  </div>
                  
                  {/* Category Tags */}
                  {selectedSkillCategory === '法律' && (
                    <>
                      <p className="text-[13px] text-gray-500 max-w-3xl mx-auto leading-relaxed mt-2 mb-8">我们深入拆解了律所、法务及企业主的日常高频诉求，精选出一系列覆盖合同审阅、合规审计及争议解决的专业 Skill 矩阵。无论你是追求提效办案的从业者，还是寻求法律支持的企业家，都能在这里找到精准的 AI 解决方案。</p>
                    </>
                  )}
                  {selectedSkillCategory !== '全部' && selectedSkillCategory !== '法律' && selectedSkillCategory !== '商业' && selectedSkillCategory !== '医疗' && selectedSkillCategory !== 'AIDP' && (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <Bot className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 text-center max-w-md">当前领域还没有相关的技能，不如你来做个表率，创建一个专属技能吧！</p>
                    </div>
                  )}

                  {/* Skills Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full text-left">
                    {[
                      {
                        id: 'aidp_skill_creator',
                        title: 'Skill 生成器',
                        icon: '🛠️',
                        description: '自动化生成标准化大模型 Skill 的元技能。遵循 Agent Skills 开放标准，支持 Human-in-the-Loop 问答式向导、自动生成 Mock 测试用例，以及基于用户反馈的自我进化（Agent RL）。',
                        author: '@官方',
                        category: 'AIDP'
                      },
                      {
                        id: 'law_101',
                        title: '诉讼大师',
                        icon: '⚖️',
                        description: '专业诉讼文书起草。浓缩多年经验，权威数据支撑，高效帮你写出符合法院要求的专业起诉状...',
                        author: '@lei0306',
                        category: '法律'
                      },
                      {
                        id: 'law_102',
                        title: '法律备忘录',
                        icon: '📝',
                        description: '生成符合顶尖律所标准的专业法律备忘录，支持类案检索、法规验证及AIRAC分析，律师值得拥有的...',
                        author: '@lei0306',
                        category: '法律'
                      },
                      {
                        id: 'law_103',
                        title: '法律类案检索',
                        icon: '📚',
                        description: '基于专业数据库的法律案例检索与类案分析工具。通过关键词/法条/案由检索并核验，快速找到...',
                        author: '@lei0306',
                        category: '法律'
                      },
                      {
                        id: 'law_104',
                        title: '法律咨询报告',
                        icon: '📋',
                        description: '提供适用性法律咨询，涵盖常见法律问题解答与建议...',
                        author: '@Xpert自选',
                        category: '法律'
                      },
                      {
                        id: 'law_105',
                        title: '商业合同审查',
                        icon: '🔍',
                        description: '全方位审查各类商业合同（买卖、租赁、服务等）。深入剖析条款，精准识别风险点，并给出...',
                        author: '@lei0306',
                        category: '商业'
                      },
                      {
                        id: 'biz_201',
                        title: '商业计划书生成器',
                        icon: '💼',
                        description: '一键生成结构完整的商业计划书，涵盖市场分析、竞品对比、盈利模式与财务预测，助你快速打动投资人...',
                        author: '@StartupPro',
                        category: '商业'
                      },
                      {
                        id: 'med_301',
                        title: '医学文献解读助手',
                        icon: '🏥',
                        description: '快速提取医学前沿论文核心观点，支持自动翻译与专业术语解析，为临床医生与科研人员节省大量时间...',
                        author: '@Dr.AI',
                        category: '医疗'
                      },
                      {
                        id: 'aidp_307',
                        title: '全自动PII脱敏',
                        icon: '🛡️',
                        description: '在数据进入人工标注流程前，自动识别并替换文本或图像中的个人隐私信息（姓名、电话、身份证号等）...',
                        author: '@SafeData',
                        category: 'AIDP'
                      }
                    ]
                    .filter(skill => selectedSkillCategory === '全部' || skill.category === selectedSkillCategory)
                    .filter(skill => skillSearchQuery ? skill.title.toLowerCase().includes(skillSearchQuery.toLowerCase()) || skill.description.toLowerCase().includes(skillSearchQuery.toLowerCase()) : true)
                    .map(skill => {
                      const isInstalled = installedSkills.some(s => s.id === skill.id);
                      return (
                        <div key={skill.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-lg hover:border-purple-200 transition-all cursor-pointer group flex flex-col h-full" onClick={() => setSelectedSkillDetail(skill)}>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                              {skill.icon}
                            </div>
                            <h3 className="font-bold text-gray-900 text-[15px] group-hover:text-purple-600 transition-colors">{skill.title}</h3>
                          </div>
                          <p className="text-[13px] text-gray-500 leading-relaxed mb-6 flex-1 line-clamp-3">
                            {skill.description}
                          </p>
                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                            <div className="text-xs text-gray-400 font-medium">
                              {skill.author}
                            </div>
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <button 
                                onClick={(e) => handleToggleSkill(skill, e)}
                                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-gray-100 text-gray-500"
                                title={isInstalled ? "取消收藏" : "收藏"}
                              >
                                <Star className={`w-4 h-4 ${isInstalled ? 'fill-amber-400 text-amber-400' : ''}`} />
                                <span>{skillStats[skill.id]?.stars || 0}</span>
                              </button>
                              <button 
                                onClick={(e) => {
                                  setSelectedSkillDetail({ ...skill, defaultTab: 'install' });
                                }}
                                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-gray-100 text-gray-500"
                                title="下载/安装"
                              >
                                <Download className="w-4 h-4" />
                                <span>{skillStats[skill.id]?.downloads || '0k'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
        </>
      )}

      {selectedSkillDetail && (
        <SkillDetailModal 
          skill={selectedSkillDetail} 
          onClose={() => setSelectedSkillDetail(null)} 
          onInstall={handleToggleSkill} 
          isInstalled={installedSkills.some(s => s.id === selectedSkillDetail.id)} 
          skillStats={skillStats[selectedSkillDetail.id]}
          markdownContent={skillMarkdownData[selectedSkillDetail.id]}
        />
      )}
    </div>
  );
}
