
import React, { useState, useEffect } from 'react';
import { AppScreen, UserProgress, LessonContent } from './types';
import { CURRICULUM, DAY_1_CONTENT } from './constants';
import { generateLesson } from './services/geminiService';
import LessonCard from './components/LessonCard';
import LessonView from './components/LessonView';

const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>(AppScreen.HOME);
  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('luso_progress');
    return saved ? JSON.parse(saved) : {
      completedLessons: [],
      currentLessonId: '1',
      streak: 0,
      lastLogin: new Date().toISOString()
    };
  });

  const [activeLesson, setActiveLesson] = useState<LessonContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('luso_progress', JSON.stringify(progress));
  }, [progress]);

  const handleOpenKeySelector = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setErrorInfo(null); // 重置错误状态
      alert("API Key 已更新，请重新开始课程。");
    } else {
      alert("当前环境不支持选择 API Key，请检查环境变量配置。");
    }
  };

  const handleLessonStart = async (lessonId: string, title: string, chineseTitle: string) => {
    if (lessonId === '1') {
      setActiveLesson(DAY_1_CONTENT);
      setScreen(AppScreen.LESSON);
      return;
    }

    setIsLoading(true);
    setErrorInfo(null);
    try {
      const topic = `第 ${lessonId} 天课程: ${title} (${chineseTitle})`;
      const content = await generateLesson(topic);
      setActiveLesson(content);
      setScreen(AppScreen.LESSON);
    } catch (err: any) {
      console.error(err);
      const msg = err.message || "";
      if (msg.includes("401") || msg.includes("403") || msg.includes("not found")) {
        setErrorInfo("API Key 验证失败或未配置。请点击下方按钮重新选择付费项目中的 API Key。");
      } else {
        setErrorInfo("生成课程失败，请稍后重试。");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLessonComplete = () => {
    if (!activeLesson) return;
    
    setProgress(prev => {
      const isNew = !prev.completedLessons.includes(activeLesson.id);
      const newCompleted = isNew ? [...prev.completedLessons, activeLesson.id] : prev.completedLessons;
      const today = new Date().toDateString();
      const last = new Date(prev.lastLogin).toDateString();
      const newStreak = last === today ? prev.streak : prev.streak + 1;

      return {
        ...prev,
        completedLessons: newCompleted,
        streak: newStreak,
        lastLogin: new Date().toISOString()
      };
    });
    
    setScreen(AppScreen.HOME);
    setActiveLesson(null);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      {/* 顶部状态栏 */}
      <header className="w-full max-w-xl sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b-2 border-slate-100 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-orange-500 font-extrabold">
            <span className="text-xl">🔥</span>
            <span>{progress.streak}</span>
          </div>
          <div className="flex items-center gap-1.5 text-blue-500 font-extrabold">
            <span className="text-xl">💎</span>
            <span>{progress.completedLessons.length * 10}</span>
          </div>
        </div>
        <button 
          onClick={handleOpenKeySelector}
          className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200 hover:bg-slate-200 transition-colors"
        >
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">设置 Key</span>
           <div className="w-4 h-3 bg-gradient-to-r from-green-600 via-red-600 to-yellow-400 rounded-sm"></div>
        </button>
      </header>

      {screen === AppScreen.HOME && (
        <main className="w-full max-w-xl flex-1 p-6 pb-24">
          {errorInfo && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-100 rounded-2xl animate-in fade-in zoom-in duration-300">
               <p className="text-red-700 text-sm font-bold mb-3">⚠️ {errorInfo}</p>
               <button 
                 onClick={handleOpenKeySelector}
                 className="w-full py-2 bg-red-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-100"
               >
                 重新配置 API Key
               </button>
               <p className="mt-2 text-[10px] text-red-400 text-center">
                 请确保选择了一个开启了结算账户的 Google Cloud 项目。
                 <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline ml-1">查看账单文档</a>
               </p>
            </div>
          )}

          {/* 路径布局 */}
          <div className="flex flex-col items-center space-y-12 py-8">
            {CURRICULUM.map((lesson, index) => {
              const isCompleted = progress.completedLessons.includes(lesson.id);
              const isLocked = index > 0 && !progress.completedLessons.includes(CURRICULUM[index-1].id);
              const isCurrent = !isCompleted && !isLocked;
              
              const offsetClass = index % 3 === 0 ? '' : index % 3 === 1 ? 'translate-x-12' : '-translate-x-12';

              return (
                <div key={lesson.id} className={`relative flex flex-col items-center transition-all duration-500 ${offsetClass}`}>
                  <LessonCard
                    {...lesson}
                    isLocked={isLocked}
                    isCompleted={isCompleted}
                    isCurrent={isCurrent}
                    onClick={() => handleLessonStart(lesson.id, lesson.title, lesson.chineseTitle)}
                  />
                  
                  {index < CURRICULUM.length - 1 && (
                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-2 h-12 bg-slate-100 -z-10 rounded-full">
                      <div className={`h-full transition-all duration-1000 ${isCompleted ? 'bg-blue-400' : 'bg-slate-100'}`} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </main>
      )}

      {screen === AppScreen.LESSON && activeLesson && (
        <div className="fixed inset-0 bg-white z-50">
          <LessonView 
            lesson={activeLesson} 
            onComplete={handleLessonComplete}
            onClose={() => setScreen(AppScreen.HOME)}
          />
        </div>
      )}

      {/* 底部导航 */}
      {screen === AppScreen.HOME && (
        <nav className="fixed bottom-0 w-full max-w-xl bg-white border-t-2 border-slate-100 p-4 flex justify-around safe-bottom">
          <button className="flex flex-col items-center text-blue-500">
            <div className="p-2 bg-blue-50 rounded-2xl mb-1">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
            </div>
            <span className="text-[10px] font-black uppercase">课程</span>
          </button>
          <button className="flex flex-col items-center text-slate-400 opacity-50">
            <div className="p-2 rounded-2xl mb-1">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <span className="text-[10px] font-black uppercase">复习</span>
          </button>
          <button className="flex flex-col items-center text-slate-400 opacity-50">
            <div className="p-2 rounded-2xl mb-1">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <span className="text-[10px] font-black uppercase">我的</span>
          </button>
        </nav>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center p-8">
           <div className="w-24 h-24 relative mb-8">
             <div className="absolute inset-0 border-8 border-slate-100 rounded-full"></div>
             <div className="absolute inset-0 border-8 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
             <div className="absolute inset-0 flex items-center justify-center text-2xl">🦉</div>
           </div>
           <h2 className="text-xl font-black text-slate-900 mb-2 italic">正在生成欧葡关卡...</h2>
           <p className="text-slate-400 text-sm">正在向 Gemini 请求 PT-PT 教学资源</p>
        </div>
      )}
    </div>
  );
};

export default App;
