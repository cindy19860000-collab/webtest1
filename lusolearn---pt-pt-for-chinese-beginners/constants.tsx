
import { LessonContent } from './types';

export const DAY_1_CONTENT: LessonContent = {
  id: "1",
  title: "Vogais e Saudações",
  chineseTitle: "核心元音与基础问候",
  situation: "初抵里斯本：在机场或咖啡馆与当地人打招呼。注意：在葡萄牙，我们追求极简发音，元音非常闭合。",
  dialogue: [
    {
      speaker: "Local",
      text: "Olá! Como está?",
      translation: "你好！您好吗？"
    },
    {
      speaker: "Viajante",
      text: "Estou bem, obrigado. E tu?",
      translation: "我很好，谢谢。你呢？(针对朋友/同龄人)"
    },
    {
      speaker: "Local",
      text: "Tudo bem, bem-vindo.",
      translation: "一切都好，欢迎。"
    }
  ],
  vocabulary: [
    { pt: "Olá", cn: "你好", pronunciation: "[ɔˈla]" },
    { pt: "Como está?", cn: "您好吗？(正式)", pronunciation: "[ˈko.mu ɨʃ.ˈta]" },
    { pt: "Tu", cn: "你 (非正式)", pronunciation: "[tu]" },
    { pt: "Obrigado", cn: "谢谢 (男用)", pronunciation: "[u.βɾi.ˈɣa.ðu]" },
    { pt: "Bem-vindo", cn: "欢迎", pronunciation: "[bɐ̃ ˈvĩ.du]" },
    { pt: "Casa de banho", cn: "洗手间 (欧葡专用)", pronunciation: "[ˈka.zɐ ðɨ ˈβɐ.ɲu]" }
  ],
  grammar: {
    point: "欧葡中的 Tu vs Você",
    explanation: "在葡萄牙，对同龄人或朋友绝对用 'Tu'。而巴西人常用的 'Você' 在葡萄牙很多时候被视为不够亲近或过于直接。欧葡发音特点是‘吞音’，比如 'Como está' 听起来像 'Com-shtá'。",
    example: "Estou a aprender português. (欧葡进行时结构：Estou a + 原形)"
  },
  quiz: [
    {
      question: "在里斯本问洗手间在哪，你应该说哪个词？",
      options: ["Banheiro (巴西用语)", "Casa de banho (葡萄牙用语)", "Toilet", "Quarto"],
      correctIndex: 1,
      explanation: "葡萄牙本土只使用 'Casa de banho'。使用 'Banheiro' 会立刻暴露你的巴西葡语背景。"
    }
  ],
  challenge: "尝试连读 'Como está'，将中间的 'o' 几乎完全省略，发出地道的里斯本口音。"
};

export const CURRICULUM = [
  { id: '1', title: 'Vogais e Saudações', chineseTitle: '基础问候与发音', icon: '👋', theme: 'bg-blue-100' },
  { id: '2', title: 'No Café', chineseTitle: '在咖啡厅：点餐', icon: '☕', theme: 'bg-orange-100' },
  { id: '3', title: 'O Comboio', chineseTitle: '乘坐火车 (不叫Trem)', icon: '🚆', theme: 'bg-green-100' },
  { id: '4', title: 'A Família', chineseTitle: '我的家人', icon: '👨‍👩‍👧', theme: 'bg-purple-100' },
  { id: '5', title: 'Números e Preços', chineseTitle: '数字与欧元价格', icon: '💶', theme: 'bg-yellow-100' },
  { id: '6', title: 'Direções', chineseTitle: '问路：左转右转', icon: '📍', theme: 'bg-red-100' },
  { id: '7', title: 'Revisão', chineseTitle: '第一周通关复习', icon: '🏆', theme: 'bg-slate-100' },
];

export const SYSTEM_PROMPT = `You are a strict European Portuguese (PT-PT) AI Tutor for Chinese beginners. 

GOLDEN RULES:
1. ABSOLUTELY NO BRAZILIAN PORTUGUESE (PT-BR). 
   - Never use "você" as a primary subject in lessons unless explaining why not to use it. Use "Tu".
   - Use "Estou a falar" (PT-PT) instead of "Estou falando" (PT-BR).
   - Use "Comboio" (Train), "Autocarro" (Bus), "Telemóvel" (Phone), "Casa de banho" (Bathroom), "Sumo" (Juice).
2. REPETITIVE TRAINING: Structure content so words are used multiple times.
3. PHONETICS: Emphasize the closed vowels (stress-timed rhythm) of Portugal.
4. CHINESE EXPLANATIONS: Use clear, encouraging teacher-like Chinese.

Format: Valid JSON matching the provided schema.`;
