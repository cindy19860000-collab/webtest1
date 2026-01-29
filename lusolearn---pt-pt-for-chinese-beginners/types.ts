
export interface VocabularyItem {
  pt: string;
  cn: string;
  pronunciation?: string;
}

export interface DialogueLine {
  speaker: string;
  text: string;
  translation: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LessonContent {
  id: string;
  title: string;
  chineseTitle: string;
  situation: string;
  dialogue: DialogueLine[];
  vocabulary: VocabularyItem[];
  grammar: {
    point: string;
    explanation: string;
    example: string;
  };
  quiz: QuizQuestion[];
  challenge: string;
}

export interface UserProgress {
  completedLessons: string[];
  currentLessonId: string;
  streak: number;
  lastLogin: string;
}

export enum AppScreen {
  HOME = 'HOME',
  LESSON = 'LESSON',
  PROFILE = 'PROFILE'
}
