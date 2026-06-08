import React, { useState, useRef, useEffect } from 'react';
import { Upload, CheckCircle, ChevronDown, HelpCircle, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Feedback = () => {
  const [issueType, setIssueType] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const issueTypeOptions = [
    { value: 'bug', label: '问题反馈 / Bug' },
    { value: 'feature', label: '功能建议' },
    { value: 'account', label: '账号问题' },
    { value: 'other', label: '其他' }
  ];
  const [email, setEmail] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('email') || '';
  });
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIssueType('');
      setEmail('');
      // reset other fields if needed
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <div 
          className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => navigate('/')}
        >
          <div className="flex items-center justify-center p-0.5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#EC4899" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
              <path d="M12 2L2 20h20L12 2z" stroke="url(#logoGradient)" strokeWidth="3" strokeLinejoin="round"/>
              <circle cx="12" cy="14" r="4" fill="url(#logoGradient)"/>
            </svg>
          </div>
          <span className="text-[19px] font-bold text-slate-900 tracking-tight leading-none">TuringArena</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="px-6 py-2 rounded-full bg-gray-900 text-white text-[13px] font-medium hover:bg-gray-800 transition-colors">
            登录
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-[36px] font-extrabold text-gray-900 mb-4 tracking-tight">联系我们</h1>
          <p className="text-[15px] text-gray-500">有好的想法或需要帮助？请告诉我们 —— 我们非常期待收到您的反馈，并为您提供支持。</p>
        </div>

        <div className="border-t border-gray-200 mb-12 w-full max-w-3xl mx-auto opacity-50"></div>

        <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-8">
          {/* Issue Type */}
          <div className="space-y-2">
            <label className="block text-[13px] font-medium text-gray-700">
              <span className="text-red-500 mr-1">*</span>问题类型
            </label>
            <div className="relative" ref={dropdownRef}>
              <div 
                className={`w-full bg-white border ${isDropdownOpen ? 'border-indigo-500 ring-4 ring-indigo-500/10' : 'border-gray-200 hover:border-gray-300'} shadow-sm rounded-xl px-4 py-3.5 text-[14px] ${!issueType ? 'text-gray-400' : 'text-gray-900'} transition-all cursor-pointer flex items-center justify-between select-none`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span>{issueType ? issueTypeOptions.find(opt => opt.value === issueType)?.label : '==== 请选择问题类型 ===='}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
              
              {isDropdownOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-gray-100 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.15)] rounded-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 py-1.5">
                  <div className="px-3 py-2 text-[12px] text-gray-400 font-medium tracking-wider mb-1 px-4">
                    请选择问题类型
                  </div>
                  {issueTypeOptions.map((opt) => (
                    <div 
                      key={opt.value}
                      className={`mx-2 px-3 py-2.5 rounded-lg text-[14px] cursor-pointer transition-all flex items-center justify-between ${issueType === opt.value ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                      onClick={() => {
                        setIssueType(opt.value);
                        setIsDropdownOpen(false);
                      }}
                    >
                      {opt.label}
                      {issueType === opt.value && <Check className="w-4 h-4 text-indigo-600" />}
                    </div>
                  ))}
                </div>
              )}

              {/* Hidden native select for form validation */}
              <select 
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="hidden"
                required
              >
                <option value="" disabled>==== 请选择问题类型 ====</option>
                <option value="bug">问题反馈 / Bug</option>
                <option value="feature">功能建议</option>
                <option value="account">账号问题</option>
                <option value="other">其他</option>
              </select>
            </div>
          </div>

          {/* Issue Title */}
          <div className="space-y-2">
            <label className="block text-[13px] font-medium text-gray-700">
              <span className="text-red-500 mr-1">*</span>反馈标题
            </label>
            <input 
              type="text" 
              className="w-full bg-white border border-gray-200 shadow-sm hover:border-gray-300 rounded-xl px-4 py-3.5 text-[14px] text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
              required
            />
          </div>

          {/* Details */}
          <div className="space-y-2">
            <label className="block text-[13px] font-medium text-gray-700">
              <span className="text-red-500 mr-1">*</span>详细描述
            </label>
            <textarea 
              rows={5}
              placeholder="请详细描述您遇到的问题或建议..."
              className="w-full bg-white border border-gray-200 shadow-sm hover:border-gray-300 rounded-xl px-4 py-3.5 text-[14px] text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-y min-h-[120px]"
              required
            ></textarea>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="block text-[13px] font-medium text-gray-700">
              <span className="text-red-500 mr-1">*</span>联系邮箱
            </label>
            <input 
              type="email" 
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-gray-200 shadow-sm hover:border-gray-300 rounded-xl px-4 py-3.5 text-[14px] text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
              required
            />
          </div>

          {/* Upload */}
          <div className="space-y-2">
            <label className="flex items-center gap-1 text-[13px] font-medium text-gray-700">
              上传截图 <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
            </label>
            <div className="w-20 h-20 bg-[#f8f9fa] border border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition-all group">
              <Upload className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
          </div>

          {/* Verification placeholder */}
          {submitted ? (
            <div className="flex items-center justify-between p-4 border border-green-200 bg-green-50 rounded-xl">
              <div className="flex items-center gap-2 text-green-700 font-medium text-sm">
                <CheckCircle className="w-5 h-5 text-green-500" />
                提交成功！
              </div>
            </div>
          ) : (
             <div className="flex items-center justify-between p-4 border border-gray-200 bg-white rounded-xl">
              <div className="flex items-center gap-2 text-gray-700 font-medium text-sm">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
                安全验证中...
              </div>
              <div className="text-[10px] text-gray-400 text-right">
                <div className="font-bold text-gray-500 mb-0.5">CLOUDFLARE</div>
                <a href="#" className="hover:underline">隐私协议</a> • <a href="#" className="hover:underline">使用条款</a>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit"
            className="w-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-medium py-3.5 rounded-xl transition-colors shadow-sm"
          >
            提交反馈
          </button>

          {/* Footer Text */}
          <p className="text-[13px] text-gray-500 leading-relaxed pt-2">
            由于收到的反馈较多，我们可能需要 1-3 个工作日来回复您。如果您需要更快的帮助，可以直接发送邮件至 <a href="mailto:care@turingarena.ai" className="text-gray-900 hover:underline">care@turingarena.ai</a>。感谢您的耐心与支持。
          </p>
        </form>
      </main>
      
      {/* Dark Footer Bar */}
      <div className="h-16 bg-[#0f172a] w-full mt-24"></div>
    </div>
  );
};
