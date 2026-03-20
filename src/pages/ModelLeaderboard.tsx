import React, { useState } from 'react';
import { 
  Trophy, 
  Sparkles, 
  Info, 
  ChevronRight, 
  MessageSquare,
  Image,
  Layout,
  BarChart
} from 'lucide-react';
import { cn } from '../lib/utils';

// Mock Data
const LEADERBOARD_DATA = [
  { rank: 1, model: 'Yi-Lightning', elo: 1038.7, votes: 4085, ci: '1048/1030' },
  { rank: 2, model: 'DeepSeek-V3', elo: 1026.9, votes: 5872, ci: '1032/1019' },
  { rank: 3, model: '匿名模型30', elo: 1026.8, votes: 2877, ci: '1035/1016' },
  { rank: 4, model: 'deepseek-r1-官方', elo: 1023.9, votes: 3085, ci: '1035/1016' },
  { rank: 5, model: '匿名模型28', elo: 1021.4, votes: 3019, ci: '1030/1011' },
  { rank: 6, model: 'Hunyuan-Pro (腾讯混元)', elo: 1020.6, votes: 6286, ci: '1027/1014' },
  { rank: 7, model: 'doubao-1-5-pro-32k-250115', elo: 1015.7, votes: 2809, ci: '1024/1007' },
  { rank: 8, model: 'MoonShot-v1-32k (月之暗面)', elo: 1014.5, votes: 6674, ci: '1021/1008' },
  { rank: 9, model: '匿名模型20', elo: 1014.1, votes: 7496, ci: '1020/1009' },
  { rank: 10, model: 'Qwen-max-2025-01-25', elo: 1012.7, votes: 3908, ci: '1021/1004' },
  { rank: 11, model: 'Spark-4.0-Ultra', elo: 1006.1, votes: 7702, ci: '1012/1001' },
  { rank: 12, model: 'Doubao-pro-32k-241215', elo: 1005.5, votes: 6322, ci: '1010/999' },
  { rank: 13, model: '匿名模型2', elo: 1003.4, votes: 6437, ci: '1008/998' },
  { rank: 14, model: 'GLM-4 (智谱AI)', elo: 1003.0, votes: 6698, ci: '1008/995' },
  { rank: 15, model: '匿名模型13', elo: 1001.3, votes: 6640, ci: '1007/995' },
  { rank: 16, model: 'doubao-1.5-pro-256k-250115', elo: 998.1, votes: 3593, ci: '1009/991' },
  { rank: 17, model: '匿名模型27', elo: 992.7, votes: 4210, ci: '1000/984' },
];

const MEDAL_COLORS = {
  1: 'from-yellow-300 to-yellow-500 text-yellow-800 shadow-yellow-200',
  2: 'from-slate-200 to-slate-400 text-slate-700 shadow-slate-200',
  3: 'from-orange-300 to-orange-400 text-orange-800 shadow-orange-200',
};

import { useNavigate } from 'react-router-dom';

export function ModelLeaderboard() {
  const [activeTab, setActiveTab] = useState('text'); // text, image, mixed
  const navigate = useNavigate();

  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden bg-[#F5F7FA] p-8">
      {/* Main Content */}
      <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden h-full flex flex-col">
        {/* Header */}
        <div className="h-24 bg-gradient-to-r from-[#FFF0E6] via-[#F3F0FF] to-[#E6F0FF] flex items-center px-8 justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 flex items-center justify-center shadow-lg border-2 border-white">
              <Trophy className="w-5 h-5 text-white fill-current" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              Turing Arena模型榜单
              <Sparkles className="w-5 h-5 text-purple-500" />
            </h1>
          </div>
          
          <button 
            onClick={() => navigate('/expert/workbench')}
            className="bg-white hover:bg-gray-50 text-slate-900 px-4 py-2 rounded-lg text-sm font-bold border border-gray-200 shadow-sm flex items-center gap-2 transition-all"
          >
            模型擂台
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Controls */}
        <div className="px-8 py-6 border-b border-gray-50 flex flex-col gap-6 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setActiveTab('text')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all border",
                  activeTab === 'text' 
                    ? "bg-black text-white border-black shadow-lg shadow-gray-200" 
                    : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <MessageSquare className="w-4 h-4" />
                文本榜单
              </button>
              <button 
                onClick={() => setActiveTab('image')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all border",
                  activeTab === 'image' 
                    ? "bg-black text-white border-black shadow-lg shadow-gray-200" 
                    : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Image className="w-4 h-4" />
                图片榜单
              </button>
              <button 
                onClick={() => setActiveTab('mixed')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all border",
                  activeTab === 'mixed' 
                    ? "bg-black text-white border-black shadow-lg shadow-gray-200" 
                    : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Layout className="w-4 h-4" />
                图文榜单
              </button>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
              <span className="flex items-center gap-1 bg-orange-50 text-orange-600 px-3 py-1 rounded-full border border-orange-100">
                <Info className="w-3 h-3" />
                榜单基于前台用户数据实时计算
              </span>
              <button className="hover:text-slate-900 flex items-center gap-1">
                <Info className="w-3 h-3" />
                规则介绍
              </button>
              <button className="hover:text-slate-900 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                我要参评
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-500">能力排序：</span>
            <select className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 outline-none focus:border-purple-200 focus:ring-2 focus:ring-purple-50">
              <option>--</option>
              <option>综合能力</option>
              <option>代码能力</option>
              <option>数学能力</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 text-left">
                  <th className="px-8 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-24">排名</th>
                  <th className="px-8 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">模型</th>
                  <th className="px-8 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">elo rating得分</th>
                  <th className="px-8 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">有效单轮投票次数</th>
                  <th className="px-8 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">95%CI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {LEADERBOARD_DATA.map((row) => (
                  <tr key={row.rank} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-4 whitespace-nowrap">
                      {row.rank <= 3 ? (
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center shadow-sm",
                          MEDAL_COLORS[row.rank as keyof typeof MEDAL_COLORS]
                        )}>
                          <Trophy className="w-4 h-4 fill-current" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                          {row.rank}
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap">
                      <span className="font-bold text-slate-700 group-hover:text-purple-600 transition-colors">{row.model}</span>
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap text-right font-mono text-slate-600 font-medium">
                      {row.elo}
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap text-right font-mono text-slate-500">
                      {row.votes}
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap text-right font-mono text-gray-400 text-xs">
                      {row.ci}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      
      {/* Floating Action Button */}
      <button className="fixed bottom-8 right-8 w-12 h-12 bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center text-gray-500 hover:text-slate-900 hover:scale-110 transition-all z-50">
        <MessageSquare className="w-5 h-5" />
      </button>
    </div>
  );
}
