import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Search, Filter, Plus, MoreHorizontal, Clock, CheckCircle2, AlertCircle, FileText, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';

export function RequesterTasks() {
  const { t } = useLanguage();

  // Mock Data
  const projects = [
    { id: 'p1', name: 'RLHF 模型训练 v2' },
    { id: 'p2', name: '法律合同审查' },
    { id: 'p3', name: '医疗影像分析' },
  ];

  const tasks = [
    {
      id: 't1',
      title: '数据清洗与预处理',
      project: 'RLHF 模型训练 v2',
      status: 'completed',
      progress: 100,
      dueDate: '2026-03-10',
      assignee: 'AI 团队 A',
      priority: 'high'
    },
    {
      id: 't2',
      title: '专家标注第一阶段',
      project: 'RLHF 模型训练 v2',
      status: 'in_progress',
      progress: 45,
      dueDate: '2026-03-25',
      assignee: '全球专家池',
      priority: 'high'
    },
    {
      id: 't3',
      title: '质量验收',
      project: 'RLHF 模型训练 v2',
      status: 'pending',
      progress: 0,
      dueDate: '2026-04-01',
      assignee: 'QA 团队',
      priority: 'medium'
    },
    {
      id: 't4',
      title: '条款提取',
      project: '法律合同审查',
      status: 'in_progress',
      progress: 78,
      dueDate: '2026-03-20',
      assignee: '法律专家组',
      priority: 'critical'
    },
    {
      id: 't5',
      title: '风险评估报告',
      project: '法律合同审查',
      status: 'pending',
      progress: 0,
      dueDate: '2026-03-28',
      assignee: '高级法律顾问',
      priority: 'high'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
     switch (status) {
      case 'completed': return '已完成';
      case 'in_progress': return '进行中';
      case 'pending': return '待处理';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-100';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-100';
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-100';
      default: return 'text-gray-600 bg-gray-50 border-gray-100';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'critical': return '紧急';
      case 'high': return '高';
      case 'medium': return '中';
      default: return '低';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-black tracking-tight">{t.requester.sidebar.tasks || '任务管理'}</h1>
          <p className="text-gray-500 mt-1">管理和追踪您所有项目中的任务进度。</p>
        </div>
        <button className="bg-black text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition-all shadow-lg shadow-black/20 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          创建任务
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-2">
                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">总任务数</span>
                <div className="p-1.5 bg-gray-50 rounded-lg"><FileText className="w-4 h-4 text-gray-400" /></div>
            </div>
            <div className="text-3xl font-bold text-black">24</div>
            <div className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
                <span className="bg-green-100 px-1.5 py-0.5 rounded text-[10px]">+12%</span> 较上月
            </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-2">
                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">进行中</span>
                <div className="p-1.5 bg-blue-50 rounded-lg"><Clock className="w-4 h-4 text-blue-500" /></div>
            </div>
            <div className="text-3xl font-bold text-black">8</div>
             <div className="text-xs text-gray-400 font-medium mt-1">活跃工作流</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-2">
                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">已完成</span>
                <div className="p-1.5 bg-green-50 rounded-lg"><CheckCircle2 className="w-4 h-4 text-green-500" /></div>
            </div>
            <div className="text-3xl font-bold text-black">12</div>
             <div className="text-xs text-gray-400 font-medium mt-1">本月累计</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-2">
                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">紧急</span>
                <div className="p-1.5 bg-red-50 rounded-lg"><AlertCircle className="w-4 h-4 text-red-500" /></div>
            </div>
            <div className="text-3xl font-bold text-black">2</div>
             <div className="text-xs text-red-500 font-medium mt-1">需立即处理</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
                type="text" 
                placeholder="搜索任务..." 
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
            />
        </div>
        <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:text-black hover:border-gray-300 bg-white whitespace-nowrap">
                <Filter className="w-4 h-4" />
                筛选
            </button>
            <div className="h-10 w-px bg-gray-200 mx-1 hidden md:block"></div>
            <select className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 bg-white focus:outline-none focus:border-black cursor-pointer">
                <option>所有项目</option>
                {projects.map(p => <option key={p.id}>{p.name}</option>)}
            </select>
            <select className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 bg-white focus:outline-none focus:border-black cursor-pointer">
                <option>所有状态</option>
                <option>进行中</option>
                <option>已完成</option>
                <option>待处理</option>
            </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                        <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider w-1/3">任务名称</th>
                        <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">所属项目</th>
                        <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">状态</th>
                        <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">优先级</th>
                        <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">截止日期</th>
                        <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">操作</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {tasks.map((task) => (
                        <tr key={task.id} className="group hover:bg-gray-50/50 transition-colors">
                            <td className="py-4 px-6">
                                <div className="flex flex-col">
                                    <span className="font-bold text-black text-sm group-hover:text-blue-600 transition-colors cursor-pointer">{task.title}</span>
                                    <span className="text-xs text-gray-400 mt-1">ID: #{task.id.toUpperCase()}</span>
                                </div>
                            </td>
                            <td className="py-4 px-6">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200">
                                    {task.project}
                                </span>
                            </td>
                            <td className="py-4 px-6">
                                <span className={cn(
                                    "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border",
                                    getStatusColor(task.status)
                                )}>
                                    <div className={cn("w-1.5 h-1.5 rounded-full mr-1.5", 
                                        task.status === 'completed' ? 'bg-green-500' : 
                                        task.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-400'
                                    )}></div>
                                    {getStatusLabel(task.status)}
                                </span>
                            </td>
                            <td className="py-4 px-6">
                                <span className={cn(
                                    "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold border uppercase tracking-wider",
                                    getPriorityColor(task.priority)
                                )}>
                                    {getPriorityLabel(task.priority)}
                                </span>
                            </td>
                            <td className="py-4 px-6">
                                <div className="flex items-center text-sm text-gray-500 font-medium">
                                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                    {task.dueDate}
                                </div>
                            </td>
                            <td className="py-4 px-6 text-right">
                                <button className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-all">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/30">
            <span className="text-xs text-gray-500 font-medium">显示 1-5 共 24 条任务</span>
            <div className="flex gap-2">
                <button className="px-3 py-1.5 border border-gray-200 bg-white rounded-lg text-xs font-medium text-gray-600 hover:border-black hover:text-black disabled:opacity-50 transition-all">上一页</button>
                <button className="px-3 py-1.5 border border-gray-200 bg-white rounded-lg text-xs font-medium text-gray-600 hover:border-black hover:text-black transition-all">下一页</button>
            </div>
        </div>
      </div>
    </div>
  );
}