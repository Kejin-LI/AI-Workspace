import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Brain, Code, Zap, Globe, Cpu, Languages, X, Lock } from 'lucide-react';
import { cn } from '../lib/utils';
import { useLanguage } from '../contexts/LanguageContext';

export function LandingPage() {
  const navigate = useNavigate();
  const { t, language, toggleLanguage } = useLanguage();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleExpertClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (localStorage.getItem('admin_authenticated') === 'true') {
      navigate('/expert/workbench');
    } else {
      setShowPasswordModal(true);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError('');

    try {
      const res = await fetch('/api/verify-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem('admin_authenticated', 'true');
        setShowPasswordModal(false);
        navigate('/expert/workbench');
      } else {
        setError(data.error || '密码错误');
      }
    } catch (err) {
      setError('网络错误，请稍后再试');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-foreground overflow-hidden font-sans selection:bg-lab-yellow selection:text-black">
      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">访问受限</h3>
              </div>
              <button 
                onClick={() => {
                  setShowPasswordModal(false);
                  setPassword('');
                  setError('');
                }} 
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleVerify} className="p-6 space-y-4">
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                🤫 嘘... 你是来打探商业机密的吗？<br />
                当前为内部测试 Demo 阶段，仅对受邀专家开放。<br />
                如有需要请联系：<a href="mailto:likejin2019@gmail.com" className="text-blue-600 hover:underline">likejin2019@gmail.com</a>
              </p>
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="请输入密码"
                  className={cn(
                    "w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm focus:outline-none transition-colors",
                    error ? "border-red-300 focus:ring-2 focus:ring-red-100" : "border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                  )}
                  autoFocus
                />
                {error && (
                  <p className="text-xs text-red-500 mt-2 font-medium">{error}</p>
                )}
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!password.trim() || isVerifying}
                  className="w-full py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isVerifying ? (
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    '验证并进入'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex justify-between items-center backdrop-blur-xl bg-white/50 border-b border-white/20">
        <div className="flex items-center gap-2 cursor-pointer group/logo">
          <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center shadow-lg shadow-black/20 shrink-0 relative overflow-hidden group-hover/logo:scale-[1.05] group-hover/logo:rotate-3 transition-all duration-300">
            <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4L4 18H20L12 4Z" stroke="white" strokeWidth="2.5" strokeLinejoin="round"/>
              <circle cx="12" cy="13" r="3.5" fill="#3B82F6"/>
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight">{t.common.appName}</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border border-gray-200 hover:bg-gray-50 transition-colors mr-2"
          >
            <Languages className="w-3.5 h-3.5" />
            {language === 'zh' ? 'English' : '中文'}
          </button>
          <button className="px-6 py-2.5 rounded-full bg-black text-white text-sm font-bold hover:scale-105 transition-all shadow-lg shadow-black/20">
            {t.common.login}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden w-full">
        
        {/* Full-width Dynamic Vibrant Background */}
        <div className="absolute inset-0 w-full h-full pointer-events-none bg-white">
          <div className="absolute top-[-20%] right-[-10%] w-[70vw] h-[70vw] bg-gradient-to-bl from-purple-600/10 via-pink-500/10 to-transparent blur-[120px] rounded-full mix-blend-multiply animate-pulse"></div>
          <div className="absolute bottom-[-10%] left-[-20%] w-[80vw] h-[80vw] bg-gradient-to-tr from-blue-600/10 to-purple-600/10 blur-[120px] rounded-full mix-blend-multiply"></div>
          <div className="absolute top-[20%] left-[30%] w-[40vw] h-[40vw] bg-pink-400/5 blur-[100px] rounded-full mix-blend-multiply animate-float"></div>
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-cover"></div>
        </div>

        <div className="relative z-10 w-full px-4 md:px-8 max-w-[1440px] mx-auto flex flex-col items-center mt-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-100 border border-gray-200 shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="w-3.5 h-3.5 text-gray-600 fill-current" />
            <span className="text-[10px] font-bold text-gray-600 tracking-wide uppercase">{t.landing.badge}</span>
          </div>

          <h1 className="relative z-10 text-6xl sm:text-7xl md:text-8xl font-display font-black leading-[1.1] tracking-tighter mb-8 w-full drop-shadow-sm max-w-5xl mx-auto text-black">
            {t.landing.hero.line1} <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
              {t.landing.hero.line2}
            </span> <br className="hidden sm:block" />
            {t.landing.hero.line3} <span className="relative inline-block text-black mt-1 sm:mt-0">
              {t.landing.hero.line4}
              <svg className="absolute w-[105%] h-3 sm:h-4 -bottom-1 -left-1 text-purple-500 z-[-1]" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 15 100 5" stroke="currentColor" strokeWidth="8" fill="none" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          <p className="relative z-10 text-base sm:text-lg text-gray-500 max-w-2xl mb-12 leading-relaxed px-4 font-medium">
            {t.landing.hero.desc} 
            <br />
            <span className="text-black font-bold relative inline-block mx-1">
               {t.landing.hero.descBold1}
            </span>
            <span className="mx-1">，</span>
            <span className="text-black font-bold relative inline-block mx-1">
               {t.landing.hero.descBold2}
            </span>{t.landing.hero.descEnd}
          </p>

          <div className="relative z-30 flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 mb-20">
            <button 
              onClick={handleExpertClick}
              className="group px-8 py-4 bg-black text-white rounded-full text-sm font-bold hover:scale-105 transition-all shadow-xl shadow-black/20 flex items-center justify-center gap-2"
            >
              {t.landing.hero.ctaExpert}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <div className="relative group/requester-btn inline-block">
              <button
                disabled
                className="w-full sm:w-auto px-8 py-4 bg-gray-200 text-gray-400 border border-transparent rounded-full text-sm font-bold flex items-center justify-center cursor-not-allowed"
              >
                {t.landing.hero.ctaRequester}
              </button>
              
              {/* Tooltip */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover/requester-btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                该模块正在紧锣密鼓地开发中，预期下周开放
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Marquee Banner */}
      <div className="w-full bg-black py-8 overflow-hidden -rotate-2 transform scale-105 shadow-2xl relative z-20 flex border-y-4 border-white mb-24">
        <div className="flex shrink-0 gap-20 animate-marquee whitespace-nowrap text-white font-display text-2xl font-black uppercase tracking-[0.2em] items-center pr-20">
          <span>{t.landing.marquee.rlhf}</span>
          <span>{t.landing.marquee.annotation}</span>
          <span>{t.landing.marquee.prompt}</span>
          <span>{t.landing.marquee.eval}</span>
          <span>RL</span>
          <span>{t.landing.marquee.rlhf}</span>
          <span>{t.landing.marquee.annotation}</span>
          <span>{t.landing.marquee.prompt}</span>
          <span>{t.landing.marquee.eval}</span>
          <span>RL</span>
        </div>
        <div className="flex shrink-0 gap-20 animate-marquee whitespace-nowrap text-white font-display text-2xl font-black uppercase tracking-[0.2em] items-center pr-20" aria-hidden="true">
          <span>{t.landing.marquee.rlhf}</span>
          <span>{t.landing.marquee.annotation}</span>
          <span>{t.landing.marquee.prompt}</span>
          <span>{t.landing.marquee.eval}</span>
          <span>RL</span>
          <span>{t.landing.marquee.rlhf}</span>
          <span>{t.landing.marquee.annotation}</span>
          <span>{t.landing.marquee.prompt}</span>
          <span>{t.landing.marquee.eval}</span>
          <span>RL</span>
        </div>
      </div>

      {/* Feature Bento Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-32">
        <h2 className="text-5xl font-display font-black mb-16 text-center tracking-tight text-black">
          {t.landing.features.title} <span className="relative inline-block">
            TuringArena
            <span className="absolute -top-6 -right-8 text-lab-yellow text-6xl animate-bounce">?</span>
          </span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-[340px]">
          {/* Card 1 */}
          <div className="md:col-span-2 bg-gray-50 rounded-[40px] p-10 relative overflow-hidden group hover:bg-white hover:shadow-2xl hover:shadow-lab-blue/10 transition-all duration-500 border border-transparent hover:border-lab-blue/20">
            <div className="absolute top-0 right-0 p-10">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-lg group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 text-black">
                <Brain className="w-10 h-10" />
              </div>
            </div>
            <div className="h-full flex flex-col justify-end relative z-10">
              <h3 className="text-4xl font-display font-bold mb-4 tracking-tight text-black">{t.landing.features.card1.title}</h3>
              <p className="text-gray-500 text-lg max-w-md font-medium leading-relaxed">{t.landing.features.card1.desc}</p>
            </div>
            <div className="absolute -top-20 -left-20 w-80 h-80 bg-lab-blue/20 rounded-full blur-[80px] group-hover:bg-lab-blue/30 transition-colors mix-blend-multiply"></div>
          </div>

          {/* Card 2 */}
          <div className="bg-black text-white rounded-[40px] p-10 flex flex-col justify-between group hover:shadow-2xl hover:shadow-lab-yellow/20 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 w-40 h-40 bg-lab-yellow/20 rounded-full blur-[60px]"></div>
            <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 text-white">
              <Zap className="w-7 h-7 text-lab-yellow fill-current" />
            </div>
            <div className="relative z-10">
              <div className="text-6xl font-display font-black mb-2 text-lab-yellow tracking-tighter">{t.landing.features.card2.val}</div>
              <div className="text-gray-400 font-bold text-lg">{t.landing.features.card2.desc}</div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-[#FFF0F0] rounded-[40px] p-10 flex flex-col justify-between group overflow-hidden hover:shadow-xl hover:shadow-lab-pink/20 transition-all duration-500 hover:-translate-y-2">
             <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-black">
              <Globe className="w-7 h-7" />
            </div>
            <div className="relative z-10">
              <h3 className="text-3xl font-display font-bold mb-2 text-black">{t.landing.features.card3.title}</h3>
              <p className="text-gray-600 font-medium">{t.landing.features.card3.desc}</p>
            </div>
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-lab-pink rounded-full blur-[60px] opacity-60 group-hover:scale-125 transition-transform duration-700"></div>
          </div>

          {/* Card 4 */}
          <div className="md:col-span-2 bg-white border-2 border-gray-100 rounded-[40px] p-10 relative overflow-hidden group hover:border-black transition-all duration-300 hover:shadow-2xl">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] bg-[radial-gradient(#000_2px,transparent_2px)] [background-size:24px_24px]"></div>
            
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center">
              <div className="inline-block px-5 py-2 bg-lab-green/10 text-lab-green-dark rounded-full text-sm font-black uppercase tracking-widest mb-6 border border-lab-green/20">
                {t.landing.features.card4.tag}
              </div>
              <h3 className="text-4xl font-display font-bold mb-6 tracking-tight text-black">{t.landing.features.card4.title}</h3>
              <p className="text-gray-500 text-lg max-w-lg font-medium leading-relaxed mb-8">
                {t.landing.features.card4.desc}
              </p>
              <button className="px-8 py-3 bg-black text-white rounded-full text-base font-bold hover:bg-lab-green hover:text-black hover:scale-105 transition-all shadow-lg text-white">
                {t.landing.features.card4.btn}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-16 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 md:px-8">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-8">
            
            {/* Brand Block */}
            <div className="lg:w-1/4 flex flex-col gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold font-display text-sm">TA</div>
                <span className="font-bold text-lg tracking-tight text-black">{t.common.appName}</span>
              </div>
              
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-black transition-colors"><span className="sr-only">Instagram</span><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth="2"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" strokeWidth="2"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2"/></svg></a>
                <a href="#" className="text-gray-400 hover:text-black transition-colors"><span className="sr-only">Twitter</span><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
                <a href="#" className="text-gray-400 hover:text-black transition-colors"><span className="sr-only">LinkedIn</span><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" strokeWidth="2"/><rect x="2" y="9" width="4" height="12" strokeWidth="2"/><circle cx="4" cy="4" r="2" strokeWidth="2"/></svg></a>
                <a href="#" className="text-gray-400 hover:text-black transition-colors"><span className="sr-only">Facebook</span><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" strokeWidth="2"/></svg></a>
                <a href="#" className="text-gray-400 hover:text-black transition-colors"><span className="sr-only">YouTube</span><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z" strokeWidth="2"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" strokeWidth="2"/></svg></a>
              </div>

              <div className="flex flex-col gap-4 mt-2">
                <button 
                  onClick={toggleLanguage}
                  className="w-fit flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <Languages className="w-4 h-4" />
                  {language === 'zh' ? '中文 (简体)' : 'English (US)'}
                  <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </button>
                <a href="#" className="text-xs text-gray-400 hover:text-gray-600 hover:underline w-fit">{t.landing.footer.cookieSettings}</a>
              </div>

              <div className="text-xs text-gray-400 mt-2">
                {t.landing.footer.copyright}
              </div>
            </div>

            {/* Links Columns */}
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-4">
              
              {/* Company */}
              <div className="flex flex-col gap-4">
                <h4 className="font-bold text-black">{t.landing.footer.columns.company.title}</h4>
                <ul className="flex flex-col gap-3">
                  {t.landing.footer.columns.company.links.map((link, i) => (
                    <li key={i}><a href="#" className="text-sm text-gray-500 hover:text-black transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>

              {/* Product */}
              <div className="flex flex-col gap-4">
                <h4 className="font-bold text-black">{t.landing.footer.columns.product.title}</h4>
                <ul className="flex flex-col gap-3">
                  {t.landing.footer.columns.product.links.map((link, i) => (
                    <li key={i}><a href="#" className="text-sm text-gray-500 hover:text-black transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              <div className="flex flex-col gap-4">
                <h4 className="font-bold text-black">{t.landing.footer.columns.resources.title}</h4>
                <ul className="flex flex-col gap-3">
                  {t.landing.footer.columns.resources.links.map((link, i) => (
                    <li key={i}><a href="#" className="text-sm text-gray-500 hover:text-black transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>

              {/* Use Cases */}
              <div className="flex flex-col gap-4">
                <h4 className="font-bold text-black">{t.landing.footer.columns.useCases.title}</h4>
                <ul className="flex flex-col gap-3">
                  {t.landing.footer.columns.useCases.links.map((link, i) => (
                    <li key={i}><a href="#" className="text-sm text-gray-500 hover:text-black transition-colors">{link}</a></li>
                  ))}
                </ul>
                
                <a href="#" className="mt-4 flex items-center gap-1 text-sm font-bold text-black hover:text-gray-600 transition-colors group">
                  {t.landing.footer.explore} 
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>

            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
