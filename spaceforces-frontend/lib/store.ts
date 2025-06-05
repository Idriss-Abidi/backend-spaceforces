import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

interface QuizCreationState {
  title: string;
  topic: string;
  difficulty: 'Basics' | 'Easy' | 'Medium' | 'Hard' | 'Expert';
  questions: Array<{
    question: string;
    answers: string[];
    correctAnswer: number;
  }>;
  setTitle: (title: string) => void;
  settopic: (topic: string) => void;
  setDifficulty: (difficulty: 'Basics' | 'Easy' | 'Medium' | 'Hard' | 'Expert') => void;
  addQuestion: (question: string, answers: string[], correctAnswer: number) => void;
  removeQuestion: (index: number) => void;
  resetQuiz: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

export const useQuizCreationStore = create<QuizCreationState>((set) => ({
  title: '',
  topic: '',
  difficulty: 'Medium',
  questions: [],
  setTitle: (title) => set({ title }),
  settopic: (topic) => set({ topic }),
  setDifficulty: (difficulty) => set({ difficulty }),
  addQuestion: (question, answers, correctAnswer) =>
    set((state) => ({
      questions: [...state.questions, { question, answers, correctAnswer }],
    })),
  removeQuestion: (index) =>
    set((state) => ({
      questions: state.questions.filter((_, i) => i !== index),
    })),
  resetQuiz: () =>
    set({
      title: '',
      topic: '',
      difficulty: 'Medium',
      questions: [],
    }),
}));