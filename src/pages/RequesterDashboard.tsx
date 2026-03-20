import React, { useState, useRef, useEffect } from 'react';
import { Send, FileText, ArrowRight, CheckCircle2, Sparkles, Zap, Brain, Image, Paperclip, Mic as MicIcon, Calendar, MessageSquarePlus, History } from 'lucide-react';
import { cn } from '../lib/utils';
import { useLanguage } from '../contexts/LanguageContext';

type Step = 'init' | 'name' | 'desc' | 'duration' | 'personnel' | 'legal' | 'done';

interface Message {
  role: 'user' | 'ai';
  content: React.ReactNode;
  type?: 'text' | 'proposal';
}

interface ProjectData {
  categories: string[];
  name: string;
  description: string;
  duration: string;
  personnel: string;
  legalLink: string;
}

import { useHeaderActions } from '../contexts/HeaderActionsContext';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../contexts/ProjectContext';

export function RequesterDashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { setActions } = useHeaderActions();
  const { addProject } = useProjects();
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>('init');
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [projectData, setProjectData] = useState<ProjectData>({
    categories: [],
    name: '',
    description: '',
    duration: '',
    personnel: '',
    legalLink: ''
  });

  // Mock history data
  const historyItems = [
    { id: 1, title: '手机版对话', active: false },
    { id: 2, title: '新一代AI Native专家数据...', active: true },
    { id: 3, title: '大模型训练中的HLE', active: false },
    { id: 4, title: '问题记录位置', active: false },
    { id: 5, title: '沙箱是什么', active: false, badge: 1 },
    { id: 6, title: '工作交接文档（简洁版）', active: false },
    { id: 7, title: '标注数据对大模型质量的影响...', active: false },
    { id: 8, title: '垂类大模型评测方法', active: false },
  ];

  const categoryIcons = {
    training: Brain,
    evaluation: CheckCircle2,
    multimodal: Image,
    industry: Zap
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAnalyzing]);

  const handleCategoryClick = (item: string) => {
    const isSelected = selectedCategories.includes(item);
    
    // Toggle selection state
    let newCategories: string[];
    if (isSelected) {
      newCategories = selectedCategories.filter(i => i !== item);
    } else {
      newCategories = [...selectedCategories, item];
    }
    setSelectedCategories(newCategories);

    // Update input text
    setInput(prev => {
      const parts = prev.split(',').map(s => s.trim()).filter(Boolean);
      if (isSelected) {
        const newParts = parts.filter(p => p !== item);
        return newParts.join(', ');
      } else {
        if (!parts.includes(item)) {
          return parts.length > 0 ? parts.join(', ') + ', ' + item : item;
        }
        return prev;
      }
    });
  };

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsAnalyzing(true);

    // Simulate AI processing
    setTimeout(() => {
      processStep(input);
      setIsAnalyzing(false);
    }, 1500);
  };

  const handleDateConfirm = () => {
    if (!startDate || !endDate) return;
    const formattedDate = `${startDate.replace(/-/g, '/')} ～ ${endDate.replace(/-/g, '/')}`;
    
    // Add user message directly
    const userMsg: Message = { role: 'user', content: formattedDate };
    setMessages(prev => [...prev, userMsg]);
    setIsAnalyzing(true);
    
    // Clear dates
    setStartDate('');
    setEndDate('');

    // Simulate AI processing
    setTimeout(() => {
      processStep(formattedDate);
      setIsAnalyzing(false);
    }, 1500);
  };

  const processStep = (userInput: string) => {
    let nextStep: Step = currentStep;
    let aiResponseText = '';

    switch (currentStep) {
      case 'init':
        setProjectData(prev => ({ ...prev, categories: selectedCategories, description: userInput })); // Assume initial input is partly desc
        nextStep = 'name';
        aiResponseText = t.requester.dashboard.agent?.askName || 'What is the project name?';
        break;
      case 'name':
        setProjectData(prev => ({ ...prev, name: userInput }));
        nextStep = 'desc';
        aiResponseText = t.requester.dashboard.agent?.askDesc || 'Please describe the requirements.';
        break;
      case 'desc':
        setProjectData(prev => ({ ...prev, description: userInput }));
        nextStep = 'duration';
        aiResponseText = t.requester.dashboard.agent?.askDuration || 'What is the duration?';
        break;
      case 'duration':
        setProjectData(prev => ({ ...prev, duration: userInput }));
        nextStep = 'personnel';
        aiResponseText = t.requester.dashboard.agent?.askPersonnel || 'Who are the key personnel?';
        break;
      case 'personnel':
        setProjectData(prev => ({ ...prev, personnel: userInput }));
        nextStep = 'legal';
        aiResponseText = t.requester.dashboard.agent?.askLegal || 'Please provide the legal assessment link.';
        break;
      case 'legal':
        setProjectData(prev => ({ ...prev, legalLink: userInput }));
        nextStep = 'done';
        aiResponseText = t.requester.dashboard.agent?.confirm || 'Perfect! Generating proposal...';
        break;
      default:
        break;
    }

    setCurrentStep(nextStep);
    
    if (aiResponseText) {
      setMessages(prev => [...prev, { role: 'ai', content: aiResponseText }]);
    }

    if (nextStep === 'done') {
        // Add a small delay before showing the proposal card
        setTimeout(() => {
            setMessages(prev => [...prev, { role: 'ai', content: '', type: 'proposal' }]);
        }, 800);
    }
  };

  const getPlaceholder = () => {
    switch (currentStep) {
      case 'init':
        return t.requester.dashboard.placeholder;
      case 'name':
        return t.requester.dashboard.agent?.askName;
      case 'desc':
        return t.requester.dashboard.agent?.askDesc;
      case 'personnel':
        return t.requester.dashboard.agent?.askPersonnel;
      case 'legal':
        return t.requester.dashboard.agent?.askLegal;
      default:
        return t.requester.dashboard.placeholder;
    }
  };

  const getSuggestions = () => {
    switch (currentStep) {
      case 'name':
        return t.requester.dashboard.agent?.suggestions?.name;
      case 'desc':
        return t.requester.dashboard.agent?.suggestions?.desc;
      case 'personnel':
        return t.requester.dashboard.agent?.suggestions?.personnel;
      case 'legal':
        return t.requester.dashboard.agent?.suggestions?.legal;
      default:
        return [];
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleApprove = () => {
    // 1. Add to project list (using context)
    addProject({
      name: projectData.name || 'New Project',
      description: projectData.description || 'No description provided',
      categories: projectData.categories,
      personnel: projectData.personnel,
      duration: projectData.duration,
      legalLink: projectData.legalLink
    });
    
    // 2. Navigate to projects page
    navigate('/requester/projects');
  };

  const handleNewChat = React.useCallback(() => {
    setMessages([]);
    setCurrentStep('init');
    setProjectData({
        categories: [],
        name: '',
        description: '',
        duration: '',
        personnel: '',
        legalLink: ''
    });
    setSelectedCategories([]);
    setInput('');
    setShowHistory(false);
  }, []);

  // Set header actions
  useEffect(() => {
    setActions(
      <div className="flex items-center gap-1">
         <button 
           onClick={handleNewChat}
           className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-all group"
           title="New Chat"
         >
           <MessageSquarePlus className="w-5 h-5 group-hover:scale-105 transition-transform" />
         </button>
         <button 
           onClick={() => setShowHistory(prev => !prev)}
           className={cn(
             "p-2 rounded-full transition-all group",
             showHistory ? "text-black bg-gray-100" : "text-gray-400 hover:text-black hover:bg-gray-100"
           )}
           title="History"
         >
           <History className="w-5 h-5 group-hover:scale-105 transition-transform" />
         </button>
      </div>
    );

    return () => setActions(null);
  }, [handleNewChat, setActions, showHistory]);

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col relative">
      {/* History Sidebar */}
      <div className={cn(
        "absolute right-0 top-0 bottom-0 w-64 bg-white border-l border-gray-100 z-50 shadow-2xl transition-transform duration-300 transform rounded-r-[32px] overflow-hidden",
        showHistory ? "translate-x-0" : "translate-x-full hidden"
      )}>
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 backdrop-blur-sm">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">历史对话</span>
            <button onClick={() => setShowHistory(false)} className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition-colors">
                <ArrowRight className="w-4 h-4" />
            </button>
        </div>
        <div className="overflow-y-auto h-full pb-20">
            {historyItems.map((item) => (
                <div 
                    key={item.id}
                    className={cn(
                        "px-4 py-3 flex items-center gap-3 cursor-pointer transition-all border-l-2 group hover:bg-gray-50",
                        item.active ? "bg-gray-50 border-black" : "border-transparent"
                    )}
                >
                    <div className={cn(
                        "p-1.5 rounded-full flex-shrink-0 transition-colors",
                        item.active ? "bg-black text-white" : "bg-gray-100 text-gray-400 group-hover:bg-white group-hover:text-black"
                    )}>
                        <MessageSquarePlus className="w-3 h-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className={cn(
                            "text-sm truncate block",
                            item.active ? "font-bold text-black" : "text-gray-600 font-medium group-hover:text-black"
                        )}>
                            {item.title}
                        </span>
                        <span className="text-[10px] text-gray-400 truncate block mt-0.5">Today, 10:23 AM</span>
                    </div>
                    {item.badge && (
                        <span className="w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                            {item.badge}
                        </span>
                    )}
                </div>
            ))}
        </div>
      </div>

      {/* Chat Interface */}
      <div className="bg-white rounded-[32px] shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden flex-1 flex flex-col min-h-[600px] relative">
        
        {/* Chat History / Content Area */}
        <div className="flex-1 p-8 bg-[#FAFAFA] space-y-8 overflow-y-auto pb-48">
          
          {/* Initial Greeting (Always Visible) */}
          <div className="flex gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-6 max-w-[90%] w-full">
              <div className="text-gray-800">
                <p className="text-base font-medium mb-6">{t.requester.dashboard.greeting}</p>
                
                {/* Category Grid */}
                <div className="space-y-6">
                  {Object.entries(t.requester.dashboard.categories || {}).map(([key, category]: [string, any]) => {
                    const Icon = categoryIcons[key as keyof typeof categoryIcons] || Sparkles;
                    return (
                      <div key={key} className="bg-white p-5 rounded-2xl border border-gray-100 hover:border-black/10 transition-colors shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2.5 bg-gray-50 rounded-xl">
                            {key === 'domains' ? <Brain className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                          </div>
                          <span className="font-bold text-base">{category.title}</span>
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                          {category.items.map((item: string, idx: number) => (
                            <button
                              key={idx}
                              onClick={() => handleCategoryClick(item)}
                              className={cn(
                                "text-xs px-3 py-1.5 border rounded-lg transition-all cursor-pointer select-none font-medium",
                                "hover:scale-105 active:scale-95",
                                selectedCategories.includes(item)
                                  ? "bg-black text-white border-black shadow-lg shadow-black/20"
                                  : "bg-white text-gray-600 border-gray-200 hover:bg-black hover:text-white hover:border-black"
                              )}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Render Messages */}
          {messages.map((msg, index) => (
            <div 
                key={index} 
                className={cn(
                    "flex gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500",
                    msg.role === 'user' ? "flex-row-reverse" : ""
                )}
            >
              {msg.role === 'user' ? (
                <>
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm mt-1">
                        <span className="text-[10px] font-bold text-gray-600">ME</span>
                    </div>
                    <div className="bg-gray-100 text-black p-6 rounded-2xl rounded-tr-none shadow-sm text-base max-w-[80%]">
                        {msg.content}
                    </div>
                </>
              ) : (
                msg.type === 'proposal' ? (
                    <div className="space-y-4 w-full max-w-3xl">
                        <div className="bg-white rounded-2xl rounded-tl-none border border-gray-200 shadow-lg overflow-hidden">
                        <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-base text-black flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-500" />
                            {t.requester.dashboard.blueprint}
                            </h3>
                            <span className="text-[10px] font-bold bg-black text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Zap className="w-3 h-3 text-lab-yellow" />
                            AI
                            </span>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {/* Project Summary */}
                            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-100">
                                <div className="col-span-2">
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {selectedCategories.map((cat, i) => (
                                            <span key={i} className="text-[10px] font-bold bg-black text-white px-2 py-1 rounded-md">{cat}</span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Project Name</h4>
                                    <p className="text-sm font-bold text-black">{projectData.name}</p>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Duration</h4>
                                    <p className="text-sm font-bold text-black">{projectData.duration}</p>
                                </div>
                                <div className="col-span-2">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Description</h4>
                                    <p className="text-sm font-medium text-gray-600 line-clamp-2">{projectData.description}</p>
                                </div>
                                <div className="col-span-2">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Personnel</h4>
                                    <p className="text-sm font-medium text-gray-600">{projectData.personnel}</p>
                                </div>
                                <div className="col-span-2">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Legal Check</h4>
                                    <p className="text-sm font-medium text-green-600 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Verified: <span className="underline truncate max-w-[200px]">{projectData.legalLink}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Workflow Section */}
                            <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t.requester.dashboard.workflow}</h4>
                            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                                <div className="flex-shrink-0 bg-white border border-gray-200 px-3 py-2 rounded-lg text-center min-w-[100px]">
                                <span className="block font-bold text-black text-sm mb-1">{t.requester.dashboard.workflowSteps[0]}</span>
                                <span className="text-[10px] font-medium text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded">{t.requester.dashboard.workflowTags[0]}</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                                <div className="flex-shrink-0 bg-lab-blue/5 border border-lab-blue px-3 py-2 rounded-lg text-center min-w-[100px]">
                                <span className="block font-bold text-lab-blue-dark text-sm mb-1">{t.requester.dashboard.workflowSteps[1]}</span>
                                <span className="text-[10px] font-bold text-white bg-lab-blue px-1.5 py-0.5 rounded">{t.requester.dashboard.workflowTags[1]}</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                                <div className="flex-shrink-0 bg-white border border-gray-200 px-3 py-2 rounded-lg text-center min-w-[100px]">
                                <span className="block font-bold text-black text-sm mb-1">{t.requester.dashboard.workflowSteps[2]}</span>
                                <span className="text-[10px] font-medium text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded">{t.requester.dashboard.workflowTags[2]}</span>
                                </div>
                        </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                            <button className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-black transition-colors">{t.common.modify}</button>
                            <button 
                              onClick={handleApprove}
                              className="px-6 py-2 text-xs font-bold bg-black text-white rounded-full hover:bg-gray-800 shadow-md transition-all"
                            >
                            {t.common.approve}
                            </button>
                        </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white text-gray-800 p-6 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm text-base max-w-[80%]">
                        {msg.content}
                    </div>
                )
              )}
            </div>
          ))}

          {/* Analysis State */}
          {isAnalyzing && (
            <div className="flex gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-4 text-gray-800">
                <div className="relative">
                   <div className="w-5 h-5 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
                </div>
                <span className="text-gray-600 font-medium text-sm">{t.requester.dashboard.agent?.thinking || 'Thinking...'}</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Floating Input Area */}
        <div className="absolute bottom-6 left-6 right-6">
          {/* Smart Suggestions Chips */}
          {getSuggestions() && (getSuggestions()?.length ?? 0) > 0 && (
            <div className="flex gap-2 mb-3 overflow-x-auto px-1 animate-in slide-in-from-bottom-2 fade-in duration-300">
              {getSuggestions()?.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="whitespace-nowrap px-3 py-1.5 bg-white/80 backdrop-blur-md border border-gray-200 rounded-full text-xs font-medium text-gray-600 hover:bg-black hover:text-white hover:border-black transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3" />
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-[24px] shadow-2xl p-2 relative">
            {currentStep === 'duration' ? (
              <div className="p-4 flex items-center gap-3 animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex-1 flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-transparent border-none text-sm focus:ring-0 p-0 text-gray-800 w-full outline-none"
                  />
                </div>
                <span className="text-gray-400 font-medium">to</span>
                <div className="flex-1 flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-transparent border-none text-sm focus:ring-0 p-0 text-gray-800 w-full outline-none"
                  />
                </div>
                <button 
                  onClick={handleDateConfirm}
                  disabled={!startDate || !endDate}
                  className="bg-black text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                >
                  Confirm
                </button>
              </div>
            ) : (
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                    }
                }}
                disabled={isAnalyzing || currentStep === 'done'}
                placeholder={getPlaceholder()}
                className="w-full bg-transparent border-none rounded-t-[20px] pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-0 resize-none h-24 placeholder:leading-relaxed"
              />
            )}
            
            {currentStep !== 'duration' && (
              <div className="flex items-center justify-between px-2 pb-1">
                 <div className="flex items-center gap-1">
                   <button className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors flex items-center gap-1.5">
                     <Paperclip className="w-4 h-4" />
                     <span className="text-xs font-medium">{t.requester.dashboard.input?.attach || 'Attach'}</span>
                   </button>
                 </div>
  
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                   <button 
                    onClick={handleSend}
                    disabled={!input.trim() || isAnalyzing || currentStep === 'done'}
                    className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-black hover:bg-black hover:text-white hover:border-black disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    {input.trim() ? <Send className="w-4 h-4" /> : <MicIcon className="w-4 h-4" />}
                  </button>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}