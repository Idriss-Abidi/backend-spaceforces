import { Quiz, QuizQuestion } from "@/types";
import axiosInstance from "./axiosInstance";

export type GetQuestionsByQuizRequest = string;

export type GetQuestionsByQuizResponse = QuizQuestion[];

export const getQuestionsByQuizId = async (quizId: GetQuestionsByQuizRequest): Promise<GetQuestionsByQuizResponse> => {
  try {
    const response = await axiosInstance.get<QuizQuestion[]>(`/quizzes/${quizId}/questions`);

    return response.data;
  } catch (error) {
    throw error;
  }
};
