import axiosInstance from "./axiosInstance";

export interface QuizOption {
  optionText: string;
  valid: boolean;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  points: number;
  tags: string;
  imageUrl?: string;
  options: QuizOption[];
}

export interface CreateQuizRequest {
  title: string;
  description: string;
  difficultyId: number;
  topic: string;
  startDateTime: string;
  duration: number;
  mode: string;
  questions: Omit<QuizQuestion, "id">[];
}

type CreateQuizResponse = {
  title: string;
  description: string;
  difficultyId: number;
  topic: string;
  startDateTime: string;
  duration: number;
  mode: string;
  questions: QuizQuestion[];
};

export const createQuiz = async (quiz: CreateQuizRequest): Promise<CreateQuizResponse> => {
  try {
    const response = await axiosInstance.post<CreateQuizResponse>(`/quizzes/with-questions`, quiz);
    return response.data;
  } catch (error) {
    throw error;
  }
};
