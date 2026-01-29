
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { LessonContent } from "../types";
import { SYSTEM_PROMPT } from "../constants";

// 保持一个全局 AudioContext 单例
let sharedAudioCtx: AudioContext | null = null;

const getAudioContext = () => {
  if (!sharedAudioCtx) {
    sharedAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  }
  return sharedAudioCtx;
};

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * 浏览器内置语音合成方案 (地道 pt-PT 欧葡)
 * 作为 AI 播放失败时的强力回退手段
 */
export function speakNative(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  // 停止当前所有正在进行的语音
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "pt-PT";
  utterance.rate = 0.85; // 稍微放慢速度，让初学者听清辅音
  utterance.pitch = 1.0;

  // 尝试在系统声音列表中寻找最纯正的葡萄牙(非巴西)语音
  const voices = window.speechSynthesis.getVoices();
  const ptPTVoice = voices.find(v => 
    (v.lang === 'pt-PT' || v.lang === 'pt_PT') && 
    (v.name.toLowerCase().includes('portugal') || !v.name.toLowerCase().includes('brazil'))
  );
  
  if (ptPTVoice) {
    utterance.voice = ptPTVoice;
  }

  window.speechSynthesis.speak(utterance);
}

// 预加载语音列表（部分浏览器需要此步骤）
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.getVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  }
}

export async function generateLesson(topic: string): Promise<LessonContent> {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a STRICT European Portuguese (PT-PT) lesson for Chinese beginners: ${topic}. 
      SENTENCE RULES:
      1. Only use "Tu" for casual singular "You". 
      2. Sentences must be 3-6 words long.
      3. Include common PT-PT vocabulary (Comboio, Telemóvel, etc.).
      4. NO BRAZILIAN PORTUGUESE (No "Você" as default, no gerunds like "falando").`,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            chineseTitle: { type: Type.STRING },
            situation: { type: Type.STRING },
            dialogue: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  speaker: { type: Type.STRING },
                  text: { type: Type.STRING },
                  translation: { type: Type.STRING }
                }
              }
            },
            vocabulary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  pt: { type: Type.STRING },
                  cn: { type: Type.STRING }
                }
              }
            },
            grammar: {
              type: Type.OBJECT,
              properties: {
                point: { type: Type.STRING },
                explanation: { type: Type.STRING },
                example: { type: Type.STRING }
              }
            },
            quiz: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctIndex: { type: Type.NUMBER },
                  explanation: { type: Type.STRING }
                }
              }
            },
            challenge: { type: Type.STRING }
          }
        }
      }
    });

    if (!response.text) throw new Error("Empty response from AI");
    return JSON.parse(response.text) as LessonContent;
  } catch (error: any) {
    console.error("Lesson generation failed:", error);
    throw error;
  }
}

/**
 * 混合语音引擎：
 * 1. 尝试使用 Gemini 2.5 高质量真人发音
 * 2. 如果失败（网络、Key、浏览器兼容），立刻回退到本地 pt-PT 引擎
 */
export async function speak(text: string): Promise<void> {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Diz isto em português de Portugal: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("TTS payload empty");

    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const bytes = decodeBase64(base64Audio);
    const audioBuffer = await decodeAudioData(bytes, ctx, 24000, 1);
    
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    source.start();
  } catch (err) {
    console.warn("AI 语音不可用，正在使用浏览器内置欧葡引擎:", err);
    speakNative(text);
  }
}

function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer, data.byteOffset, data.byteLength / 2);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
