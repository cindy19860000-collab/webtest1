
import React, { useState, useMemo, useEffect } from 'react';
import { LessonContent } from '../types';
import AudioButton from './AudioButton';

type DrillType = 'INTRO' | 'PAIRING' | 'CHOICE' | 'SCRAMBLE' | 'QUIZ' | 'CHALLENGE';

interface Drill {
  type: DrillType;
  pt?: string;
  cn?: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  speaker?: string;
  pairingData?: { pt: string; cn: string }[];
}

const LessonView: React.FC<{ lesson: LessonContent; onComplete: () => void; onClose: () => void }> = ({ lesson, onComplete, onClose }) => {
  const [drillIndex, setDrillIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [scrambledSelected, setScrambledSelected] = useState<string[]>([]);
  const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  const [pairingSelectedPT, setPairingSelectedPT] = useState<string | null>(null);
  const [pairingSelectedCN, setPairingSelectedCN] = useState<string | null>(null);
  const [pairingMatched, setPairingMatched] = useState<Set<string>>(new Set());

  // 这里的核心设计：每一课的内容都会被拆解并重新洗牌，确保用户在一次 Session 中看到同一个词 3-5 次
  const drills = useMemo(() => {
    const queue: Drill[] = [];

    // 1. 场景氛围导入
    queue.push({ type: 'INTRO', explanation: lesson.situation });

    // 2. 词汇配对练习 (初步建立联系)
    queue.push({ 
      type: 'PAIRING', 
      pairingData: lesson.vocabulary.slice(0, 4).map(v => ({ pt: v.pt, cn: v.cn }))
    });

    // 3. 核心对话句子的“三步走”强化
    lesson.dialogue.forEach(line => {
      // Step A: 听力呈现
      queue.push({ type: 'INTRO', pt: line.text, cn: line.translation, speaker: line.speaker });
      
      // Step B: 乱序拼句 (记忆语序)
      queue.push({
        type: 'SCRAMBLE',
        pt: line.text,
        cn: line.translation,
        correctAnswer: line.text,
        options: line.text.split(' ').sort(() => Math.random() - 0.5)
      });
      
      // Step C: 听力辨析 (记忆发音)
      queue.push({
        type: 'CHOICE',
        pt: line.text,
        cn: line.translation,
        correctAnswer: line.translation,
        options: [line.translation, ...lesson.dialogue.filter(x => x.translation !== line.translation).map(x => x.translation)].slice(0, 3).sort(() => Math.random() - 0.5)
      });
    });

    // 4. 单词深度强化
    lesson.vocabulary.slice(0, 3).forEach(v => {
      queue.push({
        type: 'CHOICE',
        pt: v.pt,
        cn: v.cn,
        correctAnswer: v.cn,
        options: [v.cn, ...lesson.vocabulary.filter(x => x.cn !== v.cn).map(x => x.cn)].slice(0, 3).sort(() => Math.random() - 0.5)
      });
    });

    // 5. 欧葡语法重点
    queue.push({ type: 'INTRO', pt: lesson.grammar.point, explanation: lesson.grammar.explanation, cn: lesson.grammar.example });

    // 6. 综合测试与挑战
    lesson.quiz.forEach(q => {
      queue.push({
        type: 'QUIZ',
        pt: q.question,
        options: q.options,
        correctAnswer: q.options[q.correctIndex],
        explanation: q.explanation
      });
    });

    queue.push({ type: 'CHALLENGE', explanation: lesson.challenge });
    return queue;
  }, [lesson]);

  const currentDrill = drills[drillIndex];

  useEffect(() => {
    if (pairingSelectedPT && pairingSelectedCN) {
      const match = currentDrill.pairingData?.find(d => d.pt === pairingSelectedPT && d.cn === pairingSelectedCN);
      if (match) {
        setPairingMatched(prev => new Set(prev).add(pairingSelectedPT));
      }
      setTimeout(() => {
        setPairingSelectedPT(null);
        setPairingSelectedCN(null);
      }, 300);
    }
  }, [pairingSelectedPT, pairingSelectedCN]);

  const handleCheck = () => {
    let correct = false;
    if (currentDrill.type === 'CHOICE' || currentDrill.type === 'QUIZ') {
      correct = selectedOption === currentDrill.correctAnswer;
    } else if (currentDrill.type === 'SCRAMBLE') {
      // 拼句检查：忽略标点差异（如果需要更严格可以去掉）
      const normalizedInput = scrambledSelected.join(' ').replace(/[.?!,]/g, '');
      const normalizedTarget = currentDrill.correctAnswer!.replace(/[.?!,]/g, '');
      correct = normalizedInput === normalizedTarget;
    }
    setIsCorrect(correct);
    setIsFeedbackVisible(true);
  };

  const handleContinue = () => {
    if (drillIndex < drills.length - 1) {
      setDrillIndex(drillIndex + 1);
      resetDrillState();
    } else {
      onComplete();
    }
  };

  const resetDrillState = () => {
    setSelectedOption(null);
    setScrambledSelected([]);
    setIsFeedbackVisible(false);
    setIsCorrect(null);
    setPairingSelectedPT(null);
    setPairingSelectedCN(null);
    setPairingMatched(new Set());
  };

  const isPairingComplete = currentDrill.type === 'PAIRING' && pairingMatched.size === (currentDrill.pairingData?.length || 0);

  return (
    <div className="flex flex-col h-full bg-white select-none">
      {/* 顶部导航与进度 */}
      <div className="p-4 flex items-center gap-4">
        <button onClick={onClose} className="text-slate-400 p-2 hover:bg-slate-50 rounded-full">✕</button>
        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${((drillIndex + 1) / drills.length) * 100}%` }} />
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-500 rounded-full font-black text-xs">
           <span>❤️</span><span>5</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col">
        {/* 不同的练习类型渲染 */}
        {currentDrill.type === 'INTRO' && (
          <div className="flex flex-col items-center text-center py-8 animate-in slide-in-from-bottom duration-500">
            <div className="text-6xl mb-6 drop-shadow-sm">💡</div>
            <h2 className="text-2xl font-black text-slate-800 mb-6">{currentDrill.pt || "欧葡重点提示"}</h2>
            <div className="w-full bg-slate-50 p-8 rounded-[2rem] border-2 border-slate-100 shadow-sm">
              <p className="text-slate-600 font-bold leading-relaxed">{currentDrill.explanation}</p>
              {currentDrill.cn && (
                <div className="mt-6 pt-6 border-t-2 border-slate-200">
                  <p className="text-blue-600 font-black text-2xl">{currentDrill.cn}</p>
                </div>
              )}
            </div>
            {currentDrill.pt && (
              <div className="mt-10 flex flex-col items-center">
                <AudioButton text={currentDrill.pt} size="lg" className="bg-blue-600 text-white shadow-xl shadow-blue-100" />
                <span className="mt-4 text-xs font-black text-slate-400 uppercase tracking-widest">点击听发音</span>
              </div>
            )}
          </div>
        )}

        {currentDrill.type === 'PAIRING' && (
          <div className="flex flex-col py-4">
            <h2 className="text-xl font-black text-slate-800 mb-8">配对单词，开始欧葡初体验：</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                {currentDrill.pairingData?.map(d => (
                  <button
                    key={d.pt}
                    disabled={pairingMatched.has(d.pt)}
                    onClick={() => setPairingSelectedPT(d.pt)}
                    className={`w-full p-4 rounded-2xl border-2 border-b-4 font-black transition-all text-sm h-16 ${
                      pairingMatched.has(d.pt) ? 'opacity-0 scale-90 pointer-events-none' :
                      pairingSelectedPT === d.pt ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    {d.pt}
                  </button>
                ))}
              </div>
              <div className="space-y-3">
                {currentDrill.pairingData?.map(d => d.cn).sort().map(cn => (
                  <button
                    key={cn}
                    disabled={Array.from(pairingMatched).some(pt => currentDrill.pairingData?.find(x => x.pt === pt)?.cn === cn)}
                    onClick={() => setPairingSelectedCN(cn)}
                    className={`w-full p-4 rounded-2xl border-2 border-b-4 font-black transition-all text-sm h-16 ${
                      Array.from(pairingMatched).some(pt => currentDrill.pairingData?.find(x => x.pt === pt)?.cn === cn) ? 'opacity-0 scale-90 pointer-events-none' :
                      pairingSelectedCN === cn ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    {cn}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentDrill.type === 'SCRAMBLE' && (
          <div className="flex flex-col py-4">
            <h2 className="text-xl font-black mb-4">听音拼句 (地道欧葡语序)：</h2>
            <div className="flex items-center gap-4 mb-8">
              <AudioButton text={currentDrill.correctAnswer!} size="md" className="bg-blue-600 text-white" />
              <p className="text-slate-500 font-bold italic">"{currentDrill.cn}"</p>
            </div>
            {/* 句子槽位 */}
            <div className="min-h-[140px] border-b-2 border-dashed border-slate-200 flex flex-wrap gap-2 p-3 mb-10 items-start">
              {scrambledSelected.map((w, i) => (
                <button 
                  key={i} 
                  onClick={() => setScrambledSelected(prev => prev.filter((_, idx) => idx !== i))}
                  className="px-4 py-2 bg-white border-2 border-b-4 border-slate-300 rounded-xl font-black text-slate-700 animate-in zoom-in-75 duration-200"
                >
                  {w}
                </button>
              ))}
            </div>
            {/* 单词库 */}
            <div className="flex flex-wrap gap-2 justify-center">
              {currentDrill.options?.map((w, i) => {
                const isSelected = scrambledSelected.includes(w) && scrambledSelected.filter(x => x === w).length >= currentDrill.options!.filter(x => x === w).length;
                return (
                  <button 
                    key={i} 
                    disabled={isSelected || isFeedbackVisible}
                    onClick={() => setScrambledSelected([...scrambledSelected, w])}
                    className={`px-5 py-3 rounded-2xl font-black text-lg border-2 border-b-4 transition-all ${
                      isSelected ? 'bg-slate-100 border-slate-100 text-transparent pointer-events-none' : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 active:border-b-0 active:translate-y-1'
                    }`}
                  >
                    {w}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {(currentDrill.type === 'CHOICE' || currentDrill.type === 'QUIZ') && (
          <div className="flex flex-col py-4">
            <h2 className="text-xl font-black mb-8">{currentDrill.pt || "请选择正确的答案："}</h2>
            {currentDrill.type === 'CHOICE' && (
              <div className="mb-10 flex justify-center scale-110">
                <div className="bg-blue-50 p-6 rounded-[2rem] border-2 border-blue-100 flex items-center gap-4">
                  <AudioButton text={currentDrill.pt!} size="lg" />
                  <span className="text-2xl font-black text-blue-900">{currentDrill.pt}</span>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 gap-4">
              {currentDrill.options?.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedOption(opt)}
                  disabled={isFeedbackVisible}
                  className={`p-6 text-left rounded-3xl border-2 border-b-8 font-black text-lg transition-all ${
                    selectedOption === opt 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="inline-block w-8 h-8 rounded-lg bg-slate-100 text-center leading-8 mr-4 text-sm font-black text-slate-400 opacity-50">{i+1}</span>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {currentDrill.type === 'CHALLENGE' && (
          <div className="flex flex-col items-center text-center py-10">
            <div className="text-8xl mb-12 animate-bounce">🥇</div>
            <h2 className="text-3xl font-black text-slate-900 mb-6">恭喜完成今日训练！</h2>
            <div className="p-10 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-[3rem] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl font-black">PT-PT</div>
              <p className="text-xs font-black uppercase tracking-[0.2em] mb-4 opacity-70">最后的一个小挑战</p>
              <p className="text-2xl font-black leading-tight">"{currentDrill.explanation}"</p>
            </div>
            <p className="mt-10 text-slate-400 font-bold">明天见，继续保持火热状态！🔥</p>
          </div>
        )}
      </div>

      {/* 底部反馈面板 */}
      <footer className={`p-6 border-t-2 transition-all duration-300 safe-bottom ${
        isFeedbackVisible 
          ? isCorrect ? 'bg-green-100 border-green-200' : 'bg-red-100 border-red-200'
          : 'bg-white border-slate-100'
      }`}>
        <div className="max-w-xl mx-auto">
          {isFeedbackVisible && (
            <div className="mb-6 animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center gap-4 mb-2">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-white shadow-sm`}>
                  {isCorrect ? '✨' : '⚠️'}
                </div>
                <h3 className={`text-xl font-black ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                  {isCorrect ? '非常出色!' : '还没完全掌握?'}
                </h3>
              </div>
              <p className={`text-sm font-black ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {isCorrect ? '你的欧葡语感正在飞速提升。' : `正确答案是: ${currentDrill.correctAnswer}`}
              </p>
              {currentDrill.explanation && !isCorrect && (
                <div className="mt-3 p-3 bg-white/50 rounded-xl text-xs text-red-800 font-medium">
                  💡 {currentDrill.explanation}
                </div>
              )}
            </div>
          )}
          
          <button
            onClick={isFeedbackVisible || isPairingComplete || currentDrill.type === 'INTRO' || currentDrill.type === 'CHALLENGE' ? handleContinue : handleCheck}
            disabled={!isFeedbackVisible && (
              ((currentDrill.type === 'CHOICE' || currentDrill.type === 'QUIZ') && !selectedOption) ||
              (currentDrill.type === 'SCRAMBLE' && scrambledSelected.length === 0)
            )}
            className={`w-full py-5 rounded-[1.5rem] font-black text-xl shadow-xl border-b-8 active:border-b-0 active:translate-y-2 transition-all uppercase tracking-widest ${
              !isFeedbackVisible && (((currentDrill.type === 'CHOICE' || currentDrill.type === 'QUIZ') && !selectedOption) || (currentDrill.type === 'SCRAMBLE' && scrambledSelected.length === 0))
                ? 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed shadow-none border-b-2 translate-y-1'
                : isFeedbackVisible 
                  ? isCorrect ? 'bg-green-500 border-green-700 text-white shadow-green-200' : 'bg-red-500 border-red-700 text-white shadow-red-200'
                  : isPairingComplete ? 'bg-green-500 border-green-700 text-white' : 'bg-blue-500 border-blue-700 text-white hover:bg-blue-600'
            }`}
          >
            {isFeedbackVisible || isPairingComplete || ['INTRO', 'CHALLENGE'].includes(currentDrill.type) ? '继续前进' : '检查答案'}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default LessonView;
