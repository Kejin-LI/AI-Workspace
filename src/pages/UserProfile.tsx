import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Award, 
  Coins, 
  ChevronRight,
  Edit3,
  Trash2,
  Zap,
  Star,
  CheckCircle,
  Settings,
  ChevronDown,
  Info,
  Briefcase,
  GraduationCap,
  ShieldCheck,
  TrendingUp,
  FileText,
  MessageSquare,
  ThumbsUp,
  Heart,
  Upload,
  Plus,
  ShieldAlert,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { KnowledgeBaseView } from '../components/KnowledgeBaseView';

export function UserProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  // Ensure we always have a valid default tab
  const [activeTab, setActiveTab] = useState(() => {
    const state = location.state as { activeTab?: string } | null;
    return state?.activeTab || '身份与背书';
  });
  const [bio, setBio] = useState('');
  const [showTech, setShowTech] = useState(true);
  const [showFollows, setShowFollows] = useState(true);
  const [showHistory, setShowHistory] = useState(true);
  const [transactionFilter, setTransactionFilter] = useState<'all' | 'income' | 'expense'>('all');
  
  // 新增状态：派单接收状态
  const [receiveOrders, setReceiveOrders] = useState(true);
  
  // 新增状态：期望任务类型 (多选)
  const [expectedTaskTypes, setExpectedTaskTypes] = useState<string[]>(['SFT 数据构造', 'RLHF 排序', '多轮对话评测']);

  const toggleTaskType = (type: string) => {
    setExpectedTaskTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // 教育背景状态
  const [educationList, setEducationList] = useState([
    { id: 1, school: '英国爱丁堡大学', major: '生物信息学', degree: '硕士', start: '2019.09', end: '2021.07' },
    { id: 2, school: '浙江大学', major: '计算机科学与技术', degree: '学士', start: '2015.09', end: '2019.07' }
  ]);
  const [showAddEducation, setShowAddEducation] = useState(false);
  const [editingEduId, setEditingEduId] = useState<number | null>(null);
  const [newEducation, setNewEducation] = useState({ school: '', major: '', degree: '', start: '', end: '' });

  // 工作经历状态
  const [workList, setWorkList] = useState([
    { id: 1, company: '字节跳动', position: 'AI 产品经理', description: '负责大语言模型评测平台的从0到1建设，制定模型能力评测指标体系，设计红蓝对抗安全评测SOP。', start: '2022.03', end: '至今' }
  ]);
  const [showAddWork, setShowAddWork] = useState(false);
  const [editingWorkId, setEditingWorkId] = useState<number | null>(null);
  const [newWork, setNewWork] = useState({ company: '', position: '', description: '', start: '', end: '' });

  // Load preferences from localStorage or set defaults
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('expert_profile_preferences');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse preferences', e);
      }
    }
    return {
      showLevel: true,
      showSkills: true
    };
  });

  // Save preferences when they change
  useEffect(() => {
    localStorage.setItem('expert_profile_preferences', JSON.stringify(preferences));
    // Dispatch a custom event so other components can react to preference changes
    window.dispatchEvent(new Event('profile_preferences_updated'));
  }, [preferences]);

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // 数字分身管理弹窗状态
  const [showSpModal, setShowSpModal] = useState(false);
  const [spConfig, setSpConfig] = useState({
    name: '李珂瑾的数字分身',
    systemPrompt: `你是一个资深的 AI 产品经理和数据评测专家。
在回答问题时，你需要：
1. 始终保持客观、中立和专业的态度。
2. 遇到复杂的逻辑问题时，习惯使用思维链（CoT）进行一步步的推导。
3. 在回答中多结合大语言模型（LLM）的实际落地案例。
4. 语言风格：严谨、简练，避免过度使用感叹号和夸张的情感表达。`,
    memory: [
      "擅长设计复杂的多轮对话评测集",
      "对大模型的幻觉（Hallucination）问题有深入研究",
      "偏好使用 Markdown 格式组织结构化信息",
      "近期关注强化学习（RLHF）在垂直领域的应用"
    ]
  });

  useEffect(() => {
    const state = location.state as { activeTab?: string; scrollTo?: string } | null;
    if (state?.activeTab) {
      setActiveTab(state.activeTab);
      
      if (state?.scrollTo) {
        // Increase timeout to ensure DOM is fully rendered after tab switch
        setTimeout(() => {
          const element = document.getElementById(state.scrollTo!);
          if (element) {
            // Wait for next frame to ensure the layout is fully settled
            requestAnimationFrame(() => {
              const yOffset = -20; 
              const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
              window.scrollTo({ top: y, behavior: 'smooth' });
            });
          }
        }, 500); // Increased timeout further for reliable rendering
      }
    }
  }, [location.state]);

  const handleAddEducation = () => {
    if (newEducation.school && newEducation.major) {
      if (editingEduId) {
        setEducationList(educationList.map(item => 
          item.id === editingEduId ? { ...item, ...newEducation } : item
        ));
        setEditingEduId(null);
      } else {
        setEducationList([{
          id: Date.now(),
          ...newEducation
        }, ...educationList]);
      }
      setShowAddEducation(false);
      setNewEducation({ school: '', major: '', degree: '', start: '', end: '' });
    }
  };

  const handleEditEducation = (edu: any) => {
    setNewEducation({
      school: edu.school,
      major: edu.major,
      degree: edu.degree,
      start: edu.start,
      end: edu.end
    });
    setEditingEduId(edu.id);
    setShowAddEducation(true);
  };

  const handleDeleteEducation = (id: number) => {
    setEducationList(educationList.filter(item => item.id !== id));
  };

  const handleAddWork = () => {
    if (newWork.company && newWork.position) {
      if (editingWorkId) {
        setWorkList(workList.map(item => 
          item.id === editingWorkId ? { ...item, ...newWork } : item
        ));
        setEditingWorkId(null);
      } else {
        setWorkList([{
          id: Date.now(),
          ...newWork
        }, ...workList]);
      }
      setShowAddWork(false);
      setNewWork({ company: '', position: '', description: '', start: '', end: '' });
    }
  };

  const handleEditWork = (work: any) => {
    setNewWork({
      company: work.company,
      position: work.position,
      description: work.description || '',
      start: work.start,
      end: work.end
    });
    setEditingWorkId(work.id);
    setShowAddWork(true);
  };

  const handleDeleteWork = (id: number) => {
    setWorkList(workList.filter(item => item.id !== id));
  };

  const handleSaveSp = () => {
    // 模拟保存操作
    setShowSpModal(false);
    // 这里可以添加实际的 API 调用
  };

  // ---------------------------------
  // Dynamic posts state
  // ---------------------------------
  const [userPosts, setUserPosts] = useState([
    { id: 'mock-1', title: '如何构建高质量的数学推理思维链（CoT）？', views: '3.5k', date: '昨天', type: '经验分享' },
    { id: 'mock-2', title: '关于法律条款中“模糊语义”的标注标准探讨', views: '8.6k', date: '3天前', type: '标注规范' }
  ]);

  useEffect(() => {
    const handleNewPost = (event: CustomEvent) => {
      const newPost = event.detail;
      setUserPosts(prev => [
        { 
          id: newPost.id,
          title: newPost.title, 
          views: '0', 
          date: '刚刚', 
          type: newPost.category 
        },
        ...prev
      ]);
    };

    const handleDeletePost = (event: CustomEvent) => {
      const { id } = event.detail;
      setUserPosts(prev => prev.filter(post => post.id !== id));
    };

    window.addEventListener('new-community-post', handleNewPost as EventListener);
    window.addEventListener('delete-community-post', handleDeletePost as EventListener);
    return () => {
      window.removeEventListener('new-community-post', handleNewPost as EventListener);
      window.removeEventListener('delete-community-post', handleDeletePost as EventListener);
    };
  }, []);

  return (
    <div className="w-full mx-auto flex flex-col md:flex-row gap-6 items-stretch">
      {/* Left Main Content */}
      <div className="flex-1 min-w-0 bg-transparent space-y-6 flex flex-col">
        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 pt-2 flex items-center gap-8 overflow-x-auto no-scrollbar">
          {['身份与背书', '资产与成就', '内容与知识库', '隐私与偏好'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "py-4 text-sm font-bold transition-colors relative whitespace-nowrap",
                activeTab === tab ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
              )}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
          ))}
        </div>

        {/* 1. 身份与背书 (Identity & Endorsement) */}
        {activeTab === '身份与背书' && (
          <div className="space-y-6 flex-1 flex flex-col">
            {/* 平台认证 */}
            <div id="platform-verification" className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex-1 scroll-mt-24">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-gray-900">平台认证</h3>
                <div className="text-sm text-gray-600">
                还差 <span className="text-blue-600 font-bold mx-0.5">2</span> 项即可开始领取任务
              </div>
              </div>
              
              <div className="relative flex justify-between items-center max-w-2xl mx-auto px-4 pb-8">
                {/* 进度条背景 */}
                <div className="absolute left-[10%] right-[10%] top-6 h-[2px] bg-gray-100 -z-10"></div>
                {/* 激活的进度条 */}
                <div className="absolute left-[10%] right-[45%] top-6 h-[2px] bg-blue-600 -z-10"></div>

                {/* 1. 实名认证 (已完成) */}
                <div className="flex flex-col items-center gap-3 w-24">
                  <div className="w-12 h-12 rounded-full bg-blue-50 border-2 border-blue-100 flex items-center justify-center relative z-10">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-sm font-medium text-gray-700">实名认证</div>
                </div>

                {/* 2. 职业认证 (已完成) */}
                <div className="flex flex-col items-center gap-3 w-24">
                  <div className="w-12 h-12 rounded-full bg-blue-50 border-2 border-blue-100 flex items-center justify-center relative z-10">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-sm font-medium text-gray-700">职业认证</div>
                </div>

                {/* 3. 学历认证 (当前激活/待完成) */}
                <div className="flex flex-col items-center gap-3 w-24 cursor-pointer group relative">
                  <div className="w-12 h-12 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center relative z-10 group-hover:border-blue-300 group-hover:bg-blue-50 transition-colors shadow-sm">
                    <GraduationCap className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">学历认证</div>
                  <div className="absolute top-[80px] pt-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0 z-20">
                    <button className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full whitespace-nowrap border border-blue-100 hover:bg-blue-100 transition-colors shadow-sm flex items-center gap-0.5">
                      去认证 <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* 4. 保密函签署 (未开始) */}
                <div className="flex flex-col items-center gap-3 w-24 cursor-pointer group relative">
                  <div className="w-12 h-12 rounded-full bg-gray-50 border-2 border-gray-200 flex items-center justify-center relative z-10 group-hover:border-blue-300 group-hover:bg-blue-50 transition-colors">
                    <FileText className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <div className="text-sm font-medium text-gray-400 group-hover:text-gray-700 transition-colors">保密函签署</div>
                  <div className="absolute top-[80px] pt-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0 z-20">
                    <button className="px-3 py-1 bg-white text-gray-600 text-[10px] font-bold rounded-full whitespace-nowrap border border-gray-200 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm flex items-center gap-0.5">
                      去签署 <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 专业领域与技能 */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm group">
              <h3 className="text-lg font-bold text-gray-900 mb-6">专业领域与技能</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <div className="w-1 h-3.5 bg-blue-500 rounded-full"></div>
                    专业领域
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { name: '经济金融', verified: true },
                      { name: '软件与AI', verified: true },
                      { name: '医疗健康', verified: false }
                    ].map((tag, idx) => (
                      <div key={idx} className="group/tag relative flex items-center">
                        <div className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors",
                          tag.verified 
                            ? "bg-blue-50 text-blue-700 border-blue-200" 
                            : "bg-gray-50 text-gray-600 border-gray-200 border-dashed hover:border-blue-300"
                        )}>
                          {tag.name}
                          {tag.verified ? (
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                          ) : (
                            <ShieldAlert className="w-3.5 h-3.5 text-orange-400" />
                          )}
                        </div>
                        
                        {!tag.verified && (
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover/tag:opacity-100 transition-all pointer-events-none flex items-center gap-1 z-10">
                            <button className="px-2 py-1 bg-white border border-gray-200 shadow-sm rounded text-[10px] text-blue-600 font-bold hover:bg-blue-50 whitespace-nowrap pointer-events-auto">
                              去认证
                            </button>
                            <button className="p-1 bg-white border border-gray-200 shadow-sm rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors pointer-events-auto">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                    <button className="flex items-center justify-center w-8 h-[34px] rounded-lg border border-gray-200 border-dashed text-gray-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <div className="w-1 h-3.5 bg-purple-500 rounded-full"></div>
                    掌握技能
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { name: '强化学习', verified: true },
                      { name: '提示词工程', verified: true },
                      { name: 'Python', verified: true },
                      { name: 'AI Coding', verified: false },
                      { name: 'Figma', verified: false }
                    ].map((tag, idx) => (
                      <div key={idx} className="group/tag relative flex items-center">
                        <div className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors",
                          tag.verified 
                            ? "bg-purple-50 text-purple-700 border-purple-200" 
                            : "bg-gray-50 text-gray-600 border-gray-200 border-dashed hover:border-purple-300"
                        )}>
                          {tag.name}
                          {tag.verified ? (
                            <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
                          ) : (
                            <ShieldAlert className="w-3.5 h-3.5 text-orange-400" />
                          )}
                        </div>

                        {!tag.verified && (
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover/tag:opacity-100 transition-all pointer-events-none flex items-center gap-1 z-10">
                            <button className="px-2 py-1 bg-white border border-gray-200 shadow-sm rounded text-[10px] text-purple-600 font-bold hover:bg-purple-50 whitespace-nowrap pointer-events-auto">
                              去认证
                            </button>
                            <button className="p-1 bg-white border border-gray-200 shadow-sm rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors pointer-events-auto">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                    <button className="flex items-center justify-center w-8 h-[34px] rounded-lg border border-gray-200 border-dashed text-gray-400 hover:text-purple-600 hover:border-purple-300 hover:bg-purple-50 transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 个人简历与履历 (可编辑区域) */}
            <div id="resume-archive" className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex-1 scroll-mt-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">详细履历档案</h3>
              </div>

              <div className="space-y-8">
                {/* 简历附件 */}
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    附件简历
                  </h4>
                  <div className="flex items-center justify-between p-4 border border-gray-200 border-dashed rounded-lg bg-gray-50/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 text-red-600 rounded flex items-center justify-center font-bold text-xs">
                        PDF
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">李珂瑾_AI产品经理_简历.pdf</div>
                        <div className="text-xs text-gray-500 mt-0.5">3.2 MB · 上传于 2026-03-01</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="text-sm text-gray-500 hover:text-blue-600 font-medium px-3 py-1.5 transition-colors">更新</button>
                      <button className="text-sm text-gray-500 hover:text-blue-600 font-medium px-3 py-1.5 transition-colors">预览</button>
                    </div>
                  </div>
                </div>

                {/* 教育背景编辑器 */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-gray-400" />
                      教育背景
                    </h4>
                    <button 
                      onClick={() => setShowAddEducation(true)}
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> 添加教育经历
                    </button>
                  </div>
                  <div className="space-y-3">
                    {showAddEducation && (
                      <div className="p-4 border border-blue-200 rounded-lg bg-blue-50/30">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">学校名称</label>
                            <input 
                              type="text" 
                              value={newEducation.school}
                              onChange={e => setNewEducation({...newEducation, school: e.target.value})}
                              placeholder="例如：北京大学" 
                              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">专业</label>
                            <input 
                              type="text" 
                              value={newEducation.major}
                              onChange={e => setNewEducation({...newEducation, major: e.target.value})}
                              placeholder="例如：计算机科学" 
                              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">学历</label>
                            <select 
                              value={newEducation.degree}
                              onChange={e => setNewEducation({...newEducation, degree: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
                            >
                              <option value="">请选择学历</option>
                              <option value="博士">博士</option>
                              <option value="硕士">硕士</option>
                              <option value="学士">学士</option>
                              <option value="专科">专科</option>
                            </select>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1">开始时间</label>
                              <input 
                                type="month" 
                                value={newEducation.start.replace('.', '-')}
                                onChange={e => setNewEducation({...newEducation, start: e.target.value.replace('-', '.')})}
                                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1">结束时间</label>
                              <input 
                                type="month" 
                                value={newEducation.end.replace('.', '-')}
                                onChange={e => setNewEducation({...newEducation, end: e.target.value.replace('-', '.')})}
                                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setShowAddEducation(false)}
                            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                          >
                            取消
                          </button>
                          <button 
                            onClick={handleAddEducation}
                            disabled={!newEducation.school || !newEducation.major}
                            className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 rounded-md transition-colors"
                          >
                            保存
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {educationList.map((edu) => (
                      <div key={edu.id} className="p-4 border border-gray-100 rounded-lg hover:border-blue-200 transition-colors group relative">
                        <div className="flex justify-between items-start mb-1">
                          <div className="font-bold text-gray-900 text-sm">{edu.school}</div>
                          <div className="relative">
                            <div className="text-xs text-gray-500 transition-opacity group-hover:opacity-0">{edu.start} - {edu.end}</div>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-3">
                              <button onClick={() => handleEditEducation(edu)} className="text-gray-400 hover:text-blue-600 transition-colors" title="编辑"><Edit3 className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteEducation(edu.id)} className="text-gray-400 hover:text-red-600 transition-colors" title="删除"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">{edu.major} · {edu.degree}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 工作经历编辑器 */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      工作经历
                    </h4>
                    <button 
                      onClick={() => setShowAddWork(true)}
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> 添加工作经历
                    </button>
                  </div>
                  <div className="space-y-3">
                    {showAddWork && (
                      <div className="p-4 border border-blue-200 rounded-lg bg-blue-50/30">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">公司名称</label>
                            <input 
                              type="text" 
                              value={newWork.company}
                              onChange={e => setNewWork({...newWork, company: e.target.value})}
                              placeholder="例如：字节跳动" 
                              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">岗位名称</label>
                            <input 
                              type="text" 
                              value={newWork.position}
                              onChange={e => setNewWork({...newWork, position: e.target.value})}
                              placeholder="例如：AI产品经理" 
                              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs font-bold text-gray-700 mb-1">职责描述</label>
                            <textarea 
                              value={newWork.description}
                              onChange={e => setNewWork({...newWork, description: e.target.value})}
                              placeholder="请简要描述您的主要工作职责和成就..." 
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2 col-span-2 md:col-span-1">
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1">开始时间</label>
                              <input 
                                type="month" 
                                value={newWork.start.replace('.', '-')}
                                onChange={e => setNewWork({...newWork, start: e.target.value.replace('-', '.')})}
                                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1">结束时间</label>
                              <input 
                                type="text" 
                                value={newWork.end}
                                onChange={e => setNewWork({...newWork, end: e.target.value})}
                                placeholder="如：至今 或 2024.01"
                                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setShowAddWork(false)}
                            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                          >
                            取消
                          </button>
                          <button 
                            onClick={handleAddWork}
                            disabled={!newWork.company || !newWork.position}
                            className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 rounded-md transition-colors"
                          >
                            保存
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {workList.map((work) => (
                      <div key={work.id} className="p-4 border border-gray-100 rounded-lg hover:border-blue-200 transition-colors group relative">
                        <div className="flex justify-between items-start mb-1">
                          <div className="font-bold text-gray-900 text-sm">{work.company}</div>
                          <div className="relative">
                            <div className="text-xs text-gray-500 transition-opacity group-hover:opacity-0">{work.start} - {work.end}</div>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-3">
                              <button onClick={() => handleEditWork(work)} className="text-gray-400 hover:text-blue-600 transition-colors" title="编辑"><Edit3 className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteWork(work.id)} className="text-gray-400 hover:text-red-600 transition-colors" title="删除"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 font-medium mb-2">{work.position}</div>
                        {work.description && <p className="text-xs text-gray-500 leading-relaxed">{work.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. 资产与成就 (Assets & Achievements) - Combined */}
        {activeTab === '资产与成就' && (
          <div className="space-y-6 flex-1 flex flex-col">
            {/* Asset Section from old '资产与收益' */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-6 shadow-sm text-white relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 opacity-80 mb-2">
                    <Coins className="w-4 h-4" />
                    <span className="text-sm font-medium">当前可用积分</span>
                  </div>
                  <div className="text-4xl font-black mb-4">12,450</div>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white text-blue-600 rounded-lg text-sm font-bold border border-white hover:bg-blue-50 transition-colors">去提现</button>
                    <button className="px-4 py-2 bg-blue-600/50 text-white rounded-lg text-sm font-medium border border-white/20 hover:bg-blue-600/70 transition-colors">兑换权益</button>
                  </div>
                </div>
                <Zap className="absolute -right-4 -bottom-4 w-32 h-32 text-white opacity-10" />
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex flex-col justify-center">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-gray-500 text-sm font-medium">累计获得积分</div>
                  <div className="text-gray-900 font-bold text-lg">45,200</div>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <div className="text-gray-500 text-sm font-medium">本月预计获得</div>
                  <div className="text-gray-900 font-bold text-lg">3,450</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-gray-500 text-sm font-medium">创作激励分成</div>
                  <div className="text-gray-900 font-bold text-lg">1,280</div>
                </div>
              </div>
            </div>

            {/* Data & Achievements Section */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">平台核心数据</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100/50 hover:bg-blue-50 transition-colors cursor-pointer">
                  <div className="text-blue-600 mb-2"><CheckCircle className="w-5 h-5" /></div>
                  <div className="text-2xl font-black text-gray-900">2,450</div>
                  <div className="text-xs text-gray-600 mt-1">累计完结题量</div>
                </div>
                <div className="p-4 bg-green-50/50 rounded-xl border border-green-100/50 hover:bg-green-50 transition-colors cursor-pointer">
                  <div className="text-green-600 mb-2"><TrendingUp className="w-5 h-5" /></div>
                  <div className="text-2xl font-black text-gray-900">96.8%</div>
                  <div className="text-xs text-gray-600 mt-1">历史采纳通过率</div>
                </div>
                <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100/50 hover:bg-orange-50 transition-colors cursor-pointer">
                  <div className="text-orange-600 mb-2"><Award className="w-5 h-5" /></div>
                  <div className="text-2xl font-black text-gray-900">Top 5%</div>
                  <div className="text-xs text-gray-600 mt-1">金融领域排名</div>
                </div>
              </div>
            </div>

            {/* Prestige Section (Signature/Authorship) - Redesigned to be more prominent */}
            <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 rounded-xl border border-amber-200/60 p-6 shadow-sm relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-32 h-32 bg-amber-200/20 rounded-full blur-2xl"></div>
              <div className="absolute right-10 bottom-0 opacity-10">
                <Award className="w-24 h-24 text-amber-600" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-amber-100 rounded-lg text-amber-700">
                      <Award className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">评测集署名权</h3>
                  </div>
                  <span className="px-3 py-1 bg-amber-100/80 text-amber-800 text-xs font-bold rounded-full border border-amber-200/50">
                    核心贡献者
                  </span>
                </div>
                <p className="text-sm text-amber-900/70 mb-6 max-w-full">您的专业输出不仅获得积分，更被沉淀为行业标准。以下是您作为贡献者享有永久署名权的公开评测基准。</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-amber-100 hover:bg-white hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm group-hover:text-amber-700 transition-colors">SuperCLUE 逻辑推理评测集 v2.0</h4>
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> 15 道核心考题</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          <span>解析专家</span>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-green-50 text-green-700 text-[10px] font-bold rounded border border-green-100 shrink-0">已发布</span>
                    </div>
                    <div className="flex -space-x-2">
                      {[
                        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
                        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
                        "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop"
                      ].map((imgUrl, i) => (
                        <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center overflow-hidden">
                          <img src={imgUrl} alt="avatar" className="w-full h-full object-cover bg-white" />
                        </div>
                      ))}
                      <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-[10px] text-gray-500 font-medium z-10 relative">
                        +142
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-amber-100 hover:bg-white hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm group-hover:text-amber-700 transition-colors">中文医疗大模型对齐数据集</h4>
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> 3 项核心 Rubric</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          <span>标准制定者</span>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded border border-blue-100 shrink-0">评审中</span>
                    </div>
                    <div className="flex -space-x-2">
                      {[
                        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
                        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
                      ].map((imgUrl, i) => (
                        <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center overflow-hidden">
                          <img src={imgUrl} alt="avatar" className="w-full h-full object-cover bg-white" />
                        </div>
                      ))}
                      <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-[10px] text-gray-500 font-medium z-10 relative">
                        +85
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex-1">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">专业能力认证雷达</h3>
                <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">更新于 2026-03-19</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex items-center justify-center bg-gray-50/50 rounded-xl p-6 min-h-[240px] border border-gray-100 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50"></div>
                  <div className="text-center relative z-10">
                    <div className="w-32 h-32 mx-auto rounded-full border-4 border-blue-200 bg-white shadow-inner flex items-center justify-center mb-3">
                      <div className="text-4xl font-black bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent">LV3</div>
                    </div>
                    <div className="text-sm font-bold text-gray-900">高级专家认证</div>
                    <div className="text-xs text-gray-500 mt-1">超过 85% 的平台专家</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {[
                    { label: '逻辑推理 (CoT)', score: 95, color: 'bg-blue-500' },
                    { label: '领域知识 (金融)', score: 92, color: 'bg-indigo-500' },
                    { label: '代码能力', score: 85, color: 'bg-violet-500' },
                    { label: '文学创作', score: 70, color: 'bg-purple-500' },
                    { label: '合规与安全', score: 88, color: 'bg-fuchsia-500' },
                  ].map(skill => (
                    <div key={skill.label}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-medium text-gray-700">{skill.label}</span>
                        <span className="font-bold text-gray-900">{skill.score}</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full rounded-full", skill.color)} 
                          style={{ width: `${skill.score}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>


            
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex-1">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">最近收益明细</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setTransactionFilter('all')}
                    className={cn("px-3 py-1 text-xs font-medium rounded transition-colors", transactionFilter === 'all' ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50")}
                  >
                    全部
                  </button>
                  <button 
                    onClick={() => setTransactionFilter('income')}
                    className={cn("px-3 py-1 text-xs font-medium rounded transition-colors", transactionFilter === 'income' ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50")}
                  >
                    获取
                  </button>
                  <button 
                    onClick={() => setTransactionFilter('expense')}
                    className={cn("px-3 py-1 text-xs font-medium rounded transition-colors", transactionFilter === 'expense' ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50")}
                  >
                    消耗
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { task: '兑换模型高级调用算力 (500次)', time: '2026-03-18 16:20', amount: '-1500 积分', type: '算力兑换', isNegative: true },
                  { task: '金融领域高质量SFT数据构造 (100条)', time: '2026-03-18 14:30', amount: '+3000 积分', type: '任务结算', isNegative: false },
                  { task: '参与《大模型安全合规评测》项目', time: '2026-03-15 09:15', amount: '+5000 积分', type: '任务结算', isNegative: false },
                  { task: '提现至银行卡 (尾号8899)', time: '2026-03-12 10:00', amount: '-10000 积分', type: '余额提现', isNegative: true },
                  { task: '发布优质模板被采纳 15 次', time: '2026-03-10 18:20', amount: '+750 积分', type: '创作激励', isNegative: false },
                ]
                .filter(record => {
                  if (transactionFilter === 'all') return true;
                  if (transactionFilter === 'income') return !record.isNegative;
                  if (transactionFilter === 'expense') return record.isNegative;
                  return true;
                })
                .map((record, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border border-gray-50 rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors">
                    <div>
                      <div className="font-bold text-gray-900 mb-1">{record.task}</div>
                      <div className="text-xs text-gray-500">{record.time} · {record.type}</div>
                    </div>
                    <div className={cn("font-black", record.isNegative ? "text-gray-900" : "text-green-600")}>
                      {record.amount}
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-3 text-sm text-gray-500 font-medium hover:text-blue-600 transition-colors">
                查看全部明细
              </button>
            </div>
          </div>
        )}

        {/* 3. 内容与知识库 (Content & Knowledge Base) - Combined */}
        {activeTab === '内容与知识库' && (
          <div className="space-y-6 flex-1 flex flex-col">
            
            <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-xl border border-indigo-100 p-6 shadow-sm relative overflow-hidden">
              <div className="absolute -left-4 -bottom-4 w-32 h-32 bg-indigo-200/20 rounded-full blur-2xl"></div>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-[0.03]">
                <Zap className="w-32 h-32 text-indigo-900" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-700">
                      <Zap className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">我的数字分身</h3>
                  </div>
                  <span className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                    Beta 测试中
                  </span>
                </div>
                
                <p className="text-sm text-indigo-900/70 mb-6 max-w-2xl">
                  基于您的历史答题数据、偏好设置和知识库自动生成的 AI 助手。它可以在您离线时，以您的专业视角和表达风格，参与社区讨论或协助处理基础评测任务。
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-indigo-50">
                    <div className="text-2xl font-black text-indigo-900 mb-1">45<span className="text-xs font-normal text-indigo-600 ml-1">篇</span></div>
                    <div className="text-xs text-indigo-800/60 font-medium">已学习专业文章</div>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-indigo-50">
                    <div className="text-2xl font-black text-purple-900 mb-1">128<span className="text-xs font-normal text-purple-600 ml-1">条</span></div>
                    <div className="text-xs text-purple-800/60 font-medium">提取核心观点</div>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-indigo-50">
                    <div className="text-2xl font-black text-pink-900 mb-1">12<span className="text-xs font-normal text-pink-600 ml-1">次</span></div>
                    <div className="text-xs text-pink-800/60 font-medium">累计代理回复</div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button 
                    onClick={() => setShowSpModal(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-all shadow-sm hover:shadow-md group"
                  >
                    <Settings className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
                    管理分身设定 (SP)
                  </button>
                </div>
              </div>
            </div>

            <div id="personal-knowledge-base" className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex-1 scroll-mt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">个人知识库</h3>
              <KnowledgeBaseView type="personal" />
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">代表作与专业输出</h3>
                <button className="text-sm text-blue-600 font-medium hover:underline">去发布</button>
              </div>
              <div className="space-y-4">
                {userPosts.map((post, i) => (
                  <div key={post.id || i} className="p-4 border border-gray-100 rounded-lg hover:border-blue-200 hover:bg-blue-50/30 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded font-medium">{post.type}</span>
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">{post.title}</h4>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>发布于 {post.date}</span>
                      <span className="flex items-center gap-1"><Info className="w-3 h-3" /> 浏览 {post.views}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-6">最近互动记录</h3>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                {[
                  { action: '点赞了帖子', target: '大模型评测中的幻觉现象分析', time: '2小时前', icon: ThumbsUp, color: 'text-blue-500', bg: 'bg-blue-100' },
                  { action: '收藏了模板', target: '金融研报实体抽取标准SOP', time: '昨天', icon: Heart, color: 'text-red-500', bg: 'bg-red-100' },
                  { action: '评论了', target: '多模态数据标注的最佳实践', time: '3天前', icon: MessageSquare, color: 'text-green-500', bg: 'bg-green-100' }
                ].map((record, i) => (
                  <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", record.bg)}>
                        <record.icon className={cn("w-4 h-4", record.color)} />
                      </div>
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 bg-white shadow-sm hover:border-blue-100 hover:shadow-md transition-all">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-gray-900">{record.action}</span>
                        <span className="text-xs text-gray-500">{record.time}</span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{record.target}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6. 隐私与偏好 (Privacy & Preferences) */}
        {activeTab === '隐私与偏好' && (
          <div className="space-y-6 flex-1 flex flex-col">
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">派单接收状态</h3>
                  <p className="text-xs text-gray-500 mt-1">开启后，平台将根据您的能力图谱优先为您派发高价值任务</p>
                </div>
                <button 
                  onClick={() => setReceiveOrders(!receiveOrders)}
                  className={cn(
                    "w-12 h-6 rounded-full relative transition-colors",
                    receiveOrders ? "bg-blue-600" : "bg-gray-200"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 bottom-1 w-4 bg-white rounded-full shadow-sm transition-all",
                    receiveOrders ? "left-[28px]" : "left-[4px]"
                  )}></div>
                </button>
              </div>
              
              {receiveOrders && (
                <div className="border-t border-gray-100 pt-6 space-y-6 transition-all duration-300">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">期望任务类型 (多选)</label>
                    <div className="flex flex-wrap gap-3">
                      {['SFT 数据构造', 'RLHF 排序', '多轮对话评测', '红蓝对抗安全测试', '特定领域知识抽取'].map((type) => {
                        const isSelected = expectedTaskTypes.includes(type);
                        return (
                          <button 
                            key={type} 
                            onClick={() => toggleTaskType(type)}
                            className={cn(
                              "px-4 py-2 rounded-lg text-sm font-medium border transition-colors",
                              isSelected 
                                ? "bg-blue-50 border-blue-200 text-blue-700" 
                                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                            )}
                          >
                            {type}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">期望结算方式</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer" />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">平台积分 (可兑换算力)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer" />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">现金结算 (需绑定提现账号)</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-4">隐私与展示设置</h3>
              <div className="border-t border-gray-100 pt-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">公开展示认证等级</h4>
                    <p className="text-xs text-gray-500 mt-1">在社区和其他公开页面展示您的专家等级徽章</p>
                  </div>
                  <button 
                    onClick={() => togglePreference('showLevel')}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                      preferences.showLevel ? "bg-blue-600" : "bg-gray-200"
                    )}
                  >
                    <span className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      preferences.showLevel ? "translate-x-6" : "translate-x-1"
                    )} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">公开展示专业领域与技能</h4>
                    <p className="text-xs text-gray-500 mt-1">允许其他用户在您的个人主页看到您的专业标签</p>
                  </div>
                  <button 
                    onClick={() => togglePreference('showSkills')}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                      preferences.showSkills ? "bg-blue-600" : "bg-gray-200"
                    )}
                  >
                    <span className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      preferences.showSkills ? "translate-x-6" : "translate-x-1"
                    )} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - Profile Card */}
      <div className="w-full md:w-72 lg:w-80 flex-shrink-0 flex flex-col">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden p-6 flex-1">
          <div className="mb-6">
            <div className="w-20 h-20 rounded-full bg-gray-200 shadow-sm overflow-hidden mb-4">
              <img 
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop" 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-bold text-gray-900">李珂瑾</h2>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">LV3</span>
              <span className="bg-gray-100 text-gray-500 text-[10px] font-medium px-2 py-0.5 rounded">金融领域专家</span>
            </div>

            {/* Quick Access Badges */}
            <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
              <button 
                onClick={() => setActiveTab('资产与成就')}
                className="flex items-center justify-between p-2 rounded-lg bg-amber-50/50 hover:bg-amber-50 border border-amber-100/50 hover:border-amber-200 transition-all group"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-amber-100 rounded text-amber-600">
                    <Award className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-medium text-amber-900">2 项评测集署名权</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-amber-400 group-hover:text-amber-600 transition-colors" />
              </button>
              
              <button 
                onClick={() => setActiveTab('内容与知识库')}
                className="flex items-center justify-between p-2 rounded-lg bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100/50 hover:border-indigo-200 transition-all group"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-indigo-100 rounded text-indigo-600">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-medium text-indigo-900">数字分身已激活</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
              </button>
            </div>
          </div>

          <div className="mb-8 group">
            <div className="relative pb-2 mb-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-base font-bold text-gray-900">工作经历</h3>
              <button 
                onClick={() => {
                  setActiveTab('身份与背书');
                  setTimeout(() => {
                    document.getElementById('resume-archive')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 transition-all p-1"
                title="编辑履历"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <div className="absolute bottom-[-1px] left-0 w-8 h-[2px] bg-gray-900"></div>
            </div>
            <div className="space-y-4 relative">
              <div className="absolute left-0 top-2 bottom-0 w-px bg-gray-200"></div>
              <div className="relative pl-4">
                <div className="absolute -left-[2.5px] top-1.5 w-1.5 h-1.5 rounded-full bg-blue-600 ring-4 ring-white"></div>
                <h4 className="font-bold text-gray-900 text-xs">字节跳动</h4>
                <p className="text-xs text-gray-500 mt-0.5">AI 产品经理</p>
                <p className="text-[10px] text-gray-400 mt-0.5">2022.03 - 至今</p>
              </div>
            </div>
          </div>

          <div className="group">
            <div className="relative pb-2 mb-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-base font-bold text-gray-900">教育背景</h3>
              <button 
                onClick={() => {
                  setActiveTab('身份与背书');
                  setTimeout(() => {
                    document.getElementById('resume-archive')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 transition-all p-1"
                title="编辑履历"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <div className="absolute bottom-[-1px] left-0 w-8 h-[2px] bg-gray-900"></div>
            </div>
            <div className="space-y-4 relative">
              <div className="absolute left-0 top-2 bottom-0 w-px bg-gray-200"></div>
              <div className="relative pl-4">
                <div className="absolute -left-[2.5px] top-1.5 w-1.5 h-1.5 rounded-full bg-blue-600 ring-4 ring-white"></div>
                <h4 className="font-bold text-gray-900 text-xs">英国爱丁堡大学</h4>
                <p className="text-xs text-gray-500 mt-0.5">生物信息学 · 硕士</p>
                <p className="text-[10px] text-gray-400 mt-0.5">2019.09 - 2021.07</p>
              </div>
              <div className="relative pl-4">
                <div className="absolute -left-[2.5px] top-1.5 w-1.5 h-1.5 rounded-full bg-gray-300 ring-4 ring-white"></div>
                <h4 className="font-bold text-gray-900 text-xs">浙江大学</h4>
                <p className="text-xs text-gray-500 mt-0.5">计算机科学与技术 · 学士</p>
                <p className="text-[10px] text-gray-400 mt-0.5">2015.09 - 2019.07</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* 数字分身管理弹窗 */}
      {showSpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50/50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">数字分身设定 (System Prompt)</h3>
                  <p className="text-xs text-gray-500 mt-0.5">定制您的专属 AI 助手行为与记忆</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSpModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* 分身昵称设定 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    分身昵称
                  </h4>
                </div>
                <input
                  type="text"
                  value={spConfig.name}
                  onChange={(e) => setSpConfig({...spConfig, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                  placeholder="请输入您的数字分身昵称..."
                />
              </div>

              {/* System Prompt 设定 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    核心设定 (System Prompt)
                  </h4>
                  <button className="text-xs text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" />
                    AI 自动优化
                  </button>
                </div>
                <textarea
                  value={spConfig.systemPrompt}
                  onChange={(e) => setSpConfig({...spConfig, systemPrompt: e.target.value})}
                  className="w-full h-48 p-4 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all resize-none leading-relaxed"
                  placeholder="在此输入您的 System Prompt..."
                />
              </div>

              {/* 长期记忆 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-gray-900">长期记忆 (Long-term Memory)</h4>
                  <span className="text-xs text-gray-400">系统根据您的平台行为自动提取</span>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="p-3 bg-gray-50/50 border-b border-gray-100 text-xs text-gray-500 flex items-center gap-2">
                    <Info className="w-3.5 h-3.5" />
                    这些记忆会在生成回答时作为背景上下文提供给模型
                  </div>
                  <div className="divide-y divide-gray-100">
                    {spConfig.memory.map((mem, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors group">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0"></div>
                        <p className="text-sm text-gray-700 flex-1">{mem}</p>
                        <button className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setShowSpModal(false)}
                className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button 
                onClick={handleSaveSp}
                className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all"
              >
                保存设定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
