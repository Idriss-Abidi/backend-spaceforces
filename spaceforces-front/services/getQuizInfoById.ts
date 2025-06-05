import { Quiz } from "@/types";
import axiosInstance from "./axiosInstance";

export type GetQuizRequest = string;

export type GetQuizResponse = Quiz

export const getQuizInfoById = async (quizId: GetQuizRequest): Promise<GetQuizResponse> => {
  try {
    const response = await axiosInstance.get<Quiz>(`/quizzes/${quizId}`);

    return response.data;
  } catch (error) {
    throw error;
  }
};
