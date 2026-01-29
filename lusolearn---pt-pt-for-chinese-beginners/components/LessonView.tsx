
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
  
  // 用于配对练习的状态
  const [pairingSelectedPT, setPairingSelectedPT] = useState<string | null>(null);
  const [pairingSelectedCN, setPairingSelectedCN] = useState<string | null>(null);
  const [pairingMatched, setPairingMatched] = useState<Set<string>>(new Set());

  // 生成循环训练练习队列
  const drills = useMemo(() => {
    const queue: Drill[] = [];

    // 1. 场景导入
    queue.push({ type: 'INTRO', explanation: lesson.situation });

    // 2. 词汇初见与配对 (记忆第一层)
    queue.push({ 
      type: 'PAIRING', 
      pairingData: lesson.vocabulary.slice(0, 4).map(v => ({ pt: v.pt, cn: v.cn }))
    });

    // 3. 句子训练循环 (记忆第二层)
    lesson.dialogue.forEach(line => {
      // 听力与展示
      queue.push({ type: 'INTRO', pt: line.text, cn: line.translation, speaker: line.speaker });
      // 乱序拼句 (Word Bank)
      queue.push({
        type: 'SCRAMBLE',
        pt: line.text,
        cn: line.translation,
        correctAnswer: line.text,
        options: line.text.split(' ').sort(() => Math.random() - 0.5)
      });
    });

    // 4. 单词深度强化 (记忆第三层：反向选择)
    lesson.vocabulary.forEach(v => {
      queue.push({
        type: 'CHOICE',
        pt: v.pt,
        cn: v.cn,
        correctAnswer: v.cn,
        options: [v.cn, ...lesson.vocabulary.filter(x => x.cn !== v.cn).slice(0, 2).map(x => x.cn)].sort(() => Math.random() - 0.5)
      });
    });

    // 5. 语法与文化提示 (针对欧葡差异)
    queue.push({ type: 'INTRO', pt: lesson.grammar.point, explanation: lesson.grammar.explanation, cn: lesson.grammar.example });

    // 6. 综合测试
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

  // 配对逻辑处理
  useEffect(() => {
    if (pairingSelectedPT && pairingSelectedCN) {
      const match = currentDrill.pairingData?.find(d => d.pt === pairingSelectedPT && d.cn === pairingSelectedCN);
      if (match) {
        setPairingMatched(prev => new Set(prev).add(pairingSelectedPT));
      }
      // 延迟清除选中状态，让用户看到反馈
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
      correct = scrambledSelected.join(' ') === currentDrill.correctAnswer;
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
      {/* ProgressBar */}
      <div className="p-4 flex items-center gap-4 border-b">
        <button onClick={onClose} className="text-slate-400 p-2">✕</button>
        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${((drillIndex + 1) / drills.length) * 100}%` }} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col">
        {/* INTRO TYPE */}
        {currentDrill.type === 'INTRO' && (
          <div className="animate-in slide-in-from-bottom duration-500 flex flex-col items-center text-center">
            <div className="text-6xl mb-6">💡</div>
            <h2 className="text-2xl font-black text-slate-800 mb-4">{currentDrill.pt || "注意地道欧葡用法"}</h2>
            <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 text-slate-600 font-bold mb-8">
              {currentDrill.explanation}
              {currentDrill.cn && <div className="mt-4 pt-4 border-t border-slate-200 text-blue-600 text-xl">{currentDrill.cn}</div>}
            </div>
            {currentDrill.pt && <AudioButton text={currentDrill.pt} size="lg" />}
          </div>
        )}

        {/* PAIRING TYPE */}
        {currentDrill.type === 'PAIRING' && (
          <div className="flex flex-col">
            <h2 className="text-xl font-extrabold text-slate-800 mb-8">配对单词，加强欧葡记忆：</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                {currentDrill.pairingData?.map(d => (
                  <button
                    key={d.pt}
                    disabled={pairingMatched.has(d.pt)}
                    onClick={() => setPairingSelectedPT(d.pt)}
                    className={`p-4 rounded-2xl border-2 border-b-4 font-bold transition-all ${
                      pairingMatched.has(d.pt) ? 'opacity-0 scale-90 pointer-events-none' :
                      pairingSelectedPT === d.pt ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-100 bg-white'
                    }`}
                  >
                    {d.pt}
                  </button>
                ))}
              </div>
              <div className="flex flex-col gap-3">
                {currentDrill.pairingData?.map(d => d.cn).sort().map(cn => (
                  <button
                    key={cn}
                    disabled={Array.from(pairingMatched).some(pt => currentDrill.pairingData?.find(x => x.pt === pt)?.cn === cn)}
                    onClick={() => setPairingSelectedCN(cn)}
                    className={`p-4 rounded-2xl border-2 border-b-4 font-bold transition-all ${
                      Array.from(pairingMatched).some(pt => currentDrill.pairingData?.find(x => x.pt === pt)?.cn === cn) ? 'opacity-0 scale-90 pointer-events-none' :
                      pairingSelectedCN === cn ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-100 bg-white'
                    }`}
                  >
                    {cn}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SCRAMBLE TYPE */}
        {currentDrill.type === 'SCRAMBLE' && (
          <div className="flex flex-col">
            <h2 className="text-xl font-black mb-4">拼出地道句子：</h2>
            <div className="flex items-center gap-4 mb-8">
              <AudioButton text={currentDrill.correctAnswer!} size="md" className="bg-blue-600 text-white" />
              <p className="text-slate-500 font-bold">{currentDrill.cn}</p>
            </div>
            <div className="min-h-[120px] border-b-2 border-dashed border-slate-200 flex flex-wrap gap-2 p-2 mb-8">
              {scrambledSelected.map((w, i) => (
                <button key={i} onClick={() => setScrambledSelected(prev => prev.filter((_, idx) => idx !== i))} className="px-4 py-2 bg-white border-2 border-b-4 rounded-xl font-bold">{w}</button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {currentDrill.options?.map((w, i) => (
                <button 
                  key={i} 
                  disabled={scrambledSelected.includes(w) && currentDrill.options?.filter(x => x === w).length === scrambledSelected.filter(x => x === w).length}
                  onClick={() => setScrambledSelected([...scrambledSelected, w])}
                  className={`px-4 py-2 bg-white border-2 border-b-4 rounded-xl font-bold transition-all ${scrambledSelected.includes(w) ? 'opacity-30' : 'hover:bg-slate-50'}`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CHOICE & QUIZ TYPE */}
        {(currentDrill.type === 'CHOICE' || currentDrill.type === 'QUIZ') && (
          <div className="flex flex-col">
            <h2 className="text-xl font-black mb-8">{currentDrill.pt || "选择正确翻译"}</h2>
            {currentDrill.type === 'CHOICE' && <div className="mb-8 flex justify-center"><AudioButton text={currentDrill.pt!} size="lg" /></div>}
            <div className="space-y-4">
              {currentDrill.options?.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedOption(opt)}
                  disabled={isFeedbackVisible}
                  className={`w-full p-6 text-left rounded-3xl border-2 border-b-8 font-bold text-lg transition-all ${selectedOption === opt ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 bg-white'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CHALLENGE TYPE */}
        {currentDrill.type === 'CHALLENGE' && (
          <div className="flex flex-col items-center text-center py-10">
            <div className="text-7xl mb-10 animate-bounce">🏆</div>
            <h2 className="text-3xl font-black text-slate-900 mb-6">今日收官挑战</h2>
            <div className="p-10 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-[3rem] shadow-2xl">
              <p className="text-xl font-bold leading-relaxed">{currentDrill.explanation}</p>
            </div>
          </div>
        )}
      </div>

      {/* FEEDBACK FOOTER */}
      <footer className={`p-6 border-t-2 transition-colors duration-300 ${isFeedbackVisible ? (isCorrect ? 'bg-green-100' : 'bg-red-100') : 'bg-white'}`}>
        <div className="max-w-xl mx-auto">
          {isFeedbackVisible && (
            <div className="mb-4 animate-in slide-in-from-bottom duration-200">
              <h3 className={`text-xl font-black ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>{isCorrect ? '太棒了!' : '差一点点!'}</h3>
              {!isCorrect && <p className="text-red-600 font-bold">正确答案: {currentDrill.correctAnswer}</p>}
            </div>
          )}
          
          <button
            onClick={isFeedbackVisible || isPairingComplete || currentDrill.type === 'INTRO' || currentDrill.type === 'CHALLENGE' ? handleContinue : handleCheck}
            disabled={!isFeedbackVisible && (currentDrill.type === 'CHOICE' || currentDrill.type === 'QUIZ') && !selectedOption || (currentDrill.type === 'SCRAMBLE' && scrambledSelected.length === 0)}
            className={`w-full py-5 rounded-2xl font-black text-xl border-b-8 active:border-b-0 active:translate-y-1 transition-all uppercase tracking-widest ${
              (currentDrill.type === 'CHOICE' || currentDrill.type === 'QUIZ') && !selectedOption && !isFeedbackVisible ? 'bg-slate-200 text-slate-400 border-slate-300' :
              isCorrect === false ? 'bg-red-500 text-white border-red-700' :
              isCorrect === true || isPairingComplete ? 'bg-green-500 text-white border-green-700' : 'bg-blue-500 text-white border-blue-700'
            }`}
          >
            {isFeedbackVisible || isPairingComplete || ['INTRO', 'CHALLENGE'].includes(currentDrill.type) ? '继续 (Continuar)' : '检查 (Verificar)'}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default LessonView;
