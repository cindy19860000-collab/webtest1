
import React from 'react';

interface LessonCardProps {
  id: string;
  title: string;
  chineseTitle: string;
  icon: string;
  theme: string;
  isLocked: boolean;
  isCompleted: boolean;
  isCurrent: boolean;
  onClick: () => void;
}

const LessonCard: React.FC<LessonCardProps> = ({ id, title, icon, isLocked, isCompleted, isCurrent, onClick }) => {
  return (
    <div className="flex flex-col items-center group">
      {/* 关卡名称气泡 - 仅对当前关卡显示 */}
      {isCurrent && (
        <div className="absolute -top-12 bg-blue-500 text-white px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap animate-bounce shadow-lg shadow-blue-200 z-10">
          开始吧!
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-500 rotate-45"></div>
        </div>
      )}

      <button 
        onClick={isLocked ? undefined : onClick}
        className={`relative w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all duration-300 border-b-8 active:border-b-0 active:translate-y-2 ${
          isLocked 
            ? 'bg-slate-200 border-slate-300 opacity-50 cursor-not-allowed' 
            : isCompleted
              ? 'bg-yellow-400 border-yellow-600 text-yellow-900'
              : isCurrent
                ? 'bg-blue-500 border-blue-700 text-white shadow-xl shadow-blue-200 animate-pulse'
                : 'bg-white border-slate-200 text-slate-700'
        }`}
      >
        {isLocked ? '🔒' : isCompleted ? '⭐' : icon}
      </button>

      {/* 课程标题 */}
      <div className={`mt-3 text-center transition-all ${isLocked ? 'text-slate-300' : 'text-slate-800'}`}>
        <div className="text-[10px] font-black uppercase tracking-tighter opacity-50">第 {id} 关</div>
        <div className="text-sm font-extrabold max-w-[100px] leading-tight">{title}</div>
      </div>
    </div>
  );
};

export default LessonCard;
