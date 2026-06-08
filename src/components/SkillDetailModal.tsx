import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Terminal, Download, Users, Star, Clock, CheckCircle2, ChevronRight, ChevronDown, Folder, FileText, FileCode, FileJson, Copy, Check, Bookmark, Unlock, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SkillDetailModalProps {
  skill: any;
  onClose: () => void;
  onInstall: (skill: any, e: React.MouseEvent) => void;
  isInstalled: boolean;
  skillStats?: { stars: number; downloads: string };
  markdownContent?: string;
}

export function SkillDetailModal({ skill, onClose, onInstall, isInstalled, skillStats, markdownContent }: SkillDetailModalProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'source' | 'install'>('overview');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'scripts': true,
    'references': false
  });
  const [selectedFile, setSelectedFile] = useState('SKILL.md');
  const [copied, setCopied] = useState(false);
  const [copiedTrae, setCopiedTrae] = useState(false);
  const [installTab, setInstallTab] = useState('Trae');

  useEffect(() => {
    if (skill.defaultTab) {
      setActiveTab(skill.defaultTab as 'overview' | 'source' | 'install');
    }
  }, [skill.defaultTab]);

  // Mock open source status (randomly assign for demo)
  const isOpenSource = skill.id === 'aidp_skill_creator' || skill.id === 'law_101' || Math.random() > 0.5;

  const toggleFolder = (folder: string) => {
    setExpandedFolders(prev => ({ ...prev, [folder]: !prev[folder] }));
  };

  const handleUseInCloud = () => {
    onClose();
    navigate('/expert/unified-chat', { state: { prefillSkill: skill.id } });
  };

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(`trae skill install ${skill.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCommandTrae = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedTrae(true);
    setTimeout(() => setCopiedTrae(false), 2000);
  };

  const getMockData = () => {
    if (skill.title.includes('Skill 生成器')) {
      return {
        before: "（通用大模型回答）\n\n好的，我帮你写一个技能的 Prompt。你可以告诉大模型：你是一个营销专家，请帮我写一段文案...",
        after: "（挂载技能后）\n\n自动为你生成了符合 Agent Skills 标准的完整工程目录：\n1. SKILL.md (包含 YAML 元数据与渐进式披露指令)\n2. references/ (用于 RAG 挂载的占位目录)\n3. scripts/ (MCP 工具链入口)\n\n并自动为你执行了 2 个 Test Case 进行了 Eval 评估。",
        files: {
          'SKILL.md': `---
name: "${skill.id}"
description: "${skill.description}"
author: "${skill.author}"
dependencies:
  "mcp-cli": "^1.0.0"
---

# Skill Creator

This skill helps you create new SKILLs for the workspace. It adopts the **Agent Skills open standard**, treating skills as filesystem-based domain knowledge packages.

## When to Use
CRITICAL: You MUST invoke this skill IMMEDIATELY as your FIRST action when:
- User wants to create a new skill
- User asks "how to create a skill"

## Workflow (Human-in-the-Loop)
1. Use \`AskUserQuestion\` to gather requirements.
2. Draft the SKILL.md and scripts.
3. Generate Test Cases & Eval.`,
          'scripts/eval.py': `import json\n\ndef run_eval(test_cases):\n    print("Running Agent RLHF Evaluation...")\n    return {"score": 0.98, "feedback": "Excellent instruction following."}`,
          'references/agentskills_spec.md': `# Agent Skills Specification v1.0\n\nAll skills must use YAML frontmatter for progressive disclosure.`
        }
      };
    } else if (skill.category === '法律') {
      return {
        before: "（通用大模型回答）\n\n这份合同存在一些风险，比如违约金写得太高了，建议降低。另外保密条款不够详细，建议补充完整。",
        after: "（挂载技能后）\n\n【审查报告】\n🔴 高危风险 (2处)\n1. 违约金条款 (第4.1条)：设定为合同总价的 50%，违反《民法典》关于违约金过高的司法解释，建议下调至 30% 以内。\n2. 管辖权 (第8条)：约定为“卖方所在地”，对己方不利，建议修改为“原告所在地法院管辖”。\n\n已自动调用 [法律法规数据库] 进行最新法条交叉比对。",
        files: {
          'SKILL.md': `---
name: "${skill.id}"
description: "${skill.description}"
author: "${skill.author}"
---

# Role
你是一位拥有10年经验的红圈所资深非诉律师。

# Focus Areas
1. **合同审查**：重点关注违约责任、管辖权、知识产权归属等核心利益条款。
2. **风险分级**：必须将风险分为【致命】、【高危】、【提示】三个等级。

# Workflow
1. 读取合同全文。
2. 调用法条检索工具，确认最新司法解释。
3. 输出结构化审查报告，并给出修改建议。`,
          'scripts/search_law.js': `async function searchLaw(keyword) {\n  // Connect to legal database API\n  return fetch(\`https://api.legal.com/search?q=\${keyword}\`);\n}`,
          'references/contract_checklist.md': `# 标准商业合同审查清单\n\n- [ ] 主体资格是否合法\n- [ ] 标的物描述是否明确\n- [ ] 付款节点是否合理`
        }
      };
    } else {
      return {
        before: "（通用大模型回答）\n\n这是一个普通的回答，缺乏深度专业视角，没有使用行业标准格式，且未能有效引用外部工具和最新数据。",
        after: "（挂载技能后）\n\n严格按照专家级 SOP 输出。调用了 MCP 检索最新数据，对齐了内部合规标准，并输出了结构化、可直接使用的专业报告。",
        files: {
          'SKILL.md': `---
name: "${skill.id}"
description: "${skill.description}"
author: "${skill.author}"
---

# Role
你是一位资深的领域专家。你的核心任务是处理与【${skill.title}】相关的复杂工作流。

# Focus Areas (审查重点)
1. **专业性**：严格遵循行业标准与合规要求。
2. **准确性**：确保输出的结果无逻辑漏洞。

# Workflow (工作流)
1. **深度分析**：理解用户的核心诉求。
2. **调用工具**：按需使用 MCP 工具获取外部数据。
3. **输出报告**：结构化输出结果。`,
          'scripts/index.js': `/**\n * ${skill.title} - Execution Script\n */\nasync function execute(params) {\n  console.log("Running skill execution...");\n  return { status: "success", data: params };\n}\nmodule.exports = { execute };`,
          'references/guidelines.md': `# 行业指南\n\n请在执行任务时严格参考本指南中的约束条件。`,
          'references/data.csv': `id,value,category\n1,test,sample\n2,mock,data`
        }
      };
    }
  };

  const mockData = getMockData();
  const mockFiles = mockData.files;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[85vh] min-h-[600px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="flex items-start justify-between p-6 md:p-8 border-b border-gray-100 bg-white/80 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center text-3xl shadow-sm border border-purple-100 shrink-0">
              {skill.icon || '🚀'}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-extrabold text-gray-900">{skill.title}</h2>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-md">v1.0.0</span>
                {isOpenSource ? (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-600 text-[11px] font-bold rounded-md border border-green-200/50">
                    <Unlock className="w-3 h-3" />
                    开源
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-50 text-gray-500 text-[11px] font-bold rounded-md border border-gray-200/50">
                    <Lock className="w-3 h-3" />
                    闭源
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1.5 text-[13px] text-gray-500 font-medium">
                <span>{skill.author || '@官方'}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <span>{skill.category || '效率工具'}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5" />
                  <span>{skillStats?.stars || 0}</span>
                </div>
                <div className="flex items-center gap-1.5 ml-1">
                  <Download className="w-3.5 h-3.5" />
                  <span>{skillStats?.downloads || '0k'}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleUseInCloud}
              className="px-5 py-2.5 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              立即体验
            </button>
            <button 
              onClick={(e) => onInstall(skill, e)}
              className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all border flex items-center gap-2 ${
                isInstalled 
                  ? 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100' 
                  : 'bg-white border-gray-200 text-gray-900 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Star className={`w-4 h-4 ${isInstalled ? 'fill-amber-400 text-amber-400' : ''}`} />
              {isInstalled ? '已收藏' : '收藏'}
            </button>
            <div className="w-px h-8 bg-gray-200 mx-1"></div>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-col flex-1 overflow-hidden bg-gray-50/30">
          {/* Tabs */}
          <div className="flex items-center gap-8 px-8 border-b border-gray-100 bg-white">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`py-4 text-[15px] font-bold border-b-2 transition-colors relative ${
                activeTab === 'overview' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              概览
            </button>
            {isOpenSource && (
              <button 
                onClick={() => setActiveTab('source')}
                className={`py-4 text-[15px] font-bold border-b-2 transition-colors relative flex items-center gap-1.5 ${
                  activeTab === 'source' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                源码
              </button>
            )}
            <button 
              onClick={() => setActiveTab('install')}
              className={`py-4 text-[15px] font-bold border-b-2 transition-colors relative flex items-center gap-1.5 ${
                activeTab === 'install' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              安装指引
            </button>
          </div>

          <div className="flex-1 overflow-hidden relative">
            {/* Tab 1: Overview */}
            {activeTab === 'overview' && (
              <div className="absolute inset-0 overflow-y-auto p-8">
                <div className="max-w-3xl mx-auto space-y-10">
                  <section>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">技能简介</h3>
                    <p className="text-gray-600 leading-relaxed text-[15px]">{skill.description}</p>
                  </section>
                  
                  <section>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      🎯 触发场景 (When to Use)
                    </h3>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                      <ul className="space-y-3 text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                          <span>当需要处理与 {skill.title} 相关的专业任务时</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                          <span>希望通过 AI 自动化生成标准化的报告或分析结果</span>
                        </li>
                      </ul>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      ✨ 效果演示 (Before & After)
                    </h3>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="grid grid-cols-2 divide-x divide-gray-100">
                        <div className="p-5 bg-red-50/30">
                          <div className="text-xs font-bold text-red-500 mb-3 uppercase tracking-wider">Without Skill</div>
                          <div className="text-sm text-gray-600 leading-relaxed bg-white p-3 rounded-xl border border-red-100 shadow-sm whitespace-pre-wrap">
                            {mockData.before}
                          </div>
                        </div>
                        <div className="p-5 bg-emerald-50/30">
                          <div className="text-xs font-bold text-emerald-600 mb-3 uppercase tracking-wider">With Skill</div>
                          <div className="text-sm text-gray-800 leading-relaxed bg-white p-3 rounded-xl border border-emerald-100 shadow-sm font-medium whitespace-pre-wrap">
                            {mockData.after}
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                </div>
              </div>
            )}

            {/* Tab 2: Source (IDE View) */}
            {activeTab === 'source' && (
              <div className="absolute inset-0 flex bg-white">
                {/* Sidebar File Tree */}
                <div className="w-64 border-r border-gray-100 bg-gray-50/50 flex flex-col">
                  <div className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    资源管理
                  </div>
                  <div className="flex-1 overflow-y-auto py-2 text-[13px] text-gray-700 font-mono">
                    {/* SKILL.md */}
                    {mockFiles['SKILL.md'] && (
                      <button 
                        onClick={() => setSelectedFile('SKILL.md')}
                        className={`w-full flex items-center gap-2 px-4 py-1.5 hover:bg-gray-100 transition-colors ${selectedFile === 'SKILL.md' ? 'bg-blue-50 text-blue-700 font-medium' : ''}`}
                      >
                        <FileText className="w-4 h-4 text-blue-500" />
                        SKILL.md
                      </button>
                    )}
                    
                    {/* scripts/ */}
                    {Object.keys(mockFiles).some(k => k.startsWith('scripts/')) && (
                      <div>
                        <button 
                          onClick={() => toggleFolder('scripts')}
                          className="w-full flex items-center gap-1 px-2 py-1.5 hover:bg-gray-100 transition-colors group"
                        >
                          {expandedFolders['scripts'] ? <ChevronDown className="w-4 h-4 opacity-50 group-hover:opacity-100" /> : <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100" />}
                          <Folder className="w-4 h-4 text-amber-500" />
                          scripts
                        </button>
                        {expandedFolders['scripts'] && Object.keys(mockFiles).filter(k => k.startsWith('scripts/')).map(file => (
                          <button 
                            key={file}
                            onClick={() => setSelectedFile(file)}
                            className={`w-full flex items-center gap-2 pl-9 pr-4 py-1.5 hover:bg-gray-100 transition-colors ${selectedFile === file ? 'bg-blue-50 text-blue-700 font-medium' : ''}`}
                          >
                            <FileCode className="w-4 h-4 text-yellow-500" />
                            {file.replace('scripts/', '')}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* references/ */}
                    {Object.keys(mockFiles).some(k => k.startsWith('references/')) && (
                      <div>
                        <button 
                          onClick={() => toggleFolder('references')}
                          className="w-full flex items-center gap-1 px-2 py-1.5 hover:bg-gray-100 transition-colors group"
                        >
                          {expandedFolders['references'] ? <ChevronDown className="w-4 h-4 opacity-50 group-hover:opacity-100" /> : <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100" />}
                          <Folder className="w-4 h-4 text-emerald-500" />
                          references
                        </button>
                        {expandedFolders['references'] && Object.keys(mockFiles).filter(k => k.startsWith('references/')).map(file => (
                          <button 
                            key={file}
                            onClick={() => setSelectedFile(file)}
                            className={`w-full flex items-center gap-2 pl-9 pr-4 py-1.5 hover:bg-gray-100 transition-colors ${selectedFile === file ? 'bg-blue-50 text-blue-700 font-medium' : ''}`}
                          >
                            {file.endsWith('.csv') || file.endsWith('.json') ? <FileJson className="w-4 h-4 text-green-500" /> : <FileText className="w-4 h-4 text-blue-500" />}
                            {file.replace('references/', '')}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Editor View */}
                <div className="flex-1 flex flex-col bg-white">
                  <div className="flex items-center px-4 py-2 bg-gray-50/80 border-b border-gray-100">
                    <div className="flex items-center gap-2 px-3 py-1 bg-white text-gray-700 text-xs font-mono rounded-md border border-gray-200 shadow-sm">
                      {selectedFile}
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-5">
                    <pre className="text-[13px] font-mono leading-relaxed text-gray-800 whitespace-pre-wrap break-words">
                      <code>
                        {selectedFile === 'SKILL.md' && markdownContent ? markdownContent : (mockFiles[selectedFile] || mockFiles['SKILL.md'] || '')}
                      </code>
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Install Guide */}
            {activeTab === 'install' && (
              <div className="absolute inset-0 overflow-y-auto p-8 bg-white">
                <div className="max-w-3xl mx-auto space-y-10 pb-10">
                  {/* Method 1: CLI */}
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[15px] font-bold text-gray-900 flex items-center gap-2">
                        方式一：复制命令行安装至目录，适用 Trae
                      </h3>
                    </div>
                    
                    <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50/50">
                      {/* Content */}
                      <div className="p-5">
                        <p className="text-[13px] text-gray-500 mb-4">
                          复制以下命令，安装至目录 ~/.trae-cn/skills 或 ~/.trae/skills
                        </p>
                        
                        <div className="space-y-4">
                          {/* Trae */}
                          <div className="bg-gray-100/80 rounded-lg overflow-hidden border border-gray-200/50">
                            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200/50">
                              <span className="text-xs font-bold text-gray-700">{"{ }"} 命令行 Trae</span>
                              <button onClick={() => handleCopyCommandTrae('npx -y --registry https://bnpm.byted.org @byted/aipaas@latest skills add codebase --agent trae --global')} className="text-gray-400 hover:text-gray-900 p-1">
                                {copiedTrae ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                            <div className="p-4 overflow-x-auto">
                              <code className="text-[13px] text-gray-800 font-mono select-all leading-relaxed">
                                npx -y --registry https://bnpm.byted.org \<br/>
                                @byted/aipaas@latest skills add \<br/>
                                {skill.id || 'copy-reviewer'} --agent trae --global
                              </code>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Method 2: Download */}
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[15px] font-bold text-gray-900 flex items-center gap-2">
                        方式二：下载 Skill 并移动至目录
                      </h3>
                    </div>
                    <button className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors border border-gray-200">
                      <Download className="w-4 h-4" />
                      下载 ZIP 压缩包
                    </button>
                  </section>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
