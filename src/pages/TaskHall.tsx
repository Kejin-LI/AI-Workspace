import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Clock, 
  Users, 
  ChevronRight, 
  CheckCircle,
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  BrainCircuit,
  GraduationCap,
  History,
  X,
  Zap,
  Star,
  Briefcase,
  Globe,
  Layout,
  TrendingUp,
  Feather
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
  <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-2xl font-semibold mt-1 text-gray-900">{value}</h3>
      </div>
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
    <div className="mt-4 flex items-center text-sm">
      <span className="text-green-600 font-medium flex items-center">
        <TrendingUp className="w-3 h-3 mr-1" />
        {change}
      </span>
      <span className="text-gray-400 ml-2">较上周</span>
    </div>
  </div>
);

export function TaskHall() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const location = useLocation();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [qualificationStep, setQualificationStep] = useState<'idle' | 'scanning' | 'interview' | 'quiz' | 'failed' | 'passed'>('idle');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [activeTab, setActiveTab] = useState<'public' | 'my'>((location.state as any)?.activeTab || 'public');

  const [myTasks, setMyTasks] = useState<any[]>(() => {
    // Initialize from localStorage first
    try {
      const savedTasks = localStorage.getItem('expert_my_tasks');
      const initialTasks = savedTasks ? JSON.parse(savedTasks) : [];
      
      // Check if we have a passedTask in location state to add to myTasks
      if ((location.state as any)?.passedTask) {
        const passedTask = (location.state as any).passedTask;
        if (!initialTasks.some((t: any) => t?.id === passedTask.id)) {
          const updatedTasks = [...initialTasks, { ...passedTask, status: 'in_progress' }];
          localStorage.setItem('expert_my_tasks', JSON.stringify(updatedTasks));
          return updatedTasks;
        }
      }
      // Ensure we always return an array, filtering out any null/undefined items
      return Array.isArray(initialTasks) ? initialTasks.filter(t => t != null) : [];
    } catch (e) {
      console.error("Failed to parse expert_my_tasks from localStorage", e);
      return [];
    }
  });

  useEffect(() => {
    if (location.state && (location.state as any).activeTab) {
      setActiveTab((location.state as any).activeTab);
    }
    if (location.state && (location.state as any).passedTask) {
       setMyTasks(prev => {
          // Add a safety check to ensure prev is an array and filter out nulls
          const currentTasks = Array.isArray(prev) ? prev.filter(t => t != null) : [];
          const passedTask = (location.state as any).passedTask;
          // Use optional chaining for safety
          if (currentTasks.some(t => t?.id === passedTask.id)) return currentTasks;
          
          const updatedTasks = [...currentTasks, { ...passedTask, status: 'in_progress' }];
          localStorage.setItem('expert_my_tasks', JSON.stringify(updatedTasks));
          return updatedTasks;
       });
       // Clear the state so it doesn't keep adding on re-renders if navigated away and back
       window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Mock Data for Tasks with i18n support
  const getTasks = (lang: 'zh' | 'en') => [
    {
      id: 'hle-001',
      title: lang === 'zh' ? '生物HLE评测集构建' : 'HLE Bio Benchmark Creation',
      type: lang === 'zh' ? '评测题' : 'Benchmark',
      domain: lang === 'zh' ? '生物' : 'Bio',
      price: '2000积分',
      unit: lang === 'zh' ? '题' : 'item',
      totalBudget: '$100,000',
      deadline: lang === 'zh' ? '长期' : 'Long-term',
      applicants: 205,
      requiredLevel: 'L5',
      tags: ['HLE', 'COT', 'Bio'],
      description: lang === 'zh' 
        ? '构建生物领域HLE评测集，设计高难度题目并撰写COT。需经过严格质检。' 
        : 'Create HLE bio benchmark questions with COT. Strict quality control.',
      requirements: [
        { icon: BrainCircuit, text: lang === 'zh' ? '自然科学' : 'Natural Sciences' }
      ],
      color: 'border-lab-purple',
      royalty: true,
      attribution: true
    }
  ];

  const tasks = getTasks(language);

  const [taskAttempts, setTaskAttempts] = useState<Record<string, number>>({});
  
  const handleApply = (task: any) => {
    // If already attempted and failed, don't allow re-apply
    const myTask = myTasks.find(t => t && t.id === task.id);
    if (myTask && myTask.status === 'failed') {
      return;
    }

    // If already passed and in_progress, just switch to 'my' tab
    if (myTask && myTask.status === 'in_progress') {
      setActiveTab('my');
      return;
    }

    setSelectedTask(task);
    setQualificationStep('scanning');
    
    // Simulate Background Check
    setTimeout(() => {
      setQualificationStep('interview');
    }, 2000);
  };

  const handleStartQuiz = () => {
    setQualificationStep('quiz');
  };

  const handleSubmitQuiz = () => {
    // 1. Check if all questions are answered
    if (Object.keys(quizAnswers).length < quizQuestions.length) {
      alert(language === 'zh' ? '请完成所有问题' : 'Please complete all questions');
      return;
    }

    // 2. Validate answers
    const isAllCorrect = quizQuestions.every((q, index) => {
      let selectedAnswer = quizAnswers[index];
      let correctOptionIndex = -1;

      if (selectedTask?.id === 'hle-001') {
         // HLE Bio Questions
         // 0: B, 1: D, 2: C
         if (index === 0) correctOptionIndex = 1;
         if (index === 1) correctOptionIndex = 3;
         if (index === 2) correctOptionIndex = 2;
      } else {
         // Default Legal Questions
         // 0: A, 1: B, 2: C
         if (index === 0) correctOptionIndex = 0;
         if (index === 1) correctOptionIndex = 1;
         if (index === 2) correctOptionIndex = 2;
      }

      // Check if the selected answer string matches the correct option string
      return selectedAnswer === q.options[correctOptionIndex];
    });

    // Mark as attempted
    if (selectedTask) {
      setTaskAttempts(prev => ({ ...prev, [selectedTask.id]: 1 }));
      
      // Add status to task object
      setMyTasks(prev => {
        const currentTasks = Array.isArray(prev) ? prev : [];
        // Avoid duplicates
        if (currentTasks.some(t => t?.id === selectedTask.id)) return currentTasks;
        
        const updatedTasks = [...currentTasks, { 
          ...selectedTask, 
          status: isAllCorrect ? 'in_progress' : 'failed' 
        }];
        localStorage.setItem('expert_my_tasks', JSON.stringify(updatedTasks));
        return updatedTasks;
      });
    }

    if (!isAllCorrect) {
      setQualificationStep('failed');
      return;
    }

    // 4. Show passed state
    setQualificationStep('passed');
  };

  const quizQuestions = React.useMemo(() => {
    if (selectedTask?.id === 'hle-001') {
      return language === 'zh' ? [
        {
          question: 'CRISPR-Cas9 系统中，Cas9 酶的主要功能是什么？',
          options: ['A. 合成 DNA 链。', 'B. 识别并切割特定的 DNA 序列。', 'C. 修复受损的 DNA。', 'D. 将 RNA 逆转录为 DNA。']
        },
        {
          question: '在细胞有氧呼吸过程中，产生 ATP 最多的阶段是？',
          options: ['A. 糖酵解。', 'B. 丙酮酸氧化脱羧。', 'C. 三羧酸循环 (TCA)。', 'D. 氧化磷酸化 (电子传递链)。']
        },
        {
          question: '关于蛋白质结构的描述，以下哪项是错误的？',
          options: ['A. 一级结构是指氨基酸的排列顺序。', 'B. α-螺旋和 β-折叠属于二级结构。', 'C. 所有蛋白质都必须具有四级结构才能发挥功能。', 'D. 疏水作用是维持三级结构的重要力量。']
        }
      ] : [
        {
          question: 'In the CRISPR-Cas9 system, what is the primary function of the Cas9 enzyme?',
          options: ['A. Synthesize DNA strands.', 'B. Identify and cleave specific DNA sequences.', 'C. Repair damaged DNA.', 'D. Reverse transcribe RNA into DNA.']
        },
        {
          question: 'Which stage produces the most ATP during cellular aerobic respiration?',
          options: ['A. Glycolysis.', 'B. Pyruvate oxidation.', 'C. Tricarboxylic acid cycle (TCA).', 'D. Oxidative phosphorylation (Electron Transport Chain).']
        },
        {
          question: 'Which statement about protein structure is FALSE?',
          options: ['A. Primary structure refers to the amino acid sequence.', 'B. α-helix and β-sheet belong to secondary structure.', 'C. All proteins must have a quaternary structure to function.', 'D. Hydrophobic interaction is a key force maintaining tertiary structure.']
        }
      ];
    }

    // Default (Legal) Questions
    return language === 'zh' ? [
    {
      question: '以下哪个条款在终止方面存在最高的法律风险？',
      options: ['A. 甲方可随时无通知终止合同。', 'B. 争议应通过友好协商解决。', 'C. 乙方必须在付款后3天内发货。', 'D. 不可抗力包括自然灾害。']
    },
    {
      question: '在知识产权条款中，哪种表述对乙方最不利？',
      options: ['A. 双方各自保留其背景知识产权。', 'B. 乙方交付的所有成果的知识产权归甲方所有。', 'C. 联合开发的知识产权归双方共有。', 'D. 甲方获得乙方成果的非独家使用许可。']
    },
    {
      question: '关于违约金的设定，以下哪项通常被视为过高？',
      options: ['A. 违约金为合同总额的5%。', 'B. 违约金为实际损失的130%。', 'C. 违约金为合同总额的200%。', 'D. 违约金按逾期天数每日万分之五计算。']
    }
  ] : [
    {
      question: 'Which of the following clauses poses the highest legal risk regarding termination?',
      options: ['A. Party A may terminate without notice at any time.', 'B. Disputes shall be resolved through friendly negotiation.', 'C. Party B must ship within 3 days of payment.', 'D. Force majeure includes natural disasters.']
    },
    {
      question: 'In IP clauses, which statement is most unfavorable to Party B?',
      options: ['A. Both parties retain their background IP.', 'B. All IP of deliverables belongs to Party A.', 'C. Jointly developed IP is shared.', 'D. Party A gets a non-exclusive license.']
    },
    {
      question: 'Regarding liquidated damages, which is usually considered excessive?',
      options: ['A. 5% of contract value.', 'B. 130% of actual loss.', 'C. 200% of contract value.', 'D. 0.05% per day for overdue.']
    }
  ];
}, [selectedTask, language]);

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Section - Matches Image */}
      <div className="relative rounded-[32px] overflow-hidden p-10 bg-gradient-to-r from-[#1a1c2e] via-[#24263b] to-[#362f4b] text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-wider mb-4 text-lab-yellow">
              <Zap className="w-3 h-3 fill-current" />
              <span>{t.expert.sidebar.role} WORKSPACE</span>
            </div>
            <h1 className="text-4xl font-display font-bold mb-2 tracking-tight">{t.expert.taskHall.title}</h1>
            <p className="text-gray-400 text-base max-w-xl font-medium leading-relaxed opacity-80">发现适合您专业技能的高价值挑战。</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-white transition-colors" />
              <input 
                type="text" 
                placeholder="搜索任务、技能关键词..." 
                className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-lab-purple/50 focus:bg-white/10 transition-all backdrop-blur-sm"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                 <Filter className="w-4 h-4 text-gray-300" />
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-gray-100 rounded-xl w-fit shadow-inner">
        <button
          onClick={() => setActiveTab('public')}
          className={cn(
            "px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2",
            activeTab === 'public' 
              ? "bg-white text-gray-900 shadow-sm" 
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
          )}
        >
          <Globe className="w-4 h-4" />
          公共广场
        </button>
        <button
          onClick={() => setActiveTab('my')}
          className={cn(
            "px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2",
            activeTab === 'my' 
              ? "bg-white text-gray-900 shadow-sm" 
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
          )}
        >
          <Briefcase className="w-4 h-4" />
          我的任务
        </button>
      </div>

      {activeTab === 'public' ? (
        <>
          {/* Task List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {tasks.map(task => (
              <div 
                key={task.id}
                className="group bg-white rounded-[24px] border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col relative hover:border-gray-200"
              >
                <div className="p-8 flex-1 relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-wrap gap-2">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-bold border",
                        task.domain === 'Legal' || task.domain === '法律' ? "bg-blue-50 text-blue-600 border-blue-100" :
                        task.domain === 'Medical' || task.domain === '医疗' ? "bg-green-50 text-green-600 border-green-100" :
                        "bg-purple-50 text-purple-600 border-purple-100"
                      )}>
                        {task.domain}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-50 text-gray-600 border border-gray-100">
                        {task.type}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-black">{task.price} <span className="text-sm font-normal text-gray-400">/ {task.unit}</span></div>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-black mb-3 group-hover:text-lab-blue transition-colors">
                    {task.title}
                  </h3>
                  <p className="text-gray-500 mb-6 text-sm leading-relaxed line-clamp-2">
                    {task.description}
                  </p>

                  <div className="flex flex-wrap gap-3">
                      {task.attribution && (
                        <div className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 px-2.5 py-1.5 rounded-md text-xs text-indigo-700 font-bold shadow-sm" title="保留署名权">
                            <Feather className="w-3.5 h-3.5 text-indigo-600" />
                            署名权
                        </div>
                      )}
                  </div>
                </div>

                <div className="px-6 py-5 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between group-hover:bg-white transition-colors flex-wrap gap-4">
                  <div className="flex items-center text-xs font-medium text-gray-400 gap-4 min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 whitespace-nowrap min-w-0">
                      <Clock className="w-4 h-4 shrink-0" />
                      <span className="truncate group/tooltip relative">
                        {task.deadline}
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50">
                          {task.deadline}
                          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></span>
                        </span>
                      </span>
                    </span>
                    <span className="flex items-center gap-1.5 whitespace-nowrap min-w-0">
                      <Users className="w-4 h-4 shrink-0" />
                      <span className="truncate group/tooltip relative">
                        <span className="font-bold text-gray-600 mr-1">{task.applicants}</span> 
                        {t.expert.taskHall.card.applied}
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50">
                          {task.applicants} {t.expert.taskHall.card.applied}
                          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></span>
                        </span>
                      </span>
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      if (myTasks.some(t => t && t.id === task.id)) {
                        setActiveTab('my');
                        return;
                      }
                      handleApply(task);
                    }}
                    className={cn(
                      "px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md whitespace-nowrap shrink-0",
                      myTasks.some(t => t && t.id === task.id)
                        ? "bg-gray-100 text-gray-500 cursor-pointer hover:bg-gray-200"
                        : "bg-black text-white hover:bg-gray-800 hover:scale-105"
                    )}
                  >
                    {myTasks.some(t => t && t.id === task.id) ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {language === 'zh' ? '已领取，去查看' : 'Applied, View'}
                      </>
                    ) : (
                      <>
                        {t.expert.taskHall.card.apply}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-8">
          {/* Empty State */}
          {myTasks.length === 0 ? (
            <div className="w-full bg-white rounded-[24px] border border-gray-100 p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <Briefcase className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">暂无任务</h3>
              <p className="text-gray-500 text-sm max-w-sm mb-8 leading-relaxed">
                您还没有领取任何任务。前往公共广场浏览并领取适合您的任务，开始赚取收益吧！
              </p>
              <button 
                onClick={() => setActiveTab('public')}
                className="px-6 py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
              >
                去领取任务
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {myTasks.map(task => (
                <div 
                  key={task.id}
                  className="group bg-white rounded-[24px] border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col relative hover:border-gray-200"
                >
                  <div className="p-8 flex-1 relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-wrap gap-2">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-bold border",
                          task.domain === 'Legal' || task.domain === '法律' ? "bg-blue-50 text-blue-600 border-blue-100" :
                          task.domain === 'Medical' || task.domain === '医疗' ? "bg-green-50 text-green-600 border-green-100" :
                          "bg-purple-50 text-purple-600 border-purple-100"
                        )}>
                          {task.domain}
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-50 text-gray-600 border border-gray-100">
                          {task.type}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-black">{task.price} <span className="text-sm font-normal text-gray-400">/ {task.unit}</span></div>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-black mb-3 group-hover:text-lab-blue transition-colors">
                      {task.title}
                    </h3>
                    <p className="text-gray-500 mb-6 text-sm leading-relaxed line-clamp-2">
                      {task.description}
                    </p>

                    <div className="flex flex-wrap gap-3">
                      {task.attribution && (
                         <div className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 px-2.5 py-1.5 rounded-md text-xs text-indigo-700 font-bold shadow-sm" title="保留署名权">
                             <Feather className="w-3.5 h-3.5 text-indigo-600" />
                             署名权
                         </div>
                       )}
                    </div>
                  </div>

                  <div className="px-6 py-5 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between group-hover:bg-white transition-colors flex-wrap gap-4">
                    <div className="flex items-center text-xs font-medium text-gray-400 gap-4 min-w-0 flex-1">
                      <span className={cn(
                        "flex items-center gap-1.5 font-bold px-2 py-1 rounded-md shrink-0 whitespace-nowrap",
                        (task as any).status === 'failed' 
                          ? "text-red-600 bg-red-50" 
                          : "text-green-600 bg-green-50"
                      )}>
                        {(task as any).status === 'failed' ? (
                          <>
                            <AlertCircle className="w-3.5 h-3.5" />
                            未通过
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5" />
                            进行中
                          </>
                        )}
                      </span>
                      <span className="flex items-center gap-1.5 whitespace-nowrap min-w-0">
                        <Clock className="w-4 h-4 shrink-0" />
                        <span className="truncate group/tooltip relative">
                          {task.deadline}
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50">
                            {task.deadline}
                            <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></span>
                          </span>
                        </span>
                      </span>
                    </div>
                    {task && (task as any).status !== 'failed' && (
                      <button 
                        onClick={() => {
                          localStorage.setItem('current_sandbox_task', JSON.stringify(task));
                          // Clean task object to avoid symbol/function serialization issues in History API
                          const cleanTask = JSON.parse(JSON.stringify(task, (key, value) => {
                            // Remove functions/components like 'icon' from requirements to make it serializable
                            if (key === 'icon') return undefined;
                            return value;
                          }));
                          // Pass the cleaned task object through state to the sandbox
                          navigate('/expert/sandbox', { state: { mode: 'guided', task: cleanTask } });
                        }}
                        className="bg-black text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-gray-800 hover:scale-105 transition-all flex items-center justify-center gap-1.5 shadow-md whitespace-nowrap shrink-0"
                      >
                        {language === 'zh' ? '继续任务' : 'Continue Task'}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Qualification Modal (Styled) */}
      {selectedTask && qualificationStep !== 'idle' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh] border border-gray-100 z-[101]">
            
            {/* Modal Header */}
            {qualificationStep !== 'passed' && (
              <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <div>
                  <h3 className="text-xl font-display font-bold text-black">{t.expert.taskHall.modal.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-sm text-gray-500 font-medium">{selectedTask.title}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-bold animate-pulse">为方便体验demo，正确答案为：B、D、C</span>
                  </div>
                </div>
                <button 
                  onClick={() => { setSelectedTask(null); setQualificationStep('idle'); }}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-black transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Step 1: Scanning */}
            {qualificationStep === 'scanning' && (
              <div className="p-16 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-lab-blue/10 rounded-full flex items-center justify-center mb-8 relative">
                  <div className="absolute inset-0 border-4 border-lab-blue rounded-full animate-ping opacity-20"></div>
                  <ShieldCheck className="w-12 h-12 text-lab-blue" />
                </div>
                <h4 className="text-2xl font-display font-bold text-black mb-4">{t.expert.taskHall.modal.step1}</h4>
                <div className="space-y-3 text-sm font-medium text-gray-500">
                  <p className="flex items-center justify-center gap-2 text-lab-green-dark">
                    <CheckCircle2 className="w-5 h-5" />
                    {t.expert.taskHall.modal.step1Checks[0]}
                  </p>
                  <p className="flex items-center justify-center gap-2 opacity-50">
                    <History className="w-5 h-5" />
                    {t.expert.taskHall.modal.step1Checks[1]}
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Interview / Rules */}
            {qualificationStep === 'interview' && (
              <div className="p-8 flex flex-col h-full bg-gray-50">
                <div className="flex-1 space-y-6 mb-8 overflow-y-auto">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Zap className="w-5 h-5 text-lab-yellow" />
                    </div>
                    <div className="bg-white p-6 rounded-2xl rounded-tl-none border border-gray-100 text-sm text-gray-700 space-y-4 shadow-sm">
                      <p className="text-base font-medium text-black">{t.expert.taskHall.modal.step2.congrats}</p>
                      <div className="h-px bg-gray-100 w-full"></div>
                      <p>{t.expert.taskHall.modal.step2.rulesTitle}</p>
                      <ul className="space-y-2">
                        {(t.expert.taskHall.modal.step2.rulesItems as string[]).map((item: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-black mt-1.5"></span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="font-bold text-lab-blue pt-2">{t.expert.taskHall.modal.step2.readyText}</p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={handleStartQuiz}
                  className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 hover:scale-[1.01] transition-all shadow-xl"
                >
                  {t.expert.taskHall.modal.step2.btn}
                </button>
              </div>
            )}

            {/* Step 3: Quiz */}
            {qualificationStep === 'quiz' && (
              <div className="p-8 flex flex-col h-full bg-white">
                <div className="flex-1 overflow-y-auto">
                  <div className="mb-8">
                    <span className="text-xs font-bold text-lab-blue bg-lab-blue/10 px-3 py-1 rounded-full mb-4 inline-block tracking-wider">
                      {language === 'zh' ? '问题' : 'Question'} {currentQuestionIndex + 1} / {quizQuestions.length}
                    </span>
                    <h4 className="text-xl font-display font-bold text-black mb-6 leading-relaxed">
                      {quizQuestions[currentQuestionIndex].question}
                    </h4>
                    <div className="space-y-3">
                      {quizQuestions[currentQuestionIndex].options.map((option, idx) => (
                        <label 
                          key={idx}
                          className={cn(
                            "flex items-center p-5 border-2 rounded-xl cursor-pointer transition-all hover:bg-gray-50",
                            quizAnswers[currentQuestionIndex] === option 
                              ? "border-black bg-gray-50" 
                              : "border-gray-100 hover:border-gray-200"
                          )}
                        >
                          <input 
                            type="radio" 
                            name={`quiz-${currentQuestionIndex}`}
                            className="hidden" 
                            checked={quizAnswers[currentQuestionIndex] === option}
                            onChange={() => setQuizAnswers(prev => ({ ...prev, [currentQuestionIndex]: option }))}
                          />
                          <div className={cn(
                            "w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center flex-shrink-0 transition-colors",
                            quizAnswers[currentQuestionIndex] === option ? "border-black" : "border-gray-300"
                          )}>
                            {quizAnswers[currentQuestionIndex] === option && <div className="w-2.5 h-2.5 rounded-full bg-black"></div>}
                          </div>
                          <span className="text-sm font-medium text-gray-800">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
                  {currentQuestionIndex > 0 ? (
                    <button 
                      onClick={handlePrevQuestion}
                      className="px-6 py-2 text-gray-500 hover:text-black text-sm font-medium"
                    >
                      {language === 'zh' ? '上一步' : 'Previous'}
                    </button>
                  ) : (
                    <button className="px-6 py-2 text-gray-300 cursor-not-allowed text-sm font-medium">{t.expert.taskHall.modal.step3.back}</button>
                  )}
                  
                  {currentQuestionIndex < quizQuestions.length - 1 ? (
                    <button 
                      onClick={handleNextQuestion}
                      disabled={!quizAnswers[currentQuestionIndex]}
                      className="bg-black text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
                    >
                      {language === 'zh' ? '下一题' : 'Next'}
                    </button>
                  ) : (
                    <button 
                      onClick={handleSubmitQuiz}
                      disabled={!quizAnswers[currentQuestionIndex]}
                      className="bg-lab-blue text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-200"
                    >
                      {t.expert.taskHall.modal.step3.submit}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Failed */}
            {qualificationStep === 'failed' && (
              <div className="p-16 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-300">
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-8 relative">
                  <AlertCircle className="w-12 h-12 text-red-500" />
                </div>
                <h4 className="text-2xl font-display font-bold text-black mb-4">
                  {language === 'zh' ? '测验未通过' : 'Quiz Failed'}
                </h4>
                <p className="text-gray-500 max-w-sm mb-8">
                  {language === 'zh' 
                    ? '很遗憾，您的答案中存在错误。建议复习相关知识后再次尝试。' 
                    : 'Unfortunately, there were errors in your answers. Please review and try again.'}
                </p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => { setSelectedTask(null); setQualificationStep('idle'); }}
                    className="px-8 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    {language === 'zh' ? '放弃' : 'Cancel'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Passed */}
            {qualificationStep === 'passed' && (
              <div className="p-16 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-300">
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-8 relative">
                  <div className="absolute inset-0 border-4 border-green-500 rounded-full animate-ping opacity-20"></div>
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                </div>
                <h4 className="text-2xl font-display font-bold text-black mb-4">
                  {language === 'zh' ? '恭喜！测验已通过' : 'Congratulations! Quiz Passed'}
                </h4>
                <p className="text-gray-500 max-w-sm mb-8">
                  {language === 'zh' 
                    ? '您已成功通过资格测验，现在可以开始执行任务。' 
                    : 'You have successfully passed the qualification quiz and can now start the task.'}
                </p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => { 
                      setQualificationStep('idle'); 
                      setQuizAnswers({}); 
                      setCurrentQuestionIndex(0); 
                      setActiveTab('my'); 
                      
                      // Also add it to localStorage immediately to prevent sync issues
                      const savedTasks = localStorage.getItem('expert_my_tasks');
                      const initialTasks = savedTasks ? JSON.parse(savedTasks) : [];
                      if (!initialTasks.some((t: any) => t.id === selectedTask.id)) {
                        const updatedTasks = [...initialTasks, { ...selectedTask, status: 'in_progress' }];
                        localStorage.setItem('expert_my_tasks', JSON.stringify(updatedTasks));
                        // Update local state directly so it's there before navigation
                        setMyTasks(updatedTasks);
                      }
                      
                      // navigate to same page to trigger re-render with 'my' tab
                      navigate('/expert', { state: { activeTab: 'my' } });
                      setSelectedTask(null);
                    }}
                    className="bg-black text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-gray-800 transition-colors shadow-lg"
                  >
                    {language === 'zh' ? '前往任务' : 'Go to Task'}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
