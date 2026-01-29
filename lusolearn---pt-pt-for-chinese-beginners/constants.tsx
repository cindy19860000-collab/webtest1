
import { LessonContent } from './types';

export const DAY_1_CONTENT: LessonContent = {
  id: "1",
  title: "Saudações Básicas",
  chineseTitle: "基础问候与欧葡口音",
  situation: "欢迎来到里斯本！葡萄牙欧葡的发音非常闭合，像是在耳语。我们先从最基础的问候开始。",
  dialogue: [
    {
      speaker: "Local",
      text: "Olá! Como está?",
      translation: "你好！您好吗？(正式)"
    },
    {
      speaker: "Tu",
      text: "Estou bem, obrigado. E tu?",
      translation: "我很好，谢谢。你呢？(非正式)"
    },
    {
      speaker: "Local",
      text: "Tudo bem, adeus!",
      translation: "一切都好，再见！"
    }
  ],
  vocabulary: [
    { pt: "Olá", cn: "你好", pronunciation: "[ɔˈla]" },
    { pt: "Como está?", cn: "您好吗？", pronunciation: "[ˈko.mu ʃˈta]" },
    { pt: "Tu", cn: "你 (葡萄牙常用)", pronunciation: "[tu]" },
    { pt: "Obrigado", cn: "谢谢 (男用)", pronunciation: "[u.βɾi.ˈɣa.ðu]" },
    { pt: "Adeus", cn: "再见", pronunciation: "[ɐ.ˈðewʃ]" },
    { pt: "Sumo", cn: "果汁 (欧葡专属)", pronunciation: "[ˈsu.mu]" }
  ],
  grammar: {
    point: "欧葡 vs 巴葡：Tu 与 Você",
    explanation: "在葡萄牙，'Tu' 是最常用的非正式称呼。巴葡常用的 'Você' 在葡萄牙通常用于正式场合或省略主语。同时注意，欧葡不用进行时 -ando，而是用 'a + 动词原形'。",
    example: "Estou a comer. (我正在吃。)"
  },
  quiz: [
    {
      question: "在里斯本想喝果汁，你应该说：",
      options: ["Suco (巴葡用法)", "Sumo (欧葡用法)", "Juice", "Água"],
      correctIndex: 1,
      explanation: "记住：葡萄牙叫 'Sumo'，巴西才叫 'Suco'。这是欧葡入门第一大坑！"
    }
  ],
  challenge: "尝试发出 'Adeus' 结尾的 's' 音，它在欧葡中听起来像中文的 '湿' (sh)。"
};

export const CURRICULUM = [
  { id: '1', title: 'Saudações', chineseTitle: '基础问候', icon: '👋', theme: 'bg-blue-500' },
  { id: '2', title: 'No Café', chineseTitle: '在咖啡馆点餐', icon: '☕', theme: 'bg-orange-500' },
  { id: '3', title: 'O Comboio', chineseTitle: '交通工具 (欧葡称谓)', icon: '🚆', theme: 'bg-green-500' },
  { id: '4', title: 'O Telemóvel', chineseTitle: '手机与数字', icon: '📱', theme: 'bg-purple-500' },
  { id: '5', title: 'Supermercado', chineseTitle: '超市购物', icon: '🛒', theme: 'bg-yellow-500' },
  { id: '6', title: 'A Morada', chineseTitle: '问路与地址', icon: '📍', theme: 'bg-red-500' },
  { id: '7', title: 'Certificado', chineseTitle: '第一阶段通关复习', icon: '🎓', theme: 'bg-slate-500' },
];

export const SYSTEM_PROMPT = `You are the World's Best European Portuguese (PT-PT) AI Tutor for Chinese beginners.

CRITICAL INSTRUCTIONS:
1. STRICT PT-PT: Never use Brazilian Portuguese (PT-BR). 
   - Use 'Tu' as the primary casual 'you'.
   - Use 'a + infinitive' for continuous tense (e.g., 'estou a falar' NOT 'estou falando').
   - Vocabulary priority: Comboio (not Trem), Autocarro (not Ônibus), Telemóvel (not Celular), Casa de banho (not Banheiro), Sumo (not Suco), Propina (not Mensalidade).
2. REPETITIVE TRAINING DESIGN: Content must support a multi-step learning path (Intro -> Pairing -> Scramble -> Choice -> Quiz).
3. TONE: Friendly, supportive, but academic about Portugal's linguistic standards.
4. CHINESE: Explanations must be in clear, simplified Chinese.

Response must be a strict JSON matching the provided schema.`;
